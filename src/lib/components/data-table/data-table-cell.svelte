<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLSpanElement> & {
    value: string;
  };

  export let value;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<span class={className} {...$$restProps}>
  {value}
</span>
