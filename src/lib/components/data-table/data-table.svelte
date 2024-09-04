<script lang="ts" generics="TData, TValue">
  import { writable, type Writable } from "svelte/store";

  import * as Table from "$lib/components/ui/table";
  import * as DataTable from "$lib/components/data-table";
  import type {
    ColumnDef,
    TableOptions,
    VisibilityState,
    OnChangeFn,
  } from "@tanstack/svelte-table";
  import {
    createSvelteTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
  } from "@tanstack/svelte-table";

  export let columns: ColumnDef<TData, TValue>[];
  export let data: TData[];

  let columnVisibility: VisibilityState = {};

  const setColumnVisibility: OnChangeFn<VisibilityState> = (updater) => {
    if (updater instanceof Function) {
      columnVisibility = updater(columnVisibility);
    } else {
      columnVisibility = updater;
    }
    options.update((old) => ({
      ...old,
      state: {
        ...old.state,
        columnVisibility,
      },
    }));
  };

  const options = writable<TableOptions<TData>>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      columnVisibility,
    },
    enableGlobalFilter: true,
  });

  const rerender = () => {
    options.update((options) => ({
      ...options,
      data,
    }));
  };

  $: if (data) rerender();

  const table = createSvelteTable(options);
</script>

<div class="space-y-4">
  <DataTable.Toolbar {table} />
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each $table.getHeaderGroups() as headerGroup}
          <Table.Row>
            {#each headerGroup.headers as header}
              {#if !header.isPlaceholder}
                <Table.Head class="whitespace-nowrap">
                  <DataTable.ColumnHeader column={header.column}>
                    <svelte:component
                      this={flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    />
                  </DataTable.ColumnHeader>
                </Table.Head>
              {/if}
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#if $table.getRowModel().rows.length}
          {#each $table.getRowModel().rows as row}
            <Table.Row>
              {#each row.getVisibleCells() as cell}
                <Table.Cell class="p-2 whitespace-nowrap">
                  <svelte:component
                    this={flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  />
                </Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
  <DataTable.Pagination {table} />
</div>
