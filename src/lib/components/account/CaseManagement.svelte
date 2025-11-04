<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';

	let { 
		cases, 
		isInitialLoad, 
		onOpenNewCaseModal, 
		onDeleteCase 
	} = $props();

	function formatDate(dateString: string | number | Date) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function viewCase(caseId: any) {
		goto(`/cases/${caseId}`);
	}
</script>

<!-- Create new case button -->
<div
	class="mb-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
	in:fly={{ y: 15, duration: 600, delay: isInitialLoad ? 400 : 0, easing: cubicOut }}
>
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-medium text-neutral-800">Case Management</h3>
		<button
			onclick={onOpenNewCaseModal}
			class="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			New Case
		</button>
	</div>
</div>

<!-- Cases list -->
{#if cases.length === 0}
	<div
		class="mb-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center"
		in:fly={{ y: 20, duration: 600, delay: isInitialLoad ? 500 : 0, easing: cubicOut }}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mx-auto h-12 w-12 text-neutral-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
			/>
		</svg>
		<h3 class="mt-2 text-sm font-medium text-neutral-900">No cases yet</h3>
		<p class="mt-1 text-sm text-neutral-500">Create your first case to get started</p>
	</div>
{:else}
	<div class="max-h-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white">
		<div class="divide-y divide-neutral-200">
			{#each cases as caseItem, i}
				<div
					class="group relative p-3 hover:bg-neutral-50 transition-colors cursor-pointer"
					in:fly={{ y: 20, duration: 400, delay: i * 50 }}
					onclick={() => viewCase(caseItem.id)}
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3 flex-1 min-w-0">
							<!-- Case Icon -->
							<div class="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-100 flex-shrink-0">
								<svg
									class="h-3 w-3 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>

							<!-- Case Info -->
							<div class="flex-1 min-w-0">
								<h3 class="text-xs font-medium text-neutral-900 group-hover:text-primary-600 break-words">
									{caseItem.case_name}
								</h3>
								<div class="mt-1 flex items-center space-x-3 text-xs text-neutral-500">
									<span>Created {formatDate(caseItem.created_at)}</span>
									<span>Updated {formatDate(caseItem.updated_at)}</span>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex items-center space-x-2 flex-shrink-0">
							<button
								onclick={(e) => { e.stopPropagation(); viewCase(caseItem.id); }}
								class="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-800"
							>
								View
								<svg class="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</button>
							<button
								onclick={(e) => { e.stopPropagation(); onDeleteCase(caseItem.id); }}
								class="text-xs text-red-600 hover:text-red-800"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}