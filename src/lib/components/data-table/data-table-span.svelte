<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLSpanElement>;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<span class={className} {...$$restProps}>
  <slot />
</span>
