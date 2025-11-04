<!-- SearchForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SearchParams } from "$lib/types";
	import LegalFilter from "./LegalFilter.svelte";
	import { fly, scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import {
		AdvancedFilters,
		SearchHelpPanel,
		SearchOptions,
		SortControls
	} from "./search-form";

	export let searchParams: SearchParams;
	export let isLoading: boolean = false;
	export let documentTypes: Record<string, number> = {};
	export let fieldOptions: Record<string, string[]> = {};

	let showSearchHelp = false;
	let showAdvancedFilters = false;

	const dispatch = createEventDispatcher<{
		search: Event;
		reset: void;
	}>();

	// Handle search form submission
	function handleSearch(event: Event) {
		event.preventDefault();
		searchParams.page = 1; // Reset to first page
		dispatch("search", event);
	}

	// Reset all filters
	function resetFilters() {
		dispatch("reset");
	}

	// Toggle search help
	function toggleSearchHelp() {
		showSearchHelp = !showSearchHelp;
	}

	// Toggle advanced filters
	function toggleAdvancedFilters() {
		showAdvancedFilters = !showAdvancedFilters;
	}

	// Handle parameter updates
	function handleParamsChange(params: Partial<SearchParams>) {
		Object.assign(searchParams, params);
	}

	function handleRemoveTag(event: CustomEvent<string>) {
		const tag = event.detail;
		searchParams.legal_tags = searchParams.legal_tags.filter((t) => t !== tag);
	}

	function handleAddTag(event: CustomEvent<string>) {
		const tag = event.detail;
		if (!searchParams.legal_tags.includes(tag)) {
			searchParams.legal_tags = [...searchParams.legal_tags, tag];
		}
	}

	// Handle tag matching behavior toggle
	function handleTagMatchToggle(event: CustomEvent<boolean>) {
		searchParams.legal_tags_match_all = event.detail;
	}
</script>

<div
	class="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm"
	in:fly={{ y: 15, duration: 600, easing: cubicOut }}
>
	<!-- Search Form Header -->
	<div
		class="flex items-center justify-between px-5 pb-3 pt-5"
		in:fly={{ y: -10, duration: 500, delay: 100, easing: cubicOut }}
	>
		<h2 class="text-lg font-semibold text-neutral-800">Search</h2>
		<button
			type="button"
			class="flex items-center text-xs font-medium text-primary-900 hover:text-primary-800"
			onclick={toggleSearchHelp}
			in:scale={{ start: 0.95, duration: 500, delay: 300, easing: cubicOut }}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			Search Tips
		</button>
	</div>

	<SearchHelpPanel isOpen={showSearchHelp} />

	<form onsubmit={handleSearch} class="px-5 pb-5">
		<!-- Text Search -->
		<div
			class="mb-4"
			in:fly={{ y: 10, duration: 500, delay: 250, easing: cubicOut }}
		>
			<div class="relative">
				<input
					type="text"
					id="query"
					bind:value={searchParams.query}
					placeholder="Search motions, case names, judges, or keywords"
					class="block w-full rounded-lg border-neutral-200 py-3 pl-10 pr-4 text-sm shadow-sm focus:border-primary-900 focus:ring-primary-900"
				/>
				<div
					class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-neutral-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Primary Filters -->
		<div class="mb-4 space-y-3">
			<div in:fly={{ y: 10, duration: 500, delay: 300, easing: cubicOut }}>
				<label
					for="doc_type"
					class="mb-1 block text-xs font-medium text-neutral-700"
				>Document Type</label>
				<select
					id="doc_type"
					bind:value={searchParams.doc_type}
					class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary-900 focus:ring-primary-900"
				>
					<option value="">All Document Types</option>
					{#if fieldOptions.doc_type}
						{#each fieldOptions.doc_type as type}
							<option value={type}>{type}</option>
						{/each}
					{:else}
						{#each Object.entries(documentTypes) as [type, count]}
							<option value={type}>{type} ({count})</option>
						{/each}
					{/if}
				</select>
			</div>

			<div in:fly={{ y: 10, duration: 500, delay: 350, easing: cubicOut }}>
				<LegalFilter
					selectedTags={searchParams.legal_tags}
					allTagsOptions={fieldOptions.legal_tags || []}
					matchAll={searchParams.legal_tags_match_all}
					on:add={handleAddTag}
					on:remove={handleRemoveTag}
					on:matchAllToggle={handleTagMatchToggle}
				/>
			</div>
		</div>

		<!-- Advanced Filters Toggle -->
		<button
			type="button"
			onclick={toggleAdvancedFilters}
			class="mb-4 flex items-center text-xs font-medium text-primary-900 hover:text-primary-800"
			in:scale={{ start: 0.95, duration: 500, delay: 450, easing: cubicOut }}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-4 w-4 transition-transform {showAdvancedFilters ? 'rotate-180' : ''}"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
			{showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
		</button>

		{#if showAdvancedFilters}
			<AdvancedFilters
				{searchParams}
				{fieldOptions}
				onParamsChange={handleParamsChange}
			/>
		{/if}

		<!-- Options -->
		<div class="mb-5 space-y-3">
			<SortControls
				sortBy={searchParams.sort_by}
				sortOrder={searchParams.sort_order}
				onSortByChange={(value) => searchParams.sort_by = value}
				onSortOrderChange={(value) => searchParams.sort_order = value}
			/>

			<SearchOptions
				useFuzzy={searchParams.use_fuzzy}
				includeHighlights={searchParams.include_highlights}
				onFuzzyChange={(value) => searchParams.use_fuzzy = value}
				onHighlightsChange={(value) => searchParams.include_highlights = value}
			/>
		</div>

		<!-- Action Buttons -->
		<div
			class="flex gap-2"
			in:fly={{ y: 10, duration: 500, delay: 650, easing: cubicOut }}
		>
			<button
				type="submit"
				class="flex flex-1 items-center justify-center rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
				disabled={isLoading}
				in:scale={{ start: 0.98, duration: 600, delay: 700, easing: cubicOut }}
			>
				{#if isLoading}
					<svg
						class="mr-2 h-4 w-4 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Searching...
				{:else}
					Search
				{/if}
			</button>

			<button
				type="button"
				onclick={resetFilters}
				class="flex-1 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
				disabled={isLoading}
				in:scale={{ start: 0.98, duration: 600, delay: 750, easing: cubicOut }}
			>
				Reset
			</button>
		</div>
	</form>
</div>