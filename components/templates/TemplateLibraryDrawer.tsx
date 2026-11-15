'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft01Icon,
  AspectRatioIcon,
  Cancel01Icon,
  GridIcon,
  Image01Icon,
  MagicWand01Icon,
  PaintBrush01Icon,
  Video01Icon,
} from 'hugeicons-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AnimatedTemplateGallery,
  AnimatedTemplatePreview,
} from './AnimatedTemplateGallery';
import { ImageTemplateGallery, ImageTemplatePreview } from './ImageTemplateGallery';
import { SuggestedLooks } from './SuggestedLooks';
import type { AnimatedTemplate } from '@/lib/animation/templates';
import { getPresetById as getVisualPresetById } from '@/lib/constants/presets';
import { getAspectRatioPreset } from '@/lib/aspect-ratio-utils';
import {
  getImageTemplateById,
  type ImageTemplate,
} from '@/lib/templates/image-templates';
import { useImageStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type TemplateFilter = 'all' | 'image' | 'animated';
type TemplateSelection =
  | { kind: 'image'; template: ImageTemplate }
  | { kind: 'animated'; template: AnimatedTemplate };

const FILTERS: Array<{
  id: TemplateFilter;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'all', label: 'All', icon: <GridIcon size={14} /> },
  { id: 'image', label: 'Image', icon: <Image01Icon size={14} /> },
  { id: 'animated', label: 'Animated', icon: <Video01Icon size={14} /> },
];

function TemplateMetadata({ selection }: { selection: TemplateSelection }) {
  const preset = selection.kind === 'image'
    ? selection.template.preset
    : getImageTemplateById(selection.template.visualPresetId)?.preset
      ?? getVisualPresetById(selection.template.visualPresetId);
  const dimensions = getAspectRatioPreset(
    preset?.aspectRatio ?? '16_9',
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        {selection.kind === 'animated' ? <Video01Icon size={14} /> : <Image01Icon size={14} />}
        {selection.kind === 'animated' ? 'Animated' : 'Image'}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <PaintBrush01Icon size={14} />
        {preset?.name ?? 'Editable design'}
      </span>
      {dimensions ? (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <AspectRatioIcon size={14} />
          {dimensions.width} × {dimensions.height}
        </span>
      ) : null}
    </div>
  );
}

function TemplateDetail({
  selection,
  onBack,
  onClose,
}: {
  selection: TemplateSelection;
  onBack: () => void;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const applyVisualPreset = useImageStore((state) => state.applyVisualPreset);
  const applyAnimatedTemplate = useImageStore((state) => state.applyAnimatedTemplate);
  const name = selection.kind === 'image' ? selection.template.preset.name : selection.template.name;
  const description = selection.kind === 'image'
    ? selection.template.preset.description
    : selection.template.description;

  const handleApply = () => {
    if (selection.kind === 'animated') {
      applyAnimatedTemplate(selection.template.id);
      return;
    }

    applyVisualPreset(selection.template.preset, {
      clearAnimation: true,
      closeTemplates: true,
      scene: selection.template.scene,
    });
  };

  return (
    <motion.div
      key={`detail-${selection.kind}-${name}`}
      initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, x: 12 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="grid shrink-0 grid-cols-[44px_1fr_44px] lg:grid-cols-[40px_1fr_40px] items-center border-b border-foreground/10 px-3 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to templates"
          className="flex size-11 lg:size-9 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <ArrowLeft01Icon size={18} />
        </button>
        <div className="min-w-0 text-center">
          <SheetTitle className="truncate text-base leading-6">{name}</SheetTitle>
          <SheetDescription className="sr-only">Preview and apply the {name} template.</SheetDescription>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close templates"
          className="flex size-11 lg:size-9 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <Cancel01Icon size={17} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 scrollbar-hide">
        <TemplateMetadata selection={selection} />
        <p className="mx-auto mt-3 max-w-sm text-center text-xs leading-5 text-muted-foreground">
          {description}
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-foreground/10 bg-muted shadow-xl">
          {selection.kind === 'animated' ? (
            <AnimatedTemplatePreview
              template={selection.template}
              active
              showBadges={false}
              className="rounded-xl"
            />
          ) : (
            <ImageTemplatePreview
              template={selection.template}
              className="rounded-xl"
            />
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-foreground/10 bg-background/95 px-5 pb-5 pt-4 backdrop-blur-md">
        <button
          type="button"
          onClick={handleApply}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-semibold text-background outline-none transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MagicWand01Icon size={16} />
          Use Template
        </button>
        <p className="mx-auto mt-3 max-w-sm text-center text-[11px] leading-4 text-muted-foreground">
          This replaces the current design and animation. Your uploaded media stays.
        </p>
      </div>
    </motion.div>
  );
}

export function TemplateLibraryDrawer() {
  const isMobile = useIsMobile();
  const open = useImageStore((state) => state.showTemplates);
  const setOpen = useImageStore((state) => state.setShowTemplates);
  const shouldReduceMotion = useReducedMotion();
  const tabListId = React.useId();
  const [filter, setFilter] = React.useState<TemplateFilter>('animated');
  const [selection, setSelection] = React.useState<TemplateSelection | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSelection(null);
      setFilter('animated');
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelection(null);
      setFilter('animated');
    }
  };

  const handleFilterKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % FILTERS.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + FILTERS.length) % FILTERS.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = FILTERS.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    setFilter(FILTERS[nextIndex].id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]
      ?.focus();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById('editor-templates-trigger')?.focus({ preventScroll: true });
        }}
        className={cn(
          "gap-0 overflow-hidden border-foreground/10 p-0 data-[state=closed]:duration-200 data-[state=open]:duration-300 motion-reduce:animate-none",
          isMobile
            ? "mobile-editor-drawer mx-auto h-[85dvh] w-full max-w-xl rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            : "w-[min(94vw,560px)] max-w-none sm:max-w-[560px]"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {selection ? (
            <TemplateDetail
              selection={selection}
              onBack={() => setSelection(null)}
              onClose={() => handleOpenChange(false)}
            />
          ) : (
            <motion.div
              key="template-browser"
              initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-foreground/10 px-5 py-3.5">
                <SheetTitle className="text-base leading-6">Templates</SheetTitle>
                <SheetDescription className="sr-only">
                  Browse image and animated templates.
                </SheetDescription>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  aria-label="Close templates"
                  className="flex size-11 lg:size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/30"
                >
                  <Cancel01Icon size={17} />
                </button>
              </div>

              <div className="shrink-0 border-b border-foreground/10 px-5 py-3">
                <div
                  role="tablist"
                  aria-label="Template type"
                  className="flex w-fit items-center gap-1 rounded-lg border border-foreground/10 bg-foreground/[0.04] p-1"
                >
                  {FILTERS.map((item) => {
                    const selected = filter === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`${tabListId}-${item.id}-tab`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`${tabListId}-panel`}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setFilter(item.id)}
                        onKeyDown={(event) => handleFilterKeyDown(event, FILTERS.indexOf(item))}
                        className={cn(
                          'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium outline-none transition-[background-color,color,box-shadow] duration-150 ease-out',
                          'focus-visible:ring-2 focus-visible:ring-foreground/30',
                          selected
                            ? 'bg-background text-foreground shadow-sm ring-1 ring-foreground/10'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
                {/* Above every filter: generated looks are the fastest path to a good result. */}
                <div className="px-5 pt-5 empty:hidden">
                  <SuggestedLooks />
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={filter}
                    id={`${tabListId}-panel`}
                    role="tabpanel"
                    aria-labelledby={`${tabListId}-${filter}-tab`}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-7 p-5"
                  >
                    {filter === 'all' || filter === 'animated' ? (
                      <section>
                        <AnimatedTemplateGallery
                          onTemplateSelect={(template) => setSelection({ kind: 'animated', template })}
                        />
                      </section>
                    ) : null}

                    {filter === 'all' || filter === 'image' ? (
                      <section>
                        <ImageTemplateGallery
                          onTemplateSelect={(template) => setSelection({ kind: 'image', template })}
                        />
                      </section>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
