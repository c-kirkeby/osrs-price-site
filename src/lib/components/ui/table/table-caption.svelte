<script>
  let className = "";
  export { className as class };
</script>

<caption
  class="mt-4 text-sm text-muted-foreground {className}"
  {...$$restProps}
>
  <slot />
</caption>
