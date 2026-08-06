import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.23.136", "192.168.1.16", "192.168.1.4"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "scontent-lga3-1.xx.fbcdn.net"
      }
    ],
  },

  /**
   * Service-worker infrastructure must never be served from an HTTP cache.
   *
   * `sw-manifest.json` is the deployment fingerprint the worker polls — a
   * cached copy would hide new releases. The worker script and its modules are
   * revalidated on every update check, so they get `max-age=0` rather than
   * `no-store` (which some proxies handle poorly for scripts).
   *
   * `/_next/static/*` is left alone: Next already serves it immutable.
   */
  async headers() {
    const noCache = [
      { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
    ];
    const revalidate = [
      { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
    ];

    return [
      {
        source: "/service-worker.js",
        headers: [
          ...revalidate,
          // Allows the worker to control the whole origin regardless of the
          // path it is served from.
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      { source: "/sw/:path*", headers: revalidate },
      { source: "/offline.html", headers: revalidate },
      { source: "/sw-manifest.json", headers: noCache },
    ];
  },
};

export default nextConfig;
