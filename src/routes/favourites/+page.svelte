<script lang="ts">
  import { eq, isUndefined, not, useLiveQuery } from "@tanstack/svelte-db";
  import {
    DataTable,
    type InitialTableState,
  } from "$lib/components/data-table";
  import { columns } from "./columns";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/state/settings.svelte";
  import { Loader } from "@lucide/svelte";
  import { itemsCollection, favouritesCollection } from "$lib/state/db";

  const favouritesQuery = useLiveQuery((q) =>
    q.from({ favourite: favouritesCollection }),
  );

  const favouriteItemsQuery = useLiveQuery((q) =>
    q
      .from({ item: itemsCollection })
      .leftJoin({ favourite: favouritesCollection }, ({ item, favourite }) =>
        eq(item.id, favourite.id),
      )
      .select(({ item, favourite }) => ({
        ...item,
        is_favourite: not(isUndefined(favourite.id)),
      })),
  );

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
    container: settings.current.compact,
  })}
>
  <h1 class="text-3xl font-bold tracking-tight">Favourites</h1>
  {#if !favouritesQuery.isReady || !favouriteItemsQuery.isReady}
    <div class="flex items-center text-sm text-muted-foreground justify-center">
      <Loader class="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  {:else if favouritesQuery.data.length > 0}
    <DataTable
      {columns}
      data={favouriteItemsQuery.data}
      {columnVisibility}
      {initialState}
    />
  {:else}
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
  {/if}
</section>
