const nextConfig = {
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    minimumCacheTTL: 31536000
  },
  async headers() {
    return [
      {
        source: "/models/tianrong-robot-dog.v1.glb",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/models/tianrong-robot-dog-industrial.glb",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/models/tianrong-robot-dog-industrial-repaired.glb",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/videos/tianrong/autonomous-patrol.v1.mp4",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/videos/tianrong/s07-complex-scene-2.mp4",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/videos/tianrong/practice-case.mp4",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/images/tianrong/industrial-inspection.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/images/tianrong/final-assets/logistics-yard-road.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ];
  }
};

export default nextConfig;
