<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { CaseDocument, Case } from '$lib/supabase';
	import type { Document } from '$lib/api';
	import { truncateText } from '$lib/utils';

	let { 
		caseDocuments,
		currentCase,
		isLoadingDocuments,
		isInitialLoad,
		documentDetails,
		onOpenDocumentViewer,
		onRemoveDocumentFromCase,
		onOpenAddDocumentModal
	} = $props<{
		caseDocuments: CaseDocument[];
		currentCase: Case | null;
		isLoadingDocuments: boolean;
		isInitialLoad: boolean;
		documentDetails: Map<string, Document>;
		onOpenDocumentViewer: (doc: CaseDocument) => void;
		onRemoveDocumentFromCase: (caseDocumentId: string) => void;
		onOpenAddDocumentModal: () => void;
	}>();

	function formatDate(dateString: string) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getPdfNameFromId(id: string): string | null {
		if (!id) return null;
		const lastSeg = id.split('/').pop() || id;
		const m = lastSeg.match(/^doc_[^_]+_(.+\.(pdf|PDF))$/);
		if (m && m[1]) return m[1];
		if (/\.(pdf|PDF)$/.test(lastSeg)) return lastSeg;
		return null;
	}

	function getCaseDocTitle(doc: CaseDocument): string {
		const details = documentDetails.get(doc.document_ids);
		return (
			details?.metadata?.document_name ||
			details?.file_name ||
			getPdfNameFromId(doc.document_ids) ||
			`Document ${doc.document_ids.slice(0, 8)}...`
		);
	}
</script>

<div class="mb-8">
	<h2 class="mb-4 text-xl font-semibold text-neutral-900">Documents ({caseDocuments.length})</h2>

	{#if isLoadingDocuments}
		<div class="flex items-center justify-center py-8">
			<div class="flex items-center space-x-3">
				<div class="h-6 w-6 animate-spin rounded-full border-4 border-primary-200 border-t-indigo-600"></div>
				<span class="text-neutral-600">Loading documents...</span>
			</div>
		</div>
	{:else if caseDocuments.length === 0}
		<div
			class="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center"
			in:fly={{ y: 20, duration: 600, delay: isInitialLoad ? 300 : 0, easing: cubicOut }}
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
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<h3 class="mt-4 text-lg font-medium text-neutral-900">No documents yet</h3>
			<p class="mt-2 text-sm text-neutral-500">
				Add documents to this case to start building your case file
			</p>
			<button
				onclick={onOpenAddDocumentModal}
				class="mt-4 inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none"
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
				Add Your First Document
			</button>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
			{#each caseDocuments as document, i}
				<div
					class="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
					in:fly={{ y: 20, duration: 400, delay: i * 100 }}
					onclick={() => onOpenDocumentViewer(document)}
				>
					<!-- Document Header -->
					<div class="mb-4 flex items-start justify-between">
						<div class="flex items-start space-x-3">
							<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
								<svg
									class="h-6 w-6 text-white"
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
							<div class="flex-1 min-w-0">
								<h4 class="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
									{getCaseDocTitle(document)}
								</h4>
								<div class="mt-1 flex items-center flex-wrap gap-3 text-sm text-neutral-500">
									<div class="flex items-center">
										<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Added {formatDate(document.added_at)}
									</div>
									{#if document.case_name}
										<span class="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 border border-primary-100">{document.case_name}</span>
									{:else}
										<span class="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 border border-neutral-200">{currentCase?.case_name}</span>
									{/if}
								</div>
							</div>
						</div>
						<div class="flex items-center space-x-2">
							<button
								onclick={(e) => { e.stopPropagation(); onOpenDocumentViewer(document); }}
								class="inline-flex items-center rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
								title="View Document"
								aria-label="View Document"
							>
								<svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
								View
							</button>
							<button
								onclick={(e) => { e.stopPropagation(); onRemoveDocumentFromCase(document.id); }}
								class="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
								title="Remove from Case"
								aria-label="Remove from Case"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>

					<!-- Summary & Details -->
					<div class="space-y-3">
						<!-- Summary from index -->
						{#if documentDetails.get(document.document_ids)?.metadata?.summary}
							<p class="text-sm text-neutral-700">
								{truncateText(documentDetails.get(document.document_ids)?.metadata?.summary, 220)}
							</p>
						{/if}

						<!-- Notes preview -->
						<div class="rounded bg-neutral-50 p-3 border border-neutral-100">
							<p class="text-xs uppercase tracking-wide text-neutral-500 mb-1">Your notes</p>
							<p class="whitespace-pre-wrap text-neutral-800">{document.notes || 'No notes yet.'}</p>
						</div>
						
						<!-- Document ID -->
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-neutral-600">Document ID</span>
							<div class="flex items-center space-x-2">
								<code class="rounded bg-neutral-100 px-2 py-1 text-xs font-mono text-neutral-800">
									{document.document_ids.slice(0, 16)}...
								</code>
								<button
									onclick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(document.document_ids); }}
									class="text-neutral-400 hover:text-neutral-600"
									title="Copy Document ID"
									aria-label="Copy Document ID"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
								</button>
							</div>
						</div>

						<!-- Document Type Badge -->
						{#if documentDetails.get(document.document_ids)?.doc_type}
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-neutral-600">Type</span>
								<span class="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
									{documentDetails.get(document.document_ids)?.doc_type}
								</span>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>