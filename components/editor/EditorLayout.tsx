"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { LeftEditPanel } from "./LeftEditPanel";
import { RightSettingsPanel } from "./RightSettingsPanel";
import { UnifiedRightPanel } from "./unified-right-panel";
import { EditorContent } from "./EditorContent";
import { EditorCanvas } from "@/components/canvas/EditorCanvas";
import { EditorStoreSync } from "@/components/canvas/EditorStoreSync";
import { EditorHeader } from "./EditorHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHasOpened } from "@/hooks/useHasOpened";
import { MobileDrawer } from "@/components/ui/responsive-popover";
import { Button } from "@/components/ui/button";
import { Settings02Icon, Upload01Icon, VideoReplayIcon, MagicWand01Icon } from "hugeicons-react";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { TimelineEditor } from "@/components/timeline";
import { useImageStore } from "@/lib/store";
import { trackEditorOpen } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  hasVisibleMockups,
  shouldRenderSourceImage,
} from "@/lib/device-mockups/layouts";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { useDeviceUIStore } from "@/lib/store/device-ui";
import { toast } from "sonner";
import {
  hasTemplateDemoMedia,
  isTemplateDemoMedia,
} from "@/lib/templates/demo-media";

const TemplateLibraryDrawer = dynamic(
  () =>
    import("@/components/templates/TemplateLibraryDrawer").then(
      (m) => m.TemplateLibraryDrawer,
    ),
  { ssr: false },
);

function TemplateMediaPrompt() {
  const imageName = useImageStore((state) => state.imageName);
  const uploadedImageUrl = useImageStore((state) => state.uploadedImageUrl);
  const editorMode = useImageStore((state) => state.editorMode);
  const mockups = useImageStore((state) => state.mockups);
  const replaceTemplateMedia = useImageStore((state) => state.replaceTemplateMedia);
  const selectedDeviceId = useDeviceUIStore((state) => state.selectedDeviceId);
  const [error, setError] = React.useState<string | null>(null);
  const isUsingTemplateDemo = editorMode === "device"
    ? hasTemplateDemoMedia(mockups.map((mockup) => mockup.screen))
    : isTemplateDemoMedia(uploadedImageUrl, imageName);

  if (!isUsingTemplateDemo) return null;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      setError(`Choose a PNG, JPG, or WEBP under ${MAX_IMAGE_SIZE / 1024 / 1024} MB`);
      return;
    }

    setError(null);

    const target = editorMode === "device"
      ? mockups.find((mockup) => mockup.id === selectedDeviceId)
        ?? mockups.find((mockup) => (
          isTemplateDemoMedia(mockup.screen.src, mockup.screen.name)
        ))
        ?? mockups[0]
      : null;
    if (editorMode === "device" && !target) return;

    const previousState = useImageStore.getState();
    const previousBlobUrls = new Set([
      previousState.uploadedImageUrl,
      ...previousState.mockups.map((mockup) => mockup.screen.src),
    ].filter((url): url is string => !!url?.startsWith("blob:")));
    const src = URL.createObjectURL(file);
    const temporalStore = useImageStore.temporal.getState();

    try {
      temporalStore.pause();
      replaceTemplateMedia(src, file.name, target?.id);
      temporalStore.clear();

      const currentState = useImageStore.getState();
      const retainedUrls = new Set([
        currentState.uploadedImageUrl,
        ...currentState.mockups.map((mockup) => mockup.screen.src),
      ]);
      previousBlobUrls.forEach((url) => {
        if (!retainedUrls.has(url)) URL.revokeObjectURL(url);
      });
    } catch {
      URL.revokeObjectURL(src);
      setError("Couldn't read that image. Try another file.");
    } finally {
      temporalStore.resume();
    }
  };

  return (
    <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2">
      <label className="inline-flex min-h-11 lg:min-h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-foreground/10 bg-card/95 px-3 text-xs font-medium text-foreground shadow-md backdrop-blur-md transition-[background-color,transform] duration-150 hover:bg-muted active:scale-[0.98] focus-within:ring-2 focus-within:ring-ring">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => void handleUpload(event)}
          className="sr-only"
        />
        <Upload01Icon size={14} />
        <span>{error ?? "Upload your media"}</span>
      </label>
    </div>
  );
}

function EditorMain() {
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);
  const {
    uploadedImageUrl,
    slides,
    mockups,
    editorMode,
    showTimeline,
    toggleTimeline,
    showTemplates,
    setShowTemplates,
  } = useImageStore();
  const hasOpenedTemplates = useHasOpened(showTemplates);

  // enable autosave
  useAutosaveDraft();

  const hasSourceContent = (
    !!uploadedImageUrl || slides.length > 0
  ) && shouldRenderSourceImage(editorMode, mockups);
  const hasContent = hasSourceContent || (
    editorMode === "device" && hasVisibleMockups(mockups)
  );
  React.useEffect(() => {
    trackEditorOpen();
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-contain bg-background pt-[env(safe-area-inset-top)]">
      <EditorStoreSync />

      <EditorHeader />
      {hasOpenedTemplates && <TemplateLibraryDrawer />}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="hidden lg:contents">
            <LeftEditPanel />
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <div
              className={cn(
                "relative flex min-h-0 flex-1 items-center justify-center overflow-hidden",
                // Dock space for the Animate chip so portrait stages don't sit under it
                hasContent && !showTimeline && !isMobile && "pb-14"
              )}
            >
              <EditorContent>
                <EditorCanvas />
              </EditorContent>

              <TemplateMediaPrompt />

              {hasContent && !showTimeline && !isMobile && (
                <button
                  type="button"
                  onClick={toggleTimeline}
                  className={cn(
                    'absolute bottom-3 left-1/2 z-20 -translate-x-1/2',
                    'inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-4',
                    'bg-card text-sm font-medium text-foreground',
                    'border border-foreground/10',
                    'shadow-lg',
                    'transition-all duration-150 ease-out',
                    'hover:bg-muted hover:border-foreground/15',
                    'active:scale-[0.98]'
                  )}
                >
                  <VideoReplayIcon size={15} className="text-foreground" />
                  <span>Animate</span>
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:contents">
            <RightSettingsPanel />
          </div>

        </div>

        {hasContent && showTimeline && !isMobile && <TimelineEditor />}
      </div>
      {isMobile && (
        <nav aria-label="Editor tools" className={cn("grid shrink-0 gap-2 border-t border-foreground/10 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]", editorMode === "device" ? "grid-cols-2" : "grid-cols-3")}>
          <MobileDrawer
            open={mobileSheetOpen}
            onOpenChange={setMobileSheetOpen}
            title="Edit design"
            description="Make it yours. Changes save as you go."
            className="h-[85dvh]"
            trigger={<Button variant="secondary" className="h-14 flex-col gap-1 rounded-xl text-xs"><Settings02Icon size={18} />Edit design</Button>}
          >
            <UnifiedRightPanel />
          </MobileDrawer>
          {editorMode !== "device" && <label className="relative flex h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-foreground/10 text-xs font-medium hover:bg-muted focus-within:ring-2 focus-within:ring-ring">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              aria-label="Upload images"
              className="sr-only"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (!files.length) return;
                if (files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE)) {
                  toast.error(`Choose PNG, JPG or WebP images under ${MAX_IMAGE_SIZE / 1024 / 1024} MB each.`);
                  return;
                }
                const store = useImageStore.getState();
                store.addImages(files);
                store.setActiveSlide(useImageStore.getState().slides.at(-files.length)!.id);
              }}
            />
            <Upload01Icon size={18} />Upload
          </label>}
          <Button id="editor-templates-trigger" variant="outline" onClick={() => setShowTemplates(true)} className="h-14 flex-col gap-1 rounded-xl text-xs">
            <MagicWand01Icon size={18} />Templates
          </Button>
        </nav>
      )}
    </div>
  );
}

export function EditorLayout() {
  return <EditorMain />;
}
