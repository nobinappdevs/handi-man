// Dev-only: lets a phone on the same Wi-Fi hit `next dev` without an origin warning.
const lanDevOrigins = [
  "192.168.*.*",
  "10.*.*.*",
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static SPA — `npm run build` emits `out/`, deployable to any static host.
  output: "export",

  // Mandatory with `output: "export"`: there is no server to run the optimizer.
  images: {
    unoptimized: true,
  },

  reactCompiler: true,

  allowedDevOrigins: lanDevOrigins,
};

export default nextConfig;
