<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type $$Props = HTMLAnchorAttributes & { value: string };

  let href: $$Props["href"] = undefined;
  interface Props {
    class?: $$Props["class"];
    value: any;
    [key: string]: any
  }

  let { class: className = undefined, value, ...rest }: Props = $props();
  
</script>

<a class={className} {href} {...rest}>
  {value}
</a>
