from __future__ import annotations

import argparse
import re
from pathlib import Path

import numpy as np
import trimesh
from OCP.BRep import BRep_Tool
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.Quantity import Quantity_Color
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TCollection import TCollection_ExtendedString
from OCP.TDF import TDF_Label, TDF_LabelSequence
from OCP.TDocStd import TDocStd_Document
from OCP.TopAbs import TopAbs_FACE, TopAbs_REVERSED
from OCP.TopExp import TopExp_Explorer
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS
from OCP.XCAFApp import XCAFApp_Application
from OCP.XCAFDoc import XCAFDoc_ColorType, XCAFDoc_DocumentTool


COLOR_TYPES = [XCAFDoc_ColorType.XCAFDoc_ColorSurf, XCAFDoc_ColorType.XCAFDoc_ColorGen]
DEFAULT_COLOR = (0.62, 0.62, 0.62)

MATERIAL_NAMES = [
    ((0.098, 0.098, 0.098), "black_plastic"),
    ((0.050, 0.050, 0.050), "black_powdercoat"),
    ((0.965, 0.965, 0.965), "white_enamel"),
    ((0.922, 0.922, 0.896), "warm_white"),
    ((0.768, 0.208, 0.161), "red_enamel"),
    ((0.552, 0.036, 0.020), "dark_red"),
    ((0.627, 0.627, 0.627), "steel_satin"),
    ((0.961, 0.961, 0.961), "polished_aluminum"),
    ((0.247, 0.247, 0.247), "tough_resin"),
    ((0.352, 0.352, 0.352), "graphite"),
]


def sanitize_name(value: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9_]+", "_", value.strip().lower())
    clean = re.sub(r"_+", "_", clean).strip("_")
    return clean or "part"


def material_name_for(color: tuple[float, float, float]) -> str:
    best_name = "material"
    best_distance = float("inf")
    for candidate, name in MATERIAL_NAMES:
        distance = sum((candidate[index] - color[index]) ** 2 for index in range(3))
        if distance < best_distance:
            best_distance = distance
            best_name = name
    return best_name if best_distance < 0.03 else "material"


def read_step_doc(path: Path) -> TDocStd_Document:
    app = XCAFApp_Application.GetApplication_s()
    doc = TDocStd_Document(TCollection_ExtendedString("MDTV-XCAF"))
    app.NewDocument(TCollection_ExtendedString("MDTV-XCAF"), doc)

    reader = STEPCAFControl_Reader()
    reader.SetColorMode(True)
    reader.SetNameMode(True)
    reader.SetLayerMode(True)
    status = reader.ReadFile(str(path))
    if "RetDone" not in str(status):
        raise RuntimeError(f"Failed reading {path}: {status}")
    if not reader.Transfer(doc):
        raise RuntimeError(f"Failed transferring {path}")
    return doc


def actual_label(shape_tool, label: TDF_Label) -> TDF_Label:
    referred = TDF_Label()
    if shape_tool.IsReference_s(label) and shape_tool.GetReferredShape_s(label, referred):
        return referred
    return label


def label_color(shape_tool, color_tool, label: TDF_Label) -> tuple[float, float, float] | None:
    shape = shape_tool.GetShape_s(label)
    color = Quantity_Color()
    for color_type in COLOR_TYPES:
        if color_tool.GetColor(shape, color_type, color):
            return (color.Red(), color.Green(), color.Blue())
    return None


def child_labels(shape_tool, label: TDF_Label) -> list[TDF_Label]:
    children: list[TDF_Label] = []
    components = TDF_LabelSequence()
    shape_tool.GetComponents_s(label, components, False)
    for index in range(1, components.Length() + 1):
        children.append(components.Value(index))

    subshapes = TDF_LabelSequence()
    shape_tool.GetSubShapes_s(label, subshapes)
    for index in range(1, subshapes.Length() + 1):
        children.append(subshapes.Value(index))
    return children


def collect_parts(shape_tool, color_tool) -> list[dict]:
    free = TDF_LabelSequence()
    shape_tool.GetFreeShapes(free)
    parts: list[dict] = []

    def walk(label: TDF_Label, inherited_color: tuple[float, float, float] | None, path: list[str]) -> None:
        resolved = actual_label(shape_tool, label)
        own_color = label_color(shape_tool, color_tool, resolved)
        next_color = own_color or inherited_color
        children = child_labels(shape_tool, resolved)

        if children:
            for child in children:
                walk(child, next_color, path)
            return

        shape = shape_tool.GetShape_s(resolved)
        if shape.IsNull():
            return

        color = next_color or DEFAULT_COLOR
        material_name = material_name_for(color)
        parts.append(
            {
                "shape": shape,
                "color": color,
                "name": sanitize_name("_".join([material_name, f"{len(parts) + 1:03d}"])),
            }
        )

    for index in range(1, free.Length() + 1):
        walk(free.Value(index), None, [])
    return parts


def mesh_shape(shape, color: tuple[float, float, float], linear_deflection: float) -> trimesh.Trimesh | None:
    BRepMesh_IncrementalMesh(shape, linear_deflection)
    vertices: list[list[float]] = []
    faces: list[list[int]] = []
    face_colors: list[list[int]] = []
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    rgba = [int(max(0, min(1, value)) * 255) for value in color] + [255]

    while explorer.More():
        face = TopoDS.Face_s(explorer.Current())
        location = TopLoc_Location()
        triangulation = BRep_Tool.Triangulation_s(face, location)
        if triangulation is not None:
            transform = location.Transformation()
            base_index = len(vertices)
            for node_index in range(1, triangulation.NbNodes() + 1):
                point = triangulation.Node(node_index).Transformed(transform)
                vertices.append([point.X(), point.Y(), point.Z()])

            reverse = face.Orientation() == TopAbs_REVERSED
            for triangle_index in range(1, triangulation.NbTriangles() + 1):
                triangle = triangulation.Triangle(triangle_index)
                indices = [
                    base_index + triangle.Value(1) - 1,
                    base_index + triangle.Value(2) - 1,
                    base_index + triangle.Value(3) - 1,
                ]
                faces.append([indices[0], indices[2], indices[1]] if reverse else indices)
                face_colors.append(rgba)
        explorer.Next()

    if not vertices or not faces:
        return None

    return trimesh.Trimesh(
        vertices=np.asarray(vertices, dtype=np.float64),
        faces=np.asarray(faces, dtype=np.int64),
        face_colors=np.asarray(face_colors, dtype=np.uint8),
        process=False,
    )


def convert(source: Path, target: Path, linear_deflection: float) -> None:
    doc = read_step_doc(source)
    shape_tool = XCAFDoc_DocumentTool.ShapeTool_s(doc.Main())
    color_tool = XCAFDoc_DocumentTool.ColorTool_s(doc.Main())
    parts = collect_parts(shape_tool, color_tool)
    scene = trimesh.Scene()

    exported_parts = 0
    for part in parts:
        mesh = mesh_shape(part["shape"], part["color"], linear_deflection)
        if mesh is None:
            continue
        scene.add_geometry(mesh, geom_name=part["name"], node_name=part["name"])
        exported_parts += 1

    if exported_parts < 2:
        raise RuntimeError(f"Expected multiple parts for {source}, got {exported_parts}")

    target.parent.mkdir(parents=True, exist_ok=True)
    scene.export(target)
    print(f"{source.name} -> {target} | parts={exported_parts} size={target.stat().st_size}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert colored STEP CAD files to structured GLB assets.")
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    parser.add_argument("--deflection", type=float, default=0.22)
    args = parser.parse_args()
    convert(args.source, args.target, args.deflection)


if __name__ == "__main__":
    main()
