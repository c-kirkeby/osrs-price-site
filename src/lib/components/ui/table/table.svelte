<script>
  let className = "";
  export { className as class };
</script>

<div class="relative w-full">
  <table class="w-full caption-bottom text-sm {className}" {...$$restProps}>
    <slot />
  </table>
</div>
