<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Select from "$lib/components/ui/select";
  import type { Item } from "$lib/db/schema";
  import type { TableViewModel } from "svelte-headless-table";
  import type { AnyPlugins } from "svelte-headless-table/lib/types/TablePlugin";
  import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
  } from "lucide-svelte";

  export let tableModel: TableViewModel<Item, AnyPlugins>;

  const { pluginStates, rows } = tableModel;

  const { hasNextPage, hasPreviousPage, pageSize, pageCount, pageIndex } =
    pluginStates.page;
</script>

<div class="flex items-center justify-end px-2">
  <div class="flex items-center space-x-6 lg:space-x-8">
    <p class="text-sm font-medium">Rows per page</p>
    <Select.Root
      onSelectedChange={(selected) => pageSize.set(Number(selected?.value))}
      selected={{ value: 10, label: "10" }}
    >
      <Select.Trigger class="w-[180px]">
        <Select.Value placeholder="Select page size" />
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
      Page {$pageIndex} of {$pageCount}
    </div>
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        on:click={() => ($pageIndex = 0)}
        disabled={!$hasPreviousPage}
      >
        <span class="sr-only">Go to first page</span>
        <ChevronsLeftIcon size={15} />
      </Button>
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        on:click={() => ($pageIndex = $pageIndex - 1)}
        disabled={!$hasPreviousPage}
      >
        <span class="sr-only">Go to previous page</span>
        <ChevronLeftIcon size={15} />
      </Button>
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        on:click={() => ($pageIndex = $pageIndex + 1)}
        disabled={!$hasNextPage}
      >
        <span class="sr-only">Go to next page</span>
        <ChevronRightIcon size={15} />
      </Button>
      <Button
        variant="outline"
        class="hidden h-8 w-8 p-0 lg:flex"
        on:click={() => ($pageIndex = Math.ceil($rows.length / $pageSize) - 1)}
        disabled={!$hasNextPage}
      >
        <span class="sr-only">Go to last page</span>
        <ChevronsRightIcon size={15} />
      </Button>
    </div>
  </div>
</div>
