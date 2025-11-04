<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { 
		cases, 
		documentStats, 
		totalDocuments, 
		isLoadingStorage, 
		isInitialLoad,
		onRefreshStorage 
	} = $props();
</script>

<!-- Account stats -->
<div class="mb-6 grid grid-cols-2 gap-4">
	<div
		class="rounded-lg bg-white p-4 shadow-sm"
		in:fly={{ y: 15, duration: 500, delay: isInitialLoad ? 500 : 0, easing: cubicOut }}
	>
		<h4 class="text-sm font-medium text-neutral-500">Total Cases</h4>
		<p class="mt-1 text-2xl font-semibold text-primary-600">{cases.length}</p>
	</div>
	<div
		class="rounded-lg bg-white p-4 shadow-sm"
		in:fly={{ y: 15, duration: 500, delay: isInitialLoad ? 600 : 0, easing: cubicOut }}
	>
		<h4 class="text-sm font-medium text-neutral-500">Stored Documents</h4>
		<p class="mt-1 text-2xl font-semibold text-primary-600">
			{isLoadingStorage ? '...' : (documentStats?.total_documents?.toLocaleString() || totalDocuments)}
		</p>
	</div>
	{#if documentStats?.total_size_gb}
		<div
			class="col-span-2 rounded-lg bg-white p-4 shadow-sm"
			in:fly={{ y: 15, duration: 500, delay: isInitialLoad ? 700 : 0, easing: cubicOut }}
		>
			<h4 class="text-sm font-medium text-neutral-500">Storage Usage</h4>
			<p class="mt-1 text-2xl font-semibold text-secondary-600">
				{documentStats.total_size_gb.toFixed(2)} GB
			</p>
		</div>
	{/if}
</div>

<!-- Storage Management -->
<div class="mb-6 space-y-3" in:fly={{ y: 15, duration: 500, delay: isInitialLoad ? 800 : 0 }}>
	<h3 class="text-md font-semibold text-neutral-700">Storage Management</h3>
	<button
		onclick={onRefreshStorage}
		class="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-white p-3 text-left text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
	>
		<span class="flex items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-5 w-5 text-neutral-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
				/>
			</svg>
			Refresh Storage Data
		</span>
		{#if isLoadingStorage}
			<div class="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600"></div>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-neutral-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		{/if}
	</button>
</div>