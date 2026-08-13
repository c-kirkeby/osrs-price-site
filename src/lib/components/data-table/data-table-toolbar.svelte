<script lang="ts" generics="TData extends RowData">
  import type { RowData, SvelteTable } from "@tanstack/svelte-table";
  import type { DataTableFeatures } from "$lib/components/data-table/features";

  import { Input } from "$lib/components/ui/input";

  import { DataTableViewOptions } from "$lib/components/data-table";
  interface Props {
    table: SvelteTable<DataTableFeatures, TData>;
  }

  let { table }: Props = $props();
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-1 items-center space-x-2">
    <Input
      class="h-8 w-37.5 lg:w-62.5"
      placeholder="Search"
      type="text"
      onkeyup={(event) =>
        table.setGlobalFilter(String(event?.currentTarget?.value))}
    />
  </div>
  <DataTableViewOptions {table} />
</div>

