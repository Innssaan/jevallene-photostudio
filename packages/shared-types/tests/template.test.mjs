import assert from "node:assert/strict";
import test from "node:test";
import {
  BUILTIN_TEMPLATES,
  MANDATORY_WATERMARK_BRAND,
  createDynamicPhotoboxTemplate,
  enforceMandatoryWatermark,
  validateTemplateDocument,
} from "../dist/index.js";

test("validates a complete TemplateDocument with Jevallene watermark", () => {
  const doc = {
    schemaVersion: "1.0",
    templateId: "tpl-korean-4cut",
    version: 1,
    category: "photobox",
    theme: "korean",
    canvas: {
      width: 1200,
      height: 1800,
      aspectRatio: "2:3",
      background: { type: "solid", value: "#FAF8F5" },
    },
    slots: [
      { id: "slot-1", index: 0, x: 100, y: 120, width: 1000, height: 360 },
    ],
    layers: [],
    watermark: enforceMandatoryWatermark(),
  };

  const result = validateTemplateDocument(doc);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(doc.watermark.brand, MANDATORY_WATERMARK_BRAND);
  assert.equal(doc.watermark.locked, true);
});

test("rejects template when watermark is missing or unlocked", () => {
  const doc = {
    schemaVersion: "1.0",
    templateId: "tpl-invalid",
    version: 1,
    category: "collage",
    theme: "minimal",
    canvas: {
      width: 1080,
      height: 1080,
      aspectRatio: "1:1",
      background: { type: "solid", value: "#FFFFFF" },
    },
    slots: [],
    layers: [],
    watermark: {
      brand: "OtherBrand",
      locked: false,
      placement: "bottom-right",
      contrastMode: "auto",
      minScale: 0.025,
      maxScale: 0.06,
    },
  };

  const result = validateTemplateDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Jevallene")));
  assert.ok(result.errors.some((e) => e.includes("locked")));
});

test("all BUILTIN_TEMPLATES pass validation and enforce Jevallene watermark", () => {
  assert.ok(BUILTIN_TEMPLATES.length >= 8);
  for (const preset of BUILTIN_TEMPLATES) {
    const res = validateTemplateDocument(preset.document);
    assert.equal(res.valid, true, `Preset ${preset.id} failed: ${res.errors.join(", ")}`);
    assert.equal(preset.document.watermark.brand, MANDATORY_WATERMARK_BRAND);
    assert.equal(preset.document.watermark.locked, true);
    assert.ok(preset.document.slots.length >= 2);
  }
});

test("createDynamicPhotoboxTemplate generates valid 2-8 shot templates", () => {
  for (const count of [2, 3, 4, 6, 8]) {
    const doc = createDynamicPhotoboxTemplate(count, { dark: count === 4 });
    const res = validateTemplateDocument(doc);
    assert.equal(res.valid, true);
    assert.equal(doc.slots.length, count);
    assert.equal(doc.watermark.brand, MANDATORY_WATERMARK_BRAND);
  }
});
