<!-- SortControls.svelte -->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		sortBy: string;
		sortOrder: 'asc' | 'desc';
		onSortByChange: (value: string) => void;
		onSortOrderChange: (value: 'asc' | 'desc') => void;
	}

	const {
		sortBy,
		sortOrder,
		onSortByChange,
		onSortOrderChange
	}: Props = $props();
</script>

<div class="grid grid-cols-2 gap-2">
	<div in:fly={{ y: 10, duration: 500, delay: 500, easing: cubicOut }}>
		<label for="sort_by" class="mb-1 block text-xs font-medium text-neutral-700">
			Sort By
		</label>
		<select
			id="sort_by"
			value={sortBy}
			onchange={(e) => onSortByChange(e.currentTarget.value)}
			class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary-900 focus:ring-primary-900"
		>
			<option value="metadata.filing_date">Filing Date</option>
			<option value="metadata.event_date">Event Date</option>
			<option value="metadata.hearing_date">Hearing Date</option>
			<option value="metadata.decision_date">Decision Date</option>
			<option value="created_at">Date Created</option>
			<option value="metadata.document_name">Document Name</option>
			<option value="doc_type">Document Type</option>
			<option value="metadata.case.case_number">Case Number</option>
		</select>
	</div>

	<div in:fly={{ y: 10, duration: 500, delay: 550, easing: cubicOut }}>
		<label for="sort_order" class="mb-1 block text-xs font-medium text-neutral-700">
			Order
		</label>
		<select
			id="sort_order"
			value={sortOrder}
			onchange={(e) => onSortOrderChange(e.currentTarget.value as 'asc' | 'desc')}
			class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary-900 focus:ring-primary-900"
		>
			<option value="asc">Oldest first</option>
			<option value="desc">Newest first</option>
		</select>
	</div>
</div>