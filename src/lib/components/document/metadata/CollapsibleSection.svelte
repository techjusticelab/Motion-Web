<!-- CollapsibleSection.svelte -->
<script lang="ts">
	import { slide } from 'svelte/transition';

	const {
		title,
		defaultCollapsed = false,
		children
	}: {
		title: string;
		defaultCollapsed?: boolean;
		children: any;
	} = $props();

	let collapsed = $state(defaultCollapsed);

	function toggle() {
		collapsed = !collapsed;
	}

	function getSectionIcon(isCollapsed: boolean): string {
		return isCollapsed ? 'M9 5l7 7-7 7' : 'M19 9l-7 7-7-7';
	}
</script>

<div class="rounded-lg border border-neutral-200 bg-white">
	<button
		type="button"
		onclick={toggle}
		class="flex w-full items-center justify-between p-3 text-left hover:bg-neutral-50"
	>
		<h4 class="text-sm font-medium text-neutral-800">{title}</h4>
		<svg
			class="h-4 w-4 transform transition-transform {collapsed ? '' : 'rotate-180'}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getSectionIcon(collapsed)} />
		</svg>
	</button>
	{#if !collapsed}
		<div class="border-t border-neutral-100 p-3" transition:slide={{ duration: 300 }}>
			{@render children()}
		</div>
	{/if}
</div>