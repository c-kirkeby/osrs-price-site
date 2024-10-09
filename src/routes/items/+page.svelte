<script lang="ts">
  import { DataTable } from "$lib/components/data-table";
  import { columns } from "./columns";
  import { cn } from "$lib/utils";
  import { settings } from "$lib/stores/settings";
  import { Loader2 } from "lucide-svelte";
  import type { InitialTableState } from "@tanstack/svelte-table";
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
  };

  let title = "Items";
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<section
  class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: $settings.compact,
  })}
>
  <h1 class="text-3xl font-bold tracking-tight">Items</h1>
  {#if $favouriteItemsStore}
    <DataTable
      {columns}
      data={$favouriteItemsStore}
      {columnVisibility}
      {initialState}
    />
  {:else}
    <div class="flex items-center text-sm text-muted-foreground justify-center">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  {/if}
</section>
