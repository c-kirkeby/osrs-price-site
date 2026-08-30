import { browser } from "$app/env";

function createFavourites(initialFavourites: number[]) {
  let favourites = $state(initialFavourites);

  return {
    get favourites() {
      return favourites;
    },
    set favourites(newFavourites: number[]) {
      favourites = newFavourites;

      if (browser) {
        localStorage.setItem("favourites", JSON.stringify(newFavourites));
      }
    },
  };
}

function getInitialFavourites() {
  let favourites: number[] | null = null;

  if (browser) {
    const storage = localStorage.getItem("favourites");

    if (storage) {
      favourites = JSON.parse(storage);
      console.info(
        `Restoring ${favourites?.length ?? 0} favourites from localStorage.`,
      );
    }
  }

  return favourites ?? [];
}

export const favouritesState = createFavourites(getInitialFavourites());
