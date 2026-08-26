import { browser } from "$app/environment";
import { writable, type Writable } from "svelte/store";

function createFavourites(initialFavourites: number[] | null) {
  const store: Writable<number[] | null> = writable(initialFavourites, () => {
    const subscribe = store.subscribe((value) => {
      if (browser) {
        localStorage.setItem("favourites", JSON.stringify(value));
      }
    });
    return subscribe;
  });

  const { subscribe, update, set } = store;

  return {
    subscribe,
    update,
    set,
  };
}

function getInitialFavourites() {
  let favourites = null;

  if (browser) {
    const storage = localStorage.getItem("favourites");

    if (storage) {
      favourites = JSON.parse(storage);
      console.info(
        `Restoring ${favourites.length ?? 0} favourites from localStorage.`,
      );
    }

    if (favourites === null) {
      favourites = [];
    }
  }
  return favourites;
}

const initialFavourites = getInitialFavourites();

export const favouritesStore = createFavourites(initialFavourites);
