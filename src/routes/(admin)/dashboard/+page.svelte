<script lang="ts">
  import DashboardPage from '$appmod/features/dashboard/presentation/pages/DashboardPage.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<DashboardPage
  initialDashboard={data.initialDashboard}
  initialError={data.initialError}
  initialStartDate={data.initialStartDate}
  initialEndDate={data.initialEndDate}
/>
