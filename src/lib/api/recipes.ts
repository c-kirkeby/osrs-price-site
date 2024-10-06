import type { Recipe } from "$lib/types/recipe";

export async function getRecipes(
  options: { fetcher: typeof fetch } = {
    fetcher: fetch,
  },
): Promise<Recipe[]> {
  const endpoint = import.meta.env.VITE_RECIPES_ENDPOINT as string | undefined;
  if (!endpoint) {
    throw Error("`VITE_RECIPES_ENDPOINT` environment variable not set.");
  }
  const response = await options.fetcher(endpoint);
  const data: Recipe[] = await response.json();

  return data;
}
