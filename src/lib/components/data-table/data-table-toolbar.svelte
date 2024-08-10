<script lang="ts" generics="TData">
  import type { Readable } from "svelte/store";

  import type { Table } from "@tanstack/svelte-table";

  import { Input } from "$lib/components/ui/input";

  import { DataTableViewOptions } from "$lib/components/data-table";
  export let table: Readable<Table<TData>>;
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-1 items-center space-x-2">
    <Input
      class="h-8 w-[150px] lg:w-[250px]"
      placeholder="Search"
      type="text"
      on:keyup={(event) => $table.setGlobalFilter(String(event?.target?.value))}
    />
  </div>
  <DataTableViewOptions {table} />
</div>
