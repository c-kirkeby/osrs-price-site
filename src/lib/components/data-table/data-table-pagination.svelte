<script lang="ts" generics="TData extends RowData">
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Select from "$lib/components/ui/select";
  import type { RowData, SvelteTable } from "@tanstack/svelte-table";
  import type { DataTableFeatures } from "$lib/components/data-table/features";
  import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
  } from "@lucide/svelte";

  interface Props {
    table: SvelteTable<DataTableFeatures, TData>;
  }

  let { table }: Props = $props();

  const pagination = $derived(table.atoms.pagination.get());
</script>

<div class="flex items-center justify-end px-2">
  <div class="flex items-center space-x-6 lg:space-x-8">
    <p class="text-sm font-medium">Rows per page</p>
    <Select.Root
      type="single"
      value={String(pagination.pageSize)}
      onValueChange={(v) => table.setPageSize(Number(v))}
    >
      <Select.Trigger class="w-[180px]">
        {pagination.pageSize}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="10">10</Select.Item>
        <Select.Item value="20">20</Select.Item>
        <Select.Item value="30">30</Select.Item>
        <Select.Item value="40">40</Select.Item>
        <Select.Item value="50">50</Select.Item>
      </Select.Content>
    </Select.Root>
    <div class="w-[100px] items-center justify-center text-sm font-medium">
      Page {pagination.pageIndex + 1} of
      {table.getPageCount()}
    </div>
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        onclick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <span class="sr-only">Go to first page</span>
        <ChevronsLeftIcon size={15} />
      </Button>
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        onclick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <span class="sr-only">Go to previous page</span>
        <ChevronLeftIcon size={15} />
      </Button>
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        onclick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <span class="sr-only">Go to next page</span>
        <ChevronRightIcon size={15} />
      </Button>
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        onclick={() => table.setPageIndex(table.getPageCount() - 1)}
      >
        <span class="sr-only">Go to last page</span>
        <ChevronsRightIcon size={15} />
      </Button>
    </div>
  </div>
</div>
