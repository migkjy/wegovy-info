// GA4 event helpers - safe to use server-side (no-op) and client-side
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Named event helpers for KPI tracking
export const analytics = {
  newsletterSignup: (source: string) =>
    trackEvent('newsletter_signup', { event_category: 'engagement', source }),

  communityPost: (drug: string) =>
    trackEvent('community_post', { event_category: 'engagement', drug }),

  clinicView: (clinicId: string, region: string) =>
    trackEvent('clinic_view', { event_category: 'interest', clinic_id: clinicId, region }),

  insuranceView: () =>
    trackEvent('insurance_page_view', { event_category: 'interest' }),

  sharePost: (method: string, slug: string) =>
    trackEvent('share', { event_category: 'engagement', method, content_id: slug }),
}
