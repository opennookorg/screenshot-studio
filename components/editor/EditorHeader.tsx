"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { NewTwitterIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download04Icon,
  Copy01Icon,
  AspectRatioIcon,
  Add01Icon,
  Video01Icon,
  Delete02Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  Download01Icon,
  RefreshIcon,
  MagicWand01Icon,
  GridIcon,
  RulerIcon,
  FileZipIcon,
  KeyboardIcon,
} from "hugeicons-react";
import { useEditorStore, useImageStore } from "@/lib/store";
import { useExport } from "@/hooks/useExport";
import { shouldIgnoreEditorShortcut } from "@/lib/editor-shortcuts";
import { KeyboardShortcutsDialog } from "@/components/canvas/dialogs/KeyboardShortcutsDialog";
import { useBatchExport } from "@/hooks/useBatchExport";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { AspectRatioPicker } from "@/components/aspect-ratio/aspect-ratio-picker";
import { ResponsivePopover } from "@/components/ui/responsive-popover";
import { CopyProgressDialog } from "@/components/canvas/dialogs/CopyProgressDialog";
import { BatchExportProgressDialog } from "@/components/canvas/dialogs/BatchExportProgressDialog";
import { LazyExportSlideshowDialog } from "@/lib/export-slideshow-dialog-lazy";
import { ImageExportProgressView } from "@/components/canvas/dialogs/ImageProgressView";
import {
  FormatSelector,
  QualityPresetSelector,
  ScaleSlider,
} from "@/components/export";
import { cn } from "@/lib/utils";
import { GitHubStarButton } from "@/components/ui/github-star-button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  hasVisibleMockups,
  shouldRenderSourceImage,
} from "@/lib/device-mockups/layouts";

export function EditorHeader() {
  const isMobile = useIsMobile();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const { screenshot } = useEditorStore();
  const {
    selectedAspectRatio,
    slides,
    uploadedImageUrl,
    textOverlays,
    editorMode,
    mockups,
    clearImage,
    timeline,
    animationClips,
    resetCanvasSettings,
    showTemplates,
    setShowTemplates,
    showRulers,
    showGrid,
    rulerInterval,
    toggleRulers,
    toggleGrid,
    setRulerInterval,
  } = useImageStore();
  const [aspectRatioOpen, setAspectRatioOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportSlideshowOpen, setExportSlideshowOpen] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const currentAspectRatio = aspectRatios.find(
    (ar) => ar.id === selectedAspectRatio,
  );
  const hasImage = (
    !!screenshot.src && shouldRenderSourceImage(editorMode, mockups)
  ) || (
    editorMode === "device" && hasVisibleMockups(mockups)
  );

  const hasContent = hasImage || textOverlays.length > 0;

  // Undo/redo state
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const showHistoryControls = hasImage || canUndo || canRedo;

  React.useEffect(() => {
    const updateTemporalState = () => {
      const { pastStates, futureStates } = useImageStore.temporal.getState();
      setCanUndo(pastStates.length > 0);
      setCanRedo(futureStates.length > 0);
    };
    updateTemporalState();
    const unsubscribe = useImageStore.temporal.subscribe(updateTemporalState);
    return unsubscribe;
  }, []);

  const handleUndo = React.useCallback(() => {
    const { undo, pastStates } = useImageStore.temporal.getState();
    if (pastStates.length > 0) undo();
  }, []);

  const handleRedo = React.useCallback(() => {
    const { redo, futureStates } = useImageStore.temporal.getState();
    if (futureStates.length > 0) redo();
  }, []);

  // Keep history shortcuts mounted even when undo/delete empties the canvas.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreEditorShortcut(event) || event.altKey || !(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key !== "z" && key !== "y") return;
      event.preventDefault();
      if (key === "y" || event.shiftKey) handleRedo();
      else handleUndo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const showVideoExport =
    slides.length > 0 ||
    timeline.tracks.length > 0 ||
    animationClips.length > 0;

  const {
    copyImage,
    isExporting,
    isCopying,
    progress,
    copyProgress,
    settings: exportSettings,
    exportImage,
    updateScale,
    updateFormat,
    updateQualityPreset,
  } = useExport(selectedAspectRatio);

  const { isBatchExporting, batchProgress, exportAllSlides } = useBatchExport(
    selectedAspectRatio,
    exportSettings,
  );

  const handleExport = async () => {
    setExportError(null);
    try {
      await exportImage();
      setExportOpen(false);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Export failed. Please try again.",
      );
    }
  };

  const handleExportAll = async () => {
    setExportOpen(false);
    await exportAllSlides();
  };

  const formatLabel =
    exportSettings.format === "jpeg"
      ? "JPEG"
      : exportSettings.format === "webp"
        ? "WebP"
        : "PNG";

  return (
    <>
      <header
        className={cn(
          "flex h-16 justify-between bg-background border-b border-foreground/10 items-center shrink-0",
          isMobile ? "gap-2 px-3" : "gap-3 px-4"
        )}
      >
        <div className="flex items-center h-8 justify-self-start min-w-0">
          <Link
            href="/"
            className="flex h-11 min-w-11 items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0 lg:h-8"
          >
            <Image
              src="/logo-mark.png"
              alt="Screenshot Studio"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="hidden xl:inline font-semibold text-foreground text-sm tracking-tight leading-none">
              Screenshot Studio
            </span>
          </Link>

          {!isMobile ? (
            <>
              <div className="mx-2.5 h-4 w-px shrink-0 bg-foreground/10" aria-hidden />
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                aria-expanded={showTemplates}
                aria-label="Templates"
                id="editor-templates-trigger"
                className={cn(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2",
                  "text-sm font-medium leading-none transition-colors duration-150",
                  showTemplates
                    ? "text-foreground hover:text-foreground/70"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MagicWand01Icon size={14} className="shrink-0" />
                <span>Templates</span>
              </button>
            </>
          ) : null}
        </div>

        <div
          className={cn(
            "flex items-center justify-center justify-self-center",
            isMobile ? "gap-1" : "gap-1 xl:gap-2.5"
          )}
        >
          {showHistoryControls ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={cn(
                  "flex items-center justify-center size-11 lg:size-8 rounded-md shrink-0 cursor-pointer",
                  "text-muted-foreground transition-all duration-150",
                  canUndo
                    ? "hover:text-foreground active:scale-95"
                    : "opacity-40 cursor-not-allowed",
                )}
                title="Undo (Cmd+Z)"
                aria-label="Undo"
              >
                <ArrowTurnBackwardIcon size={16} />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={cn(
                  "flex items-center justify-center size-11 lg:size-8 rounded-md shrink-0 cursor-pointer",
                  "text-muted-foreground transition-all duration-150",
                  canRedo
                    ? "hover:text-foreground active:scale-95"
                    : "opacity-40 cursor-not-allowed",
                )}
                title="Redo (Cmd+Shift+Z)"
                aria-label="Redo"
              >
                <ArrowTurnForwardIcon size={16} />
              </button>
            </div>
          ) : null}

          {hasImage && !isMobile ? (
            <div className="w-px h-4 bg-foreground/10 shrink-0" aria-hidden />
          ) : null}

          {hasImage && !isMobile ? (
            <div className="flex items-center gap-1">
              <button
                onClick={toggleRulers}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md shrink-0 cursor-pointer transition-all duration-150 active:scale-95",
                  showRulers
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Toggle rulers"
              >
                <RulerIcon size={15} />
              </button>
              {showRulers ? (
                <select
                  value={rulerInterval}
                  onChange={(e) => setRulerInterval(Number(e.target.value))}
                  className="h-8 px-1.5 text-[11px] rounded-md bg-muted text-foreground border-0 outline-none cursor-pointer shrink-0"
                  title="Ruler interval"
                >
                  <option value={25}>25px</option>
                  <option value={50}>50px</option>
                  <option value={100}>100px</option>
                  <option value={200}>200px</option>
                </select>
              ) : null}
              <button
                onClick={toggleGrid}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md shrink-0 cursor-pointer transition-all duration-150 active:scale-95",
                  showGrid
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Toggle grid"
              >
                <GridIcon size={15} />
              </button>
            </div>
          ) : null}

          {hasImage && !isMobile ? (
            <div className="w-px h-4 bg-foreground/10 shrink-0" aria-hidden />
          ) : null}

          <div className="flex items-center gap-1">
            <ResponsivePopover
              open={aspectRatioOpen}
              onOpenChange={setAspectRatioOpen}
              title="Canvas size"
              description="Choose a shape or enter your own dimensions."
              className="w-[420px] p-0"
              trigger={
                <Button
                  aria-label="Canvas size"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 gap-1.5 rounded-md text-muted-foreground hover:text-foreground shrink-0",
                    isMobile ? "h-11 px-3" : "px-2.5"
                  )}
                >
                  <AspectRatioIcon size={15} />
                  <span className="text-xs leading-none">
                    {isMobile ? 'Size' : currentAspectRatio
                      ? `${currentAspectRatio.width}:${currentAspectRatio.height}`
                      : "Auto"}
                  </span>
                </Button>
              }
            >
                <AspectRatioPicker onSelect={() => setAspectRatioOpen(false)} />
            </ResponsivePopover>

            {slides.length > 0 && !isMobile ? (
              <label className="cursor-pointer inline-flex shrink-0" aria-label="Add slide">
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Add slide"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      useImageStore
                        .getState()
                        .addImages(Array.from(e.target.files));
                    }
                  }}
                />
                <span className="h-8 inline-flex items-center justify-center gap-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted text-xs leading-none transition-all font-medium px-2.5">
                  <Add01Icon size={14} />
                  <span className="hidden xl:inline">Add Slide</span>
                </span>
              </label>
            ) : null}
          </div>

          <div className="hidden lg:block w-px h-4 bg-foreground/10 shrink-0" aria-hidden />

          <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-1.5")}>
            <Button
              onClick={() => copyImage()}
              disabled={!hasContent || isExporting || isCopying}
              variant="ghost"
              size="sm"
              aria-label="Copy"
              className={cn(
                "hidden lg:inline-flex h-8 gap-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-transparent dark:hover:bg-transparent text-xs leading-none shrink-0",
                isMobile ? "px-1.5" : "px-2.5"
              )}
            >
              <Copy01Icon size={15} />
              <span className="hidden xl:inline">Copy</span>
            </Button>

            <ResponsivePopover
              open={exportOpen}
              onOpenChange={setExportOpen}
              dismissible={!isExporting}
              title="Save your image"
              description="Choose the format and quality, then download."
              className="w-[340px] p-0"
              trigger={
                <Button
                  disabled={!hasContent}
                  size="sm"
                  aria-label="Save"
                  className={cn(
                    "h-8 gap-1.5 rounded-md text-xs font-medium leading-none shrink-0",
                    isMobile ? "h-11 rounded-lg px-3" : "px-3"
                  )}
                >
                  <Download04Icon size={15} />
                  <span>Save</span>
                </Button>
              }
            >
                {isExporting ? (
                  <div className="p-5">
                    <p className="text-sm font-medium text-foreground mb-1">
                      Exporting...
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Rendering your creation
                    </p>
                    <ImageExportProgressView
                      progress={progress}
                      format={exportSettings.format}
                    />
                  </div>
                ) : (
                  <div className="p-5 space-y-5 lg:p-4 lg:space-y-4">
                    <FormatSelector
                      format={exportSettings.format}
                      onFormatChange={updateFormat}
                    />
                    <QualityPresetSelector
                      qualityPreset={exportSettings.qualityPreset}
                      format={exportSettings.format}
                      onQualityPresetChange={updateQualityPreset}
                    />
                    <ScaleSlider
                      scale={exportSettings.scale}
                      onScaleChange={updateScale}
                    />

                    {exportError && (
                      <div role="alert" className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
                        {exportError}
                      </div>
                    )}

                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="w-full h-12 lg:h-10 text-sm font-semibold rounded-lg transition-all"
                    >
                      <Download01Icon size={16} className="mr-2" />
                      Export as {formatLabel}
                    </Button>

                    {slides.length > 1 && (
                      <Button
                        onClick={handleExportAll}
                        disabled={isExporting || isBatchExporting}
                        variant="outline"
                        className="w-full h-12 lg:h-10 text-sm font-semibold rounded-lg transition-all"
                      >
                        <FileZipIcon size={16} className="mr-2" />
                        Export All ({slides.length})
                      </Button>
                    )}
                    {isMobile && (
                      <Button onClick={() => { setExportOpen(false); void copyImage(); }} variant="outline" className="h-12 w-full rounded-lg" disabled={isCopying}>
                        <Copy01Icon size={16} />Copy image
                      </Button>
                    )}
                    {isMobile && hasImage && showVideoExport && (
                      <Button onClick={() => { setExportOpen(false); setExportSlideshowOpen(true); }} variant="outline" className="h-12 w-full rounded-lg">
                        <Video01Icon size={16} />Export video
                      </Button>
                    )}
                  </div>
                )}
            </ResponsivePopover>

            {hasImage && showVideoExport && !isMobile ? (
              <Button
                onClick={() => setExportSlideshowOpen(true)}
                aria-label="Export video"
                size="sm"
                className="h-8 gap-1.5 rounded-md text-xs font-medium leading-none px-3 shrink-0"
              >
                <Video01Icon size={14} />
                <span className="hidden xl:inline">Export Video</span>
              </Button>
            ) : null}
          </div>

          {(hasContent || uploadedImageUrl) && !isMobile ? (
            <>
              <div className="w-px h-4 bg-foreground/10 shrink-0" aria-hidden />
              <div className="flex items-center gap-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5",
                        "text-xs font-medium leading-none text-muted-foreground transition-[color,background-color,transform] duration-150",
                        "hover:bg-muted hover:text-foreground active:scale-[0.98]",
                      )}
                      aria-label="Start over"
                      title="Reset the design and animation"
                    >
                      <RefreshIcon size={14} />
                      <span className="hidden xl:inline">Start over</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-[420px]">
                    <AlertDialogHeader>
                      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
                        <RefreshIcon aria-hidden="true" size={18} />
                      </div>
                      <AlertDialogTitle>Start over?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This resets the current design, overlays, and animation. Your uploaded media stays, and you can undo this action.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={resetCanvasSettings}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30"
                      >
                        Start over
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {hasContent ? (
                  <Button
                    onClick={clearImage}
                    aria-label="Remove image"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-xs leading-none text-muted-foreground hover:text-destructive hover:bg-transparent dark:hover:bg-transparent shrink-0"
                  >
                    <Delete02Icon size={14} />
                    <span className="hidden xl:inline">Remove</span>
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <div className="hidden lg:flex items-center gap-1 justify-self-end">
          <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts" onClick={() => setShortcutsOpen(true)}>
            <KeyboardIcon size={16} />
          </Button>
          {!isMobile ? <span className="hidden 2xl:inline-flex"><GitHubStarButton compact /></span> : null}
          <a
            href="https://x.com/code_kartik"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on X"
            className="hidden xl:flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground transition-[color,filter] duration-150 hover:text-foreground "
          >
            <NewTwitterIcon className="h-[18px] w-[18px]" />
          </a>
        </div>
      </header>

      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <CopyProgressDialog open={isCopying} progress={copyProgress} />

      <BatchExportProgressDialog
        open={isBatchExporting}
        batchProgress={batchProgress}
        format={exportSettings.format}
      />

      <LazyExportSlideshowDialog
        open={exportSlideshowOpen}
        onOpenChange={setExportSlideshowOpen}
      />
    </>
  );
}
