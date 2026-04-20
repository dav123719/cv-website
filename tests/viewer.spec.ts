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

async function expectElementHorizontallyInside(parent: import("@playwright/test").Locator, child: import("@playwright/test").Locator) {
  const parentHandle = await parent.elementHandle();
  const childHandle = await child.elementHandle();

  if (!parentHandle || !childHandle) {
    throw new Error("Expected elements for horizontal clipping assertion");
  }

  const boxes = await parent.page().evaluate(
    ([parentElement, childElement]) => {
      const parentBox = parentElement.getBoundingClientRect();
      const childBox = childElement.getBoundingClientRect();

      return {
        parent: { x: parentBox.x, width: parentBox.width },
        child: { x: childBox.x, width: childBox.width },
      };
    },
    [parentHandle, childHandle] as const
  );

  expect(boxes.child.x).toBeGreaterThanOrEqual(boxes.parent.x - 1);
  expect(boxes.child.x + boxes.child.width).toBeLessThanOrEqual(boxes.parent.x + boxes.parent.width + 1);
}

async function scrollElementIntoView(locator: import("@playwright/test").Locator) {
  await locator.evaluate((element) => {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

async function expectConsistentThumbnailGaps(gallery: import("@playwright/test").Locator) {
  const gaps = await gallery.locator(".project-media-card").evaluateAll((cards) => {
    const boxes = cards.map((card) => card.getBoundingClientRect());
    return boxes.slice(1).map((box, index) => Math.round(box.left - boxes[index].right));
  });

  expect(gaps.length).toBeGreaterThan(0);
  for (const gap of gaps) {
    expect(Math.abs(gap - gaps[0])).toBeLessThanOrEqual(1);
  }
  expect(gaps[0]).toBeGreaterThanOrEqual(10);
  expect(gaps[0]).toBeLessThanOrEqual(14);
}

function previewCounter(gallery: import("@playwright/test").Locator) {
  return gallery.locator(".project-evidence-preview__counter");
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
  await page.waitForFunction(() => Boolean(window.__cvViewerDebug?.camera));
  await page.waitForFunction(() => {
    const canvas = document.querySelector("#projects canvas");
    if (!canvas) return false;
    const box = canvas.getBoundingClientRect();
    return box.width > 500 && box.height > 500;
  });
  await viewerShell.evaluate((element) => {
    const box = element.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + box.top - Math.max((window.innerHeight - box.height) / 2, 24),
      left: 0,
      behavior: "auto",
    });
  });
  await page.waitForFunction(() => {
    const canvas = document.querySelector("#projects canvas");
    if (!canvas) return false;
    const box = canvas.getBoundingClientRect();
    return box.top < window.innerHeight - 80 && box.bottom > 160;
  });
  await expect(viewerShell).toBeVisible();

  const canvasBox = await viewerShell.boundingBox();
  if (!canvasBox) {
    throw new Error("Canvas bounding box not found");
  }

  expect(canvasBox.width).toBeGreaterThan(500);
  expect(canvasBox.height).toBeGreaterThan(500);

  const initial = await readViewerDebug(page);

  let afterDrag = initial;
  for (let attempt = 0; attempt < 3; attempt++) {
    const currentBox = await viewerShell.boundingBox();
    if (!currentBox) {
      throw new Error("Canvas bounding box not found during drag");
    }

    const dragStartY = currentBox.y + currentBox.height * 0.5;
    const dragEndY = currentBox.y + currentBox.height * 0.32;

    await page.mouse.move(currentBox.x + currentBox.width * 0.48, dragStartY);
    await page.mouse.down();
    await page.mouse.move(currentBox.x + currentBox.width * 0.86, dragEndY, {
      steps: 24
    });
    await page.mouse.up();
    await page.waitForTimeout(350);

    afterDrag = await readViewerDebug(page);
    if (movedEnough(initial, afterDrag)) break;
  }

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

test("project evidence supports main arrows and thumbnail browsing through all media", async ({ page }) => {
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

  const projectSection = page.locator("#projects");
  await projectSection.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Boolean(window.__cvViewerDebug?.camera));

  const gallery = projectSection.getByLabel("Project media gallery");
  const preview = gallery.locator(".project-evidence-preview__media");
  const thumbnailRail = gallery.locator(".project-media-viewport");
  const initialBox = await gallery.boundingBox();
  if (!initialBox) {
    throw new Error("Gallery bounding box not found");
  }

  const previewBox = await preview.boundingBox();
  if (!previewBox) {
    throw new Error("Evidence preview bounding box not found");
  }
  expect(previewBox.height).toBeGreaterThan(220);

  for (const [label, count] of [
    ["Final build", "1/5"],
    ["Motor interface", "2/5"],
    ["Interactive CAD", "3/5"],
    ["Print setup", "4/5"],
    ["Assembly detail", "5/5"],
  ] as const) {
    await expect(projectSection.getByRole("button", { name: `Selected media: ${label}` })).toBeVisible();
    await expect(previewCounter(gallery)).toHaveText(count);
    await expect(gallery.locator(".project-evidence-preview__caption").getByRole("heading", { name: label })).toBeVisible();
    await expectElementHorizontallyInside(thumbnailRail, projectSection.getByRole("button", { name: `Selected media: ${label}` }));

    if (count !== "5/5") {
      await gallery.getByRole("button", { name: "Show next project media" }).click();
      await page.waitForTimeout(280);
    }
  }

  const afterNextBox = await gallery.boundingBox();
  if (!afterNextBox) {
    throw new Error("Gallery bounding box not found after navigation");
  }

  expect(Math.abs(afterNextBox.height - initialBox.height)).toBeLessThan(8);

  await expect(gallery.getByRole("button", { name: "Show next project media" })).toBeDisabled();
  await projectSection.getByRole("button", { name: "Select media: Interactive CAD" }).click();
  await expect(previewCounter(gallery)).toHaveText("3/5");
  await expect(projectSection.getByRole("button", { name: "Selected media: Interactive CAD" })).toBeVisible();

  await gallery.getByRole("button", { name: "Show previous project media" }).click();
  await expect(previewCounter(gallery)).toHaveText("2/5");
  await expect(projectSection.getByRole("button", { name: "Selected media: Motor interface" })).toBeVisible();

  const afterPreviousBox = await gallery.boundingBox();
  if (!afterPreviousBox) {
    throw new Error("Gallery bounding box not found after reverse navigation");
  }

  expect(Math.abs(afterPreviousBox.height - initialBox.height)).toBeLessThan(8);

  await projectSection.getByRole("button", { name: "Select project: Elevator scale model" }).click();
  await expect(projectSection.getByRole("button", { name: "Selected media: Full rig" })).toBeVisible();
  await expect(gallery.getByRole("button", { name: "Show next project media" })).toBeVisible();
  await expect(previewCounter(gallery)).toHaveText("1/5");

  await projectSection.getByRole("button", { name: "Select project: H-bridge motor driver" }).click();
  await expect(projectSection.getByRole("button", { name: "Selected media: PCB close-up" })).toBeVisible();
  await expect(previewCounter(gallery)).toHaveText("1/3");
});

test("project selector and evidence hover states are not clipped across breakpoints", async ({ page }) => {
  test.setTimeout(90000);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

    const projectSection = page.locator("#projects");
    await projectSection.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Boolean(window.__cvViewerDebug?.camera));

    const selectorRail = projectSection.locator(".selector-scroll-fade > div");
    const elevatorButton = projectSection.getByRole("button", { name: "Select project: Elevator scale model" });
    await scrollElementIntoView(elevatorButton);
    await elevatorButton.click();
    const selectedProject = projectSection.getByRole("button", { name: "Selected project: Elevator scale model" });
    await scrollElementIntoView(selectedProject);
    await expect(selectedProject).toBeVisible();
    await selectedProject.hover();
    await expectElementHorizontallyInside(selectorRail, selectedProject);

    const gallery = projectSection.getByLabel("Project media gallery");
    const thumbnailRail = gallery.locator(".project-media-viewport");
    const selectedMedia = projectSection.getByRole("button", { name: "Selected media: Full rig" });
    await scrollElementIntoView(thumbnailRail);
    await selectedMedia.hover();
    await expectElementHorizontallyInside(thumbnailRail, selectedMedia);

    await gallery.getByRole("button", { name: "Show next project media" }).click();
    await page.waitForTimeout(280);
    const nextMedia = projectSection.getByRole("button", { name: "Selected media: Drive system" });
    await scrollElementIntoView(nextMedia);
    await nextMedia.hover();
    await expectElementHorizontallyInside(thumbnailRail, nextMedia);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("project evidence thumbnail gaps stay consistent across breakpoints", async ({ page }) => {
  test.setTimeout(90000);

  for (const viewport of [
    { width: 360, height: 740 },
    { width: 640, height: 900 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

    const projectSection = page.locator("#projects");
    await projectSection.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Boolean(window.__cvViewerDebug?.camera));
    const gallery = projectSection.getByLabel("Project media gallery");

    await expectConsistentThumbnailGaps(gallery);

    await projectSection.getByRole("button", { name: "Select project: H-bridge motor driver" }).click();
    await expect(previewCounter(gallery)).toHaveText("1/3");
    await expect(gallery.locator(".project-media-card")).toHaveCount(3);
    await expectConsistentThumbnailGaps(gallery);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("contact email and phone copy buttons copy exact values", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://localhost:3000" });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    let clipboardText = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: async () => clipboardText,
        writeText: async (value: string) => {
          clipboardText = value;
        },
      },
    });
  });

  const contact = page.locator("#contact");
  await contact.scrollIntoViewIfNeeded();

  await expect(contact.getByRole("button", { name: "Copy email address" })).toBeVisible();
  await expect(contact.getByRole("button", { name: "Copy phone number" })).toBeVisible();
  await expect(contact.getByRole("link", { name: /email/i })).toHaveCount(0);
  await expect(contact.getByRole("link", { name: /phone/i })).toHaveCount(0);

  await contact.getByRole("button", { name: "Copy email address" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("ddabbis@gmail.com");
  await expect(contact.getByText("Copied")).toBeVisible();

  await contact.getByRole("button", { name: "Copy phone number" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("+371 22056110");
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
