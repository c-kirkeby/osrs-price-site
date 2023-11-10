<script lang="ts">
  import { DataTable } from "$lib/components/data-table";
  import { writable } from "svelte/store";
  import { createTableModel } from "./table-model";
  import { poll } from "$lib/utils";
  import { headers } from "$lib/api/headers";
  import { ChevronRight } from "lucide-svelte";

  export let data;

  const itemsStore = writable(data.items);

  poll(async () => {
    const response = await (
      await fetch("/items", {
        headers,
      })
    ).json();
    $itemsStore = response;
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
