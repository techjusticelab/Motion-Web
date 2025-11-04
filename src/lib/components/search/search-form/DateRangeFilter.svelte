<!-- DateRangeFilter.svelte -->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		dateFieldType: string;
		dateStart: string;
		dateEnd: string;
		onFieldTypeChange: (type: string) => void;
		onStartChange: (date: string) => void;
		onEndChange: (date: string) => void;
	}

	const {
		dateFieldType,
		dateStart,
		dateEnd,
		onFieldTypeChange,
		onStartChange,
		onEndChange
	}: Props = $props();
</script>

<div in:fly={{ y: 10, duration: 500, delay: 300, easing: cubicOut }}>
	<label class="mb-2 block text-xs font-medium text-neutral-700">Date Filters</label>

	<!-- Date Type Selector -->
	<div class="mb-2">
		<select
			value={dateFieldType}
			onchange={(e) => onFieldTypeChange(e.currentTarget.value)}
			class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs shadow-sm focus:border-primary-900 focus:ring-primary-900"
		>
			<option value="filing_date">Filing Date</option>
			<option value="event_date">Event Date</option>
			<option value="hearing_date">Hearing Date</option>
			<option value="decision_date">Decision Date</option>
			<option value="served_date">Served Date</option>
			<option value="created_at">Document Created</option>
		</select>
	</div>

	<!-- Date Range -->
	<div class="grid grid-cols-2 gap-2">
		<div>
			<input
				type="date"
				id="date_start"
				value={dateStart}
				oninput={(e) => onStartChange(e.currentTarget.value)}
				placeholder="From"
				class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs shadow-sm focus:border-primary-900 focus:ring-primary-900"
			/>
		</div>
		<div>
			<input
				type="date"
				id="date_end"
				value={dateEnd}
				oninput={(e) => onEndChange(e.currentTarget.value)}
				placeholder="To"
				class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs shadow-sm focus:border-primary-900 focus:ring-primary-900"
			/>
		</div>
	</div>
</div>