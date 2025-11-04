<!-- AdvancedFilters.svelte -->
<script lang="ts">
	import { slide, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { SearchParams } from '$lib/types';
	import DateRangeFilter from './DateRangeFilter.svelte';

	interface Props {
		searchParams: SearchParams;
		fieldOptions: Record<string, string[]>;
		onParamsChange: (params: Partial<SearchParams>) => void;
	}

	const {
		searchParams,
		fieldOptions,
		onParamsChange
	}: Props = $props();
</script>

<div
	class="mb-4 space-y-3 border-t border-neutral-100 pt-2"
	transition:slide={{ duration: 400, easing: cubicOut }}
>
	<div in:fly={{ y: 10, duration: 500, delay: 100, easing: cubicOut }}>
		<label for="case_name" class="mb-1 block text-xs font-medium text-neutral-700">
			Case Name
		</label>
		<input
			type="text"
			id="case_name"
			value={searchParams.case_name}
			oninput={(e) => onParamsChange({ case_name: e.currentTarget.value })}
			placeholder="Enter case name"
			class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary-900 focus:ring-primary-900"
		/>
	</div>

	<DateRangeFilter
		dateFieldType={searchParams.date_field_type}
		dateStart={searchParams.date_range.start}
		dateEnd={searchParams.date_range.end}
		onFieldTypeChange={(type) => onParamsChange({ date_field_type: type })}
		onStartChange={(date) => onParamsChange({ 
			date_range: { ...searchParams.date_range, start: date }
		})}
		onEndChange={(date) => onParamsChange({ 
			date_range: { ...searchParams.date_range, end: date }
		})}
	/>

	<div class="grid grid-cols-2 gap-2">
		<div in:fly={{ y: 10, duration: 500, delay: 350, easing: cubicOut }}>
			<label for="author" class="mb-1 block text-xs font-medium text-neutral-700">
				Author
			</label>
			<input
				type="text"
				id="author"
				value={searchParams.author}
				oninput={(e) => onParamsChange({ author: e.currentTarget.value })}
				placeholder="Document author"
				class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary-900 focus:ring-primary-900"
			/>
		</div>

		<div in:fly={{ y: 10, duration: 500, delay: 400, easing: cubicOut }}>
			<label for="status" class="mb-1 block text-xs font-medium text-neutral-700">
				Status
			</label>
			<select
				id="status"
				value={searchParams.status}
				onchange={(e) => onParamsChange({ status: e.currentTarget.value })}
				class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary-900 focus:ring-primary-900"
			>
				<option value="">All Statuses</option>
				{#if fieldOptions.status}
					{#each fieldOptions.status as status}
						<option value={status}>{status}</option>
					{/each}
				{/if}
			</select>
		</div>
	</div>
</div>