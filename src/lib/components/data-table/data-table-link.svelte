<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type $$Props = HTMLAnchorAttributes & { value: string };

  let className: $$Props["class"] = undefined;
  let href: $$Props["href"] = undefined;
  export let value;
  export { className as class };
</script>

<a class={className} {href} {...$$restProps}>
  {value}
</a>
