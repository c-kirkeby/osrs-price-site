<script lang="ts">
  import { DataTable } from "$lib/components/data-table";
  import { writable } from "svelte/store";
  import { createTableModel } from "./table-model";
  import { poll } from "$lib/utils";
  import { headers } from "$lib/api/headers";

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

<section class="space-y-6">
  <h1 class="text-3xl font-bold">Items</h1>
  <DataTable {tableModel} />
</section>
