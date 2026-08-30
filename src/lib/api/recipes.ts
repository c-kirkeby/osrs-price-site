import type { Recipe } from "$lib/types/recipe";
import { RECIPES_ENDPOINT } from '$app/env/public'

export async function getRecipes(
  options: { fetcher: typeof fetch } = {
    fetcher: fetch,
  },
): Promise<Recipe[]> {
  const response = await options.fetcher(RECIPES_ENDPOINT);
  const data: Recipe[] = await response.json();

  return data;
}
