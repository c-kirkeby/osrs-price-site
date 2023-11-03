<script>
  import DataTable from "./data-table.svelte";

  export let data;
</script>

<section class="space-y-6">
  <h1 class="text-3xl font-bold">Items</h1>
  <DataTable data={data.items} />
</section>
