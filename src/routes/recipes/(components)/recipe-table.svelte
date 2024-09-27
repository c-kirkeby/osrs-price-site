<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import type { Recipe } from "$lib/types/recipe";

  export let data: Recipe;
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head></Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each data.inputs as input}
      <Table.Row>
        <Table.Cell>{input.quantity}</Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
