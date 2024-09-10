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
  import { calculateTax, calculateRoi, cn } from "$lib/utils";
  import type { TimeSeriesOption, TimeStep } from "$lib/types/time-series";
  import PriceSeriesChart from "$lib/components/charts/price-series-chart.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import TimeStepDropdown from "./(components)/time-step-dropdown.svelte";
  import { page, navigating } from "$app/stores";
  import { alchPrice } from "$lib/stores/alch";
  import { settings } from "$lib/stores/settings";
  import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
  import { format } from "date-fns/format";
  import { itemsStore } from "$lib/stores/items";
  import { getTimeSeries } from "$lib/api/time-series";

  const formatter = new Intl.NumberFormat();
  const compactFormatter = new Intl.NumberFormat("en-AU", {
    notation: "compact",
    compactDisplay: "short",
  });

  export let data;

  $: item = $itemsStore.find((item) => `${item.id}` === $page.params.id);

  let selected = {
    value: "5m",
    label: "1 Day",
  };

  $: if ($navigating) {
    selected = {
      value: "5m",
      label: "1 Day",
    };
  }

  $: tax = item?.low ? calculateTax(item.low, item.id) : null;
  $: profit =
    item?.low && item.high && typeof tax === "number"
      ? Math.floor(item.high - item.low - tax)
      : null;
  $: highAlchProfit =
    item?.highalch && item.high && $alchPrice?.high
      ? Math.floor(item.highalch - item.high - $alchPrice?.high)
      : null;
  $: lowAlchProfit =
    item?.lowalch && item.high && $alchPrice?.high
      ? Math.floor(item.lowalch - item.high - $alchPrice?.high)
      : null;
  $: potentialProfit =
    profit && item?.limit ? Math.floor(profit * item.limit) : null;
  $: returnOnInvestment =
    item?.low && profit && tax ? calculateRoi(item.low, profit) : null;

  async function fetchHistory(interval: TimeSeriesOption) {
    selected = interval;
    data.streamed.history = getTimeSeries(
      $page.params.id,
      selected.value as TimeStep,
    );
  }
</script>

<svelte:head>
  <title>{item?.name}</title>
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
      <a href={`/items/${$page.params.id}`}>{item?.name}</a>
    </div>
  </div>
  <div class="flex items-center justify-between">
    <h1 class="text-3xl tracking-tight">
      {#if item?.icon}
        <img
          src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
            item.icon.replaceAll(" ", "_"),
          )}`}
          alt={item.name}
          class="object-contain inline-block mr-2"
        />
      {/if}
      <span class="font-bold">{item?.name}</span>
      <span class="text-muted-foreground text-sm ml-2">
        (ID: {item?.id})
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
            {#if item?.high}
              {formatter.format(item.high)}
            {:else}
              Unknown
            {/if}
          </span>
          {#if item?.limit}
            <span class="text-sm text-muted-foreground"
              >(limit: {formatter.format(item.limit)})</span
            >
          {/if}
        </p>
        {#if item?.highTime}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <p class="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(new Date(item.highTime * 1000), {
                  addSuffix: true,
                })}
                <Info class="inline-block h-3 w-3" />
              </p>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span
                >{format(
                  new Date(item.highTime * 1000),
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
          {#if item?.low}
            {formatter.format(item.low)}
          {:else}
            Unknown
          {/if}
        </div>
        {#if item?.lowTime}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <p class="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(new Date(item.lowTime * 1000), {
                  addSuffix: true,
                })}
                <Info class="inline-block h-3 w-3" />
              </p>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span
                >{format(
                  new Date(item.lowTime * 1000),
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
          {#if item?.high && item.low && typeof tax === "number"}
            <Tooltip.Content>
              <span
                >{formatter.format(item.high)} - {formatter.format(item.low)} -
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
                {#if item?.highalch}
                  <span class=" text-sm text-muted-foreground"
                    >(high alch: {formatter.format(item.highalch)})</span
                  >
                {/if}
                <Info class="inline-block h-4 w-4" />
              </p>
            </Tooltip.Trigger>
          {:else}
            <div class="text-2xl font-bold">Unknown</div>
          {/if}
          {#if item?.highalch && item.high && $alchPrice?.high}
            <Tooltip.Content>
              <span>
                {formatter.format(item.highalch)} - {formatter.format(
                  item.high,
                )} - {formatter.format($alchPrice.high)} (nature rune)
              </span>
            </Tooltip.Content>
          {/if}
        </Tooltip.Root>
        {#if lowAlchProfit && item?.lowalch}
          <p>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <span class="text-xs text-muted-foreground">
                  {formatter.format(lowAlchProfit)} (low alch: {formatter.format(
                    item.lowalch,
                  )})
                  <Info class="inline-block h-3 w-3" />
                </span>
              </Tooltip.Trigger>
              {#if item.high && $alchPrice?.high && item.highalch && $alchPrice.low}
                <Tooltip.Content>
                  <span>
                    {formatter.format(item?.highalch)} - {formatter.format(
                      item?.high,
                    )} - {formatter.format($alchPrice?.low)} (nature rune)
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
      <TimeStepDropdown bind:selected onSelectedChange={fetchHistory} />
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
