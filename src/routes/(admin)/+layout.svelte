<script lang="ts">
  import { Toaster } from 'svelte-sonner';
  import AdminLayout from '$appmod/shared/widgets/AdminLayout.svelte';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  const role = $derived(data.adminRole);
  const admin = $derived(data.admin);
</script>

<AdminLayout {role} {admin}>
  {#snippet content()}
    {@render children()}
  {/snippet}
</AdminLayout>

<Toaster
  position="bottom-right"
  theme="dark"
  toastOptions={{
    style: 'background: #0F0F18; border: 1px solid rgba(255,255,255,0.08); color: #F6F6FF;'
  }}
/>
