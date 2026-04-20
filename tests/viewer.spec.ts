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

test.beforeEach(async ({ page }) => {
  await page.route("**/api/personalization", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ scores: [] }),
    });
  });
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });
});

test("viewer fills frame and drag persists until reset", async ({ page }) => {
  test.setTimeout(60000);

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

  const projectSection = page.locator("#projects");
  await projectSection.scrollIntoViewIfNeeded();
  await expect(projectSection.getByText("Wireframe")).toHaveCount(0);
  await expect(projectSection.getByText("Drag to orbit")).toHaveCount(0);
  await expect(projectSection.getByText("Lighting dev")).toHaveCount(0);

  const viewerShell = projectSection.locator("canvas").first();
  await viewerShell.scrollIntoViewIfNeeded();
  await expect(viewerShell).toBeVisible();
  await page.waitForFunction(() => Boolean(window.__cvViewerDebug?.camera));

  const canvasBox = await viewerShell.boundingBox();
  if (!canvasBox) {
    throw new Error("Canvas bounding box not found");
  }

  expect(canvasBox.width).toBeGreaterThan(500);
  expect(canvasBox.height).toBeGreaterThan(500);

  const initial = await readViewerDebug(page);

  const viewport = page.viewportSize();
  const startY = viewport ? Math.min(canvasBox.y + canvasBox.height * 0.45, viewport.height - 90) : canvasBox.y + canvasBox.height * 0.45;
  const endY = viewport ? Math.min(canvasBox.y + canvasBox.height * 0.36, viewport.height - 130) : canvasBox.y + canvasBox.height * 0.36;

  await page.mouse.move(canvasBox.x + canvasBox.width * 0.5, startY);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.78, endY, {
    steps: 16
  });
  await page.mouse.up();

  await page.waitForTimeout(250);
  const afterDrag = await readViewerDebug(page);
  expect(movedEnough(initial, afterDrag)).toBeTruthy();

  await page.waitForTimeout(1200);
  const afterIdle = await readViewerDebug(page);
  expect(movedEnough(initial, afterIdle)).toBeTruthy();

  await projectSection.getByRole("button", { name: "Reset model, orbit, and camera" }).click();
  await page.waitForTimeout(500);
  await page.waitForFunction(() => Boolean(window.__cvViewerDebug?.camera));
  const afterReset = await readViewerDebug(page);
  expect(movedEnough(initial, afterReset)).toBeFalsy();
});

test("project gallery stays compact and supports overflow media", async ({ page }) => {
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

  const projectSection = page.locator("#projects");
  await projectSection.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Boolean(window.__cvViewerDebug?.camera));

  const gallery = projectSection.getByLabel("Project media gallery");
  const initialBox = await gallery.boundingBox();
  if (!initialBox) {
    throw new Error("Gallery bounding box not found");
  }

  await expect(projectSection.getByRole("button", { name: "Selected media: Final build" })).toBeVisible();
  await expect(projectSection.getByRole("button", { name: "Select media: Interactive CAD" })).toBeVisible();
  await projectSection.getByRole("button", { name: "Show next project media" }).click();
  await expect(gallery.getByText("2-4/5")).toBeVisible();
  await expect(projectSection.getByRole("button", { name: "Selected media: Motor interface" })).toBeVisible();

  const afterNextBox = await gallery.boundingBox();
  if (!afterNextBox) {
    throw new Error("Gallery bounding box not found after navigation");
  }

  expect(Math.abs(afterNextBox.height - initialBox.height)).toBeLessThan(8);

  await projectSection.getByRole("button", { name: "Show previous project media" }).click();
  await expect(gallery.getByText("1-3/5")).toBeVisible();
  await expect(projectSection.getByRole("button", { name: "Selected media: Motor interface" })).toBeVisible();

  const afterPreviousBox = await gallery.boundingBox();
  if (!afterPreviousBox) {
    throw new Error("Gallery bounding box not found after reverse navigation");
  }

  expect(Math.abs(afterPreviousBox.height - initialBox.height)).toBeLessThan(8);

  await projectSection.getByRole("button", { name: "Select project: Elevator scale model" }).click();
  await expect(projectSection.getByRole("button", { name: "Selected media: Full rig" })).toBeVisible();
  await expect(projectSection.getByRole("button", { name: "Show next project media" })).toBeVisible();
});

test("key sections avoid horizontal overflow across breakpoints", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

    for (const sectionId of ["#work", "#projects", "#contact"]) {
      const section = page.locator(sectionId);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
