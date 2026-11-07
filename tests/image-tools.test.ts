import test from "node:test";
import assert from "node:assert/strict";
import {
  aspectRatioOf,
  applyCropAspectRatio,
  centeredCropForRatio,
  clampCropRect,
  computeResizeDimensions,
  coverCropForResize,
  dimensionsAfterRotation,
  MAX_CROP_ZOOM,
  moveCropPlacement,
  zoomCropPlacement,
  fitWithin,
  matchLockedAxis,
  normalizeAngle,
} from "../lib/image-tools/geometry";
import {
  appendPathPoint,
  clampPoint,
  pickCutSide,
  pointInPolygon,
  polygonArea,
  polygonBounds,
  resolveFreehand,
} from "../lib/image-tools/freehand";
import {
  findResizeTemplate,
  RESIZE_TEMPLATE_GROUPS,
  searchResizeTemplates,
} from "../lib/image-tools/resize-templates";
import { BYTES_PER_KB, encodeWithinLimit } from "../lib/image-tools/size-limit";
import {
  clampQuality,
  extensionFor,
  formatBytes,
  formatFromMime,
  isLossy,
  mimeFor,
  qualityForLevel,
  savingsPercent,
  supportsTransparency,
} from "../lib/image-tools/format";
import {
  baseName,
  batchArchiveName,
  outputFilename,
  sanitizeFilename,
  swapExtension,
  uniqueFilename,
} from "../lib/image-tools/filename";
import {
  applyResizeTemplate,
  buildOutputName,
  buildProcessOptions,
  clearResizeTemplate,
  resolveToolFormat,
  resolveOutputFormat,
  DEFAULT_REENCODE_QUALITY,
  DEFAULT_RESIZE,
  DEFAULT_TOOL_SETTINGS,
} from "../lib/image-tools/plan";
import type { ResizeOptions } from "../lib/image-tools/types";

const SOURCE = { width: 1600, height: 900 };

function resizeOptions(overrides: Partial<ResizeOptions> = {}): ResizeOptions {
  return {
    mode: "pixels",
    width: null,
    height: null,
    percentage: 100,
    lockAspectRatio: true,
    allowUpscale: false,
    ...overrides,
  };
}

test("aspectRatioOf survives a zero-height image", () => {
  assert.equal(aspectRatioOf({ width: 1600, height: 900 }), 1600 / 900);
  assert.equal(aspectRatioOf({ width: 100, height: 0 }), 1);
});

test("quarter turns swap width and height", () => {
  assert.deepEqual(dimensionsAfterRotation(SOURCE, 0), SOURCE);
  assert.deepEqual(dimensionsAfterRotation(SOURCE, 180), SOURCE);
  assert.deepEqual(dimensionsAfterRotation(SOURCE, 90), {
    width: 900,
    height: 1600,
  });
  assert.deepEqual(dimensionsAfterRotation(SOURCE, 270), {
    width: 900,
    height: 1600,
  });
});

test("normalizeAngle snaps onto the four quarter turns", () => {
  assert.equal(normalizeAngle(0), 0);
  assert.equal(normalizeAngle(90), 90);
  assert.equal(normalizeAngle(-90), 270);
  assert.equal(normalizeAngle(360), 0);
  assert.equal(normalizeAngle(450), 90);
});

test("percentage resize scales both axes and rounds to whole pixels", () => {
  assert.deepEqual(
    computeResizeDimensions(
      SOURCE,
      resizeOptions({ mode: "percentage", percentage: 50 })
    ),
    { width: 800, height: 450 }
  );
});

test("locked resize derives the axis the user did not type", () => {
  assert.deepEqual(
    computeResizeDimensions(SOURCE, resizeOptions({ width: 800 })),
    { width: 800, height: 450 }
  );
  assert.deepEqual(
    computeResizeDimensions(SOURCE, resizeOptions({ height: 450 })),
    { width: 800, height: 450 }
  );
});

test("locked resize with both axes fits inside the box instead of stretching", () => {
  assert.deepEqual(
    computeResizeDimensions(
      SOURCE,
      resizeOptions({ width: 800, height: 800 })
    ),
    { width: 800, height: 450 }
  );
});

test("unlocked resize stretches to exactly what was typed", () => {
  assert.deepEqual(
    computeResizeDimensions(
      SOURCE,
      resizeOptions({ width: 500, height: 500, lockAspectRatio: false })
    ),
    { width: 500, height: 500 }
  );
});

test("upscaling is clamped to the source unless explicitly allowed", () => {
  assert.deepEqual(
    computeResizeDimensions(SOURCE, resizeOptions({ width: 3200 })),
    SOURCE
  );
  assert.deepEqual(
    computeResizeDimensions(
      SOURCE,
      resizeOptions({ width: 3200, allowUpscale: true })
    ),
    { width: 3200, height: 1800 }
  );
});

test("a resize with no target returns the source size", () => {
  assert.deepEqual(computeResizeDimensions(SOURCE, resizeOptions()), SOURCE);
});

test("matchLockedAxis keeps the ratio true as the user types", () => {
  assert.deepEqual(matchLockedAxis(SOURCE, "width", 800), {
    width: 800,
    height: 450,
  });
  assert.deepEqual(matchLockedAxis(SOURCE, "height", 450), {
    width: 800,
    height: 450,
  });
});

test("clampCropRect slides an out-of-bounds rect back inside", () => {
  assert.deepEqual(
    clampCropRect({ x: -50, y: -50, width: 400, height: 300 }, SOURCE),
    { x: 0, y: 0, width: 400, height: 300 }
  );
  assert.deepEqual(
    clampCropRect({ x: 1500, y: 800, width: 400, height: 300 }, SOURCE),
    { x: 1200, y: 600, width: 400, height: 300 }
  );
});

test("clampCropRect trims a rect larger than the image", () => {
  assert.deepEqual(
    clampCropRect({ x: 0, y: 0, width: 9999, height: 9999 }, SOURCE),
    { x: 0, y: 0, width: 1600, height: 900 }
  );
});

test("applyCropAspectRatio reshapes around the current centre", () => {
  const square = applyCropAspectRatio(
    { x: 400, y: 200, width: 400, height: 300 },
    SOURCE,
    1
  );
  assert.equal(square.width, square.height);
  assert.ok(square.x >= 0 && square.x + square.width <= SOURCE.width);
  assert.ok(square.y >= 0 && square.y + square.height <= SOURCE.height);
});

test("centeredCropForRatio returns the largest fitting rect", () => {
  assert.deepEqual(centeredCropForRatio(SOURCE, 1), {
    x: 350,
    y: 0,
    width: 900,
    height: 900,
  });
  assert.deepEqual(centeredCropForRatio(SOURCE, 16 / 9), {
    x: 0,
    y: 0,
    width: 1600,
    height: 900,
  });
});

test("polygonBounds grows a freehand shape outward to whole pixels", () => {
  assert.deepEqual(
    polygonBounds(
      [
        { x: 100.6, y: 50.2 },
        { x: 300.1, y: 80.9 },
        { x: 180.4, y: 240.5 },
      ],
      SOURCE
    ),
    { x: 100, y: 50, width: 201, height: 191 }
  );
});

test("polygonBounds clamps a stroke that runs off the image", () => {
  assert.deepEqual(
    polygonBounds(
      [
        { x: -40, y: -40 },
        { x: 1700, y: 100 },
        { x: 800, y: 1000 },
      ],
      SOURCE
    ),
    { x: 0, y: 0, width: 1600, height: 900 }
  );
});

test("polygonBounds rejects clicks and lines too thin to crop", () => {
  assert.equal(polygonBounds([{ x: 10, y: 10 }, { x: 20, y: 20 }], SOURCE), null);
  assert.equal(
    polygonBounds(
      [
        { x: 10, y: 10 },
        { x: 400, y: 12 },
        { x: 200, y: 14 },
      ],
      SOURCE,
      16
    ),
    null
  );
});

test("appendPathPoint skips points too close to the last one", () => {
  const path = [{ x: 0, y: 0 }];
  assert.equal(appendPathPoint(path, { x: 1, y: 1 }, 2), path);
  assert.deepEqual(appendPathPoint(path, { x: 3, y: 0 }, 2), [
    { x: 0, y: 0 },
    { x: 3, y: 0 },
  ]);
  assert.deepEqual(appendPathPoint([], { x: 5, y: 5 }, 2), [{ x: 5, y: 5 }]);
});

test("clampPoint pins a point to the image edge", () => {
  assert.deepEqual(clampPoint({ x: -5, y: 2000 }, SOURCE), { x: 0, y: 900 });
});

const THRESHOLDS = { edge: 16, close: 32, minSize: 16 };

test("polygonArea measures a shape whichever way it winds", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  assert.equal(polygonArea(square), 10000);
  assert.equal(polygonArea([...square].reverse()), 10000);
});

test("pointInPolygon finds points inside and outside a triangle", () => {
  const triangle = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 50, y: 100 },
  ];
  assert.equal(pointInPolygon({ x: 50, y: 20 }, triangle), true);
  assert.equal(pointInPolygon({ x: 5, y: 90 }, triangle), false);
});

test("a loop that ends near its start is a lasso", () => {
  const loop = [
    { x: 400, y: 200 },
    { x: 800, y: 200 },
    { x: 800, y: 600 },
    { x: 400, y: 600 },
    { x: 410, y: 210 },
  ];
  assert.deepEqual(resolveFreehand(loop, SOURCE, THRESHOLDS), {
    kind: "lasso",
    polygon: loop,
  });
});

test("a straight line in the middle encloses nothing and is rejected", () => {
  const line = [
    { x: 200, y: 200 },
    { x: 700, y: 500 },
    { x: 1200, y: 800 },
  ];
  assert.equal(resolveFreehand(line, SOURCE, THRESHOLDS), null);
});

test("a corner-to-corner diagonal splits the image into two triangles", () => {
  const selection = resolveFreehand(
    [
      { x: 0, y: 0 },
      { x: 800, y: 450 },
      { x: 1600, y: 900 },
    ],
    SOURCE,
    THRESHOLDS
  );
  assert.equal(selection?.kind, "cut");
  if (selection?.kind !== "cut") return;
  for (const side of selection.sides) {
    assert.equal(polygonArea(side), (1600 * 900) / 2);
  }
  const topRight = pickCutSide(selection.sides, { x: 1500, y: 100 });
  const bottomLeft = pickCutSide(selection.sides, { x: 100, y: 800 });
  assert.notEqual(topRight, null);
  assert.notEqual(bottomLeft, null);
  assert.notEqual(topRight, bottomLeft);
});

test("an edge-to-edge cut snaps its ends to the border and keeps the clicked side", () => {
  const selection = resolveFreehand(
    [
      { x: 10, y: 300 },
      { x: 800, y: 320 },
      { x: 1590, y: 300 },
    ],
    SOURCE,
    THRESHOLDS
  );
  assert.equal(selection?.kind, "cut");
  if (selection?.kind !== "cut") return;
  assert.deepEqual(selection.stroke[0], { x: 0, y: 300 });
  assert.deepEqual(selection.stroke.at(-1), { x: 1600, y: 300 });

  const top = pickCutSide(selection.sides, { x: 800, y: 50 });
  const bottom = pickCutSide(selection.sides, { x: 800, y: 850 });
  assert.notEqual(top, bottom);
  // The kept side spans the whole width and only its own half of the height.
  assert.deepEqual(polygonBounds(selection.sides[top!], SOURCE), {
    x: 0,
    y: 0,
    width: 1600,
    height: 320,
  });
  assert.deepEqual(polygonBounds(selection.sides[bottom!], SOURCE), {
    x: 0,
    y: 300,
    width: 1600,
    height: 600,
  });
});

test("a line that only skims an edge is not offered as a cut", () => {
  const skim = [
    { x: 100, y: 2 },
    { x: 800, y: 4 },
    { x: 1500, y: 2 },
  ];
  assert.equal(resolveFreehand(skim, SOURCE, THRESHOLDS), null);
});

test("resize templates convert physical sizes at 300 DPI", () => {
  const size = (id: string) => {
    const template = findResizeTemplate(id)!.template;
    return [template.width, template.height];
  };
  assert.deepEqual(size("passport-us"), [600, 600]);
  assert.deepEqual(size("passport-35x45"), [413, 531]);
  assert.deepEqual(size("passport-canada"), [591, 827]);
  assert.deepEqual(size("print-a4"), [2480, 3508]);
  assert.deepEqual(size("print-letter"), [2550, 3300]);
});

test("every resize template has a unique id and a usable size", () => {
  const templates = RESIZE_TEMPLATE_GROUPS.flatMap((group) => group.templates);
  assert.equal(new Set(templates.map(({ id }) => id)).size, templates.length);
  for (const { id, width, height } of templates) {
    assert.ok(Number.isInteger(width) && width > 0, id);
    assert.ok(Number.isInteger(height) && height > 0, id);
  }
});

test("template search matches every word in any order and drops empty groups", () => {
  const ids = (query: string) =>
    searchResizeTemplates(query).flatMap((group) => group.templates.map(({ id }) => id));
  assert.deepEqual(ids("india passport"), ["passport-india"]);
  assert.deepEqual(ids("passport india"), ["passport-india"]);
  assert.ok(ids("twitter").includes("x-header"));
  assert.deepEqual(ids("600x750"), ["passport-uk-digital"]);
  assert.deepEqual(searchResizeTemplates("nothing like this"), []);
  assert.equal(searchResizeTemplates("  "), RESIZE_TEMPLATE_GROUPS);
});

test("applying a template crops to an exact size and can enlarge", () => {
  const applied = applyResizeTemplate(DEFAULT_RESIZE, findResizeTemplate("passport-india")!);
  assert.equal(applied.resizeTemplateId, "passport-india");
  assert.equal(applied.format, "jpeg");
  assert.equal(applied.resize.cropToFit, true);
  assert.equal(applied.resize.allowUpscale, true);
  assert.equal(applied.resize.lockAspectRatio, false);

  const social = applyResizeTemplate(applied.resize, findResizeTemplate("x-post")!);
  assert.equal(social.format, "auto");

  const cleared = clearResizeTemplate(applied.resize);
  assert.equal(cleared.resizeTemplateId, null);
  assert.equal(cleared.format, "auto");
  assert.deepEqual(cleared.resize, DEFAULT_RESIZE);
});

test("a crop-to-fit resize is exact, in any shape, including an edited size", () => {
  const { resize } = applyResizeTemplate(DEFAULT_RESIZE, findResizeTemplate("instagram-square")!);
  const crop = coverCropForResize(SOURCE, resize)!;
  assert.deepEqual(crop, { x: 350, y: 0, width: 900, height: 900 });
  assert.deepEqual(computeResizeDimensions(crop, resize), { width: 1080, height: 1080 });

  const edited = { ...resize, width: 500, height: 250 };
  const editedCrop = coverCropForResize(SOURCE, edited)!;
  assert.equal(editedCrop.width / editedCrop.height, 2);
  assert.deepEqual(computeResizeDimensions(editedCrop, edited), { width: 500, height: 250 });
});

test("a crop placement positions the crop within the spare room", () => {
  const { resize } = applyResizeTemplate(DEFAULT_RESIZE, findResizeTemplate("instagram-square")!);
  const at = (x: number, y: number) =>
    coverCropForResize(SOURCE, { ...resize, cropPlacement: { x, y, zoom: 1 } })!;
  assert.deepEqual(at(0, 0.5), { x: 0, y: 0, width: 900, height: 900 });
  assert.deepEqual(at(1, 0.5), { x: 700, y: 0, width: 900, height: 900 });
  assert.deepEqual(at(0.5, 0.5), coverCropForResize(SOURCE, resize));
  // The placement is a fraction, so it stays put when the target shape changes.
  const tall = coverCropForResize(SOURCE, {
    ...resize,
    width: 300,
    height: 900,
    cropPlacement: { x: 1, y: 0, zoom: 1 },
  })!;
  assert.equal(tall.x + tall.width, SOURCE.width);
});

test("moving a crop stops at the edges and ignores an axis with no room", () => {
  const crop = { width: 900, height: 900 };
  const start = { x: 0.5, y: 0.5, zoom: 1 };
  assert.deepEqual(moveCropPlacement(start, 350, 100, SOURCE, crop), { x: 1, y: 0.5, zoom: 1 });
  assert.deepEqual(moveCropPlacement(start, -5000, 0, SOURCE, crop), { x: 0, y: 0.5, zoom: 1 });
  assert.deepEqual(moveCropPlacement(start, 175, 0, SOURCE, crop), { x: 0.75, y: 0.5, zoom: 1 });
});

test("zooming keeps the crop's shape and exact output size", () => {
  const { resize } = applyResizeTemplate(DEFAULT_RESIZE, findResizeTemplate("instagram-square")!);
  const crop = coverCropForResize(SOURCE, { ...resize, cropPlacement: { x: 0.5, y: 0.5, zoom: 2 } })!;
  assert.deepEqual(crop, { x: 575, y: 225, width: 450, height: 450 });
  assert.deepEqual(computeResizeDimensions(crop, resize), { width: 1080, height: 1080 });
});

test("zooming holds the crop's centre still and stays inside the image", () => {
  const { resize } = applyResizeTemplate(DEFAULT_RESIZE, findResizeTemplate("instagram-square")!);
  const cropAt = (cropPlacement: { x: number; y: number; zoom: number }) =>
    coverCropForResize(SOURCE, { ...resize, cropPlacement })!;

  // Hard left at zoom 1 has its centre at x=450. Zooming in must not drift off it.
  const start = { x: 0, y: 0.5, zoom: 1 };
  const zoomed = zoomCropPlacement(start, 2, SOURCE, resize);
  const crop = cropAt(zoomed);
  assert.equal(crop.x + crop.width / 2, 450);
  assert.equal(crop.y + crop.height / 2, 450);

  // Zooming back out has to slide back inside the image.
  assert.deepEqual(cropAt(zoomCropPlacement(zoomed, 1, SOURCE, resize)), {
    x: 0,
    y: 0,
    width: 900,
    height: 900,
  });

  assert.equal(zoomCropPlacement(start, 99, SOURCE, resize).zoom, MAX_CROP_ZOOM);
  assert.equal(zoomCropPlacement(start, 0.2, SOURCE, resize).zoom, 1);
});

/** Fake encoder: quality 1 makes a 1000-byte file. Records every attempt. */
function fakeEncoder(minSize = 0) {
  const attempts: number[] = [];
  const encode = async (quality: number) => {
    attempts.push(quality);
    return { size: Math.max(minSize, quality * 1000), quality };
  };
  return { encode, attempts };
}

test("a size limit leaves a file alone when it already fits", async () => {
  const { encode, attempts } = fakeEncoder();
  const { blob, overLimit } = await encodeWithinLimit(encode, 0.9, 950, true);
  assert.equal(blob.quality, 0.9);
  assert.equal(overLimit, false);
  assert.equal(attempts.length, 1);
});

test("no size limit means one encode at the requested quality", async () => {
  const { encode, attempts } = fakeEncoder();
  assert.equal((await encodeWithinLimit(encode, 0.9, null, true)).blob.quality, 0.9);
  assert.equal(attempts.length, 1);
});

test("a size limit finds a high quality that fits", async () => {
  const { encode } = fakeEncoder();
  const { blob, overLimit } = await encodeWithinLimit(encode, 0.9, 500, true);
  assert.equal(overLimit, false);
  assert.ok(blob.size <= 500);
  assert.ok(blob.size > 480, `quality search stopped early at ${blob.size}`);
});

test("an impossible size limit reports it and returns the smallest file", async () => {
  const { encode } = fakeEncoder(700);
  const { blob, overLimit } = await encodeWithinLimit(encode, 0.9, 500, true);
  assert.equal(overLimit, true);
  assert.equal(blob.size, 700);
});

test("a lossless format over its limit gets one attempt and is flagged", async () => {
  const { encode, attempts } = fakeEncoder();
  const { overLimit } = await encodeWithinLimit(encode, 1, 500, false);
  assert.equal(overLimit, true);
  assert.equal(attempts.length, 1);
});

test("a size limit moves PNG to JPEG and only applies to resize", () => {
  const limited = { ...DEFAULT_TOOL_SETTINGS, maxFileKb: 50 };
  assert.equal(resolveToolFormat("resize", limited, "image/png"), "jpeg");
  assert.equal(resolveToolFormat("resize", limited, "image/webp"), "webp");
  assert.equal(resolveToolFormat("resize", DEFAULT_TOOL_SETTINGS, "image/png"), "png");
  assert.equal(resolveToolFormat("rotate", limited, "image/png"), "png");

  const options = buildProcessOptions("resize", limited, "image/png");
  assert.equal(options.encode.format, "jpeg");
  assert.equal(options.encode.maxBytes, 50 * BYTES_PER_KB);
  assert.equal(buildProcessOptions("rotate", limited, "image/png").encode.maxBytes, null);
});

test("only a pixel resize with both axes crops to fit", () => {
  const resize = { ...DEFAULT_RESIZE, width: 100, height: 100 };
  assert.equal(coverCropForResize(SOURCE, resize), null);
  assert.equal(coverCropForResize(SOURCE, { ...resize, cropToFit: true, mode: "percentage" }), null);
  assert.equal(coverCropForResize(SOURCE, { ...resize, cropToFit: true, width: null }), null);
});

test("a template with an emptied box scales proportionally rather than stretching", () => {
  const { resize } = applyResizeTemplate(DEFAULT_RESIZE, findResizeTemplate("x-post")!);
  const options = buildProcessOptions(
    "resize",
    { ...DEFAULT_TOOL_SETTINGS, resize: { ...resize, height: null } },
    "image/png"
  );
  assert.equal(options.resize?.cropToFit, false);
  assert.equal(options.resize?.lockAspectRatio, true);
});

test("fitWithin shrinks to the box but never enlarges", () => {
  assert.deepEqual(fitWithin(SOURCE, { width: 800, height: 800 }), {
    width: 800,
    height: 450,
  });
  assert.deepEqual(fitWithin({ width: 100, height: 100 }, { width: 800, height: 800 }), {
    width: 100,
    height: 100,
  });
});

test("format metadata matches what canvas encoders expect", () => {
  assert.equal(mimeFor("jpeg"), "image/jpeg");
  assert.equal(extensionFor("jpeg"), "jpg");
  assert.equal(isLossy("png"), false);
  assert.equal(isLossy("webp"), true);
  assert.equal(supportsTransparency("jpeg"), false);
  assert.equal(supportsTransparency("webp"), true);
});

test("formatFromMime is case-insensitive and rejects what we cannot encode", () => {
  assert.equal(formatFromMime("image/PNG"), "png");
  assert.equal(formatFromMime(" image/jpg "), "jpeg");
  assert.equal(formatFromMime("image/tiff"), null);
  assert.equal(formatFromMime("image/svg+xml"), null);
});

test("clampQuality bounds lossy values and ignores quality for lossless", () => {
  assert.equal(clampQuality(0.8, "jpeg"), 0.8);
  assert.equal(clampQuality(5, "jpeg"), 1);
  assert.equal(clampQuality(-1, "jpeg"), 0.01);
  assert.equal(clampQuality(Number.NaN, "webp"), 1);
  assert.equal(clampQuality(0.2, "png"), 1);
});

test("compression levels trade quality for size in the right direction", () => {
  assert.ok(
    qualityForLevel("low", "jpeg") > qualityForLevel("medium", "jpeg")
  );
  assert.ok(
    qualityForLevel("medium", "jpeg") > qualityForLevel("high", "jpeg")
  );
  assert.ok(
    qualityForLevel("high", "jpeg") > qualityForLevel("extreme", "jpeg")
  );
});

test("formatBytes reads like a file manager", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(1536), "1.5 KB");
  assert.equal(formatBytes(15 * 1024), "15 KB");
  assert.equal(formatBytes(2 * 1024 * 1024), "2.0 MB");
  assert.equal(formatBytes(-1), "-");
});

test("savingsPercent reports growth as a negative saving", () => {
  assert.equal(savingsPercent(1000, 250), 75);
  assert.equal(savingsPercent(1000, 1200), -20);
  assert.equal(savingsPercent(0, 100), 0);
});

test("filenames are stripped of characters that break zips and downloads", () => {
  assert.equal(sanitizeFilename("my/screen:shot?.png"), "my-screen-shot-.png");
  assert.equal(sanitizeFilename("   "), "image");
});

test("baseName keeps dotted names and leading-dot files intact", () => {
  assert.equal(baseName("shot.final.png"), "shot.final");
  assert.equal(baseName("shot"), "shot");
  assert.equal(baseName(".gitignore"), ".gitignore");
});

test("swapExtension and outputFilename produce the download name", () => {
  assert.equal(swapExtension("shot.png", "webp"), "shot.webp");
  assert.equal(swapExtension("shot.png", "jpeg"), "shot.jpg");
  assert.equal(outputFilename("shot.png", "jpeg"), "shot.jpg");
  assert.equal(
    outputFilename("shot.png", "png", "compressed"),
    "shot-compressed.png"
  );
});

test("uniqueFilename keeps batch zip entries from overwriting each other", () => {
  const taken = new Set(["shot.png"]);
  assert.equal(uniqueFilename("other.png", taken), "other.png");
  assert.equal(uniqueFilename("shot.png", taken), "shot (2).png");

  taken.add("shot (2).png");
  assert.equal(uniqueFilename("shot.png", taken), "shot (3).png");
});

test("batchArchiveName is a safe zip name", () => {
  assert.equal(
    batchArchiveName("compress-image"),
    "screenshot-studio-compress-image.zip"
  );
});

test("resolveOutputFormat keeps the source format on auto", () => {
  assert.equal(resolveOutputFormat("auto", "image/png"), "png");
  assert.equal(resolveOutputFormat("auto", "image/webp"), "webp");
  assert.equal(resolveOutputFormat("webp", "image/png"), "webp");
});

test("resolveOutputFormat falls back to PNG for decode-only sources", () => {
  assert.equal(resolveOutputFormat("auto", "image/tiff"), "png");
  assert.equal(resolveOutputFormat("auto", ""), "png");
});

test("each batch engine only sends the pipeline the options it uses", () => {
  const settings = {
    ...DEFAULT_TOOL_SETTINGS,
    // A crop rect is deliberately present: the batch builder must never pass
    // it through, because only the interactive crop tool sets one.
    crop: { x: 10, y: 10, width: 100, height: 100 },
    transform: { rotate: 90 as const, flipHorizontal: true, flipVertical: false },
    resize: { ...DEFAULT_RESIZE, width: 640 },
  };

  for (const engine of ["compress", "convert", "resize", "rotate"] as const) {
    assert.equal(
      buildProcessOptions(engine, settings, "image/jpeg").crop,
      null,
      `${engine} must not carry a crop rect`
    );
  }

  const compress = buildProcessOptions("compress", settings, "image/jpeg");
  assert.equal(compress.transform, null);
  assert.equal(compress.resize, null);

  const resize = buildProcessOptions("resize", settings, "image/jpeg");
  assert.equal(resize.resize?.width, 640);
  assert.equal(resize.transform, null);

  const rotate = buildProcessOptions("rotate", settings, "image/jpeg");
  assert.equal(rotate.transform?.rotate, 90);
  assert.equal(rotate.resize, null);
});

test("resize and rotate re-encode at the shared high-quality default", () => {
  const settings = { ...DEFAULT_TOOL_SETTINGS };
  assert.equal(
    buildProcessOptions("resize", settings, "image/jpeg").encode.quality,
    DEFAULT_REENCODE_QUALITY
  );
  assert.equal(
    buildProcessOptions("rotate", settings, "image/jpeg").encode.quality,
    DEFAULT_REENCODE_QUALITY
  );
});

test("compress quality follows the preset level, not the manual slider", () => {
  const gentle = buildProcessOptions(
    "compress",
    { ...DEFAULT_TOOL_SETTINGS, level: "low" },
    "image/jpeg"
  );
  const aggressive = buildProcessOptions(
    "compress",
    { ...DEFAULT_TOOL_SETTINGS, level: "extreme" },
    "image/jpeg"
  );
  assert.ok(gentle.encode.quality > aggressive.encode.quality);
});

test("convert honours the manual quality slider only when it is enabled", () => {
  const auto = buildProcessOptions(
    "convert",
    { ...DEFAULT_TOOL_SETTINGS, quality: 0.5 },
    "image/jpeg"
  );
  assert.equal(auto.encode.quality, 0.5);

  const manual = buildProcessOptions(
    "convert",
    { ...DEFAULT_TOOL_SETTINGS, quality: 0.4, useCustomQuality: true },
    "image/jpeg"
  );
  assert.equal(manual.encode.quality, 0.4);
});

test("output names only gain a suffix when they would overwrite the source", () => {
  assert.equal(buildOutputName("convert", "shot.png", "jpeg"), "shot.jpg");
  assert.equal(buildOutputName("compress", "shot.png", "png"), "shot-compressed.png");
  assert.equal(buildOutputName("resize", "shot.jpg", "jpeg"), "shot-resized.jpg");
  assert.equal(buildOutputName("rotate", "shot.PNG", "png"), "shot-rotated.png");
  assert.equal(buildOutputName("crop", "shot.webp", "png"), "shot.png");
});

test("output names keep the extension the source arrived with", () => {
  // ".jpeg" and ".jpg" are one format, so an operation that does not change
  // the format must not rename the file between them.
  assert.equal(buildOutputName("resize", "shot.jpeg", "jpeg"), "shot-resized.jpeg");
  assert.equal(buildOutputName("compress", "shot.jpeg", "jpeg"), "shot-compressed.jpeg");
  // Rewriting the extension used to hide the collision, dropping the suffix.
  assert.equal(buildOutputName("rotate", "shot.JPEG", "jpeg"), "shot-rotated.jpeg");
  // A real conversion still takes the target format's canonical extension.
  assert.equal(buildOutputName("convert", "shot.jpeg", "webp"), "shot.webp");
  // JPEG's rarer spellings are just as much JPEG; ".jfif" is what Windows and
  // older Chrome wrote, so those files are still in circulation.
  assert.equal(buildOutputName("resize", "shot.jfif", "jpeg"), "shot-resized.jfif");
  assert.equal(buildOutputName("resize", "shot.jpe", "jpeg"), "shot-resized.jpe");
});
