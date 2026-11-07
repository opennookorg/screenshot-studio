# Screenshot Studio

<a href="https://vercel.com/oss"><img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" /></a>

![Screenshot Studio editor preview](https://github.com/user-attachments/assets/2c27aef0-b5d0-41a0-98b3-d2008ad9c232)

A free, open-source editor for screenshots, mockups, and social graphics. No signup or watermarks.

[Open the editor](https://www.screenshot-studio.com/editor) · [Image tools](https://www.screenshot-studio.com/tools) · [Code to image](https://www.screenshot-studio.com/code) · [App Store screenshots](https://www.screenshot-studio.com/store-screenshots)

## What you can make

- **Screenshot designs:** backgrounds, browser and device frames, shadows, and 3D perspective.
- **Text-only graphics:** start without an image; choose Inter, Geist, or other fonts, then drag or center your text.
- **Layered compositions:** text, images, annotations, and blur regions.
- **Store and social assets:** ready-made layouts and exact export sizes, including Chrome Web Store screenshots.
- **Images and motion:** PNG, JPEG, WebP, batch ZIP, MP4, WebM, and GIF exports.
- **Quick edits:** resize to ready-made sizes like passport photos, crop by hand, convert, compress, and remove image backgrounds.

## Run locally

Requires Node.js 20.9+ and npm.

```bash
git clone https://github.com/opennookorg/screenshot-studio.git
cd screenshot-studio
npm ci
printf 'DATABASE_URL="postgresql://localhost:5432/screenshot_studio"\n' > .env
npm run dev
```

Open [localhost:3000](http://localhost:3000). The browser editor needs no running database; `DATABASE_URL` is required by Prisma during startup and builds. Server-side screenshot caching requires PostgreSQL and R2 credentials; see the [cache configuration](./lib/screenshot-cache.ts).

## Contribute

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow and checks. Built with Next.js, React, TypeScript, Tailwind CSS, and Zustand.

Created by [Kartik Labhshetwar](https://github.com/KartikLabhshetwar) and maintained together with [Aniket Rawat](https://github.com/AniketR10).

[Apache 2.0 license](./LICENSE) · Supported by the [Vercel OSS Program](https://vercel.com/oss)
