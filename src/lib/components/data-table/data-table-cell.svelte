<script lang="ts" generics="T">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLSpanElement> & {
    value: T;
  };

  export let value;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

{#if Array.isArray(value)}
  {#each value as subRow}
    <div class={className} {...$$restProps}>
      {subRow}
    </div>
  {/each}
{:else}
  <span class={className} {...$$restProps}>
    {value}
  </span>
{/if}
