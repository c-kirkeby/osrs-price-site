<script lang="ts">
  import { itemsStore } from "$lib/stores/items";
  import type { Item } from "$lib/types/item";
  import { DataTable } from "$lib/components/data-table";
  import { columns } from "./columns";
  import type { InitialTableState } from "@tanstack/svelte-table";
  import { Loader2 } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/stores/settings";

  export let data;

  function getItem(id: number) {
    if (id === 995) {
      return {
        id: 995,
        name: "Coins",
        high: 1,
        low: 1,
      } as Pick<Item, "id" | "name" | "high" | "low">;
    }
    return $itemsStore?.find((item) => item.id === id);
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
  {:then recipes}
    {@const data = recipes
      ?.filter(
        (recipe) => recipe.inputs.length > 0 && recipe.outputs.length > 0,
      )
      .map((recipe) => {
        return {
          name: recipe.name,
          inputs: recipe.inputs.map(({ id, quantity }) => {
            const { high, low, name } = getItem(id);
            return {
              id,
              quantity,
              high,
              low,
              name,
            };
          }),
          outputs: recipe.outputs.map(({ id, quantity }) => {
            const { high, low, name } = getItem(id);
            return {
              id,
              quantity,
              high,
              low,
              name,
            };
          }),
        };
      })}
    <DataTable {columns} {data} {initialState} />
  {/await}
</section>
