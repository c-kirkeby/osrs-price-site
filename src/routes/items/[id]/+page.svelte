<script lang="ts">
  import {
    ChevronRight,
    ArrowDownCircle,
    ArrowUpCircle,
    Coins,
    Info,
    FlaskRound,
  } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { formatDistance } from "date-fns";
  import { onMount } from "svelte";
  import { headers } from "$lib/api/headers";
  import type { Item } from "$lib/db/schema";
  import { writable } from "svelte/store";
  import { cn } from "$lib/utils";
  import PriceSeriesChart from "$lib/components/charts/price-series-chart.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { page } from "$app/stores";

  const formatter = new Intl.NumberFormat();

  export let data;

  let itemStore = writable(data.item);

  $: tax = $itemStore.buy_price
    ? Math.round($itemStore.buy_price * 0.01)
    : null;
  $: profit =
    $itemStore.sell_price && $itemStore.buy_price && tax
      ? Math.round($itemStore.sell_price - $itemStore.buy_price - tax)
      : null;
  $: highAlchProfit =
    $itemStore.alch_high && $itemStore.buy_price
      ? Math.round($itemStore.alch_high - $itemStore.buy_price)
      : null;
  $: lowAlchProfit =
    $itemStore.alch_low && $itemStore.buy_price
      ? Math.round($itemStore.alch_low - $itemStore.buy_price)
      : null;
  $: potentialProfit =
    $itemStore.sell_price && $itemStore.buy_price && tax && $itemStore.buy_limit
      ? Math.round(
          ($itemStore.sell_price - $itemStore.buy_price - tax) *
            $itemStore.buy_limit,
        )
      : null;

  let now = new Date();

  onMount(() => {
    const clockInterval = setInterval(() => {
      now = new Date();
    }, 1000);

    async function getPrices(id: number) {
      const response: Item[] = await (
        await fetch(
          `/items/${id}?` +
            new URLSearchParams(
              [
                "id",
                "buy_price",
                "buy_price_timestamp",
                "sell_price",
                "sell_price_timestamp",
                "last_updated",
              ].map((field) => ["fields[items]", field]),
            ).toString(),
          {
            headers,
          },
        )
      ).json();
      $itemStore = Object.assign($itemStore, response[0]);
    }
    const priceInterval = setInterval(
      async () => await getPrices(data.item.id),
      30_000,
    );

    return () => {
      clearInterval(clockInterval);
      clearInterval(priceInterval);
    };
  });
</script>

<svelte:head>
  <title>{data.item.name}</title>
</svelte:head>

<section class="space-y-6">
  <div class="mb-4 flex items-center space-x-1 text-sm">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap">
      <a href="/items">Items</a>
    </div>
    <ChevronRight class="h-4 w-4" />
    <div class="font-medium text-foreground">
      <a href={`/items/${$page.params.id}`}>{data.item.name}</a>
    </div>
  </div>
  <h1 class="text-3xl font-bold tracking-tight">
    {#if $itemStore.icon}
      <img
        src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
          $itemStore.icon.replaceAll(" ", "_"),
        )}`}
        alt={$itemStore.name}
        class="object-contain inline-block mr-2"
      />
    {/if}
    {$itemStore.name}
  </h1>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Buy Price</Card.Title>
        <ArrowDownCircle />
      </Card.Header>
      <Card.Content>
        <p>
          <span class="text-2xl font-bold">
            {#if $itemStore.buy_price}
              {formatter.format($itemStore.buy_price)}
            {:else}
              Unknown
            {/if}
          </span>
          {#if $itemStore.buy_limit}
            <span class=" text-sm text-muted-foreground"
              >(limit: {formatter.format($itemStore.buy_limit)})</span
            >
          {/if}
        </p>
        {#if $itemStore.buy_price_timestamp}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <p class="text-xs text-muted-foreground">
                {formatDistance(new Date($itemStore.buy_price_timestamp), now, {
                  addSuffix: true,
                })}
                <Info class="inline-block h-3 w-3" />
              </p>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span>{new Date($itemStore.buy_price_timestamp)}</span>
            </Tooltip.Content>
          </Tooltip.Root>
        {/if}
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Sell Price</Card.Title>
        <ArrowUpCircle />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">
          {#if $itemStore.sell_price}
            {formatter.format($itemStore.sell_price)}
          {:else}
            Unknown
          {/if}
        </div>
        {#if $itemStore.sell_price_timestamp}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <p class="text-xs text-muted-foreground">
                {formatDistance(
                  new Date($itemStore.sell_price_timestamp),
                  now,
                  {
                    addSuffix: true,
                  },
                )}
                <Info class="inline-block h-3 w-3" />
              </p>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span>{new Date($itemStore.sell_price_timestamp)}</span>
            </Tooltip.Content>
          </Tooltip.Root>
        {/if}
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium"
          >Margin & Potential Profit</Card.Title
        >
        <Coins />
      </Card.Header>
      <Card.Content>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div class="text-2xl font-bold">
              {#if profit}
                <span
                  class={cn({
                    "text-red-500": profit < 0,
                    "text-green-500": profit > 0,
                  })}
                >
                  {formatter.format(profit)}
                </span>
                <Info class="inline-block h-4 w-4" />
              {:else}
                Unknown
              {/if}
            </div>
          </Tooltip.Trigger>
          {#if $itemStore.buy_price && $itemStore.sell_price}
            <Tooltip.Content>
              <span
                >{formatter.format($itemStore.sell_price)} - {formatter.format(
                  $itemStore.buy_price,
                )} -
                {formatter.format(Math.round($itemStore.sell_price * 0.01))} (tax)</span
              >
            </Tooltip.Content>
          {/if}
        </Tooltip.Root>
        <p class="text-xs text-muted-foreground">
          {#if potentialProfit}
            {formatter.format(potentialProfit)}
          {:else}
            Unknown
          {/if}
        </p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Alch Profit</Card.Title>
        <FlaskRound />
      </Card.Header>
      <Card.Content>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div class="text-2xl font-bold">
              {#if highAlchProfit}
                <span
                  class={cn({
                    "text-red-500": highAlchProfit < 0,
                    "text-green-500": highAlchProfit > 0,
                  })}
                >
                  {formatter.format(highAlchProfit)}
                </span>
                <Info class="inline-block h-4 w-4" />
              {:else}
                Unknown
              {/if}
            </div>
          </Tooltip.Trigger>
          {#if $itemStore.alch_high}
            <Tooltip.Content>
              <span>
                High Alch: {formatter.format($itemStore.alch_high)}
              </span>
            </Tooltip.Content>
          {/if}
        </Tooltip.Root>
        {#if lowAlchProfit}
          <p>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <span class="text-xs text-muted-foreground">
                  {formatter.format(lowAlchProfit)}
                  <Info class="inline-block h-3 w-3" />
                </span>
              </Tooltip.Trigger>
              {#if $itemStore.alch_low}
                <Tooltip.Content>
                  <span>
                    Low Alch: {formatter.format($itemStore.alch_low)}
                  </span>
                </Tooltip.Content>
              {/if}
            </Tooltip.Root>
          </p>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
  <Card.Root>
    <Card.Header
      class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <Card.Title class="text-base font-normal">Item History</Card.Title>
      <Button
        variant="outline"
        role="combobox"
        class="w-[200px] justify-between"
      >
        5 Mins
      </Button>
    </Card.Header>
    <Card.Content>
      {#await data.streamed.history}
        Loading...
      {:then value}
        <PriceSeriesChart data={value.data} />
      {:catch error}
        {error.message}
      {/await}
    </Card.Content>
  </Card.Root>
</section>
