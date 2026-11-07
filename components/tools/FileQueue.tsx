"use client";

import * as React from "react";
import Image from "next/image";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Loading03Icon,
} from "hugeicons-react";
import { cn } from "@/lib/utils";
import { formatBytes, savingsPercent } from "@/lib/image-tools";
import type { QueueItem } from "./useToolQueue";

interface FileQueueProps {
  items: QueueItem[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

function StatusBadge({ item }: { item: QueueItem }) {
  if (item.status === "processing") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loading03Icon size={14} className="animate-spin" aria-hidden="true" />
        Processing
      </span>
    );
  }

  if (item.status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <Alert02Icon size={14} aria-hidden="true" />
        {item.error ?? "Failed"}
      </span>
    );
  }

  if (item.status === "done" && item.result) {
    const saved = savingsPercent(item.bytes, item.result.bytes);

    if (item.keptOriginal) {
      // Naming the reason matters most for PNG, where nothing the compressor
      // does can shrink the file and an unchanged size looks like a failure.
      const lossless = item.file.type === "image/png";
      return (
        <span
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          title={
            lossless
              ? "PNG stores every pixel exactly, so there is nothing to discard. Re-encoding produced a file no smaller than yours, so your original was kept. Pick another output format for a real reduction."
              : "Re-encoding produced a file no smaller than yours, so your original was kept."
          }
        >
          <CheckmarkCircle02Icon
            size={14}
            className="text-emerald-600 dark:text-emerald-500"
            aria-hidden="true"
          />
          {lossless
            ? `PNG is lossless - nothing to remove, original kept (${formatBytes(item.bytes)})`
            : `Already optimised, original kept (${formatBytes(item.bytes)})`}
        </span>
      );
    }

    // A file that came back bigger is not a success, whatever the user asked
    // for, so it does not get the green tick that every other result carries.
    const grew = saved < 0;
    const warn = grew || item.result.overLimit;

    return (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {warn ? (
            <Alert02Icon
              size={14}
              className="text-amber-600 dark:text-amber-500"
              aria-hidden="true"
            />
          ) : (
            <CheckmarkCircle02Icon
              size={14}
              className="text-emerald-600 dark:text-emerald-500"
              aria-hidden="true"
            />
          )}
          {formatBytes(item.bytes)} → {formatBytes(item.result.bytes)}
        </span>
        <span
          className={cn(
            "font-medium",
            saved > 0 && "text-emerald-600 dark:text-emerald-500",
            grew && "text-amber-600 dark:text-amber-500",
            saved === 0 && "text-muted-foreground"
          )}
          title={
            grew
              ? "This output format stores more data than the original did, so the file grew. Pick another output format to reduce it instead."
              : undefined
          }
        >
          {saved > 0 ? `-${saved}%` : grew ? `+${Math.abs(saved)}% bigger` : "same size"}
        </span>
        <span className="text-muted-foreground">
          {item.result.width} × {item.result.height}
        </span>
        {item.result.overLimit ? (
          <span className="font-medium text-amber-600 dark:text-amber-500">
            Can&apos;t reach your size limit at these dimensions
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      {formatBytes(item.bytes)}
      {item.source ? ` · ${item.source.width} × ${item.source.height}` : ""}
    </span>
  );
}

export function FileQueue({ items, onRemove, disabled = false }: FileQueueProps) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col" aria-label="Images to process">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-foreground/[0.03]"
        >
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-border">
            {/* Object URLs are local blobs; next/image cannot optimise them. */}
            <Image
              src={item.previewUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="48px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-0.5 truncate text-sm font-medium text-foreground" title={item.name}>
              {item.name}
            </p>
            <StatusBadge item={item} />
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            aria-label={`Remove ${item.name}`}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <Cancel01Icon size={15} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
