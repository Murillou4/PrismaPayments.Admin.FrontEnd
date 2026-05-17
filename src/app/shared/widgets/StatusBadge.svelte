<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js';

  interface Props {
    status: string;
  }
  let { status }: Props = $props();

  type BadgeVariant = {
    color: string;
    background: string;
    border: string;
    isMed?: boolean;
  };

  const STATUS_MAP: Record<string, BadgeVariant> = {
    ACTIVE:         { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
    APPROVED:       { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
    RESOLVED:       { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
    ACCEPTED:       { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
    PENDING:        { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    PENDING_REVIEW: { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    OPEN:           { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    UNDER_REVIEW:   { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    REFUND_REQUEST: { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    CHARGEBACK:     { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    SUSPENDED:      { color: '#FF3B5C', background: 'rgba(255,59,92,0.10)', border: 'rgba(255,59,92,0.20)' },
    REJECTED:       { color: '#FF3B5C', background: 'rgba(255,59,92,0.10)', border: 'rgba(255,59,92,0.20)' },
    BLOCKED:        { color: '#FF3B5C', background: 'rgba(255,59,92,0.10)', border: 'rgba(255,59,92,0.20)' },
    INACTIVE:       { color: '#9090A8', background: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' },
    UNVERIFIED:     { color: '#9090A8', background: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' },
    MED:            { color: '#FF3B5C', background: 'rgba(255,59,92,0.15)', border: 'rgba(255,59,92,0.30)', isMed: true },
    // Payment statuses
    CREATED:    { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    PAID:       { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
    FAILED:     { color: '#FF3B5C', background: 'rgba(255,59,92,0.10)', border: 'rgba(255,59,92,0.20)' },
    CANCELLED:  { color: '#9090A8', background: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' },
    REFUNDED:   { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    EXPIRED:    { color: '#9090A8', background: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' },
    // Withdrawal statuses
    REQUESTED:  { color: '#FFB300', background: 'rgba(255,179,0,0.10)', border: 'rgba(255,179,0,0.20)' },
    PROCESSING: { color: '#01FAFB', background: 'rgba(1,250,251,0.10)', border: 'rgba(1,250,251,0.20)' },
    COMPLETED:  { color: '#00E676', background: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.20)' },
  };

  const DEFAULT_VARIANT: BadgeVariant = {
    color: '#9090A8',
    background: 'rgba(144,144,168,0.10)',
    border: 'rgba(144,144,168,0.20)'
  };

  const variant = $derived(STATUS_MAP[status?.toUpperCase()] ?? DEFAULT_VARIANT);
</script>

<Badge
  variant="outline"
  class={variant.isMed ? 'status-badge status-badge--med' : 'status-badge'}
  style="color: {variant.color}; background: {variant.background}; border-color: {variant.border};"
>
  {status}
</Badge>

<style>
  :global(.status-badge) {
    border-radius: 9999px;
    padding: 4px 10px;
    font-size: 0.75rem;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.5;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  /* MED: pulsing left border — time-sensitive indicator */
  :global(.status-badge--med) {
    border-left-width: 2px;
    animation: med-pulse 1.5s ease-in-out infinite;
  }

  @keyframes -global-med-pulse {
    0%, 100% { border-left-color: rgba(255,59,92,0.30); }
    50%       { border-left-color: rgba(255,59,92,0.80); }
  }
</style>
