<script lang="ts">
  export let data;
</script>

<svelte:head>
  <title>{data.item.name}</title>
</svelte:head>

<section>
  <h1>{data.item.name}</h1>
  <code
    class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
  >
    {JSON.stringify(data.item, null, 2)}
  </code>
</section>
