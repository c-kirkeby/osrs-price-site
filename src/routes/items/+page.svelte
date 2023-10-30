<script>
  export let data;

  let pageSize = 10;
  $: totalPages = Math.ceil(data.count / pageSize);
</script>

<section>
  <h1>Items</h1>
  <ul>
    {#each data.items as item}
      <li>
        <a href="/items/{item.id}">{item.name}</a>
      </li>
    {/each}
  </ul>
  <ul>
    <li>
      {#each Array(totalPages) as _, index}
        {#if index < 10 || index > totalPages - 10}
          <a
            class="mr-1"
            href="/items?limit={pageSize}&offset={index * pageSize}"
            >{index + 1}</a
          >
        {/if}
      {/each}
    </li>
  </ul>
</section>
