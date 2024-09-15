<script lang="ts">
  import {
    ChevronRight,
    ArrowDownCircle,
    ArrowUpCircle,
    Info,
    Loader2,
    ExternalLinkIcon,
    TrendingUp,
    TrendingDown,
  } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import {
    calculateTax,
    calculateRoi,
    cn,
    getNumberFormatter,
    getSignedPrefix,
    styleSignedNumberCell,
    getCompactNumberFormatter,
  } from "$lib/utils";
  import type {
    TimeSeries,
    TimeSeriesOption,
    TimeStep,
  } from "$lib/types/time-series";
  import PriceSeriesChart from "$lib/components/charts/price-series-chart.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import TimeStepDropdown from "./(components)/time-step-dropdown.svelte";
  import { page, navigating } from "$app/stores";
  import { alchPrice } from "$lib/stores/alch";
  import { settings } from "$lib/stores/settings";
  import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
  import { format } from "date-fns/format";
  import { currentItem } from "$lib/stores/current-item";
  import { getTimeSeries } from "$lib/api/time-series";
  import { invalidate } from "$app/navigation";

  $: formatter = getNumberFormatter();
  $: compactFormatter = getCompactNumberFormatter();

  export let data;

  let selected = {
    value: "5m",
    label: "1 Day",
  };

  let history: TimeSeries[] | undefined;

  $: if ($navigating) {
    selected = {
      value: "5m",
      label: "1 Day",
    };
  }

  $: tax = $currentItem?.low
    ? calculateTax($currentItem.low, $currentItem.id)
    : null;
  $: margin =
    $currentItem?.low && $currentItem.high && typeof tax === "number"
      ? Math.floor($currentItem.high - $currentItem.low - tax)
      : null;
  $: highAlchProfit =
    $currentItem?.highalch && $currentItem.high && $alchPrice?.high
      ? Math.floor($currentItem.highalch - $currentItem.high - $alchPrice?.high)
      : null;
  $: lowAlchProfit =
    $currentItem?.lowalch && $currentItem.high && $alchPrice?.high
      ? Math.floor($currentItem.lowalch - $currentItem.high - $alchPrice?.high)
      : null;
  $: potentialProfit =
    margin && $currentItem?.limit
      ? Math.floor(margin * $currentItem.limit)
      : null;
  $: returnOnInvestment =
    $currentItem?.low && margin && tax
      ? calculateRoi($currentItem.low, margin)
      : null;
  $: buyPriceChangePeriodStart =
    history?.find((entry) => entry.avgHighPrice)?.avgHighPrice || 0;
  $: buyPriceChangePeriodEnd =
    history?.findLast((entry) => entry.avgHighPrice)?.avgHighPrice || 0;
  $: buyPriceChange = buyPriceChangePeriodEnd - buyPriceChangePeriodStart;
  $: buyPriceChangePercentage =
    buyPriceChangePeriodStart > 0
      ? (buyPriceChange / buyPriceChangePeriodStart) * 100
      : 0;
  $: sellPriceChangePeriodStart =
    history?.find((entry) => entry.avgLowPrice)?.avgLowPrice || 0;
  $: sellPriceChangePeriodEnd =
    history?.findLast((entry) => entry.avgLowPrice)?.avgLowPrice || 0;
  $: sellPriceChange = sellPriceChangePeriodEnd - sellPriceChangePeriodStart;
  $: sellPriceChangePercentage =
    sellPriceChangePeriodStart > 0
      ? (sellPriceChange / sellPriceChangePeriodStart) * 100
      : 0;

  $: {
    const fetchPrice = async () => {
      history = await data.streamed.history.then((streamed) => streamed.data);
    };
    fetchPrice();
  }

  async function fetchHistory(interval: TimeSeriesOption) {
    selected = interval;
    invalidate(`/items/${$page.params.id}`);
    const timeSeries = getTimeSeries(
      $page.params.id,
      selected.value as TimeStep,
    );
    data.streamed.history = timeSeries;
    history = await timeSeries.then((series) => series.data);
  }
</script>

<svelte:head>
  <title>{$currentItem?.name}</title>
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
    <ChevronRight class="size-4" />
    <div class="font-medium text-foreground truncate">
      <a href={`/items/${$page.params.id}`}>{$currentItem?.name}</a>
    </div>
  </div>
  <div class="flex items-center justify-between">
    <h1 class="md:text-3xl text-xl tracking-tight">
      {#if $currentItem?.icon}
        <img
          src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(
            $currentItem.icon.replaceAll(" ", "_"),
          )}`}
          alt={$currentItem.name}
          class="object-contain inline-block mr-2"
        />
      {/if}
      <span class="font-bold">{$currentItem?.name}</span>
      <span class="text-muted-foreground text-sm ml-2">
        (ID: {$currentItem?.id})
      </span>
    </h1>
    <Button
      variant="outline"
      size="sm"
      class="ml-auto hidden h-8 md:flex gap-1"
      href={`https://oldschool.runescape.wiki/w/Special:Lookup?type=item&id=${$page.params.id}`}
      target="_blank"
    >
      <ExternalLinkIcon class="size-3.5" />
      Wiki
    </Button>
  </div>

  <div
    class="grid flex-1 items-start gap-4 sm:py-0 md:grid-cols-3 xl:grid-cols-3"
  >
    <div class="grid auto-rows-max items-start gap-4 md:col-span-2">
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card.Root class="sm:col-span-2">
          <Card.Header
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <Card.Title class="text-sm font-medium">Buy Price</Card.Title>
            <ArrowDownCircle />
          </Card.Header>
          <Card.Content>
            <p>
              <span class="text-2xl font-bold">
                {#if $currentItem?.high}
                  {formatter.format($currentItem.high)}
                {:else}
                  Unknown
                {/if}
              </span>
              {#if buyPriceChange !== 0}
                <span
                  class={cn("text-sm", styleSignedNumberCell(buyPriceChange))}
                  >{getSignedPrefix(buyPriceChange)}{compactFormatter.format(
                    buyPriceChange,
                  )}
                  {#if buyPriceChange > 0}
                    <TrendingUp class="inline size-4" />
                  {:else if buyPriceChange < 0}
                    <TrendingDown class="inline size-4" />
                  {/if}
                  {formatter.format(
                    buyPriceChangePercentage,
                  )}{buyPriceChangePercentage !== 0 ? "%" : ""}</span
                >
              {/if}
            </p>
            {#if $currentItem?.highTime}
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <p class="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(
                      new Date($currentItem.highTime * 1000),
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
                      new Date($currentItem.highTime * 1000),
                      "yyyy-MM-dd HH:mm:ss",
                    )}</span
                  >
                </Tooltip.Content>
              </Tooltip.Root>
            {/if}
          </Card.Content>
        </Card.Root>
        <Card.Root class="sm:col-span-2">
          <Card.Header
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <Card.Title class="text-sm font-medium">Sell Price</Card.Title>
            <ArrowUpCircle />
          </Card.Header>
          <Card.Content>
            <p>
              <span class="text-2xl font-bold">
                {#if $currentItem?.low}
                  {formatter.format($currentItem.low)}
                {:else}
                  Unknown
                {/if}
              </span>
              {#if sellPriceChange !== 0}
                <span
                  class={cn("text-sm", styleSignedNumberCell(sellPriceChange))}
                  >{getSignedPrefix(sellPriceChange)}{compactFormatter.format(
                    sellPriceChange,
                  )}
                  {#if sellPriceChange > 0}
                    <TrendingUp class="inline size-4" />
                  {:else if sellPriceChange < 0}
                    <TrendingDown class="inline size-4" />
                  {/if}
                  {formatter.format(
                    sellPriceChangePercentage,
                  )}{sellPriceChangePercentage !== 0 ? "%" : ""}</span
                >
              {/if}
            </p>
            {#if $currentItem?.lowTime}
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <p class="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(
                      new Date($currentItem.lowTime * 1000),
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
                      new Date($currentItem.lowTime * 1000),
                      "yyyy-MM-dd HH:mm:ss",
                    )}</span
                  >
                </Tooltip.Content>
              </Tooltip.Root>
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
              <Loader2 class="mr-2 size-4 animate-spin" />Loading...
            </div>
          {:then { data }}
            <PriceSeriesChart {data} />
          {:catch error}
            {error.message}
          {/await}
        </Card.Content>
      </Card.Root>
    </div>
    <div>
      <Card.Root class="overflow-hidden">
        <Card.Content class="p-6 text-sm">
          <div class="grid gap-3">
            <div class="font-semibold">Item Details</div>
            <ul class="grid gap-3">
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Margin</span>
                {#if typeof margin !== "undefined" && margin !== null}
                  <span class={styleSignedNumberCell(margin)}
                    >{getSignedPrefix(margin)}{formatter.format(margin)}</span
                  >
                {:else}
                  -
                {/if}
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Limit</span>
                <span>
                  {#if $currentItem?.limit}
                    {formatter.format($currentItem.limit)}
                  {:else}
                    -
                  {/if}</span
                >
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Potential Profit</span>

                <span class={styleSignedNumberCell(margin)}>
                  {#if potentialProfit}
                    {getSignedPrefix(potentialProfit)}{formatter.format(
                      potentialProfit,
                    )}
                  {:else}
                    -
                  {/if}</span
                >
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">ROI</span>
                <span class={styleSignedNumberCell(margin)}>
                  {#if returnOnInvestment}
                    {getSignedPrefix(returnOnInvestment)}{formatter
                      .format(returnOnInvestment)
                      ?.concat("%")}
                  {:else}
                    -
                  {/if}
                </span>
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Tax</span>
                {#if tax}
                  {formatter.format(tax)}
                {:else}
                  -
                {/if}
              </li>
            </ul>
            <Separator class="my-2" />
            <ul class="grid gap-3">
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">High Alch Profit</span>
                <span class={styleSignedNumberCell(highAlchProfit)}>
                  {#if highAlchProfit}
                    {getSignedPrefix(highAlchProfit)}{formatter.format(
                      highAlchProfit,
                    )}
                  {:else}
                    -
                  {/if}
                </span>
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">High Alch</span>
                <span>
                  {#if $currentItem?.highalch}
                    {formatter.format($currentItem.highalch)}
                  {:else}
                    -
                  {/if}
                </span>
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Low Alch Profit</span>
                <span class={styleSignedNumberCell(lowAlchProfit)}>
                  {#if lowAlchProfit}
                    {getSignedPrefix(lowAlchProfit)}{formatter.format(
                      lowAlchProfit,
                    )}
                  {:else}
                    -
                  {/if}
                </span>
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Low Alch</span>
                <span>
                  {#if $currentItem?.lowalch}
                    {formatter.format($currentItem.lowalch)}
                  {:else}
                    -
                  {/if}
                </span>
              </li>
            </ul>
            <Separator class="my-2" />
            <ul class="grid gap-3">
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Members</span>
                <span>
                  {#if typeof $currentItem?.members !== "undefined"}
                    {$currentItem.members ? "Yes" : "No"}
                  {:else}
                    -
                  {/if}
                </span>
              </li>
            </ul>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</section>
