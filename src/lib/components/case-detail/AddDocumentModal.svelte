<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { 
		showAddDocumentModal,
		selectedDocumentId,
		documentNotes,
		isAddingDocument,
		onCloseAddDocumentModal,
		onAddDocumentToCase
	} = $props<{
		showAddDocumentModal: boolean;
		selectedDocumentId: string;
		documentNotes: string;
		isAddingDocument: boolean;
		onCloseAddDocumentModal: () => void;
		onAddDocumentToCase: () => void;
	}>();
</script>

{#if showAddDocumentModal}
	<div 
		class="fixed inset-0 z-[60] overflow-y-auto"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
	>
		<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
			<div 
				class="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity"
				onclick={onCloseAddDocumentModal}
				aria-hidden="true"
			></div>

			<div 
				class="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg mx-auto"
				in:scale={{ start: 0.95, duration: 200 }}
				out:scale={{ start: 1, end: 0.95, duration: 200 }}
				onclick={(e) => e.stopPropagation()}
			>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-lg font-medium text-neutral-900">Add Document to Case</h3>
						<button 
							onclick={onCloseAddDocumentModal}
							class="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500"
							aria-label="Close modal"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div class="space-y-4">
						<div>
							<label for="document-id" class="block text-sm font-medium text-neutral-700">Document ID</label>
							<div class="mt-1">
								<input
									id="document-id"
									type="text"
									bind:value={selectedDocumentId}
									placeholder="Enter document ID..."
									class="block w-full appearance-none rounded-md border border-neutral-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								/>
							</div>
						</div>
						<div>
							<label for="document-notes" class="block text-sm font-medium text-neutral-700">Notes (optional)</label>
							<div class="mt-1">
								<textarea
									id="document-notes"
									bind:value={documentNotes}
									rows="3"
									placeholder="Add any notes about this document..."
									class="block w-full appearance-none rounded-md border border-neutral-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								></textarea>
							</div>
						</div>
					</div>
				</div>
				<div class="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
					<button
						type="button"
						class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
						disabled={!selectedDocumentId.trim() || isAddingDocument}
						onclick={onAddDocumentToCase}
					>
						{#if isAddingDocument}
							<div class="flex items-center">
								<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								<span>Adding...</span>
							</div>
						{:else}
							Add Document
						{/if}
					</button>
					<button
						type="button"
						class="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
						onclick={onCloseAddDocumentModal}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}