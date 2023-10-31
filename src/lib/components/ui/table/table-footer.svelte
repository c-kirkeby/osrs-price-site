<script>
  let className = "";
  export { className as class };
</script>

<tfoot
  class="bg-primary font-medium text-primary-foreground {className}"
  {...$$restProps}
>
  <slot />
</tfoot>
