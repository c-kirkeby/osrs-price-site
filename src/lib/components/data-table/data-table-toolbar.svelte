<script lang="ts" module>
  type TData = unknown;
</script>

<script lang="ts" generics="TData">
  import type { Table } from "@tanstack/table-core";
  import { Input } from "$lib/components/ui/input";
  import DataTableViewOptions from "$lib/components/data-table/data-table-view-options.svelte";

  let { table }: { table: Table<TData> } = $props();
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-1 items-center space-x-2">
    <Input
      class="h-8 w-[150px] lg:w-[250px]"
      placeholder="Search"
      type="text"
      onkeyup={(event) =>
        table.setGlobalFilter(String(event?.currentTarget?.value))}
    />
  </div>
  <DataTableViewOptions {table} />
</div>
