<script lang="ts">
  import { itemsStore } from "$lib/stores/items";
  import type { Item } from "$lib/types/item";
  import {
    DataTable,
    type InitialTableState,
  } from "$lib/components/data-table";
  import { columns } from "./columns";
  import { Loader2 } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/stores/settings.svelte";
  import type { RecipeRow, RecipeStepRow, Step } from "$lib/types/recipe";

  let { data } = $props();

  function getItem(
    id: number,
    items: Item[] | null,
  ): Partial<
    Pick<Item, "id" | "name" | "high" | "low" | "highTime" | "lowTime">
  > {
    if (id === 995) {
      return {
        id: 995,
        name: "Coins",
        high: 1,
        low: 1,
      };
    }
    const item = items?.find((i) => i.id === id);
    return item
      ? {
          id: item.id,
          name: item.name,
          high: item.high,
          low: item.low,
          highTime: item.highTime,
          lowTime: item.lowTime,
        }
      : {};
  }

  function stepsToItemSteps(
    steps: Step[],
    type: "input" | "output",
    items: Item[] | null,
  ): RecipeStepRow[] {
    return steps.map((step) => ({
      id: step.id,
      quantity: step.quantity,
      type,
      ...getItem(step.id, items),
    }));
  }

  let initialState: InitialTableState = {
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: [
      {
        id: "profit",
        desc: true,
      },
    ],
  };

  const recipeItems: RecipeRow[] = $derived(
    data.recipes
      ?.filter(
        (recipe) => recipe.inputs.length > 0 && recipe.outputs.length > 0,
      )
      .map((recipe) => {
        return {
          name: recipe.name,
          children: stepsToItemSteps(
            recipe.inputs,
            "input",
            $itemsStore,
          ).concat(stepsToItemSteps(recipe.outputs, "output", $itemsStore)),
        };
      }) ?? [],
  );

  let title = "Recipes";
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<section
  class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: settings.current.compact,
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
