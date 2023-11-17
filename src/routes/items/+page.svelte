<script lang="ts">
  import { DataTable } from "$lib/components/data-table";
  import { writable } from "svelte/store";
  import { createTableModel } from "./table-model";
  import { poll } from "$lib/utils";
  import { headers } from "$lib/api/headers";
  import { ChevronRight } from "lucide-svelte";
  import type { Item } from "$lib/db/schema";

  export let data;

  const itemsStore = writable(data.items);

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
    $itemsStore = $itemsStore.map((item) =>
      Object.assign(
        item,
        response.find((price) => price?.id === item.id),
      ),
    );
  }, 60_000);

  const tableModel = createTableModel(itemsStore);
</script>

<svelte:head>
  <title>Items</title>
</svelte:head>

<section class="space-y-6">
  <div class="mb-4 flex items-center space-x-1 text-sm">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap">Dashboard</div>
    <ChevronRight class="h-4 w-4" />
    <div class="font-medium text-foreground">Items</div>
  </div>
  <h1 class="text-3xl font-bold tracking-tight">Items</h1>
  <DataTable {tableModel} />
</section>
