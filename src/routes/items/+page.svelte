<script lang="ts">
  import {
    DataTable,
    type InitialTableState,
  } from "$lib/components/data-table";
  import { columns } from "./columns";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/state/settings.svelte";
  import { Loader } from "@lucide/svelte";
  import { favouriteItemsState } from "$lib/state/favourite-items.svelte";

  let columnVisibility = {
    id: false,
    value: false,
    members: false,
    lowalch: false,
    highalch: false,
  };

  let initialState: InitialTableState = {
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: [
      {
        id: "volume_x_margin",
        desc: true,
      },
    ],
  };

  let title = "Items";
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<section
  class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: settings.current.compact,
  })}
>
  <h1 class="text-3xl font-bold tracking-tight">Items</h1>
  {#if favouriteItemsState.items}
    <DataTable
      {columns}
      data={favouriteItemsState.items}
      {columnVisibility}
      {initialState}
    />
  {:else}
    <div class="flex items-center text-sm text-muted-foreground justify-center">
      <Loader class="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  {/if}
</section>
