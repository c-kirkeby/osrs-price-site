<script>
  import { DataTableLink } from "$lib/components/data-table";
  import DataTableImage from "$lib/components/data-table/data-table-image.svelte";

  export let value;
</script>

<DataTableImage {src} />
<DataTableLink {value} {...$$restProps}></DataTableLink>
