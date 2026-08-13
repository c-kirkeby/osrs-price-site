<script lang="ts">
  import placeholder from "$lib/assets/placeholder.svg";
  import type { HTMLImgAttributes } from "svelte/elements";

  type $$Props = HTMLImgAttributes;

  interface Props {
    class?: $$Props["class"];
    alt?: $$Props["alt"];
    [key: string]: any;
  }

  let {
    class: className = undefined,
    alt = undefined,
    ...rest
  }: Props = $props();

  const onerror = (event: Event) => {
    (event.currentTarget as HTMLImageElement).src = placeholder;
  };
</script>

<img class={className} {alt} {onerror} {...rest} />
