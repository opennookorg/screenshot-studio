"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { demoImagePaths } from "@/lib/r2-demo-images";
import "./MasonryGrid.css";

const ZOOM_IMAGES = demoImagePaths.slice(0, 7);

function ZoomFrame({
  src,
  alt,
  scale,
}: {
  src: string;
  alt: string;
  scale: MotionValue<number> | number;
}): React.JSX.Element {
  return (
    <motion.div style={{ scale }} className="zoom-parallax__el">
      <div className="zoom-parallax__frame">
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 35vw"
          quality="auto"
          crop="fill"
          gravity="auto"
        />
      </div>
    </motion.div>
  );
}

function StaticFallback(): React.JSX.Element {
  return (
    <section className="hidden bg-background px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-20 md:block md:pt-24 md:pb-24">
      <div className="container mx-auto grid max-w-[1400px] grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {ZOOM_IMAGES.map((image, index) => (
          <article
            key={image}
            className="relative aspect-video overflow-hidden rounded-2xl bg-muted/30 shadow-[var(--card-edge-shadow)] ring-1 ring-border"
          >
            <OptimizedImage
              src={image}
              alt={`Example design ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
              quality="auto"
              crop="fill"
              gravity="auto"
            />
          </article>
        ))}
      </div>
    </section>
  );
}

export function MasonryGrid(): React.JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales: MotionValue<number>[] = [
    scale4,
    scale5,
    scale6,
    scale5,
    scale6,
    scale8,
    scale9,
  ];

  if (reduceMotion) {
    return <StaticFallback />;
  }

  return (
    <section
      className="hidden bg-background md:block md:pt-24"
      aria-label="Example designs"
    >
      <div ref={container} className="zoom-parallax">
        <div className="zoom-parallax__sticky">
          {ZOOM_IMAGES.map((src, index) => (
            <ZoomFrame
              key={src}
              src={src}
              alt={`Example design ${index + 1}`}
              scale={scales[index] ?? scale4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
