import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local hero illustration is served as SVG; safe since it's a static
    // asset from our own /public directory, not user-uploaded content.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
};

export default nextConfig;
