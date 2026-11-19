/**
 * Real studio & lifestyle sample photos served from /public/samples/
 * used in Template Library previews and the Template Detail Inspector
 * so templates look like real finished photobooth prints.
 */

export const SAMPLE_STUDIO_PHOTOS: string[] = [
  "/samples/sample-1.jpg",
  "/samples/sample-2.jpg",
  "/samples/sample-3.jpg",
  "/samples/sample-4.jpg",
  "/samples/sample-5.jpg",
  "/samples/sample-6.jpg",
];

const sampleSlotCache = new Map<number, string[]>();

export function getSampleSlotImages(count: number): string[] {
  const existing = sampleSlotCache.get(count);
  if (existing) return existing;
  const list = Array.from(
    { length: count },
    (_, i) => SAMPLE_STUDIO_PHOTOS[i % SAMPLE_STUDIO_PHOTOS.length]
  );
  sampleSlotCache.set(count, list);
  return list;
}
