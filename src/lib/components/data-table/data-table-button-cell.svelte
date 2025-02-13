<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import type { ButtonEventHandler } from "bits-ui";
  import { HeartIcon } from "lucide-svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLButtonElement> & {
    onclick: ButtonEventHandler<MouseEvent>;
  };

  

  interface Props {
    class?: $$Props["class"];
    onclick: any;
    [key: string]: any
  }

  let { class: className = undefined, onclick, ...rest }: Props = $props();
</script>

<Button
  variant="ghost"
  class="flex h-5 w-5 p-0"
  {...rest}
  on:click={onclick}
  on:keydown
>
  <HeartIcon class={cn("h-5 w-5", className)} />
  <span class="sr-only">Add to favourites</span>
</Button>
