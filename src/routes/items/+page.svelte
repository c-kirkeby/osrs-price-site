<script lang="ts">
  import { DataTable } from "$lib/components/data-table";
  import { itemsStore } from "$lib/stores/items";
  import { columns } from "./columns";
  import { cn, poll } from "$lib/utils";
  import { settings } from "$lib/stores/settings";
  import { headers } from "$lib/api/headers";
  import type { Item } from "$lib/db/schema";
  import { onMount } from "svelte";
  import { Loader2 } from "lucide-svelte";

  export let data;

  onMount(async () => {
    $itemsStore = await data.items;
  });

  poll(async () => {
    const response: Partial<Item[]> = await (
      await fetch(
        "/items?" +
          new URLSearchParams(
            [
              "id",
              "buy_price",
              "buy_price_timestamp",
              "sell_price",
              "sell_price_timestamp",
              "last_updated",
            ].map((field) => ["fields[items]", field]),
          ).toString(),
        {
          headers,
        },
      )
    ).json();
    $itemsStore = $itemsStore.map((item: Item) =>
      Object.assign(
        item,
        response.find((price) => price?.id === item.id),
      ),
    );
  }, 60_000);
</script>

<svelte:head>
  <title>Items</title>
</svelte:head>

<section
  class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: $settings.compact,
  })}
>
  <div class="flex items-center space-x-1 text-sm">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap">
      <a href="/items">Items</a>
    </div>
  </div>
  <h1 class="text-3xl font-bold tracking-tight">Items</h1>
  {#await data.items}
    <div class="flex items-center text-sm text-muted-foreground justify-center">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  {:then items}
    <DataTable {columns} data={items} />
  {/await}
</section>
