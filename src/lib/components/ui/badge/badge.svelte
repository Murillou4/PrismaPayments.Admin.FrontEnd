<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "h-5 gap-1 rounded-sm border border-transparent px-2 py-0.5 text-xs font-medium uppercase tracking-wide transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:ring-[3px] [&>svg]:pointer-events-none",
		variants: {
			variant: {
				default: "bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/30 [a]:hover:bg-brand-magenta/20",
				secondary: "bg-secondary/20 text-secondary-foreground border border-secondary/40 [a]:hover:bg-secondary/30",
				destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 text-destructive border-destructive/30",
				outline: "border-border text-foreground [a]:hover:bg-surface-elevated [a]:hover:text-foreground",
				success: "bg-success/10 text-success border border-success/30 [a]:hover:bg-success/20",
				warning: "bg-warning/10 text-warning border border-warning/30 [a]:hover:bg-warning/20",
				ghost: "hover:bg-surface-elevated hover:text-foreground",
				link: "text-brand-magenta underline-offset-4 hover:underline",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
