<script lang="ts" generics="TData">
  import type { Readable } from "svelte/store";

  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { SlidersHorizontalIcon } from "lucide-svelte";
  import type { Table } from "@tanstack/svelte-table";

  export let table: Readable<Table<TData>>;
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button
      variant="outline"
      size="sm"
      class="ml-auto hidden h-8 md:flex"
      builders={[builder]}
    >
      <SlidersHorizontalIcon class="mr-2 h-4 w-4" /> Columns
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
    {#each $table
      .getAllColumns()
      .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide()) as column}
      <DropdownMenu.CheckboxItem
        checked={column.getIsVisible()}
        on:click={() => column.toggleVisibility()}
      >
        {column.columnDef.header}
      </DropdownMenu.CheckboxItem>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
