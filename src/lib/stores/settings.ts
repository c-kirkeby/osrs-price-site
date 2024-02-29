import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";

export interface Settings {
  compact: boolean;
}

function createSettings(initialSettings: Settings) {
  const store: Writable<Settings> = writable(initialSettings, () => {
    const subscribe = store.subscribe((value) => {
      if (browser) {
        localStorage.setItem("settings", JSON.stringify(value));
      }
    });
    return subscribe;
  });

  return store;
}

const initialSettings = JSON.parse(
  browser ? localStorage.getItem("settings") ?? "{}" : "{}",
) as Partial<Settings>;

export const settings = createSettings({
  compact: true,
  ...initialSettings,
});
