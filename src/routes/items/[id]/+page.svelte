<script lang="ts">
  export let data;
</script>

<section>
  <h1>{data.item.name}</h1>
  <ul>
    {#each Object.entries(data.item) as [key, value]}
      <li>{key}: {value}</li>
    {/each}
  </ul>
</section>
