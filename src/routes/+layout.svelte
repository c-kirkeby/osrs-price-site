<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import "../app.postcss";
  import SiteHeader from "$lib/components/site-header.svelte";
  import { onMount } from "svelte";
  import { itemsStore } from "$lib/stores/items";
  import { fetchPrices, fetchVolumes } from "$lib/api/items";
  import { isLoading } from "$lib/stores/loading";
  import { config } from "$lib/config";
  import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";

  export let data;

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let interval = () => {
    return setInterval(async () => {
      let [prices, volumes] = await Promise.all([
        fetchPrices(),
        fetchVolumes(),
      ]);
      if (!$itemsStore) {
        return;
      }
      $itemsStore = $itemsStore.map((item) => {
        return {
          ...item,
          ...prices[item.id],
          volume: volumes[item.id],
        };
      });
    }, config.pollMs);
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
    $itemsStore = await data.streamed.items;
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
      false,
    );
    handleVisibilityChange();
    $isLoading = false;
  });
</script>

<TailwindIndicator />
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
