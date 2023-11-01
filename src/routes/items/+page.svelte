<script>
  import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
  } from "$lib/components/ui/table";

  export let data;

  let pageSize = 10;
  $: totalPages = Math.ceil(data.count / pageSize);
</script>

<section>
  <h1 class="text-4xl lg:text-5xl mt-3 tracking-tight text-slate-900">Items</h1>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Buy Price</TableHead>
        <TableHead>Sell Price</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each data.items as item}
        <TableRow>
          <TableCell>
            <a href="/items/{item.id}">{item.name}</a>
          </TableCell>
          <TableCell>{item.buy_price}</TableCell>
          <TableCell>{item.sell_price}</TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
  <ul>
    <li>
      {#each Array(totalPages) as _, index}
        {#if index < 10 || index > totalPages - 10}
          <a
            class="mr-1"
            href="/items?page[limit]={pageSize}&page[offset]={index * pageSize}"
            >{index + 1}</a
          >
        {/if}
      {/each}
    </li>
  </ul>
</section>
