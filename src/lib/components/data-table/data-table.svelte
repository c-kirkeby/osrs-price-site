<script lang="ts" generics="TData extends RowData & { children?: TData[] }">
  import { cn } from "$lib/utils";

  import * as Table from "$lib/components/ui/table";
  import * as DataTable from "$lib/components/data-table";
  import type {
    ColumnDef,
    ColumnVisibilityState,
    OnChangeFn,
    RowData,
  } from "@tanstack/svelte-table";
  import { createTable, FlexRender } from "@tanstack/svelte-table";
  import {
    features,
    type DataTableFeatures,
    type InitialTableState,
  } from "$lib/components/data-table/features";

  interface Props {
    columns: ColumnDef<DataTableFeatures, TData>[];
    data: TData[];
    columnVisibility?: ColumnVisibilityState;
    initialState?: InitialTableState;
  }

  let {
    columns,
    data,
    columnVisibility = $bindable({}),
    initialState = {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  }: Props = $props();

  // initialState is intentionally captured once at table creation.
  // svelte-ignore state_referenced_locally
  const initial = initialState;

  const onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState> = (
    updater,
  ) => {
    columnVisibility =
      updater instanceof Function ? updater(columnVisibility) : updater;
  };

  const table = createTable({
    features,
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
    getRowCanExpand: (row) => !!row.original.children,
    maxLeafRowFilterDepth: 0,
    paginateExpandedRows: false,
    getSubRows: (row) => row.children,
    autoResetExpanded: false,
    onColumnVisibilityChange,
    initialState: initial,
    state: {
      get columnVisibility() {
        return columnVisibility;
      },
    },
    enableGlobalFilter: true,
  });
</script>

<div class="space-y-4">
  <DataTable.Toolbar {table} />
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup}
          <Table.Row>
            {#each headerGroup.headers as header}
              {#if !header.isPlaceholder}
                <Table.Head class="whitespace-nowrap">
                  <DataTable.ColumnHeader column={header.column}>
                    <FlexRender {header} />
                  </DataTable.ColumnHeader>
                </Table.Head>
              {/if}
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#if table.getRowModel().rows.length}
          {#each table.getRowModel().rows as row}
            {@const onclick = row.getCanExpand()
              ? row.getToggleExpandedHandler()
              : null}
            <Table.Row
              {onclick}
              class={cn({ "cursor-pointer": row.getCanExpand() })}
            >
              {#each row.getVisibleCells() as cell}
                <Table.Cell class="p-2 whitespace-nowrap">
                  <FlexRender {cell} />
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
