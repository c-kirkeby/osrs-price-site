<script lang="ts">
  import { DataTable } from "$lib/components/data-table";
  import { createTableModel } from "./table-model";

  export let data;

  $: tableModel = createTableModel(data.items);
</script>

<section class="space-y-6">
  <h1 class="text-3xl font-bold">Items</h1>
  <DataTable {tableModel} />
</section>
