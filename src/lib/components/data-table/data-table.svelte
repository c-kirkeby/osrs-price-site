<script lang="ts" generics="TData extends { children: TData[] }, TValue">
  import { run } from 'svelte/legacy';

  import { cn } from "$lib/utils";

  import { writable } from "svelte/store";

  import * as Table from "$lib/components/ui/table";
  import * as DataTable from "$lib/components/data-table";
  import type {
    ColumnDef,
    TableOptions,
    VisibilityState,
    OnChangeFn,
    InitialTableState,
  } from "@tanstack/svelte-table";
  import {
    createSvelteTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    getGroupedRowModel,
  } from "@tanstack/svelte-table";


  interface Props {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    columnVisibility?: VisibilityState;
    initialState?: InitialTableState;
  }

  let {
    columns,
    data,
    columnVisibility = $bindable({}),
    initialState = {
    pagination: {
      pageSize: 10,
    },
  }
  }: Props = $props();

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
        expanded: true,
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
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.children,
    maxLeafRowFilterDepth: 0,
    paginateExpandedRows: false,
    getSubRows: (row) => row.children,
    onColumnVisibilityChange: setColumnVisibility,
    autoResetExpanded: false,
    initialState,
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

  run(() => {
    if (data) rerender();
  });

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
                    {@const SvelteComponent = flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    <SvelteComponent
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
            {@const onclick = row.getCanExpand()
              ? row.getToggleExpandedHandler()
              : null}
            <Table.Row
              on:click={onclick}
              class={cn({ "cursor-pointer": row.getCanExpand() })}
            >
              {#each row.getVisibleCells() as cell}
                <Table.Cell class="p-2 whitespace-nowrap">
                  {@const SvelteComponent_1 = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  <SvelteComponent_1
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
