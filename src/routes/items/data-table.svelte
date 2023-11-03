<script lang="ts">
  import type { Item } from "$lib/db/schema";
  import {
    createRender,
    createTable,
    Render,
    Subscribe,
  } from "svelte-headless-table";
  import { addPagination } from "svelte-headless-table/plugins";
  import { readable } from "svelte/store";
  import * as Table from "$lib/components/ui/table";
  import formatDistance from "date-fns/formatDistance";
  import { Button } from "$lib/components/ui/button";
  import DataTableLink from "./data-table-link.svelte";

  export let data: Item[];

  const formatter = new Intl.NumberFormat();

  const table = createTable(readable(data), {
    page: addPagination(),
  });
  const columns = table.createColumns([
    table.column({
      accessor: "name",
      header: "Name",
      cell: ({ row, value }) =>
        createRender(DataTableLink, {
          href: `/items/${row.id}`,
        }).slot(value ?? ""),
    }),
    table.column({
      accessor: "is_members",
      header: "Members?",
    }),
    table.column({
      accessor: "alch_low",
      header: "Alch Low",
    }),
    table.column({
      accessor: "alch_high",
      header: "Alch High",
    }),
    table.column({
      accessor: (row) => row.buy_limit && formatter.format(row.buy_limit),
      header: "Limit",
    }),
    table.column({
      accessor: (row) => row.value && formatter.format(row.value),
      header: "Value",
    }),
    table.column({
      accessor: "buy_price",
      header: "Buy Price",
    }),
    table.column({
      accessor: (row) => {
        if (row.buy_price_timestamp) {
          return formatDistance(new Date(row.buy_price_timestamp), new Date(), {
            addSuffix: true,
          }).replace("about", "");
        }
        return "";
      },
      header: "Last Bought",
    }),
    table.column({
      accessor: (row) => row.sell_price && formatter.format(row.sell_price),
      header: "Sell Price",
    }),
    table.column({
      accessor: (row) => {
        if (row.buy_price_timestamp) {
          return formatDistance(new Date(row.buy_price_timestamp), new Date(), {
            addSuffix: true,
          }).replace("about", "");
        }
        return "";
      },
      header: "Last Sold",
    }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns);

  const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
</script>

<div>
  <div class="rounded-md">
    <Table.Root {...$tableAttrs}>
      <Table.Header>
        {#each $headerRows as headerRow}
          <Subscribe rowAttrs={headerRow.attrs()}>
            <Table.Row>
              {#each headerRow.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                  <Table.Head {...attrs}>
                    <Render of={cell.render()} />
                  </Table.Head>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      </Table.Header>
      <Table.Body {...$tableBodyAttrs}>
        {#each $pageRows as row (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <Table.Row {...rowAttrs}>
              {#each row.cells as cell}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <Table.Cell {...attrs}>
                    <Render of={cell.render()} />
                  </Table.Cell>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  <div class="flex items-center justify-end space-x-2 py-4">
    <Button
      variant="outline"
      size="sm"
      on:click={() => ($pageIndex = $pageIndex - 1)}
      disabled={!$hasPreviousPage}
    >
      Previous</Button
    >
    <Button
      variant="outline"
      size="sm"
      on:click={() => ($pageIndex = $pageIndex + 1)}
      disabled={!$hasNextPage}
    >
      Next</Button
    >
  </div>
</div>
