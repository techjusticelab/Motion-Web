<!-- SearchHelpPanel.svelte -->
<script lang="ts">
	import { slide, fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		isOpen: boolean;
	}

	const { isOpen }: Props = $props();

	const searchTips = [
		{ code: '"exact phrase"', desc: "Exact match" },
		{ code: "term1 OR term2", desc: "Either term" },
		{ code: "+required", desc: "Must include" },
		{ code: "-excluded", desc: "Must exclude" }
	];
</script>

{#if isOpen}
	<div
		class="mx-5 mb-4 rounded-lg bg-primary-50 p-4 text-xs"
		transition:slide={{ duration: 300, easing: cubicOut }}
	>
		<h3 class="mb-2 font-medium text-primary-900" in:fade={{ duration: 400 }}>
			Search Operators
		</h3>
		<div class="grid grid-cols-2 gap-2">
			{#each searchTips as tip, i}
				<div
					class="rounded border border-primary-100 bg-white p-2"
					in:fly={{
						y: 10,
						duration: 400,
						delay: 100 + i * 100,
						easing: cubicOut,
					}}
				>
					<code class="text-primary-800">{tip.code}</code>
					<span class="mt-1 block text-neutral-600">{tip.desc}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}