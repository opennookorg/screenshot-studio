import { loadPosthog } from '@/lib/posthog';

// =============================================================================
// Core Tracking Functions
// =============================================================================

/**
 * Check if analytics should be enabled
 */
function shouldTrack(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return false;
  }

  return true;
}

/**
 * Safely track a custom event with PostHog
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, string | number | boolean>
): void {
  if (!shouldTrack()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Skipped:', eventName, eventData);
    }
    return;
  }

  loadPosthog()
    .then((posthog) => posthog.capture(eventName, eventData))
    .catch((error) => console.warn('[PostHog] Failed:', error));
}

/**
 * Identify a user in PostHog (for future auth integration)
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, string | number | boolean>
): void {
  loadPosthog()
    .then((posthog) => posthog.identify(userId, properties))
    .catch((error) => console.warn('[PostHog] Identify failed:', error));
}

/**
 * Reset user identity (call on logout)
 */
export function resetUser(): void {
  loadPosthog()
    .then((posthog) => posthog.reset())
    .catch((error) => console.warn('[PostHog] Reset failed:', error));
}

// =============================================================================
// Image Upload
// =============================================================================

export function trackImageUpload(source: 'file' | 'paste' | 'drop' | 'url', fileSize?: number): void {
  trackEvent('image_upload', {
    source,
    file_size_kb: fileSize ? Math.round(fileSize / 1024) : 0,
  });
}

// =============================================================================
// Export Events
// =============================================================================

export function trackExportStart(format: string, quality: string, scale: number): void {
  trackEvent('export_start', { format, quality, scale });
}

export function trackExportComplete(
  format: string,
  quality: string,
  scale: number,
  fileSizeKb: number,
  durationMs: number
): void {
  trackEvent('export_complete', { format, quality, scale, file_size_kb: fileSizeKb, duration_ms: durationMs });
}

export function trackExportError(format: string, error: string): void {
  trackEvent('export_error', { format, error: error.substring(0, 100) });
}

export function trackCopyToClipboard(success: boolean): void {
  trackEvent('copy_to_clipboard', { success });
}


export function trackBackgroundChange(
  type: 'gradient' | 'solid' | 'image' | 'transparent',
  value?: string
): void {
  trackEvent('background_change', { type, value: value?.substring(0, 50) || '' });
}

export function trackEffectApply(
  effectType: 'shadow' | 'border' | 'radius' | 'blur' | 'noise' | 'filter' | '3d_transform',
  value?: string | number
): void {
  trackEvent('effect_apply', { effect_type: effectType, value: String(value || '').substring(0, 50) });
}

export function trackFrameApply(frameType: string): void {
  trackEvent('frame_apply', { frame_type: frameType });
}

export function trackPresetApply(presetId: string, presetName: string): void {
  trackEvent('preset_apply', { preset_id: presetId, preset_name: presetName.substring(0, 50) });
}

export function trackOverlayAdd(overlayType: 'text' | 'image' | 'sticker'): void {
  trackEvent('overlay_add', { overlay_type: overlayType });
}

export function trackAspectRatioChange(ratio: string): void {
  trackEvent('aspect_ratio_change', { ratio });
}

export function trackAnimationClipAdd(presetId: string, presetName: string, duration: number): void {
  trackEvent('animation_clip_add', { preset_id: presetId, preset_name: presetName.substring(0, 50), duration_ms: duration });
}

// =============================================================================
// Session & Navigation
// =============================================================================

export function trackSessionStart(): void {
  trackEvent('session_start', {
    referrer: typeof document !== 'undefined' ? (document.referrer || 'direct').substring(0, 100) : 'unknown',
  });
}

export function trackEditorOpen(): void {
  trackEvent('editor_open', {});
}

export function trackCTAClick(location: string, label: string): void {
  trackEvent('cta_click', { location, label: label.substring(0, 50) });
}

// =============================================================================
// Errors
// =============================================================================

export function trackError(errorType: string, message: string): void {
  trackEvent('error', { error_type: errorType, message: message.substring(0, 200) });
}
