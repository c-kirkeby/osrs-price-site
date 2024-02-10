<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import { poll } from "$lib/utils";
  import "../app.postcss";
  import { getItem } from "$lib/api/item";
  import { natureRune, natureRuneItemId } from "$lib/stores/alch";
  import SiteHeader from "$lib/components/site-header.svelte";

  export let data;

  $natureRune = data.natureRunePrice;

  poll(async () => {
    try {
      const response = await getItem(natureRuneItemId, [
        "id",
        "buy_price",
        "buy_price_timestamp",
        "last_updated",
      ]);
      if (response) {
        $natureRune = response;
      }
    } catch (error) {
      console.error("Failed to fetch nature rune price", error);
    }
  }, 30_000);
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
