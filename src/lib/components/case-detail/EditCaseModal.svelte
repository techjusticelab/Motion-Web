<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { 
		showEditCaseModal,
		editCaseName,
		isUpdatingCase,
		onCloseEditCaseModal,
		onUpdateCaseName
	} = $props<{
		showEditCaseModal: boolean;
		editCaseName: string;
		isUpdatingCase: boolean;
		onCloseEditCaseModal: () => void;
		onUpdateCaseName: () => void;
	}>();
</script>

{#if showEditCaseModal}
	<div 
		class="fixed inset-0 z-[60] overflow-y-auto"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
	>
		<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
			<div 
				class="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity"
				onclick={onCloseEditCaseModal}
				aria-hidden="true"
			></div>

			<div 
				class="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg mx-auto"
				in:scale={{ start: 0.95, duration: 200 }}
				out:scale={{ start: 1, end: 0.95, duration: 200 }}
				onclick={(e) => e.stopPropagation()}
			>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<h3 class="text-lg font-medium text-neutral-900 mb-4">Edit Case</h3>
					<div>
						<label for="edit-case-name" class="block text-sm font-medium text-neutral-700">Case Name</label>
						<div class="mt-1">
							<input
								id="edit-case-name"
								type="text"
								bind:value={editCaseName}
								placeholder="Enter case name..."
								class="block w-full appearance-none rounded-md border border-neutral-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								onkeydown={(e) => e.key === 'Enter' && onUpdateCaseName()}
							/>
						</div>
					</div>
				</div>
				<div class="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
					<button
						type="button"
						class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
						disabled={!editCaseName.trim() || isUpdatingCase}
						onclick={onUpdateCaseName}
					>
						{#if isUpdatingCase}
							<div class="flex items-center">
								<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								<span>Updating...</span>
							</div>
						{:else}
							Update Case
						{/if}
					</button>
					<button
						type="button"
						class="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
						onclick={onCloseEditCaseModal}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}