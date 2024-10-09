<script lang="ts">
  import { itemsStore } from "$lib/stores/items";
  import type { Item } from "$lib/types/item";
  import { DataTable } from "$lib/components/data-table";
  import { columns } from "./columns";
  import type { InitialTableState } from "@tanstack/svelte-table";
  import { Loader2 } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/stores/settings";
  import type { Step } from "$lib/types/recipe";

  export let data;

  let recipes = data.recipes;
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

  let title = "Recipes";
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<section
  class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: $settings.compact,
  })}
>
  <h1 class="text-3xl font-bold tracking-tight">Recipes</h1>
  {#if recipeItems}
    <DataTable {columns} data={recipeItems} {initialState} />
  {:else}
    <div class="flex items-center text-sm text-muted-foreground justify-center">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  {/if}
</section>
