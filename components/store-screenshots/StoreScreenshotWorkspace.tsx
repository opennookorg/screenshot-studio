"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Reorder, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  Add01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  Copy01Icon,
  Delete02Icon,
  Download04Icon,
  FileZipIcon,
  GridIcon,
  NewTwitterIcon,
  RedoIcon,
  RefreshIcon,
  Settings02Icon,
  UndoIcon,
} from "hugeicons-react";
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
} from "@/components/ui/alert-dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GitHubStarButton } from "@/components/ui/github-star-button";
import { MobileBanner } from "@/components/editor/MobileBanner";
import { StoreExportDialog } from "./StoreExportDialog";
import {
  StoreGlobalPanel,
  StoreSlidePanel,
  type StoreTextFocusRequest,
} from "./StoreSidePanels";
import { StoreSlideCanvas, type StoreCropRequest } from "./StoreSlideCanvas";
import { StoreTemplateGallery } from "./StoreTemplateGallery";
import { StoreWorkspaceLoading } from "./StoreWorkspaceLoading";
import {
  getStoreProfile,
  MAX_STORE_SLIDES,
} from "@/lib/store-screenshots/config";
import { resolveStoreLayout } from "@/lib/store-screenshots/layouts";
import {
  assertStoreImageBudget,
  createScratchStoreProject,
  createStarterStoreProject,
  duplicateStoreSlide,
  fileToDataUrl,
  filesToStoreSlides,
  getStoreDeviceStyleOverride,
  MAX_STORE_PROJECT_IMAGE_BYTES,
  moveStoreSlide,
  removeStoreSlide,
  resetStoreSlidePositions,
  storeDataUrlBytes,
  storeSlidePositionsChanged,
  storeSlideImageBytes,
  storeSlidesImageBytes,
  STORE_STARTER_SCREEN_SRC,
} from "@/lib/store-screenshots/project";
import {
  deleteStoreProject,
  loadStoreProject,
  saveStoreProject,
} from "@/lib/store-screenshots/storage";
import type {
  StoreDeviceSlot,
  StoreImageTransform,
  StoreProject,
  StoreSlide,
} from "@/lib/store-screenshots/types";
import {
  appendStoreHistory,
  storeHistoryGroupKey,
} from "@/lib/store-screenshots/history";
import { cn } from "@/lib/utils";
import { showStoreUndoToast } from "./store-undo-toast";

const PAGE_SIZE = 4;

function StoreStarterChoice({
  onUseTemplate,
  onStartFromScratch,
  className,
  titleId,
}: {
  onUseTemplate: () => void;
  onStartFromScratch: () => void;
  className?: string;
  titleId: string;
}): React.JSX.Element {
  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex justify-end", className)}
    >
      <h2 id={titleId} className="sr-only">Choose a starting point</h2>
      <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
        <Button type="button" className="flex-1" onClick={onUseTemplate}>
          Use the template
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onStartFromScratch}>
          Start from scratch
        </Button>
      </div>
    </section>
  );
}

function StoreHeader({
  onExport,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  resetButtonRef,
  disabled = false,
  showActions = true,
}: {
  onExport: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetButtonRef?: React.Ref<HTMLButtonElement>;
  disabled?: boolean;
  showActions?: boolean;
}): React.JSX.Element {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between gap-3 border-b border-foreground/10 bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80">
          <Image src="/logo-mark.png" alt="Screenshot Studio" width={32} height={32} className="size-8" priority />
          <span className="hidden text-sm font-semibold tracking-tight text-foreground lg:inline">Screenshot Studio</span>
        </Link>
        <div className="mx-1 hidden h-4 w-px bg-foreground/10 sm:block" />
        <p className="hidden truncate text-xs font-medium text-foreground sm:block">Store screenshots</p>
      </div>

      {showActions ? (
        <>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
            <Button
              type="button"
              onClick={onUndo}
              disabled={disabled || !canUndo}
              variant="ghost"
              size="icon-sm"
              aria-label="Undo last edit"
              title="Undo (⌘Z)"
              className="text-muted-foreground hover:text-foreground"
            >
              <UndoIcon size={14} />
            </Button>
            <Button
              type="button"
              onClick={onRedo}
              disabled={disabled || !canRedo}
              variant="ghost"
              size="icon-sm"
              aria-label="Redo last edit"
              title="Redo (⇧⌘Z)"
              className="text-muted-foreground hover:text-foreground"
            >
              <RedoIcon size={14} />
            </Button>
            <div className="mx-1 h-4 w-px bg-foreground/10" />
            <Button
              ref={resetButtonRef}
              type="button"
              onClick={onReset}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshIcon size={14} />
              Start over
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={onExport}
              disabled={disabled}
              aria-label="Export store screenshots"
              className="text-xs"
            >
              <Download04Icon size={15} /> <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-1">
          <div className="hidden sm:block">
            <GitHubStarButton compact />
          </div>
          <a
            href="https://x.com/screenshotstdio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Screenshot Studio on X"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <NewTwitterIcon className="size-[18px]" />
          </a>
        </div>
      )}
    </header>
  );
}

function SlideCard({
  project,
  slide,
  index,
  onOpen,
  onMove,
  disabled = false,
}: {
  project: StoreProject;
  slide: StoreSlide;
  index: number;
  onOpen: () => void;
  onMove: (direction: -1 | 1) => void;
  disabled?: boolean;
}): React.JSX.Element {
  const profile = getStoreProfile("app-store");

  return (
    <div className="group relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (!event.shiftKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
          event.preventDefault();
          onMove(event.key === "ArrowLeft" ? -1 : 1);
        }}
        aria-label={`Edit screenshot ${index + 1} of ${project.slides.length}`}
        aria-describedby="store-reorder-instructions"
        aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
        className={cn(
          "relative block w-full overflow-hidden border border-foreground/10 bg-card text-left shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
          disabled
            ? "cursor-default rounded-xl"
            : "rounded-md transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-foreground/25",
        )}
      >
        <StoreSlideCanvas project={project} slide={slide} slideIndex={index} profile={profile} className="w-full" />
        {!disabled ? (
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground/75 px-2 py-2 text-center text-[10px] font-medium text-background backdrop-blur-sm transition-transform group-hover:translate-y-0 group-focus-within:translate-y-0">
            Edit screenshot
          </span>
        ) : null}
      </button>
    </div>
  );
}

function StoreOverview({
  project,
  page,
  onPage,
  onReorder,
  onMove,
  onSelect,
  showStarterChoice,
  onUseTemplate,
  onStartFromScratch,
}: {
  project: StoreProject;
  page: number;
  onPage: (page: number) => void;
  onReorder: (ids: string[]) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onSelect: (id: string) => void;
  showStarterChoice: boolean;
  onUseTemplate: () => void;
  onStartFromScratch: () => void;
}): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [animatePageChange, setAnimatePageChange] = React.useState(true);
  const dragGestureRef = React.useRef<{
    id: string;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const pages = Math.max(1, Math.ceil(project.slides.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const start = safePage * PAGE_SIZE;
  const visibleSlides = project.slides.slice(start, start + PAGE_SIZE);
  const visibleIds = visibleSlides.map((slide) => slide.id);
  const slidePages = Array.from({ length: pages }, (_, pageIndex) => (
    project.slides.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)
  ));

  const reorderPage = (reorderedIds: string[]): void => {
    const nextIds = project.slides.map((slide) => slide.id);
    reorderedIds.forEach((id, index) => { nextIds[start + index] = id; });
    onReorder(nextIds);
  };

  const changePage = (nextPage: number, animated = true): void => {
    setAnimatePageChange(animated);
    onPage(nextPage);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 items-center overflow-auto px-5 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="mb-5 text-center">
            <div className="mx-auto">
              <h2 className="text-xl font-semibold tracking-[-0.025em] text-foreground">
                {showStarterChoice ? "App Store screenshot template" : "App Store screenshot set"}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {showStarterChoice ? "Preview the set, then choose how to begin." : "Drag to reorder · Select to edit"}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              {showStarterChoice ? (
                <motion.div
                  data-store-carousel-track
                  initial={false}
                  animate={{ transform: `translate3d(-${safePage * 100}%, 0, 0)` }}
                  transition={{
                    duration: prefersReducedMotion || !animatePageChange ? 0 : 0.48,
                    ease: [0.645, 0.045, 0.355, 1],
                  }}
                  className="flex w-full will-change-transform"
                >
                  {slidePages.map((pageSlides, pageIndex) => (
                    <div
                      key={pageIndex}
                      data-store-carousel-page={pageIndex}
                      aria-hidden={pageIndex !== safePage}
                      className="grid w-full shrink-0 grid-cols-4 gap-3"
                    >
                      {pageSlides.map((slide, localIndex) => {
                        const index = pageIndex * PAGE_SIZE + localIndex;
                        return (
                          <div
                            key={slide.id}
                            data-slide-id={slide.id}
                            className="w-full min-w-0"
                          >
                            <SlideCard
                              project={project}
                              slide={slide}
                              index={index}
                              onMove={(direction) => onMove(slide.id, direction)}
                              disabled
                              onOpen={() => undefined}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <Reorder.Group
                  axis="x"
                  values={visibleIds}
                  onReorder={reorderPage}
                  aria-label="Store screenshots"
                  className="grid list-none gap-3 p-0"
                  style={{ gridTemplateColumns: `repeat(${Math.max(visibleSlides.length, 1)}, minmax(0, 1fr))` }}
                >
                  {visibleSlides.map((slide, localIndex) => {
                    const index = start + localIndex;
                    return (
                      <Reorder.Item
                          key={slide.id}
                          value={slide.id}
                          data-slide-id={slide.id}
                          onPointerDown={(event) => {
                            dragGestureRef.current = {
                              id: slide.id,
                              startX: event.clientX,
                              startY: event.clientY,
                              moved: false,
                            };
                          }}
                          onPointerMove={(event) => {
                            const gesture = dragGestureRef.current;
                            if (!gesture || gesture.id !== slide.id) return;
                            if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > 6) {
                              gesture.moved = true;
                            }
                          }}
                          onDragStart={() => {
                            const gesture = dragGestureRef.current;
                            if (gesture?.id === slide.id) gesture.moved = true;
                          }}
                          onPointerCancel={() => {
                            dragGestureRef.current = null;
                          }}
                          className="w-full min-w-0 max-w-[220px] cursor-grab justify-self-center active:cursor-grabbing"
                        >
                          <SlideCard
                            project={project}
                            slide={slide}
                            index={index}
                            onMove={(direction) => onMove(slide.id, direction)}
                            onOpen={() => {
                              const gesture = dragGestureRef.current;
                              dragGestureRef.current = null;
                              if (gesture?.id === slide.id && gesture.moved) return;
                              onSelect(slide.id);
                            }}
                          />
                        </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              )}
            </div>

            {showStarterChoice && safePage > 0 ? (
              <button
                type="button"
                onClick={(event) => changePage(safePage - 1, event.detail > 0)}
                aria-label={`Show screenshots ${Math.max(1, start - PAGE_SIZE + 1)} to ${start}`}
                title="Previous screenshots"
                className="absolute -left-14 top-1/2 z-10 hidden h-16 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-foreground/[0.08] hover:text-foreground active:scale-[0.97] lg:flex"
              >
                <ArrowLeft02Icon size={26} strokeWidth={1.8} />
              </button>
            ) : null}
            {showStarterChoice && safePage < pages - 1 ? (
              <button
                type="button"
                onClick={(event) => changePage(safePage + 1, event.detail > 0)}
                aria-label={`Show screenshots ${start + PAGE_SIZE + 1} to ${Math.min(project.slides.length, start + PAGE_SIZE * 2)}`}
                title="Next screenshots"
                className="absolute -right-14 top-1/2 z-10 hidden h-16 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-foreground/[0.08] hover:text-foreground active:scale-[0.97] lg:flex"
              >
                <ArrowRight02Icon size={26} strokeWidth={1.8} />
              </button>
            ) : null}
          </div>

          <p className="sr-only" aria-live="polite">
            Showing screenshots {start + 1} to {Math.min(start + PAGE_SIZE, project.slides.length)} of {project.slides.length}.
          </p>
          {showStarterChoice ? (
            <StoreStarterChoice
              className="mt-6"
              titleId="store-starter-choice-title"
              onUseTemplate={onUseTemplate}
              onStartFromScratch={onStartFromScratch}
            />
          ) : null}

          {pages > 1 && !showStarterChoice ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button variant="outline" size="icon-sm" aria-label="Previous screenshots" disabled={safePage === 0} onClick={(event) => changePage(safePage - 1, event.detail > 0)}>
                <ArrowLeft02Icon size={14} />
              </Button>
              <span className="text-[11px] tabular-nums text-muted-foreground">{safePage + 1} / {pages}</span>
              <Button variant="outline" size="icon-sm" aria-label="Next screenshots" disabled={safePage === pages - 1} onClick={(event) => changePage(safePage + 1, event.detail > 0)}>
                <ArrowRight02Icon size={14} />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StoreFocus({
  project,
  selectedSlide,
  onSelect,
  onReorder,
  onMove,
  onResetPositions,
  onAdd,
  onDuplicate,
  onDelete,
  onSlideChange,
  onScreenFile,
  onScreenDelete,
  onScreenImageChange,
  cropRequest,
  onTextEditRequest,
  onDeviceSelect,
  selectedDeviceSlot,
  canAdd,
  canDuplicate,
  positionsChanged,
}: {
  project: StoreProject;
  selectedSlide: StoreSlide;
  onSelect: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onResetPositions: () => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSlideChange: (slide: StoreSlide) => void;
  onScreenFile: (sourceSlideId: string, file: File) => void;
  onScreenDelete: (sourceSlideId: string) => void;
  onScreenImageChange: (sourceSlideId: string, image: StoreImageTransform) => void;
  cropRequest: StoreCropRequest | null;
  onTextEditRequest: (field: "heading" | "subheading") => void;
  onDeviceSelect: (slot: StoreDeviceSlot | null) => void;
  selectedDeviceSlot: StoreDeviceSlot | null;
  canAdd: boolean;
  canDuplicate: boolean;
  positionsChanged: boolean;
}): React.JSX.Element {
  const profile = getStoreProfile("app-store");
  const selectedIndex = project.slides.findIndex((slide) => slide.id === selectedSlide.id);
  const dragGestureRef = React.useRef<{
    id: string;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-5 sm:p-7"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onDeviceSelect(null);
        }}
      >
        <div className="relative">
          <StoreSlideCanvas
            project={project}
            slide={selectedSlide}
            slideIndex={selectedIndex}
            profile={profile}
            className="max-w-full shrink-0 rounded-md shadow-2xl ring-1 ring-foreground/10"
            style={{ width: "clamp(220px, calc(46.025vh - 92px), 500px)" }}
            interactive
            onSlideChange={onSlideChange}
            onScreenFile={onScreenFile}
            onScreenDelete={onScreenDelete}
            onScreenImageChange={onScreenImageChange}
            cropRequest={cropRequest}
            onTextEditRequest={onTextEditRequest}
            onDeviceSelect={onDeviceSelect}
            selectedDeviceSlot={selectedDeviceSlot}
          />
          <div className="absolute right-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 sm:left-full sm:right-auto sm:ml-6 xl:ml-10">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!positionsChanged}
              onClick={onResetPositions}
              aria-label="Reset positions"
              title="Reset positions"
              className="size-11 shrink-0 rounded-full bg-background shadow-lg sm:size-9"
            >
              <RefreshIcon size={15} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canAdd}
              onClick={onAdd}
              aria-label="Add image"
              title="Add image"
              className="size-11 shrink-0 rounded-full bg-background shadow-lg sm:size-9"
            >
              <Add01Icon size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canDuplicate}
              onClick={onDuplicate}
              aria-label="Duplicate screenshot"
              title="Duplicate screenshot"
              className="size-11 shrink-0 rounded-full bg-background shadow-lg sm:size-9"
            >
              <Copy01Icon size={15} />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex h-20 shrink-0 items-center overflow-x-auto border-t border-foreground/10 bg-background px-2.5">
        <Reorder.Group
          axis="x"
          values={project.slides.map((slide) => slide.id)}
          onReorder={onReorder}
          aria-label="Store screenshots"
          className="mx-auto flex w-fit list-none gap-3 p-0"
        >
          {project.slides.map((slide, index) => (
            <Reorder.Item
              key={slide.id}
              value={slide.id}
              data-slide-id={slide.id}
              style={{ aspectRatio: `${profile.width}/${profile.height}` }}
              onPointerDown={(event) => {
                dragGestureRef.current = {
                  id: slide.id,
                  startX: event.clientX,
                  startY: event.clientY,
                  moved: false,
                };
              }}
              onPointerMove={(event) => {
                const gesture = dragGestureRef.current;
                if (!gesture || gesture.id !== slide.id) return;
                if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > 6) {
                  gesture.moved = true;
                }
              }}
              onDragStart={() => {
                const gesture = dragGestureRef.current;
                if (gesture?.id === slide.id) gesture.moved = true;
              }}
              onPointerCancel={() => {
                dragGestureRef.current = null;
              }}
              className="relative h-14 shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
            >
              <button
                type="button"
                aria-label={`Edit screenshot ${index + 1} of ${project.slides.length}`}
                aria-pressed={slide.id === selectedSlide.id}
                aria-describedby="store-reorder-instructions"
                aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
                onKeyDown={(event) => {
                  if (!event.shiftKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
                  event.preventDefault();
                  onMove(slide.id, event.key === "ArrowLeft" ? -1 : 1);
                }}
                onClick={() => {
                  const gesture = dragGestureRef.current;
                  dragGestureRef.current = null;
                  if (gesture?.id === slide.id && gesture.moved) return;
                  onSelect(slide.id);
                }}
                className={cn(
                  "relative h-full w-full overflow-hidden rounded border transition-[border-color,opacity,box-shadow]",
                  slide.id === selectedSlide.id ? "border-foreground/40 ring-1 ring-foreground/30" : "border-foreground/10 opacity-65 hover:opacity-100",
                )}
              >
                <StoreSlideCanvas project={project} slide={slide} slideIndex={index} profile={profile} className="h-full w-full" />
              </button>
              {slide.id === selectedSlide.id ? (
                <button
                  type="button"
                  aria-label={`Delete screenshot ${index + 1}`}
                  title="Delete screenshot"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    dragGestureRef.current = null;
                    onDelete();
                  }}
                  className="absolute -right-3 -top-3 z-20 flex size-6 cursor-pointer items-center justify-center rounded-full border border-destructive/40 bg-background text-destructive shadow-sm transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                >
                  <Cancel01Icon size={11} strokeWidth={2.25} />
                </button>
              ) : null}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}

export function StoreScreenshotWorkspace({
  initialHasSavedProject = false,
}: {
  initialHasSavedProject?: boolean;
}): React.JSX.Element {
  const [project, setProject] = React.useState<StoreProject | null>(null);
  const projectRef = React.useRef<StoreProject | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [view, setView] = React.useState<"overview" | "focus">("focus");
  const [page, setPage] = React.useState(0);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportRequestId, setExportRequestId] = React.useState(0);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [showStarterChoice, setShowStarterChoice] = React.useState(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = React.useState(false);
  const [activeDeviceSlot, setActiveDeviceSlot] = React.useState<StoreDeviceSlot | null>("primary");
  const [controlsOpen, setControlsOpen] = React.useState(false);
  const [responsivePanel, setResponsivePanel] = React.useState<"design" | "content">("content");
  const [reorderAnnouncement, setReorderAnnouncement] = React.useState("");
  const [textFocusRequest, setTextFocusRequest] = React.useState<StoreTextFocusRequest | null>(null);
  const [cropRequest, setCropRequest] = React.useState<StoreCropRequest | null>(null);
  const [historyAvailability, setHistoryAvailability] = React.useState({ canUndo: false, canRedo: false });
  const addInputRef = React.useRef<HTMLInputElement>(null);
  const resetButtonRef = React.useRef<HTMLButtonElement>(null);
  const saveErrorShownRef = React.useRef(false);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProjectRef = React.useRef<StoreProject | null>(null);
  const saveQueueRef = React.useRef<Promise<void>>(Promise.resolve());
  const savesInFlightRef = React.useRef(0);
  const pendingThumbnailFocusRef = React.useRef<string | null>(null);
  const projectGenerationRef = React.useRef(0);
  const persistenceGenerationRef = React.useRef(0);
  const replacementRequestIdsRef = React.useRef<Map<string, number>>(new Map());
  const undoStackRef = React.useRef<StoreProject[]>([]);
  const redoStackRef = React.useRef<StoreProject[]>([]);
  const historyGroupKeyRef = React.useRef<string | null>(null);
  const historyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncHistoryAvailability = React.useCallback((): void => {
    setHistoryAvailability({
      canUndo: undoStackRef.current.length > 0,
      canRedo: redoStackRef.current.length > 0,
    });
  }, []);

  const closeHistoryGroup = React.useCallback((): void => {
    historyGroupKeyRef.current = null;
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
  }, []);

  const clearHistory = React.useCallback((): void => {
    closeHistoryGroup();
    undoStackRef.current = [];
    redoStackRef.current = [];
    syncHistoryAvailability();
  }, [closeHistoryGroup, syncHistoryAvailability]);

  const setCurrentProject = React.useCallback((
    next: StoreProject | null,
    historyMode: "record" | "skip" = "record",
  ): void => {
    const previous = projectRef.current;
    if (historyMode === "record" && previous && next && previous !== next) {
      const groupKey = storeHistoryGroupKey(previous, next);
      if (!groupKey || historyGroupKeyRef.current !== groupKey) {
        undoStackRef.current = appendStoreHistory(undoStackRef.current, previous, next);
      }
      redoStackRef.current = [];
      closeHistoryGroup();
      if (groupKey) {
        historyGroupKeyRef.current = groupKey;
        historyTimerRef.current = setTimeout(() => {
          historyGroupKeyRef.current = null;
          historyTimerRef.current = null;
        }, 500);
      }
      syncHistoryAvailability();
    }
    projectRef.current = next;
    setProject(next);
  }, [closeHistoryGroup, syncHistoryAvailability]);

  React.useEffect(() => {
    let active = true;
    void loadStoreProject().then((savedProject) => {
      if (!active) return;
      if (savedProject) {
        setCurrentProject(savedProject, "skip");
        setShowStarterChoice(false);
        setView("focus");
      } else {
        setCurrentProject(createStarterStoreProject(), "skip");
        setShowStarterChoice(true);
        setView("overview");
      }
      clearHistory();
      setLoaded(true);
    });
    return () => { active = false; };
  }, [clearHistory, setCurrentProject]);

  const queueProjectSave = React.useCallback((projectToSave: StoreProject): void => {
    const persistenceGeneration = persistenceGenerationRef.current;
    savesInFlightRef.current += 1;
    const save = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveStoreProject(projectToSave));
    saveQueueRef.current = save;
    void save
      .then(() => {
        saveErrorShownRef.current = false;
      })
      .catch(() => {
        if (persistenceGeneration !== persistenceGenerationRef.current) return;
        const pending = pendingProjectRef.current;
        if (!pending || pending.updatedAt < projectToSave.updatedAt) {
          pendingProjectRef.current = projectToSave;
        }
        if (saveErrorShownRef.current) return;
        saveErrorShownRef.current = true;
        toast.error("Could not save this screenshot set", {
          description: "Your latest changes are still open, but may not survive a refresh.",
        });
      })
      .finally(() => { savesInFlightRef.current -= 1; });
  }, []);

  const flushPendingSave = React.useCallback((): void => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (!pendingProjectRef.current) return;
    const pending = pendingProjectRef.current;
    pendingProjectRef.current = null;
    queueProjectSave(pending);
  }, [queueProjectSave]);

  React.useEffect(() => {
    if (!project || !loaded || showStarterChoice) {
      pendingProjectRef.current = null;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      return;
    }
    pendingProjectRef.current = project;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushPendingSave, 650);
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [flushPendingSave, loaded, project, showStarterChoice]);

  React.useEffect(() => () => {
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
  }, []);

  React.useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "hidden") flushPendingSave();
    };
    const handlePageHide = (): void => flushPendingSave();
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!pendingProjectRef.current && savesInFlightRef.current === 0) return;
      flushPendingSave();
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushPendingSave();
    };
  }, [flushPendingSave]);

  React.useEffect(() => {
    const slideId = pendingThumbnailFocusRef.current;
    if (!slideId) return;
    const button = document.querySelector<HTMLButtonElement>(`[data-slide-id="${slideId}"] button`);
    if (!button) return;
    button.focus();
    pendingThumbnailFocusRef.current = null;
  }, [page, project]);

  const commitProject = React.useCallback((next: StoreProject): void => {
    setCurrentProject({ ...next, updatedAt: Date.now() });
  }, [setCurrentProject]);

  const undo = React.useCallback((): void => {
    const current = projectRef.current;
    const previous = undoStackRef.current.at(-1);
    if (!current || !previous) return;
    closeHistoryGroup();
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    const restored = { ...previous, updatedAt: Date.now() };
    redoStackRef.current = appendStoreHistory(redoStackRef.current, current, restored);
    setCurrentProject(restored, "skip");
    setShowStarterChoice(false);
    syncHistoryAvailability();
  }, [closeHistoryGroup, setCurrentProject, syncHistoryAvailability]);

  const redo = React.useCallback((): void => {
    const current = projectRef.current;
    const next = redoStackRef.current.at(-1);
    if (!current || !next) return;
    closeHistoryGroup();
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    const restored = { ...next, updatedAt: Date.now() };
    undoStackRef.current = appendStoreHistory(undoStackRef.current, current, restored);
    setCurrentProject(restored, "skip");
    setShowStarterChoice(false);
    syncHistoryAvailability();
  }, [closeHistoryGroup, setCurrentProject, syncHistoryAvailability]);

  React.useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent): void => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable
        || target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
      )) return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", handleHistoryShortcut);
    return () => window.removeEventListener("keydown", handleHistoryShortcut);
  }, [redo, undo]);

  if (!loaded) {
    return <StoreWorkspaceLoading variant={initialHasSavedProject ? "editor" : "templates"} />;
  }

  if (!project || project.slides.length === 0) {
    return <StoreWorkspaceLoading />;
  }

  const selectedSlide = project.slides.find((slide) => slide.id === project.selectedSlideId)
    ?? project.slides[0];
  const selectedSlideIndex = project.slides.findIndex((slide) => slide.id === selectedSlide.id);
  const selectedLayoutId = resolveStoreLayout(
    project.templateId,
    selectedSlideIndex,
    selectedSlide.layoutOverride,
  );
  const selectedDeviceSlot = selectedLayoutId === "duo" && activeDeviceSlot === "secondary"
    ? "secondary"
    : "primary";
  const fallbackRightSlide = project.slides[(selectedSlideIndex + 1) % project.slides.length]
    ?? selectedSlide;
  const selectedScreenSlide = selectedLayoutId === "duo"
    ? selectedDeviceSlot === "secondary"
      ? project.slides.find((slide) => slide.id === selectedSlide.duoRightSlideId) ?? fallbackRightSlide
      : project.slides.find((slide) => slide.id === selectedSlide.duoLeftSlideId) ?? selectedSlide
    : selectedSlide;
  const selectedScreenLabel = selectedLayoutId === "duo"
    ? selectedDeviceSlot === "secondary" ? "Right" : "Left"
    : "Screenshot";
  const selectedScreenUsesDeviceFrame = (
    getStoreDeviceStyleOverride(selectedSlide, selectedDeviceSlot) ?? project.theme.deviceStyle
  ) === "iphone";

  const selectSlide = (id: string, focus = true): void => {
    setCurrentProject({ ...project, selectedSlideId: id, updatedAt: Date.now() }, "skip");
    setActiveDeviceSlot("primary");
    if (focus) setView("focus");
  };

  const updateSlide = (nextSlide: StoreSlide): void => {
    const current = projectRef.current;
    if (!current) return;
    setCurrentProject({
      ...current,
      slides: current.slides.map((slide) => slide.id === nextSlide.id ? nextSlide : slide),
      updatedAt: Date.now(),
    });
  };

  const patchSlide = (slideId: string, updates: Partial<StoreSlide>): void => {
    const current = projectRef.current;
    if (!current) return;
    const currentSlide = current.slides.find((slide) => slide.id === slideId);
    if (!currentSlide) return;
    const nextSlide = { ...currentSlide, ...updates };
    if ("src" in updates || "backgroundImageOverride" in updates || "overlay" in updates) {
      assertStoreImageBudget(
        storeSlidesImageBytes(current.slides),
        storeSlideImageBytes(nextSlide),
        storeSlideImageBytes(currentSlide),
      );
    }
    setCurrentProject({
      ...current,
      slides: current.slides.map((slide) => slide.id === slideId ? nextSlide : slide),
      updatedAt: Date.now(),
    });
  };

  const applyTextColorToAll = (
    key: "headlineColor" | "subheadColor",
    value: string,
  ): void => {
    const overrideKey = key === "headlineColor"
      ? "headlineColorOverride"
      : "subheadColorOverride";
    commitProject({
      ...project,
      theme: { ...project.theme, [key]: value },
      slides: project.slides.map((slide) => ({
        ...slide,
        [overrideKey]: null,
        extraTexts: (slide.extraTexts ?? []).map((text) => text.kind === (
          key === "headlineColor" ? "heading" : "subheading"
        ) ? { ...text, color: null } : text),
      })),
    });
  };

  const addFiles = async (files: File[]): Promise<void> => {
    const projectGeneration = projectGenerationRef.current;
    const existingSlides = project.slides.length === 1
      && project.slides[0].src === STORE_STARTER_SCREEN_SRC
      ? []
      : project.slides;
    const remaining = MAX_STORE_SLIDES - existingSlides.length;
    if (remaining <= 0) return;
    try {
      const added = await filesToStoreSlides(files.slice(0, remaining), {
        availableBytes: MAX_STORE_PROJECT_IMAGE_BYTES - storeSlidesImageBytes(existingSlides),
        maxFiles: remaining,
      });
      if (added.length === 0) return;
      if (projectGenerationRef.current !== projectGeneration) return;
      const current = projectRef.current;
      if (!current) return;
      const currentSlides = current.slides.length === 1
        && current.slides[0].src === STORE_STARTER_SCREEN_SRC
        ? []
        : current.slides;
      const available = MAX_STORE_SLIDES - currentSlides.length;
      const accepted = added.slice(0, available);
      if (accepted.length === 0) return;
      assertStoreImageBudget(
        storeSlidesImageBytes(currentSlides),
        storeSlidesImageBytes(accepted),
      );
      setCurrentProject({
        ...current,
        slides: [...currentSlides, ...accepted],
        selectedSlideId: accepted[0].id,
        updatedAt: Date.now(),
      });
      setActiveDeviceSlot("primary");
      setView("focus");
    } catch (cause) {
      toast.error("Could not add those screenshots", {
        description: cause instanceof Error ? cause.message : "Please try different image files.",
      });
    }
  };

  const reorder = (ids: string[]): void => {
    const byId = new Map(project.slides.map((slide) => [slide.id, slide]));
    commitProject({ ...project, slides: ids.map((id) => byId.get(id)).filter((slide): slide is StoreSlide => Boolean(slide)) });
    setActiveDeviceSlot("primary");
  };

  const moveSlide = (slideId: string, direction: -1 | 1): void => {
    const currentIndex = project.slides.findIndex((slide) => slide.id === slideId);
    const nextProject = moveStoreSlide(project, slideId, direction);
    if (nextProject === project) return;
    const nextIndex = currentIndex + direction;
    pendingThumbnailFocusRef.current = slideId;
    commitProject(nextProject);
    setActiveDeviceSlot("primary");
    if (view === "overview") setPage(Math.floor(nextIndex / PAGE_SIZE));
    setReorderAnnouncement(
      `Screenshot moved to position ${nextIndex + 1} of ${project.slides.length}.`,
    );
  };

  const applyAppTemplate = (templateProject: StoreProject): void => {
    projectGenerationRef.current += 1;
    clearHistory();
    setCurrentProject(templateProject, "skip");
    queueProjectSave(templateProject);
    setActiveDeviceSlot("primary");
    setTemplateGalleryOpen(false);
    setView("focus");
  };

  const useStarterTemplate = (): void => {
    setShowStarterChoice(false);
    setActiveDeviceSlot("primary");
    setView("focus");
    queueProjectSave(project);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('[data-store-device-control="move"]')?.focus();
    });
  };

  const startFromScratch = (): void => {
    projectGenerationRef.current += 1;
    const scratchProject = createScratchStoreProject();
    clearHistory();
    setCurrentProject(scratchProject, "skip");
    setShowStarterChoice(false);
    setActiveDeviceSlot("primary");
    setView("focus");
    queueProjectSave(scratchProject);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('[data-store-device-control="move"]')?.focus();
    });
  };

  const positionsChanged = storeSlidePositionsChanged(selectedSlide);

  const resetPositions = (): void => {
    commitProject({
      ...project,
      slides: project.slides.map((slide) => slide.id === selectedSlide.id
        ? resetStoreSlidePositions(slide)
        : slide),
    });
    setActiveDeviceSlot("primary");
  };

  const duplicateSelectedSlide = (): void => {
    if (project.slides.length >= MAX_STORE_SLIDES) return;
    try {
      assertStoreImageBudget(
        storeSlidesImageBytes(project.slides),
        storeSlideImageBytes(selectedSlide),
      );
      const copy = duplicateStoreSlide(selectedSlide);
      const selectedIndex = project.slides.findIndex((slide) => slide.id === selectedSlide.id);
      const slides = [...project.slides];
      slides.splice(selectedIndex + 1, 0, copy);
      commitProject({ ...project, slides, selectedSlideId: copy.id });
      setActiveDeviceSlot("primary");
    } catch (cause) {
      toast.error("Could not duplicate this screenshot", {
        description: cause instanceof Error ? cause.message : "Remove another image and try again.",
      });
    }
  };

  const removeProject = (clearEditorHistory = true): Promise<void> => {
    persistenceGenerationRef.current += 1;
    if (clearEditorHistory) clearHistory();
    pendingProjectRef.current = null;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setCurrentProject(createStarterStoreProject(), "skip");
    setShowStarterChoice(true);
    setActiveDeviceSlot("primary");
    setView("overview");
    savesInFlightRef.current += 1;
    const deletion = saveQueueRef.current
      .catch(() => undefined)
      .then(() => deleteStoreProject());
    saveQueueRef.current = deletion;
    return deletion
      .catch(() => {
        toast.error("Could not remove the saved screenshot set", {
          description: "Your previous set may return after a refresh.",
        });
      })
      .finally(() => { savesInFlightRef.current -= 1; });
  };

  const deleteSelectedSlide = (): void => {
    const deletedSlide = selectedSlide;
    const deletedIndex = project.slides.findIndex((slide) => slide.id === deletedSlide.id);
    const deletionGeneration = projectGenerationRef.current;
    const nextProject = removeStoreSlide(project, selectedSlide.id);
    let clearedProject: StoreProject | null = null;
    if (!nextProject) {
      void removeProject(false);
      clearedProject = projectRef.current;
    } else {
      commitProject(nextProject);
      setActiveDeviceSlot("primary");
    }

    showStoreUndoToast("Screenshot deleted", () => {
      if (projectGenerationRef.current !== deletionGeneration) {
        toast.error("Could not restore this screenshot", {
          description: "The screenshot set has been replaced.",
        });
        return;
      }
      const current = projectRef.current;
      if (!current || current.slides.some((slide) => slide.id === deletedSlide.id)) return;

      const restoringClearedProject = clearedProject !== null && current === clearedProject;
      if (restoringClearedProject) {
        const restoredProject = { ...project, updatedAt: Date.now() };
        setCurrentProject(restoredProject, "skip");
        setShowStarterChoice(false);
        setView("focus");
        setActiveDeviceSlot("primary");
        return;
      }

      if (current.slides.length >= MAX_STORE_SLIDES) {
        toast.error("Could not restore this screenshot", {
          description: `A project can contain up to ${MAX_STORE_SLIDES} screenshots.`,
        });
        return;
      }

      try {
        assertStoreImageBudget(
          storeSlidesImageBytes(current.slides),
          storeSlideImageBytes(deletedSlide),
        );
      } catch (cause) {
        toast.error("Could not restore this screenshot", {
          description: cause instanceof Error ? cause.message : "Remove another image and try again.",
        });
        return;
      }

      const slides = [...current.slides];
      slides.splice(Math.min(deletedIndex, slides.length), 0, deletedSlide);
      setCurrentProject({
        ...current,
        slides,
        selectedSlideId: deletedSlide.id,
        updatedAt: Date.now(),
      }, "skip");
      setShowStarterChoice(false);
      setView("focus");
      setActiveDeviceSlot("primary");
    });
  };

  const reset = (): void => {
    projectGenerationRef.current += 1;
    void removeProject();
  };

  const handleResetDialogOpenChange = (open: boolean): void => {
    setResetDialogOpen(open);
    if (!open) {
      window.requestAnimationFrame(() => resetButtonRef.current?.focus());
    }
  };

  const replaceImage = (file: File, slideId: string): void => {
    const sourceSlide = project.slides.find((candidate) => candidate.id === slideId) ?? selectedSlide;
    const projectGeneration = projectGenerationRef.current;
    const requestId = (replacementRequestIdsRef.current.get(slideId) ?? 0) + 1;
    replacementRequestIdsRef.current.set(slideId, requestId);
    void (async () => {
      try {
        assertStoreImageBudget(
          storeSlidesImageBytes(project.slides),
          file.size,
          storeDataUrlBytes(sourceSlide.src),
        );
        const src = await fileToDataUrl(file);
        if (projectGenerationRef.current !== projectGeneration) return;
        if (replacementRequestIdsRef.current.get(slideId) !== requestId) return;
        const current = projectRef.current;
        if (!current) return;
        const currentSlide = current.slides.find((slide) => slide.id === slideId);
        if (!currentSlide) return;
        assertStoreImageBudget(
          storeSlidesImageBytes(current.slides),
          file.size,
          storeDataUrlBytes(currentSlide.src),
        );
        setCurrentProject({
          ...current,
          slides: current.slides.map((slide) => slide.id === slideId
            ? { ...slide, src, name: file.name }
            : slide),
          updatedAt: Date.now(),
        });
      } catch (cause) {
        if (projectGenerationRef.current !== projectGeneration) return;
        if (replacementRequestIdsRef.current.get(slideId) !== requestId) return;
        toast.error("Could not replace this screenshot", {
          description: cause instanceof Error ? cause.message : "Please try a different image file.",
        });
      }
    })();
  };

  const replaceScreenImage = (sourceSlideId: string, file: File): void => {
    replaceImage(file, sourceSlideId);
  };

  const deleteScreenImage = (sourceSlideId: string): void => {
    const sourceSlide = projectRef.current?.slides.find((slide) => slide.id === sourceSlideId);
    if (!sourceSlide || !sourceSlide.src) return;
    const deletedImage = {
      src: sourceSlide.src,
      name: sourceSlide.name,
      image: { ...sourceSlide.image },
    };

    patchSlide(sourceSlideId, {
      src: "",
      name: "Empty screen",
      image: { mode: "fill", scale: 1, offsetX: 0, offsetY: 0 },
    });

    showStoreUndoToast("Screen image deleted", () => {
      const current = projectRef.current;
      const currentSlide = current?.slides.find((slide) => slide.id === sourceSlideId);
      if (!current || !currentSlide) return;
      setCurrentProject({
        ...current,
        slides: current.slides.map((slide) => slide.id === sourceSlideId
          ? { ...slide, ...deletedImage }
          : slide),
        updatedAt: Date.now(),
      }, "skip");
    });
  };

  const updateScreenImage = (sourceSlideId: string, image: StoreImageTransform): void => {
    patchSlide(sourceSlideId, { image });
  };

  const requestScreenCrop = (sourceSlideId: string, original: StoreImageTransform): void => {
    setControlsOpen(false);
    setCropRequest((current) => ({
      id: (current?.id ?? 0) + 1,
      sourceSlideId,
      original,
    }));
  };

  const focusCopyField = (field: "heading" | "subheading"): void => {
    setResponsivePanel("content");
    if (window.innerWidth < 1280) setControlsOpen(true);
    setTextFocusRequest((current) => ({ field, id: (current?.id ?? 0) + 1 }));
  };

  const beginExport = (): void => {
    setExportRequestId((current) => current + 1);
    setExportOpen(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <p id="store-reorder-instructions" className="sr-only">
        Press Shift plus Left Arrow or Shift plus Right Arrow to reorder this screenshot.
      </p>
      <p role="status" aria-live="polite" className="sr-only">
        {reorderAnnouncement}
      </p>
      <MobileBanner />
      <StoreHeader
        onExport={beginExport}
        onReset={() => setResetDialogOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyAvailability.canUndo}
        canRedo={historyAvailability.canRedo}
        resetButtonRef={resetButtonRef}
        showActions={!showStarterChoice && !templateGalleryOpen}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!templateGalleryOpen && !showStarterChoice ? (
          <div className="hidden md:block">
            <StoreGlobalPanel
              project={project}
              onChange={commitProject}
              onSlideChange={patchSlide}
              onOverview={() => setView("overview")}
              onPreviewTemplates={() => setTemplateGalleryOpen(true)}
              onDeviceSelectionChange={setActiveDeviceSlot}
              deviceSlot={activeDeviceSlot}
            />
          </div>
        ) : null}
        <main className="flex min-w-0 flex-1 flex-col bg-foreground/[0.018]">
          <div className="min-h-0 flex-1">
            {templateGalleryOpen ? (
              <StoreTemplateGallery
                onApply={applyAppTemplate}
                onClose={() => setTemplateGalleryOpen(false)}
              />
            ) : view === "overview" ? (
              <StoreOverview
                project={project}
                page={page}
                onPage={setPage}
                onReorder={reorder}
                onMove={moveSlide}
                onSelect={selectSlide}
                showStarterChoice={showStarterChoice}
                onUseTemplate={useStarterTemplate}
                onStartFromScratch={startFromScratch}
              />
            ) : (
              <StoreFocus
                project={project}
                selectedSlide={selectedSlide}
                onSelect={(id) => selectSlide(id, false)}
                onReorder={reorder}
                onMove={moveSlide}
                onResetPositions={resetPositions}
                onAdd={() => addInputRef.current?.click()}
                onDuplicate={duplicateSelectedSlide}
                onDelete={deleteSelectedSlide}
                onSlideChange={updateSlide}
                onScreenFile={replaceScreenImage}
                onScreenDelete={deleteScreenImage}
                onScreenImageChange={updateScreenImage}
                cropRequest={cropRequest}
                onTextEditRequest={focusCopyField}
                onDeviceSelect={setActiveDeviceSlot}
                selectedDeviceSlot={activeDeviceSlot}
                canAdd={project.slides.length < MAX_STORE_SLIDES}
                canDuplicate={project.slides.length < MAX_STORE_SLIDES}
                positionsChanged={positionsChanged}
              />
            )}
          </div>
        </main>
        {!showStarterChoice && !templateGalleryOpen ? (
          <StoreSlidePanel
            slide={selectedSlide}
            screenSlide={selectedScreenSlide}
            screenLabel={selectedScreenLabel}
            usesDeviceFrame={selectedScreenUsesDeviceFrame}
            slides={project.slides}
            isDuo={selectedLayoutId === "duo"}
            theme={project.theme}
            onChange={patchSlide}
            onThemeChange={(updates) => commitProject({
              ...project,
              theme: { ...project.theme, ...updates },
            })}
            onApplyTextColorToAll={applyTextColorToAll}
            onReplace={(slideId, file) => replaceImage(file, slideId)}
            onCropRequest={requestScreenCrop}
            textFocusRequest={textFocusRequest}
          />
        ) : null}
      </div>

      <input
        ref={addInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) void addFiles(files);
          event.currentTarget.value = "";
        }}
      />

      <StoreExportDialog
        project={project}
        open={exportOpen}
        onOpenChange={setExportOpen}
        requestId={exportRequestId}
      />

      <AlertDialog open={resetDialogOpen} onOpenChange={handleResetDialogOpenChange}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
              <Delete02Icon aria-hidden="true" size={18} />
            </div>
            <AlertDialogTitle>Start over?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every screenshot and edit in this set, then returns you to the template chooser. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={reset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30"
            >
              Start over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={controlsOpen} onOpenChange={setControlsOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[420px] gap-0 p-0 xl:hidden"
        >
          <SheetHeader className="border-b border-foreground/10 px-4 py-3 pr-12">
            <SheetTitle className="text-sm">Customize screenshot</SheetTitle>
            <SheetDescription className="sr-only">
              Edit the selected screenshot design, text, and image settings.
            </SheetDescription>
          </SheetHeader>
          <div className="shrink-0 border-b border-foreground/10 p-3">
            <SegmentedControl
              size="sm"
              value={responsivePanel}
              onChange={(value) => setResponsivePanel(value as "design" | "content")}
              options={[
                { id: "design", label: "Design" },
                { id: "content", label: "Content" },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {responsivePanel === "design" ? (
              <StoreGlobalPanel
                project={project}
                onChange={commitProject}
                onSlideChange={patchSlide}
                onOverview={() => {
                  setControlsOpen(false);
                  setView("overview");
                }}
                onPreviewTemplates={() => {
                  setControlsOpen(false);
                  setTemplateGalleryOpen(true);
                }}
                onDeviceSelectionChange={setActiveDeviceSlot}
                deviceSlot={activeDeviceSlot}
                embedded
              />
            ) : (
              <StoreSlidePanel
                slide={selectedSlide}
                screenSlide={selectedScreenSlide}
                screenLabel={selectedScreenLabel}
                usesDeviceFrame={selectedScreenUsesDeviceFrame}
                slides={project.slides}
                isDuo={selectedLayoutId === "duo"}
                theme={project.theme}
                onChange={patchSlide}
                onThemeChange={(updates) => commitProject({
                  ...project,
                  theme: { ...project.theme, ...updates },
                })}
                onApplyTextColorToAll={applyTextColorToAll}
                onReplace={(slideId, file) => replaceImage(file, slideId)}
                onCropRequest={requestScreenCrop}
                textFocusRequest={textFocusRequest}
                embedded
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className={cn("fixed bottom-3 right-3 z-40 gap-2 xl:hidden", templateGalleryOpen || showStarterChoice ? "hidden" : "flex")}>
        <Button size="sm" variant="outline" onClick={() => setControlsOpen(true)}>
          <Settings02Icon size={14} /> Customize
        </Button>
        <Button className="md:hidden" size="sm" variant="outline" onClick={() => setView(view === "overview" ? "focus" : "overview")}>
          {view === "overview" ? <ArrowRight02Icon size={14} /> : <GridIcon size={14} />}
          {view === "overview" ? "Edit" : "Overview"}
        </Button>
        <Button className="md:hidden" size="sm" onClick={beginExport}><FileZipIcon size={14} /> Export</Button>
      </div>
    </div>
  );
}
