'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { locales } from '@/i18n/routing';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { isLocalDropTarget } from '@/lib/drop-routing';
import { shouldIgnoreEditorShortcut } from '@/lib/editor-shortcuts';

interface GlobalDropZoneProps {
  children: React.ReactNode;
}

export function GlobalDropZone({ children }: GlobalDropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const dragCounterRef = React.useRef(0);
  const router = useRouter();
  const pathname = usePathname();

  const locale = locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  const editorPath = `${locale ? `/${locale}` : ''}/editor`;
  const isEditorPage = pathname === editorPath;

  const validateFile = React.useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'File type not supported. Use PNG, JPG, or WEBP.';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File too large. Max ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`;
    }
    return null;
  }, []);

  const handleFiles = React.useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      const validationError = validateFile(imageFiles[0]);
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        setTimeout(() => setError(null), 3000);
        return;
      }

      setIsProcessing(true);
      setError(null);

      // Small delay for the animation to play
      setTimeout(async () => {
        const { useEditorStore, useImageStore } = await import('@/lib/store');
        const { addImages, addImageOverlay, uploadedImageUrl } = useImageStore.getState();
        const hasMainImage = !!uploadedImageUrl;

        if (isEditorPage && hasMainImage) {
          // Add as overlay images on top of existing canvas
          imageFiles.forEach((file) => {
            const url = URL.createObjectURL(file);
            addImageOverlay({
              src: url,
              position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 },
              size: 250,
              rotation: 0,
              opacity: 1,
              flipX: false,
              flipY: false,
              isVisible: true,
              isCustom: true,
            });
          });
        } else {
          const imageUrl = URL.createObjectURL(imageFiles[0]);
          addImages(imageFiles);
          useEditorStore.getState().setScreenshot({ src: imageUrl });

          if (!isEditorPage) {
            router.push(editorPath);
          }
        }

        setIsProcessing(false);
        setIsDraggingOver(false);
      }, 300);
    },
    [validateFile, isEditorPage, editorPath, router]
  );

  // Global drag events
  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (isLocalDropTarget(e.target)) {
        dragCounterRef.current = 0;
        setIsDraggingOver(false);
        return;
      }
      e.preventDefault();
      dragCounterRef.current++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDraggingOver(true);
        setError(null);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (isLocalDropTarget(e.target)) return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (isLocalDropTarget(e.target)) return;
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (isLocalDropTarget(e.target)) {
        dragCounterRef.current = 0;
        setIsDraggingOver(false);
        return;
      }
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        handleFiles(files);
      }
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleFiles]);

  // Handle image pastes before and after the editor's upload state unmounts.
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (shouldIgnoreEditorShortcut(e)) return;

      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) handleFiles([file]);
          break;
        }
      }
    };

    // Let local paste handlers (for example device screens) consume it first.
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFiles]);

  return (
    <>
      {children}

      <AnimatePresence>
        {(isDraggingOver || isProcessing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          >
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80"
            />

            {/* Drop zone content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              {/* Animated dashed border box */}
              <motion.div
                className="w-[420px] h-[280px] rounded-2xl flex flex-col items-center justify-center gap-4"
                style={{
                  border: '2.5px dashed',
                  borderColor: isProcessing ? 'var(--primary)' : 'var(--border)',
                  background: isProcessing
                    ? 'hsl(var(--primary) / 0.05)'
                    : 'hsl(var(--muted) / 0.5)',
                }}
                animate={
                  isProcessing
                    ? {}
                    : {
                        borderColor: [
                          'hsl(var(--border))',
                          'hsl(var(--primary))',
                          'hsl(var(--border))',
                        ],
                      }
                }
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
                    />
                    <p className="text-sm font-medium text-foreground">Loading image...</p>
                  </>
                ) : (
                  <>
                    {/* Animated arrow icon */}
                    <motion.svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      fill="none"
                      className="text-primary"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <path
                        d="M24 6v28M14 24l10 10 10-10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="10"
                        y1="42"
                        x2="38"
                        y2="42"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </motion.svg>

                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">
                        Drop your image here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, or WEBP
                      </p>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
