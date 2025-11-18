const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const trackAnalyticsEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const determineUserType = (user = {}) => {
  const createdAt = user.created_at || user.createdAt;
  const lastLogin = user.last_login || user.lastLogin;
  if (!createdAt || !lastLogin) {
    return 'existing';
  }

  const created = new Date(createdAt);
  const last = new Date(lastLogin);

  if (Number.isNaN(created.getTime()) || Number.isNaN(last.getTime())) {
    return 'existing';
  }

  const diffMs = Math.abs(last - created);
  return diffMs <= WEEK_IN_MS ? 'new' : 'existing';
};
