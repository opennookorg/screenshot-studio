import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        // R2 custom domain (new)
        protocol: "https",
        hostname: "assets.screenshot-studio.com",
      },
    ],
  },

  // Enable SharedArrayBuffer for multi-threaded FFmpeg WASM
  // Requires Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy
  // Only applied to editor routes — applying globally breaks YouTube embeds on landing page
  async headers() {
    return [
      // Security and SEO headers for all pages
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Vary", value: "Accept" },
        ],
      },
      // COOP/COEP for editor routes (FFmpeg WASM)
      {
        source: "/editor/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      {
        source: "/home",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      // Cross-origin isolation lets the background remover run ONNX WASM
      // multi-threaded. credentialless still allows the Hugging Face model fetch.
      {
        source: "/:locale(es|fr|de|ja|pt|ko|zh)?/remove-background",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      // Same isolation as the editor, so the video compressor gets the
      // multi-threaded FFmpeg core instead of the much slower single thread.
      {
        source: "/:locale(es|fr|de|ja|pt|ko|zh)?/compress-video",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      // A module worker started from an isolated page is blocked unless its own
      // script response carries a compatible COEP. The header is inert on
      // ordinary scripts, so it is safe on every static chunk.
      // The unbundled FFmpeg worker (see lib/export/ffmpeg-encoder.ts) is a
      // module worker too, so it needs the same header.
      {
        source: "/ffmpeg/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },

  // Permanent redirects for SEO (301)
  async redirects() {
    return [
      {
        source: "/features/background-remover",
        destination: "/remove-background",
        statusCode: 301,
      },
      {
        source: "/home",
        destination: "/editor",
        statusCode: 301,
      },
      {
        source: "/free-screenshot-editor-online",
        destination: "/free-screenshot-editor",
        statusCode: 301,
      },
      {
        source: "/free-screenshot-studio/:path*",
        destination: "/free-screenshot-editor",
        statusCode: 301,
      },
      {
        source: "/blog/:slug*",
        destination: "/guides/:slug*",
        statusCode: 301,
      },
    ];
  },

  // Proxy R2 assets through same origin to avoid CORS issues
  // (especially critical for canvas capture during video export)
  // Also proxy PostHog through same origin to bypass ad blockers
  async rewrites() {
    const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    return {
      beforeFiles: [
        {
          source: "/guides",
          destination:
            "https://o--dfb8769c-6039-46cd-8425-71c74b77f43f.outrankblog.com/",
        },
        {
          source: "/guides/:path*",
          destination:
            "https://o--dfb8769c-6039-46cd-8425-71c74b77f43f.outrankblog.com/:path*",
        },
      ],
      afterFiles: [
        {
          source: "/llms.txt",
          destination: "/api/llms",
        },
        {
          source: "/llms-full.txt",
          destination: "/api/llms-full",
        },
        {
          source: "/openapi.json",
          destination: "/api/openapi",
        },
        {
          source: "/indexnow-key.txt",
          destination: "/api/indexnow",
        },
        {
          source: "/.well-known/openapi.json",
          destination: "/api/openapi",
        },
        {
          source: "/svc/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/svc/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
        ...(r2Url
          ? [
              {
                source: "/r2-assets/:path*",
                destination: `${r2Url}/:path*`,
              },
            ]
          : []),
      ],
      fallback: [],
    };
  },

  // REQUIRED for react-konva
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    if (!isServer) {
      // transformers.js (background remover) references Node-only backends
      // that must never be bundled for the browser. Server code still uses sharp.
      config.resolve.alias = {
        ...config.resolve.alias,
        "sharp$": false,
        "onnxruntime-node$": false,
      };
    }
    return config;
  },

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {},

};

export default withNextIntl(nextConfig);
