import { useState } from 'react';

export function useFeatureFlags() {
  const [loading] = useState(false);
  const isActive = (name) => name === 'dark-mode';
  return { isActive, loading };
}
