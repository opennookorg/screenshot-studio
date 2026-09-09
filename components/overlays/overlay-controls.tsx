'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useImageStore } from '@/lib/store'
import { Delete02Icon, ViewIcon, ViewOffSlashIcon, RotateRight01Icon, RotateLeft01Icon, RefreshIcon } from 'hugeicons-react'
import { getR2ImageUrl } from '@/lib/r2'
import { OVERLAY_PATHS, isOverlayPath } from '@/lib/r2-overlays'

export function OverlayControls() {
  const {
    imageOverlays,
    updateImageOverlay,
    removeImageOverlay,
    clearImageOverlays,
    selectedOverlayId,
    setSelectedOverlayId,
  } = useImageStore()

  const selectedOverlay = imageOverlays.find(
    (overlay) => overlay.id === selectedOverlayId
  )

  const handleUpdateSize = (value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { size: value[0] })
    }
  }

  // Normalize rotation to -180 to 180 range
  const normalizeRotation = (rotation: number): number => {
    let normalized = rotation % 360
    if (normalized > 180) normalized -= 360
    if (normalized < -180) normalized += 360
    return normalized
  }

  const handleUpdateRotation = (value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { rotation: value[0] })
    }
  }

  const handleRotateBy = (degrees: number) => {
    if (selectedOverlay) {
      const newRotation = normalizeRotation(selectedOverlay.rotation + degrees)
      updateImageOverlay(selectedOverlay.id, { rotation: newRotation })
    }
  }

  const handleUpdateOpacity = (value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { opacity: value[0] })
    }
  }

  const handleToggleFlipX = () => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { flipX: !selectedOverlay.flipX })
    }
  }

  const handleToggleFlipY = () => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { flipY: !selectedOverlay.flipY })
    }
  }

  const handleToggleVisibility = (id: string) => {
    const overlay = imageOverlays.find((o) => o.id === id)
    if (overlay) {
      updateImageOverlay(id, { isVisible: !overlay.isVisible })
    }
  }

  const handleUpdatePosition = (axis: 'x' | 'y', value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, {
        position: {
          ...selectedOverlay.position,
          [axis]: value[0],
        },
      })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Image Overlays</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearImageOverlays}
          disabled={imageOverlays.length === 0}
          className="h-8 px-3 text-xs font-medium rounded-lg"
        >
          Clear All
        </Button>
      </div>

      {imageOverlays.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Manage Overlays</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {imageOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                  selectedOverlayId === overlay.id
                    ? 'bg-accent border-primary'
                    : 'bg-background hover:bg-accent border-border'
                }`}
                onClick={() => setSelectedOverlayId(overlay.id)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleVisibility(overlay.id)
                  }}
                  className="h-6 w-6 p-0"
                >
                  {overlay.isVisible ? (
                    <ViewIcon className="h-3 w-3" />
                  ) : (
                    <ViewOffSlashIcon className="h-3 w-3" />
                  )}
                </Button>
                <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden">
                  {(() => {
                    // Check if this is an R2 overlay path or a custom upload
                    const isR2Overlay = isOverlayPath(overlay.src) ||
                                       (typeof overlay.src === 'string' && overlay.src.startsWith('overlays/'))

                    // Get the image URL - use R2 if it's a known path, otherwise use the src directly
                    const imageUrl = isR2Overlay && !overlay.isCustom
                      ? getR2ImageUrl({ src: overlay.src })
                      : overlay.src

                    // Use regular img tag
                    return (
                      <img
                        src={imageUrl}
                        alt="Overlay preview"
                        className="object-contain w-full h-full"
                        style={{ display: 'block' }}
                      />
                    )
                  })()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImageOverlay(overlay.id)
                    if (selectedOverlayId === overlay.id) {
                      setSelectedOverlayId(null)
                    }
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive ml-auto"
                >
                  <Delete02Icon className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOverlay && (
        <div className="space-y-5 border-t pt-5">
          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              Edit Overlay
            </p>

            {/* Size */}
            <div className="p-3 rounded-xl bg-muted border border-border">
              <Slider
                value={[selectedOverlay.size]}
                onValueChange={handleUpdateSize}
                max={400}
                min={20}
                step={1}
                label="Size"
                valueDisplay={`${selectedOverlay.size}px`}
              />
            </div>

            {/* Rotation */}
            <div className="p-3 rounded-xl bg-muted border border-border space-y-3">
              <Slider
                value={[selectedOverlay.rotation]}
                onValueChange={handleUpdateRotation}
                max={180}
                min={-180}
                step={1}
                label="Rotation"
                valueDisplay={`${selectedOverlay.rotation}°`}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotateBy(-90)}
                  className="flex-1 h-8 rounded-lg"
                  title="Rotate -90°"
                >
                  <RotateLeft01Icon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateImageOverlay(selectedOverlay.id, { rotation: 0 })}
                  className="flex-1 h-8 rounded-lg"
                  title="Reset rotation"
                >
                  <RefreshIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotateBy(90)}
                  className="flex-1 h-8 rounded-lg"
                  title="Rotate +90°"
                >
                  <RotateRight01Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Opacity */}
            <div className="p-3 rounded-xl bg-muted border border-border">
              <Slider
                value={[selectedOverlay.opacity]}
                onValueChange={handleUpdateOpacity}
                max={1}
                min={0}
                step={0.01}
                label="Opacity"
                valueDisplay={`${Math.round(selectedOverlay.opacity * 100)}%`}
              />
            </div>

            {/* Blur */}
            <div className="p-3 rounded-xl bg-muted border border-border">
              <Slider
                value={[selectedOverlay.blur ?? 0]}
                onValueChange={(v) => updateImageOverlay(selectedOverlay.id, { blur: v[0] })}
                max={20}
                min={0}
                step={0.5}
                label="Blur"
                valueDisplay={`${selectedOverlay.blur ?? 0}px`}
              />
            </div>

            {/* Flip Controls */}
            <div className="flex gap-2">
              <Button
                variant={selectedOverlay.flipX ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleFlipX}
                className="flex-1 h-10 rounded-xl"
              >
                Flip X
              </Button>
              <Button
                variant={selectedOverlay.flipY ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleFlipY}
                className="flex-1 h-10 rounded-xl"
              >
                Flip Y
              </Button>
            </div>

            {/* Position */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">Position</p>
              {/* X position */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[selectedOverlay.position.x]}
                  onValueChange={(value) => handleUpdatePosition('x', value)}
                  max={800}
                  min={0}
                  step={1}
                  label="X Position"
                  valueDisplay={`${Math.round(selectedOverlay.position.x)}px`}
                />
              </div>

              {/* Y position */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[selectedOverlay.position.y]}
                  onValueChange={(value) => handleUpdatePosition('y', value)}
                  max={600}
                  min={0}
                  step={1}
                  label="Y Position"
                  valueDisplay={`${Math.round(selectedOverlay.position.y)}px`}
                />
              </div>
            </div>

            {/* Remove Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                removeImageOverlay(selectedOverlay.id)
                setSelectedOverlayId(null)
              }}
              className="w-full h-10 rounded-xl"
            >
              <Delete02Icon className="h-4 w-4 mr-2" />
              Remove Overlay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

