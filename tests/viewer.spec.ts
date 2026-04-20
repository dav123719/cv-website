import { test, expect } from "@playwright/test";

type DebugSnapshot = {
  cameraPosition: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number } | null;
  preset: string | undefined;
};

async function readViewerDebug(page: import("@playwright/test").Page): Promise<DebugSnapshot> {
  return page.evaluate(() => {
    const debug = window.__cvViewerDebug;
    const camera = debug?.camera;
    const controls = debug?.controls;

    return {
      cameraPosition: camera
        ? { x: camera.position.x, y: camera.position.y, z: camera.position.z }
        : { x: 0, y: 0, z: 0 },
      target: controls?.target
        ? { x: controls.target.x, y: controls.target.y, z: controls.target.z }
        : null,
      preset: debug?.preset
    };
  });
}

function movedEnough(a: DebugSnapshot, b: DebugSnapshot) {
  const dx = Math.abs(a.cameraPosition.x - b.cameraPosition.x);
  const dy = Math.abs(a.cameraPosition.y - b.cameraPosition.y);
  const dz = Math.abs(a.cameraPosition.z - b.cameraPosition.z);
  return dx + dy + dz > 0.12;
}

test("viewer fills frame and drag persists until reset", async ({ page }) => {
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  const projectSection = page.locator("#projects");
  await projectSection.scrollIntoViewIfNeeded();

  const viewerShell = projectSection.locator("canvas").first();
  await expect(viewerShell).toBeVisible();

  const canvasBox = await viewerShell.boundingBox();
  if (!canvasBox) {
    throw new Error("Canvas bounding box not found");
  }

  expect(canvasBox.width).toBeGreaterThan(500);
  expect(canvasBox.height).toBeGreaterThan(500);

  const initial = await readViewerDebug(page);

  await page.mouse.move(canvasBox.x + canvasBox.width * 0.5, canvasBox.y + canvasBox.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.78, canvasBox.y + canvasBox.height * 0.36, {
    steps: 16
  });
  await page.mouse.up();

  await page.waitForTimeout(250);
  const afterDrag = await readViewerDebug(page);
  expect(movedEnough(initial, afterDrag)).toBeTruthy();

  await page.waitForTimeout(1200);
  const afterIdle = await readViewerDebug(page);
  expect(movedEnough(initial, afterIdle)).toBeTruthy();

  await projectSection.getByRole("button", { name: "Reset orbit and camera" }).click();
  await page.waitForTimeout(250);
  const afterReset = await readViewerDebug(page);
  expect(movedEnough(initial, afterReset)).toBeFalsy();
});
