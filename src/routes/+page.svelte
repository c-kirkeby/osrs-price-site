<script>
  import { ChevronRight } from "lucide-svelte";
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section class="space-y-6">
  <div class="mb-4 flex items-center space-x-1 text-sm">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap">Dashboard</div>
    <ChevronRight class="h-4 w-4" />
    <div class="font-medium text-foreground">Home</div>
  </div>
  <h1 class="text-3xl font-bold tracking-tight">Home</h1>
</section>
