<script lang="ts" generics="T">
  import type { TableViewModel } from "svelte-headless-table";

  import type { AnyPlugins } from "svelte-headless-table/lib/types/TablePlugin";

  import { DataTableViewOptions } from "$lib/components/data-table";
  export let tableModel: TableViewModel<T, AnyPlugins>;
</script>

<div class="flex-items-center-justify-between">
  <div class="flex flex-1 items-center space-x-2">
    <!-- Placeholder -->
  </div>
  <DataTableViewOptions {tableModel} />
</div>
