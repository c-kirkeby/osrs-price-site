<script lang="ts">
  import {
    ChevronRight,
    ArrowDownCircle,
    ArrowUpCircle,
    Coins,
    Info,
    FlaskRound,
    Loader2,
  } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { onMount } from "svelte";
  import { calculateTax, calculateRoi, cn } from "$lib/utils";
  import type { TimeSeriesOption } from "$lib/types/time-series";
  import PriceSeriesChart from "$lib/components/charts/price-series-chart.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import TimeStepDropdown from "./(components)/time-step-dropdown.svelte";
  import { page, navigating } from "$app/stores";
  import { getItem } from "$lib/api/item";
  import { natureRune } from "$lib/stores/alch";
  import { settings } from "$lib/stores/settings";
  import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
  import { format } from "date-fns/format";
  import { writable, type Writable } from "svelte/store";

  const formatter = new Intl.NumberFormat();
  const compactFormatter = new Intl.NumberFormat("en-AU", {
    notation: "compact",
    compactDisplay: "short",
  });

  export let data;

  let selected: Writable<TimeSeriesOption> = writable({
    value: "5m",
    label: "1 Day",
  });

  $: if ($navigating) {
    $selected = {
      value: "5m",
      label: "1 Day",
    };
  }

  $: tax = data.item.sell_price
    ? calculateTax(data.item.sell_price, data.item.id)
    : null;
  $: profit =
    data.item.sell_price && data.item.buy_price && typeof tax === "number"
      ? Math.floor(data.item.buy_price - data.item.sell_price - tax)
      : null;
  $: highAlchProfit =
    data.item.alch_high && data.item.buy_price && $natureRune.buy_price
      ? Math.floor(
          data.item.alch_high - data.item.buy_price - $natureRune.buy_price,
        )
      : null;
  $: lowAlchProfit =
    data.item.alch_low && data.item.buy_price && $natureRune.buy_price
      ? Math.floor(
          data.item.alch_low - data.item.buy_price - $natureRune.buy_price,
        )
      : null;
  $: potentialProfit =
    profit && data.item.buy_limit
      ? Math.floor(profit * data.item.buy_limit)
      : null;
  $: returnOnInvestment =
    data.item.sell_price && profit && tax
      ? calculateRoi(data.item.sell_price, profit)
      : null;

  onMount(() => {
    const priceInterval = setInterval(
      () =>
        getItem(data.item.id, [
          "id",
          "buy_price",
          "buy_price_timestamp",
          "sell_price",
          "sell_price_timestamp",
          "last_updated",
        ]).then((response) => {
          data.item = Object.assign(data.item, response);
        }),
      30_000,
    );

    return () => {
      clearInterval(priceInterval);
    };
  });

  async function fetchHistory(interval: TimeSeriesOption) {
    $selected = interval;
    const response = await fetch(
      `/items/${data.item.id}/time-series?timeStep=${interval.value}`,
    );
    data.streamed.history = response.json();
  }
</script>

<svelte:head>
  <title>{data.item.name}</title>
</svelte:head>

<section
  class={cn("flex-1 flex-col space-y-4 p-4 md:flex relative", {
    container: $settings.compact,
  })}
>
  <div class="flex items-center space-x-1 text-sm">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap">
      <a href="/items">Items</a>
    </div>
    <ChevronRight class="h-4 w-4" />
    <div class="font-medium text-foreground">
      <a href={`/items/${$page.params.id}`}>{data.item.name}</a>
    </div>
  </div>
  <div class="flex items-center justify-between">
    <h1 class="text-3xl tracking-tight">
      {#if data.item.icon}
        <img
          src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
            data.item.icon.replaceAll(" ", "_"),
          )}`}
          alt={data.item.name}
          class="object-contain inline-block mr-2"
        />
      {/if}
      <span class="font-bold">{data.item.name}</span>
      <span class="text-muted-foreground text-sm ml-2">
        (ID: {data.item.id})
      </span>
    </h1>
    <Button
      variant="outline"
      size="sm"
      class="ml-auto hidden h-8 md:flex"
      href={`https://oldschool.runescape.wiki/w/Special:Lookup?type=item&id=${$page.params.id}`}
      target="_blank"
    >
      Wiki</Button
    >
  </div>
  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
            {#if data.item.buy_price}
              {formatter.format(data.item.buy_price)}
            {:else}
              Unknown
            {/if}
          </span>
          {#if data.item.buy_limit}
            <span class="text-sm text-muted-foreground"
              >(limit: {formatter.format(data.item.buy_limit)})</span
            >
          {/if}
        </p>
        {#if data.item.buy_price_timestamp}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <p class="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(
                  new Date(data.item.buy_price_timestamp),
                  {
                    addSuffix: true,
                  },
                )}
                <Info class="inline-block h-3 w-3" />
              </p>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span
                >{format(
                  new Date(data.item.buy_price_timestamp),
                  "yyyy-MM-dd HH:mm:ss",
                )}</span
              >
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
          {#if data.item.sell_price}
            {formatter.format(data.item.sell_price)}
          {:else}
            Unknown
          {/if}
        </div>
        {#if data.item.sell_price_timestamp}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <p class="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(
                  new Date(data.item.sell_price_timestamp),
                  {
                    addSuffix: true,
                  },
                )}
                <Info class="inline-block h-3 w-3" />
              </p>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span
                >{format(
                  new Date(data.item.sell_price_timestamp),
                  "yyyy-MM-dd HH:mm:ss",
                )}</span
              >
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
            <p>
              {#if typeof profit === "number"}
                <span
                  class={cn("text-2xl font-bold", {
                    "text-red-500": profit < 0,
                    "text-green-500": profit > 0,
                  })}
                >
                  {compactFormatter.format(profit)}
                </span>
                {#if returnOnInvestment}
                  <span class=" text-sm text-muted-foreground"
                    >(ROI: {formatter.format(returnOnInvestment)}%)</span
                  >
                {/if}
                <Info class="inline-block h-4 w-4" />
              {:else}
                Unknown
              {/if}
            </p>
          </Tooltip.Trigger>
          {#if data.item.buy_price && data.item.sell_price && typeof tax === "number"}
            <Tooltip.Content>
              <span
                >{formatter.format(data.item.buy_price)} - {formatter.format(
                  data.item.sell_price,
                )} -
                {formatter.format(tax)} (tax)</span
              >
            </Tooltip.Content>
          {/if}
        </Tooltip.Root>
        <p class="text-xs text-muted-foreground">
          {#if typeof potentialProfit === "number"}
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
          {#if highAlchProfit}
            <Tooltip.Trigger>
              <p>
                <span
                  class={cn("text-2xl font-bold", {
                    "text-red-500": highAlchProfit < 0,
                    "text-green-500": highAlchProfit > 0,
                  })}
                >
                  {#if highAlchProfit > 1_000_000 || highAlchProfit < -1_000_000}
                    {compactFormatter.format(highAlchProfit)}
                  {:else}
                    {formatter.format(highAlchProfit)}
                  {/if}
                </span>
                {#if data.item.alch_high}
                  <span class=" text-sm text-muted-foreground"
                    >(high alch: {formatter.format(data.item.alch_high)})</span
                  >
                {/if}
                <Info class="inline-block h-4 w-4" />
              </p>
            </Tooltip.Trigger>
          {:else}
            <div class="text-2xl font-bold">Unknown</div>
          {/if}
          {#if data.item.alch_high && data.item.buy_price && $natureRune.buy_price}
            <Tooltip.Content>
              <span>
                {formatter.format(data.item.alch_high)} - {formatter.format(
                  data.item.buy_price,
                )} - {formatter.format($natureRune.buy_price)} (nature rune)
              </span>
            </Tooltip.Content>
          {/if}
        </Tooltip.Root>
        {#if lowAlchProfit && data.item.alch_low}
          <p>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <span class="text-xs text-muted-foreground">
                  {formatter.format(lowAlchProfit)} (low alch: {formatter.format(
                    data.item.alch_low,
                  )})
                  <Info class="inline-block h-3 w-3" />
                </span>
              </Tooltip.Trigger>
              {#if data.item.buy_price && $natureRune.buy_price}
                <Tooltip.Content>
                  <span>
                    {formatter.format(data.item.alch_low)} - {formatter.format(
                      data.item.buy_price,
                    )} - {formatter.format($natureRune.buy_price)} (nature rune)
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
      <TimeStepDropdown
        bind:selected={$selected}
        onSelectedChange={fetchHistory}
      />
    </Card.Header>
    <Card.Content class="h-[248px] w-full flex justify-center items-center">
      {#await data.streamed.history}
        <div class="text-muted-foreground flex items-center">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />Loading...
        </div>
      {:then value}
        <PriceSeriesChart data={value.data} />
      {:catch error}
        {error.message}
      {/await}
    </Card.Content>
  </Card.Root>
</section>
