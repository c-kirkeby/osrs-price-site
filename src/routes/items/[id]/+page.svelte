<script lang="ts">
  import {
    ChevronRight,
    ArrowDownCircle,
    ArrowUpCircle,
    Info,
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
    getCompactNumberFormatter,
    getSignedPrefix,
    styleSignedNumberCell,
  } from "$lib/utils";
  import type { TimeSeriesOption } from "$lib/types/time-series";
  import PriceTimeSeriesChart from "$lib/components/charts/price-time-series-chart.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import TimeStepDropdown from "./(components)/time-step-dropdown.svelte";
  import { page } from "$app/stores";
  import { alchPrice } from "$lib/stores/alch";
  import { settings } from "$lib/stores/settings";
  import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
  import { format } from "date-fns/format";
  import { currentItem } from "$lib/stores/current-item";
  import { isLoading } from "$lib/stores/loading";
  import { goto, invalidate } from "$app/navigation";
  import VolumeTimeSeriesChart from "$lib/components/charts/volume-time-series-chart.svelte";
  import { onMount } from "svelte";
  import { config } from "$lib/config";

  $: formatter = getNumberFormatter();
  $: compactFormatter = getCompactNumberFormatter();

  export let data;

  let options = [
    { value: "5m", label: "Last day" },
    { value: "1h", label: "Last 7 days" },
    { value: "6h", label: "Last 30 days" },
    { value: "24h", label: "Last 12 months" },
  ];

  $: selected = options.find(
    (option) => option.value === $page.url.searchParams.get("time_step"),
  ) ?? {
    value: "5m",
    label: "Last day",
  };

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let interval = () => {
    return setInterval(async () => {
      invalidate("items:history");
    }, config.pollMs);
  };

  function handleVisibilityChange() {
    if (document.hidden) {
      clearInterval(intervalId);
      intervalId = undefined;
    } else {
      intervalId = intervalId || interval();
    }
  }

  onMount(() => {
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
      false,
    );
    handleVisibilityChange();
  });

  $: history = data.history.data;

  $: totalVolume = data.history.data.reduce(
    (sum, tick) => (sum += tick.lowPriceVolume + tick.highPriceVolume),
    0,
  );

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

  async function fetchHistory(option: TimeSeriesOption) {
    selected = option;
    goto(`/items/${$page.params.id}?time_step=${option.value}`);
  }
</script>

<svelte:head>
  <title>{$currentItem?.name}</title>
</svelte:head>

{#if !$isLoading}
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
                    class={cn(
                      "text-sm",
                      styleSignedNumberCell(sellPriceChange),
                    )}
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
            class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row"
          >
            <div class="grid flex-1 gap-1 text-center sm:text-left">
              <Card.Title>Item History</Card.Title>
              <Card.Description>
                Showing the price history for the last {selected.label.toLowerCase()}.
              </Card.Description>
            </div>
            <TimeStepDropdown bind:selected onSelectedChange={fetchHistory} />
          </Card.Header>
          <Card.Content class="px-2 pt-4 sm:px-6 sm:pt-6">
            {#if history.length === 0}
              <div
                class=" h-[400px] flex flex-col items-center justify-center gap-1 text-center"
              >
                <h3 class="text-2xl font-bold tracking-tight">
                  No data for the selected period
                </h3>
                <p class="text-sm text-muted-foreground">
                  Try selecting a different period.
                </p>
              </div>
            {:else}
              <PriceTimeSeriesChart data={history} />
              <VolumeTimeSeriesChart data={history} />
            {/if}
          </Card.Content>
        </Card.Root>
      </div>
      <div>
        <Card.Root class="overflow-hidden">
          <Card.Content class="p-6 text-sm">
            <div class="grid gap-3">
              <div class="font-semibold">Item Details</div>
              <ul class="grid gap-3">
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >Margin
                        <Info class="inline-block h-3 w-3" />
                      </span>
                    </Tooltip.Trigger>
                    {#if typeof margin !== "undefined" && margin !== null}
                      <span class={styleSignedNumberCell(margin)}
                        >{getSignedPrefix(margin)}{formatter.format(
                          margin,
                        )}</span
                      >
                    {:else}
                      -
                    {/if}
                  </li>
                  <Tooltip.Content>
                    {#if $currentItem?.high && $currentItem.low && typeof tax === "number"}
                      <span
                        >{formatter.format($currentItem.high)} - {formatter.format(
                          $currentItem.low,
                        )} -
                        {formatter.format(tax)} (tax)</span
                      >
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
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
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground">
                        Potential Profit

                        <Info class="inline-block size-3" />
                      </span>
                    </Tooltip.Trigger>

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
                  <Tooltip.Content>
                    {#if margin && $currentItem?.limit}
                      <span>
                        {formatter.format(margin)} × {formatter.format(
                          $currentItem.limit,
                        )}
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >ROI <Info class="inline-block h-3 w-3" /></span
                      >
                    </Tooltip.Trigger>
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
                  <Tooltip.Content>
                    {#if $currentItem?.low && margin && tax}
                      <span>
                        {formatter.format(margin)} / {formatter.format(
                          $currentItem?.low,
                        )} × 100
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >Tax

                        <Info class="inline-block size-3" />
                      </span>
                    </Tooltip.Trigger>
                    {#if tax}
                      {formatter.format(tax)}
                    {:else}
                      -
                    {/if}
                  </li>
                  <Tooltip.Content>
                    {#if $currentItem?.low}
                      <span>
                        1% of {formatter.format($currentItem.low)}
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
              </ul>
              <Separator class="my-2" />
              <ul class="grid gap-3">
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >High Alch Profit
                        <Info class="inline-block h-3 w-3" />
                      </span>
                    </Tooltip.Trigger>
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
                  <Tooltip.Content>
                    {#if $currentItem?.highalch && $currentItem.high && $alchPrice?.high}
                      <span>
                        {formatter.format($currentItem.highalch)} - {formatter.format(
                          $currentItem.high,
                        )} - {formatter.format($alchPrice.high)} (alch price)
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
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
                <Tooltip.Root>
                  <li class="flex items-center justify-between">
                    <Tooltip.Trigger>
                      <span class="text-muted-foreground"
                        >Low Alch Profit
                        <Info class="inline-block h-3 w-3" />
                      </span>
                    </Tooltip.Trigger>
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
                  <Tooltip.Content>
                    {#if $currentItem?.lowalch && $currentItem.high && $alchPrice?.high}
                      <span>
                        {formatter.format($currentItem.lowalch)} - {formatter.format(
                          $currentItem.high,
                        )} - {formatter.format($alchPrice.high)} (alch price)
                      </span>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
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
                  <span class="text-muted-foreground"
                    >Volume ({selected.label})</span
                  >
                  <span>
                    {#if typeof totalVolume !== "undefined"}
                      {formatter.format(totalVolume)}
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
{/if}
