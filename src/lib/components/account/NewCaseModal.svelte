<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { 
		showNewCaseModal, 
		newCaseName, 
		isCreatingCase, 
		onCloseNewCaseModal, 
		onCreateCase 
	} = $props();
</script>

<!-- New Case Modal -->
{#if showNewCaseModal}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background-color: rgba(0, 0, 0, 0.5);"
		in:fade={{ duration: 300, easing: cubicOut }}
		out:fade={{ duration: 200 }}
	>
		<div 
			class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
			in:scale={{ start: 0.95, duration: 300, easing: cubicOut }}
			out:scale={{ start: 1, end: 0.95, duration: 200 }}
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-medium text-neutral-900">Create New Case</h3>
				<button
					onclick={onCloseNewCaseModal}
					class="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500"
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="mb-4">
				<label for="case-name" class="block text-sm font-medium text-neutral-700">Case Name</label>
				<input
					type="text"
					id="case-name"
					bind:value={newCaseName}
					class="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
					placeholder="Enter a name for your case"
					onkeydown={(e) => e.key === 'Enter' && onCreateCase()}
					required
				/>
				<p class="mt-1 text-xs text-neutral-500">
					Give your case a descriptive name to help you identify it later.
				</p>
			</div>

			<div class="mt-5 flex justify-end space-x-3">
				<button
					type="button"
					onclick={onCloseNewCaseModal}
					class="inline-flex justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none"
				>
					Cancel
				</button>
				<button
					type="button"
					class="inline-flex justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!newCaseName.trim() || isCreatingCase}
					onclick={onCreateCase}
				>
					{#if isCreatingCase}
						<div class="flex items-center">
							<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
							<span>Creating...</span>
						</div>
					{:else}
						Create Case
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}