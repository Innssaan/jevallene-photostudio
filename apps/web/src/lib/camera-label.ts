/**
 * Format raw MediaDeviceInfo labels (e.g. "camera2 0, facing back") into
 * clear user-friendly names ("Kamera Depan" / "Kamera Belakang").
 */
export function formatCameraLabel(
  rawLabel: string | undefined,
  index: number,
  isId: boolean
): string {
  const label = (rawLabel || "").trim();
  if (!label) {
    return isId ? `Kamera ${index + 1}` : `Camera ${index + 1}`;
  }

  const lower = label.toLowerCase();
  if (/facing\s*front|\bfront\b|\bselfie\b|\buser\b/.test(lower)) {
    return isId ? "Kamera Depan" : "Front Camera";
  }

  if (/facing\s*back|\bback\b|\brear\b|\benvironment\b/.test(lower)) {
    if (/ultra\s*wide|0\.5x/.test(lower)) {
      return isId ? "Kamera Belakang (Ultra Wide)" : "Back Camera (Ultra Wide)";
    }
    if (/tele|zoom/.test(lower)) {
      return isId ? "Kamera Belakang (Telephoto)" : "Back Camera (Telephoto)";
    }
    return isId ? "Kamera Belakang" : "Back Camera";
  }

  return label;
}
