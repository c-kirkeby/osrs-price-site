import { getRecipes } from "$lib/api/recipes.js";
import type { Recipe } from "$lib/types/recipe";

export async function load({ depends, fetch }): Promise<{ recipes: Recipe[] }> {
  depends("app:recipes");
  return {
    recipes: await getRecipes({ fetcher: fetch }),
  };
}
