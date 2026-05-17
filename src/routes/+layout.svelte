<script lang="ts">
  import '../app.css';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { queryClient } from '$appmod/services/cache/queryClient';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>
