import recipes from "$lib/data/recipes.json";
import type { Recipe } from "$lib/types/recipe";

async function getRecipes(): Promise<Recipe[]> {
  return new Promise((resolve) => resolve(recipes as Recipe[]));
}

export async function load({ depends, setHeaders }) {
  setHeaders({
    "cache-control": "max-age=86400",
  });
  depends("app:recipes");
  return {
    streamed: {
      recipes: getRecipes(),
    },
  };
}
