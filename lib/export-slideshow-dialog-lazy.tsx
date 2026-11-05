"use client";

import dynamic from "next/dynamic";
import { useHasOpened } from "@/hooks/useHasOpened";

const ExportSlideshowDialog = dynamic(
  () => import("./export-slideshow-dialog").then((m) => m.ExportSlideshowDialog),
  { ssr: false },
);

export function LazyExportSlideshowDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const hasOpened = useHasOpened(open);
  return hasOpened ? <ExportSlideshowDialog open={open} onOpenChange={onOpenChange} /> : null;
}
