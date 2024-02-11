<script lang="ts" generics="T">
  import type { Writable } from "svelte/store";

  import { Input } from "$lib/components/ui/input";
  import type { TableViewModel } from "svelte-headless-table";

  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import { DataTableViewOptions } from "$lib/components/data-table";
  export let tableModel: TableViewModel<T, AnyPlugins>;

  const { pluginStates } = tableModel;

  const {
    filterValue,
  }: {
    filterValue: Writable<string>;
  } = pluginStates.filter;
</script>

<div class="flex items-center justify-between">
  <div class="flex flex-1 items-center space-x-2">
    <Input
      class="h-8 w-[150px] lg:w-[250px]"
      placeholder="Search"
      type="text"
      bind:value={$filterValue}
    />
  </div>
  <DataTableViewOptions {tableModel} />
</div>
