<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { HeartIcon } from "lucide-svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    class: className = undefined,
    onclick,
    ...rest
  }: HTMLButtonAttributes = $props();
</script>

<Button variant="ghost" class="flex h-5 w-5 p-0" {...rest} {onclick}>
  <HeartIcon class={cn("h-5 w-5", className)} />
  <span class="sr-only">Add to favourites</span>
</Button>
