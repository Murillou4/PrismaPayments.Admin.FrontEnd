<script lang="ts">
  import type { ChartData } from 'chart.js';

  // Stub do <Bar> de svelte5-chartjs: chart.js exige canvas/getContext, que o
  // jsdom nao fornece. Em vez de montar o grafico real, expomos os dados que
  // chegaram via props para o teste poder asserir que o grafico recebeu series.
  let { data }: { data: ChartData<'bar'> } = $props();

  const datasets = $derived(data?.datasets ?? []);
  const total = $derived(
    datasets.reduce((sum, ds) => sum + (ds.data as number[]).reduce((a, b) => a + (b ?? 0), 0), 0)
  );
</script>

<div data-testid="bar-chart" data-datasets={datasets.length} data-total={total}></div>
