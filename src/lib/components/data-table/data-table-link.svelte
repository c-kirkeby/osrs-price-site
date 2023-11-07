<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type $$Props = HTMLAnchorAttributes;

  let className: $$Props["class"] = undefined;
  let href: $$Props["href"] = undefined;
  export { className as class };
</script>

<a class={className} {href} {...$$restProps}>
  <slot />
</a>
