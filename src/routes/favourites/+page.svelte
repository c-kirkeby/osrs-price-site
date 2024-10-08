<script lang="ts">
  import { DataTable } from "$lib/components/data-table";
  import { columns } from "./columns";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/stores/settings";
  import { Loader2 } from "lucide-svelte";
  import type { InitialTableState } from "@tanstack/svelte-table";
  import { favouritesStore } from "$lib/stores/favourites";
  import { favouriteItemsStore } from "$lib/stores/favourite-items";

  let columnVisibility = {
    id: false,
    value: false,
    members: false,
    lowalch: false,
    highalch: false,
  };

  let initialState: InitialTableState = {
    pagination: {
      pageSize: 10,
    },
    sorting: [
      {
        id: "volume_x_margin",
        desc: true,
      },
    ],
    columnFilters: [
      {
        id: "is_favourite",
        value: true,
      },
    ],
  };

  let title = "Favourites";
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<section
  class={cn("flex flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: $settings.compact,
  })}
>
  <div class="flex items-center space-x-1 text-sm">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap">
      <a href="/favourites">{title}</a>
    </div>
  </div>
  <h1 class="text-3xl font-bold tracking-tight">Favourites</h1>
  {#if $favouritesStore?.length ?? 0 > 0}
    <DataTable
      {columns}
      data={$favouriteItemsStore}
      {columnVisibility}
      {initialState}
    />
  {:else if $favouriteItemsStore}
    <div
      class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
    >
      <div class="flex flex-col items-center gap-1 text-center">
        <h2 class="text-2xl font-bold tracking-tight">
          You have no favourite items
        </h2>
        <p class="text-sm text-muted-foreground">
          Add some to start tracking them.
        </p>
      </div>
    </div>
  {:else}
    <div class="flex items-center text-sm text-muted-foreground justify-center">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  {/if}
</section>
