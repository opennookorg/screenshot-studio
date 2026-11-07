"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Download04Icon,
  MagicWand01Icon,
  Delete02Icon,
  Loading03Icon,
} from "hugeicons-react";
import {
  buildOutputName,
  buildProcessOptions,
  detectEncodeSupport,
  formatBytes,
  formatFromMime,
  resolveToolFormat,
  savingsPercent,
  DEFAULT_TOOL_SETTINGS,
  type BatchToolEngine,
  type CropPlacement,
  type RasterFormat,
  type ToolSettings,
} from "@/lib/image-tools";
import type { ToolDefinition, ToolEngine } from "@/lib/seo/tools";
import { ToolDropzone } from "./ToolDropzone";
import { FileQueue } from "./FileQueue";
import { CropPositioner } from "./CropPositioner";
import { useToolQueue } from "./useToolQueue";
import { CARD_CLASS } from "./ui";
import {
  CompressOptions,
  ConvertOptions,
  ResizeOptions,
  RotateOptions,
  type PanelProps,
} from "./ToolOptions";

const ACTION_LABEL: Record<ToolEngine, string> = {
  compress: "Compress",
  convert: "Convert",
  resize: "Resize",
  crop: "Crop",
  rotate: "Apply",
};

const PANELS: Record<BatchToolEngine, React.ComponentType<PanelProps>> = {
  compress: CompressOptions,
  convert: ConvertOptions,
  resize: ResizeOptions,
  rotate: RotateOptions,
};

interface ToolWorkspaceProps {
  tool: ToolDefinition;
}

function initialSettings(tool: ToolDefinition): ToolSettings {
  return {
    ...DEFAULT_TOOL_SETTINGS,
    // Converter landing pages arrive with their target already chosen; the
    // generic converter starts on WebP as the most useful default.
    format:
      tool.preset?.targetFormat ??
      (tool.engine === "convert" ? "webp" : "auto"),
  };
}

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  const engine = tool.engine as BatchToolEngine;
  const queue = useToolQueue(tool.slug.replace(/^\//, ""));
  const [settings, setSettings] = React.useState<ToolSettings>(() =>
    initialSettings(tool)
  );
  const [encodable, setEncodable] = React.useState<RasterFormat[]>([
    "png",
    "jpeg",
  ]);
  const [cropPlacementById, setCropPlacementById] = React.useState<
    Record<string, CropPlacement>
  >({});

  // Canvas encoders lie about unsupported formats, so the real list is probed
  // once and drives which options are offered at all.
  React.useEffect(() => {
    let active = true;
    detectEncodeSupport().then((supported) => {
      if (!active) return;
      const order: RasterFormat[] = ["png", "jpeg", "webp", "avif"];
      setEncodable(order.filter((format) => supported.has(format)));
      setSettings((previous) =>
        previous.format !== "auto" && !supported.has(previous.format)
          ? { ...previous, format: "png" }
          : previous
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const { resetResults } = queue;
  const updateSettings = React.useCallback(
    (updates: Partial<ToolSettings>) => {
      setSettings((previous) => ({ ...previous, ...updates }));
      // Results produced under the old settings would download as stale files.
      resetResults();
    },
    [resetResults]
  );

  const handleCropPlacement = React.useCallback(
    (itemId: string, placement: CropPlacement) => {
      setCropPlacementById((previous) => ({ ...previous, [itemId]: placement }));
      resetResults();
    },
    [resetResults]
  );

  const handleRun = React.useCallback(() => {
    void queue.run((item) => {
      const format = resolveToolFormat(engine, settings, item.file.type);
      return {
        options: buildProcessOptions(
          engine,
          settings,
          item.file.type,
          cropPlacementById[item.id]
        ),
        outputName: buildOutputName(engine, item.name, format),
        // Compressing to the same format should never return a bigger file.
        // A deliberate conversion or resize is delivered whatever its size.
        preferSmaller:
          engine === "compress" && format === formatFromMime(item.file.type),
      };
    });
  }, [cropPlacementById, engine, queue, settings]);

  const Panel = PANELS[engine];
  const reference = queue.items.find((item) => item.source)?.source ?? null;
  // What the queue will actually be written as, so a panel can flag a setting
  // that cannot do anything — or is actively counterproductive — for these
  // particular files. The source formats matter too: re-encoding an already
  // lossy image losslessly inflates it, which is worth saying before the run.
  const outputFormats = Array.from(
    new Set(
      queue.items.map((item) =>
        resolveToolFormat(engine, settings, item.file.type)
      )
    )
  );
  const sourceFormats = Array.from(
    new Set(
      queue.items
        .map((item) => formatFromMime(item.file.type))
        .filter((format): format is RasterFormat => format !== null)
    )
  );
  const hasItems = queue.items.length > 0;
  const finished =
    queue.hasResults &&
    queue.items.every((item) => item.status === "done" || item.status === "error");
  const totalSaved = savingsPercent(
    queue.totalInputBytes,
    queue.totalOutputBytes
  );

  if (!hasItems) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <ToolDropzone
          onFiles={queue.addFiles}
          sourceLabel={tool.preset?.sourceLabel}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className={cn(CARD_CLASS, "p-2")}>
        <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-2">
          <p className="text-sm font-medium text-foreground">
            {queue.items.length} {queue.items.length === 1 ? "image" : "images"}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {formatBytes(queue.totalInputBytes)}
            </span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={queue.clear}
            disabled={queue.isRunning}
            className="text-muted-foreground"
          >
            <Delete02Icon size={15} aria-hidden="true" />
            Clear all
          </Button>
        </div>
        <FileQueue
          items={queue.items}
          onRemove={queue.removeItem}
          disabled={queue.isRunning}
        />
        <div className="mt-2">
          <ToolDropzone
            onFiles={queue.addFiles}
            sourceLabel={tool.preset?.sourceLabel}
            compact
          />
        </div>
        {engine === "resize" && settings.resizeTemplateId ? (
          <CropPositioner
            items={queue.items}
            resize={settings.resize}
            placementById={cropPlacementById}
            onPlacementChange={handleCropPlacement}
            disabled={queue.isRunning}
          />
        ) : null}
      </div>

      <aside
        className={cn(
          CARD_CLASS,
          "flex flex-col gap-5 p-5 lg:sticky lg:top-24",
        )}
      >
        <Panel
          settings={settings}
          onChange={updateSettings}
          encodable={encodable}
          reference={reference}
          outputFormats={outputFormats}
          sourceFormats={sourceFormats}
        />

        <div className="flex flex-col gap-2 border-t border-border pt-5">
          {finished && !queue.isRunning ? (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-foreground/[0.04] px-3.5 py-3 text-sm">
              <span className="text-muted-foreground">
                {formatBytes(queue.totalInputBytes)} →{" "}
                <span className="text-foreground">
                  {formatBytes(queue.totalOutputBytes)}
                </span>
              </span>
              {totalSaved > 0 ? (
                <span className="font-semibold text-emerald-500">
                  {totalSaved}% smaller
                </span>
              ) : totalSaved < 0 ? (
                <span className="font-semibold text-amber-500">
                  {Math.abs(totalSaved)}% bigger
                </span>
              ) : (
                <span className="text-muted-foreground">Same size</span>
              )}
            </div>
          ) : null}

          {queue.isRunning ? (
            <>
              <Button disabled size="lg" className="w-full">
                <Loading03Icon size={16} className="animate-spin" aria-hidden="true" />
                {queue.completed} of {queue.items.length}
              </Button>
              <Button variant="ghost" onClick={queue.cancel} className="w-full">
                Stop
              </Button>
            </>
          ) : finished ? (
            <Button
              size="lg"
              onClick={() => void queue.download()}
              className="w-full"
            >
              <Download04Icon size={16} aria-hidden="true" />
              {queue.doneCount > 1 ? "Download all as zip" : "Download"}
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={handleRun} className="w-full">
                <MagicWand01Icon size={16} aria-hidden="true" />
                {ACTION_LABEL[engine]}
                {queue.items.length > 1 ? ` ${queue.items.length} images` : ""}
              </Button>
              {queue.hasResults ? (
                <Button
                  variant="secondary"
                  onClick={() => void queue.download()}
                  className="w-full"
                >
                  <Download04Icon size={16} aria-hidden="true" />
                  Download finished
                </Button>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
