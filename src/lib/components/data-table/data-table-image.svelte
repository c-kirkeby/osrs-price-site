<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";

  type $$Props = HTMLImgAttributes;

  let className: $$Props["class"] = undefined;
  export { className as class };
  export let alt: $$Props["alt"] = undefined;
</script>

<img class={className} {alt} {...$$restProps} />
