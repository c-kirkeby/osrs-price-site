<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import "../app.postcss";
  import SiteHeader from "$lib/components/site-header.svelte";
  import { itemsStore } from "$lib/stores/items";
  import {
    fetchPrices,
    fetchVolumes,
    type Mapping,
    type Prices,
    type Volumes,
  } from "$lib/api/items";
  import { onMount } from "svelte";
  import type { Item } from "$lib/types/item";

  export let data;

  onMount(async () => {
    let mappings: Mapping[];
    let prices: Prices;
    let volumes: Volumes;

    [mappings, prices, volumes] = await Promise.all([
      data.streamed.mappings,
      data.streamed.prices,
      data.streamed.volumes,
    ]);
    $itemsStore = mappings.map((mapping) => {
      return {
        ...mapping,
        ...prices[mapping.id],
        volume: volumes[mapping.id],
      } satisfies Item;
    });

    const interval = setInterval(async () => {
      [prices, volumes] = await Promise.all([fetchPrices(), fetchVolumes()]);

      $itemsStore = $itemsStore.map((item) => {
        return {
          ...item,
          ...prices[item.id],
        };
      });

      return () => clearInterval(interval);
    }, 60_000);
  });
</script>

<ModeWatcher />
<div class="min-h-screen bg-background antialiased font-sans">
  <div class="relative flex min-h-screen flex-col">
    <div class="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div class="flex-1">
        <slot />
      </div>
    </div>
  </div>
</div>
