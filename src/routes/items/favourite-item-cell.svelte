<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { HeartIcon } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils";

  let {
    variant = "ghost",
    class: className,
    ...restProps
  }: ComponentProps<typeof Button> = $props();
</script>

<Button {variant} {...restProps}>
  <HeartIcon class={cn("size-5", className)} />
  <span class="sr-only">Add to favourites</span>
</Button>
