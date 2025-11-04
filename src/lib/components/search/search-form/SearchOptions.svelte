<!-- SearchOptions.svelte -->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		useFuzzy: boolean;
		includeHighlights: boolean;
		onFuzzyChange: (value: boolean) => void;
		onHighlightsChange: (value: boolean) => void;
	}

	const {
		useFuzzy,
		includeHighlights,
		onFuzzyChange,
		onHighlightsChange
	}: Props = $props();
</script>

<div in:fly={{ y: 10, duration: 500, delay: 600, easing: cubicOut }}>
	<div class="flex items-center space-x-4">
		<label class="flex items-center">
			<input
				type="checkbox"
				checked={useFuzzy}
				onchange={(e) => onFuzzyChange(e.currentTarget.checked)}
				class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
			/>
			<span class="ml-2 text-xs text-neutral-700">Fuzzy search (find similar terms)</span>
		</label>

		<label class="flex items-center">
			<input
				type="checkbox"
				checked={includeHighlights}
				onchange={(e) => onHighlightsChange(e.currentTarget.checked)}
				class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
			/>
			<span class="ml-2 text-xs text-neutral-700">Highlight matches</span>
		</label>
	</div>
</div>