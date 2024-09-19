<script lang="ts">
  import placeholder from "$lib/assets/placeholder.svg";
  import type { HTMLImgAttributes } from "svelte/elements";

  type $$Props = HTMLImgAttributes;

  let className: $$Props["class"] = undefined;
  export { className as class };
  export let alt: $$Props["alt"] = undefined;

  const onerror = (event) => (event.target.src = placeholder);
</script>

<img class={className} {alt} on:error={onerror} {...$$restProps} />
