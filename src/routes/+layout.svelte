<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import SiteHeader from "$lib/components/site-header.svelte";
  import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";
  import "./layout.css";
  import * as Tooltip from "@/components/ui/tooltip";

  let { children } = $props();
</script>

<TailwindIndicator />
<ModeWatcher />
<div class="min-h-screen bg-background antialiased font-sans">
  <div class="relative flex min-h-screen flex-col">
    <div class="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Tooltip.Provider>
        {@render children?.()}
      </Tooltip.Provider>
    </div>
  </div>
</div>
