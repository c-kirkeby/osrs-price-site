<script lang="ts" generics="T">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLSpanElement> & {
    value: T;
  };


  interface Props {
    value: any;
    class?: $$Props["class"];
    [key: string]: any
  }

  let { value, class: className = undefined, ...rest }: Props = $props();
  
</script>

{#if Array.isArray(value)}
  {#each value as subRow}
    <div class={className} {...rest}>
      {subRow}
    </div>
  {/each}
{:else}
  <span class={className} {...rest}>
    {value}
  </span>
{/if}
