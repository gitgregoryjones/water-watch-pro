import { useState } from 'react';

export function useFeatureFlags() {
  const [loading] = useState(false);
  const isActive = (name) => ['dark-mode', 'https://blinkprojects.atlassian.net/browse/DP-197'].includes(name);
  return { isActive, loading };
}
