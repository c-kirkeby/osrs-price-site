<script lang="ts">
  import { itemsStore } from "$lib/stores/items";
  import type { Item } from "$lib/types/item";
  import { DataTable } from "$lib/components/data-table";
  import { columns } from "./columns";
  import type { InitialTableState } from "@tanstack/svelte-table";
  import { Loader2 } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/stores/settings";
  import { onMount } from "svelte";
  import type { Recipe, Step } from "$lib/types/recipe";

  export let data;

  let recipes: Recipe[] = [];
  let recipeItems = [];

  function getItem(id: number, items: Item[] | null) {
    if (id === 995) {
      return {
        id: 995,
        name: "Coins",
        high: 1,
        low: 1,
      } as Pick<Item, "id" | "name" | "high" | "low">;
    }
    return items?.find((item) => item.id === id);
  }

  function stepsToItemSteps(
    steps: Step[],
    type: "input" | "output",
    items: Item[] | null,
  ) {
    return steps.map((step) => ({
      quantity: step.quantity,
      type,
      ...getItem(step.id, items),
    }));
  }

  let initialState: InitialTableState = {
    pagination: {
      pageSize: 10,
    },
    sorting: [
      {
        id: "profit",
        desc: true,
      },
    ],
  };

  $: recipeItems = recipes
    ?.filter((recipe) => recipe.inputs.length > 0 && recipe.outputs.length > 0)
    .map((recipe) => {
      const out = {
        name: recipe.name,
        children: stepsToItemSteps(recipe.inputs, "input", $itemsStore).concat(
          stepsToItemSteps(recipe.outputs, "output", $itemsStore),
        ),
      };
      return out;
    });

  onMount(async () => {
    recipes = await data.streamed.recipes;
  });
</script>

<svelte:head>
  <title>Recipes</title>
</svelte:head>

<section
  class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: $settings.compact,
  })}
>
  <div class="flex items-center space-x-1 text-sm">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap">
      <a href="/">Recipes</a>
    </div>
  </div>
  <h1 class="text-3xl font-bold tracking-tight">Recipes</h1>
  {#await data.streamed.recipes}
    <div class="flex items-center text-sm text-muted-foreground justify-center">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  {:then}
    {#if recipeItems}
      <DataTable {columns} data={recipeItems} {initialState} />
    {/if}
  {/await}
</section>
