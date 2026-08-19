<script lang="ts" generics="TData extends Record<string, any>">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { SlidersHorizontalIcon } from "@lucide/svelte";
  import type { SvelteTable } from "@tanstack/svelte-table";
  import type { DataTableFeatures } from "$lib/components/data-table/features";

  interface Props {
    table: SvelteTable<DataTableFeatures, TData>;
  }

  let { table }: Props = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="outline" size="sm" class="ml-auto hidden h-8 md:flex">
      <SlidersHorizontalIcon class="mr-2 h-4 w-4" /> Columns
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
    {#each table
      .getAllColumns()
      .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide()) as column}
      <DropdownMenu.CheckboxItem
        checked={column.getIsVisible()}
        onclick={() => column.toggleVisibility()}
      >
        {column.columnDef.header}
      </DropdownMenu.CheckboxItem>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
