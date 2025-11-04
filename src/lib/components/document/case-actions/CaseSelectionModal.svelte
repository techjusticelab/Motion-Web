<!-- CaseSelectionModal.svelte -->
<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { Case } from '$lib/supabase';

	interface Props {
		isOpen: boolean;
		cases: Case[];
		selectedCaseId: string;
		documentNotes: string;
		isSubmitting: boolean;
		onConfirm: () => void;
		onCancel: () => void;
		onCaseIdChange: (id: string) => void;
		onNotesChange: (notes: string) => void;
	}

	const {
		isOpen,
		cases,
		selectedCaseId,
		documentNotes,
		isSubmitting,
		onConfirm,
		onCancel,
		onCaseIdChange,
		onNotesChange
	}: Props = $props();
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[60] overflow-y-auto"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
	>
		<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
			<!-- Backdrop -->
			<button
				type="button"
				class="fixed inset-0 bg-neutral-500 bg-opacity-75 transition-opacity"
				onclick={onCancel}
				aria-label="Close modal"
			></button>

			<!-- Modal Content -->
			<div
				class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full z-10"
				in:scale={{ start: 0.95, duration: 200 }}
				out:scale={{ start: 1, end: 0.95, duration: 200 }}
			>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<h3 class="text-lg font-medium text-neutral-900 mb-4">Add Document to Case</h3>
					<div class="space-y-4">
						<div>
							<label for="case-select" class="block text-sm font-medium text-neutral-700">
								Select Case
							</label>
							<div class="mt-1">
								<select
									id="case-select"
									value={selectedCaseId}
									onchange={(e) => onCaseIdChange(e.currentTarget.value)}
									class="block w-full appearance-none rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								>
									<option value="">Choose a case...</option>
									{#each cases as caseItem}
										<option value={caseItem.id}>{caseItem.case_name}</option>
									{/each}
								</select>
							</div>
						</div>
						<div>
							<label for="document-notes" class="block text-sm font-medium text-neutral-700">
								Notes (optional)
							</label>
							<div class="mt-1">
								<textarea
									id="document-notes"
									value={documentNotes}
									oninput={(e) => onNotesChange(e.currentTarget.value)}
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
						disabled={!selectedCaseId || isSubmitting}
						onclick={onConfirm}
					>
						{#if isSubmitting}
							<div class="flex items-center">
								<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								<span>Adding...</span>
							</div>
						{:else}
							Add to Case
						{/if}
					</button>
					<button
						type="button"
						class="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
						onclick={onCancel}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}