import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0B0E",
        }}
      >
        <svg width="144" height="144" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="32" fill="#0B0B0E" />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#E5142A"
            strokeWidth="2.8"
            strokeDasharray="140 36"
          />
          <path
            d="M 36.5 18 C 36.5 24 36.5 31 36.5 37.5 C 36.5 42.5 32.5 46.5 27.5 46.5 C 23.8 46.5 20.8 44.3 19.6 41"
            stroke="#FAFAFA"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="36.5" cy="18" r="2.8" fill="#E5142A" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
