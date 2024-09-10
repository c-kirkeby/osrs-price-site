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

  let mappings: Mapping[];
  let prices: Prices;
  let volumes: Volumes;

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let interval = () => {
    return setInterval(async () => {
      [prices, volumes] = await Promise.all([fetchPrices(), fetchVolumes()]);
      $itemsStore = $itemsStore.map((item) => {
        return {
          ...item,
          ...prices[item.id],
        };
      });
    }, 60_000);
  };

  function handleVisibilityChange() {
    if (document.hidden) {
      clearInterval(intervalId);
      intervalId = undefined;
    } else {
      intervalId = intervalId || interval();
    }
  }

  onMount(async () => {
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

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
      false,
    );
    handleVisibilityChange();
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
