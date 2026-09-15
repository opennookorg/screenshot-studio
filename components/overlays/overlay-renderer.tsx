'use client'

import { useState, useRef, useEffect } from 'react'
import { useImageStore } from '@/lib/store'
import { getR2ImageUrl } from '@/lib/r2'
import { isOverlayPath } from '@/lib/r2-overlays'

export function OverlayRenderer() {
  const { imageOverlays, updateImageOverlay, selectedOverlayId, setSelectedOverlayId } = useImageStore()
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, overlayId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const overlay = imageOverlays.find((o) => o.id === overlayId)
    if (!overlay || !containerRef.current) return

    setSelectedOverlayId(overlayId)
    setIsDragging(true)

    const containerRect = containerRef.current.getBoundingClientRect()
    const offsetX = e.clientX - containerRect.left - overlay.position.x
    const offsetY = e.clientY - containerRect.top - overlay.position.y
    setDragOffset({ x: offsetX, y: offsetY })
  }

  const handleTouchStart = (e: React.TouchEvent, overlayId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const overlay = imageOverlays.find((o) => o.id === overlayId)
    if (!overlay || !containerRef.current) return

    setSelectedOverlayId(overlayId)
    setIsDragging(true)

    const touch = e.touches[0]
    const containerRect = containerRef.current.getBoundingClientRect()
    const offsetX = touch.clientX - containerRect.left - overlay.position.x
    const offsetY = touch.clientY - containerRect.top - overlay.position.y
    setDragOffset({ x: offsetX, y: offsetY })
  }

  useEffect(() => {
    if (!isDragging || !selectedOverlayId || !containerRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const overlay = imageOverlays.find((o) => o.id === selectedOverlayId)
      if (!overlay || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y

      // Constrain to container bounds
      const maxX = containerRect.width - overlay.size
      const maxY = containerRect.height - overlay.size

      updateImageOverlay(selectedOverlayId, {
        position: {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        },
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const overlay = imageOverlays.find((o) => o.id === selectedOverlayId)
      if (!overlay || !containerRef.current) return

      const touch = e.touches[0]
      const containerRect = containerRef.current.getBoundingClientRect()
      const newX = touch.clientX - containerRect.left - dragOffset.x
      const newY = touch.clientY - containerRect.top - dragOffset.y

      // Constrain to container bounds
      const maxX = containerRect.width - overlay.size
      const maxY = containerRect.height - overlay.size

      updateImageOverlay(selectedOverlayId, {
        position: {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        },
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, selectedOverlayId, dragOffset, imageOverlays, updateImageOverlay])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: 35, // Match parent container z-index
        overflow: 'visible', // Allow overlays to extend beyond container bounds
      }}
    >
      {imageOverlays.map((overlay) => {
        if (!overlay.isVisible) return null

        // Check if this is an R2 overlay path or a custom upload
        const isR2Overlay = isOverlayPath(overlay.src) ||
                           (typeof overlay.src === 'string' && overlay.src.startsWith('overlays/'))

        // Get the image URL - use R2 if it's a known path, otherwise use the src directly
        const imageUrl = isR2Overlay && !overlay.isCustom
          ? getR2ImageUrl({ src: overlay.src })
          : overlay.src

        return (
          <div
            key={overlay.id}
            className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
            style={{
              left: `${overlay.position.x}px`,
              top: `${overlay.position.y}px`,
              width: `${overlay.size}px`,
              height: `${overlay.size}px`,
              opacity: overlay.opacity,
              filter: (overlay.blur ?? 0) > 0 ? `blur(${overlay.blur}px)` : undefined,
              transform: `
                rotate(${overlay.rotation}deg)
                scaleX(${overlay.flipX ? -1 : 1})
                scaleY(${overlay.flipY ? -1 : 1})
              `,
              transformOrigin: 'center center',
              border: selectedOverlayId === overlay.id ? '2px solid hsl(var(--primary))' : 'none',
              borderRadius: '4px',
            }}
            onMouseDown={(e) => handleMouseDown(e, overlay.id)}
            onTouchStart={(e) => handleTouchStart(e, overlay.id)}
          >
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt="Overlay"
                className="object-contain w-full h-full"
                draggable={false}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
