import { reactive } from 'vue';

// Selected tab per tab group, shared by every <Tabs> with the same group id and
// remembered across pages in localStorage (when available).
const STORAGE_KEY = 'docs-selected-tabs';

export const selectedTabs = reactive<Record<string, string>>({});

export function loadSelectedTabs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (saved && typeof saved === 'object')
      Object.assign(selectedTabs, saved);
  } catch {
    // Storage unavailable or corrupt: fall back to defaults.
  }
}

export function selectTab(groupId: string, value: string) {
  selectedTabs[groupId] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTabs));
  } catch {
    // Storage unavailable: the selection still applies for this visit.
  }
}
