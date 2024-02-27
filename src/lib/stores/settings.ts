import { writable } from "svelte/store";

export interface Settings {
  compact: boolean;
}

function createSettings(initialSettings: Settings) {
  const { subscribe, update } = writable(initialSettings);

  return {
    subscribe,
    update,
  };
}

export const settings = createSettings({
  compact: true,
});
