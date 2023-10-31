<script>
  let className = "";
  export { className as class };
</script>

<td
  class="p-4 align-middle [&:has([role=checkbpx])]:pr-0 {className}"
  {...$$restProps}
>
  <slot />
</td>
