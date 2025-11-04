<script lang="ts">
	import type { CaseDocument } from '$lib/supabase';
	import type { Document } from '$lib/api';

	let { 
		showNotesPanel,
		activeCaseDoc,
		documentDetails,
		notesText,
		isSavingNotes,
		saveMessage,
		onCloseNotesPanel,
		onSaveNotes
	} = $props<{
		showNotesPanel: boolean;
		activeCaseDoc: CaseDocument | null;
		documentDetails: Map<string, Document>;
		notesText: string;
		isSavingNotes: boolean;
		saveMessage: string;
		onCloseNotesPanel: () => void;
		onSaveNotes: () => void;
	}>();
</script>

{#if activeCaseDoc}
	<!-- Collapsible notes panel (styled to match viewer/metadata colors) -->
	<div class="fixed inset-y-0 right-0 z-[60] w-96 max-w-full transform transition-transform duration-300"
		style={`transform: translateX(${showNotesPanel ? '0' : '100%'});`}>
		<div class="flex h-full flex-col border-l border-neutral-200 bg-neutral-50 shadow-xl">
			<div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3 bg-white/70 backdrop-blur">
				<h3 class="text-sm font-semibold text-neutral-800">Notes</h3>
				<button class="rounded p-1 text-neutral-500 hover:bg-neutral-100" onclick={onCloseNotesPanel} aria-label="Close notes">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="flex-1 overflow-auto p-4 space-y-3">
				<p class="text-sm text-neutral-700">{documentDetails.get(activeCaseDoc.document_ids)?.metadata?.document_name || documentDetails.get(activeCaseDoc.document_ids)?.file_name || 'Document'}</p>
				<textarea
					class="h-60 w-full rounded border border-neutral-300 p-2 text-sm bg-white focus:border-primary-600 focus:ring-primary-600"
					bind:value={notesText}
					placeholder="Add notes for this document..."
				></textarea>
				{#if saveMessage}
					<p class="text-xs text-green-600">{saveMessage}</p>
				{/if}
			</div>
			<div class="border-t border-neutral-200 p-3 bg-white/70 backdrop-blur">
				<button class="w-full rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50" onclick={onSaveNotes} disabled={isSavingNotes}>
					{#if isSavingNotes}
						Saving...
					{:else}
						Save Notes
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}