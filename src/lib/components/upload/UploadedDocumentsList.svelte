<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui';
	import { fly, scale, slide } from 'svelte/transition';
	import { cubicOut, elasticOut } from 'svelte/easing';
	import type { Document } from '$lib/api';

	const dispatch = createEventDispatcher();

	interface UploadedDocument {
		name: string;
		type: string;
		response: Document;
	}

	interface Props {
		documents: UploadedDocument[];
		currentDocument?: Document | null;
		class?: string;
	}

	let {
		documents = [],
		currentDocument = null,
		class: className = ''
	}: Props = $props();

	// Handle document selection
	function selectDocument(document: Document) {
		dispatch('documentSelected', { document });
	}

	// Get file icon based on type
	function getFileIcon(type: string): string {
		if (type.includes('pdf')) return 'pdf';
		if (type.includes('word') || type.includes('docx')) return 'word';
		if (type.includes('text')) return 'text';
		return 'generic';
	}

	// Get file size display
	function getFileSizeDisplay(sizeBytes?: number): string {
		if (!sizeBytes) return 'Unknown size';
		
		if (sizeBytes < 1024) return `${sizeBytes} B`;
		if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
		return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	// Format date
	function formatDate(dateString?: string): string {
		if (!dateString) return 'Unknown date';
		
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return 'Unknown date';
		}
	}

	// Get file extension from filename
	function getFileExtension(filename: string): string {
		return filename.split('.').pop()?.toLowerCase() || '';
	}

	// Get status color
	function getStatusColor(status?: string): string {
		if (!status) return 'bg-neutral-100 text-neutral-800';
		
		const statusLower = status.toLowerCase();
		if (statusLower.includes('complete') || statusLower.includes('processed')) {
			return 'bg-green-100 text-green-800';
		}
		if (statusLower.includes('error') || statusLower.includes('failed')) {
			return 'bg-red-100 text-red-800';
		}
		if (statusLower.includes('processing') || statusLower.includes('pending')) {
			return 'bg-yellow-100 text-yellow-800';
		}
		return 'bg-blue-100 text-blue-800';
	}
</script>

<div class="space-y-4 {className}">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-neutral-900">
			Uploaded Documents
		</h3>
		<span class="text-sm text-neutral-500">
			{documents.length} document{documents.length !== 1 ? 's' : ''}
		</span>
	</div>

	{#if documents.length === 0}
		<!-- Empty state -->
		<div 
			class="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg"
			in:fly={{ y: 20, duration: 300 }}
		>
			<div class="space-y-3">
				<div class="mx-auto h-12 w-12 text-neutral-400">
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<p class="text-sm text-neutral-500">No documents uploaded yet</p>
				<p class="text-xs text-neutral-400">Upload your first document to get started</p>
			</div>
		</div>
	{:else}
		<!-- Documents list -->
		<div class="space-y-3 max-h-96 overflow-y-auto">
			{#each documents as docItem, index}
				{@const doc = docItem.response}
				{@const isSelected = currentDocument?.id === doc.id}
				
				<div 
					class="group cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-primary-300 hover:shadow-md {isSelected ? 'border-primary-500 bg-primary-50 shadow-md' : ''}"
					onclick={() => selectDocument(doc)}
					in:scale={{ start: 0.95, duration: 300, delay: index * 100, easing: elasticOut }}
				>
					<div class="flex items-start space-x-4">
						<!-- File icon -->
						<div class="flex-shrink-0">
							{#if getFileIcon(docItem.type) === 'pdf'}
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
									</svg>
								</div>
							{:else if getFileIcon(docItem.type) === 'word'}
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
							{:else if getFileIcon(docItem.type) === 'text'}
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
							{:else}
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
							{/if}
						</div>

						<!-- Document info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<!-- Document name -->
									<h4 class="text-sm font-medium text-neutral-900 truncate group-hover:text-primary-900 transition-colors">
										{doc.metadata?.document_name || docItem.name || 'Untitled Document'}
									</h4>
									
									<!-- File details -->
									<div class="mt-1 flex items-center space-x-3 text-xs text-neutral-500">
										<span class="uppercase font-medium">
											{getFileExtension(docItem.name)}
										</span>
										<span>•</span>
										<span>{getFileSizeDisplay(doc.file_size)}</span>
										<span>•</span>
										<span>{formatDate(doc.created_at)}</span>
									</div>

									<!-- Metadata preview -->
									{#if doc.metadata}
										<div class="mt-2 space-y-1">
											{#if doc.metadata.subject}
												<p class="text-xs text-neutral-600 truncate">
													<span class="font-medium">Subject:</span> {doc.metadata.subject}
												</p>
											{/if}
											{#if doc.metadata.case_name}
												<p class="text-xs text-neutral-600 truncate">
													<span class="font-medium">Case:</span> {doc.metadata.case_name}
												</p>
											{/if}
											{#if doc.metadata.legal_tags && doc.metadata.legal_tags.length > 0}
												<div class="flex flex-wrap gap-1 mt-1">
													{#each doc.metadata.legal_tags.slice(0, 3) as tag}
														<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
															{tag}
														</span>
													{/each}
													{#if doc.metadata.legal_tags.length > 3}
														<span class="text-xs text-neutral-500">
															+{doc.metadata.legal_tags.length - 3} more
														</span>
													{/if}
												</div>
											{/if}
										</div>
									{/if}
								</div>

								<!-- Status and actions -->
								<div class="flex flex-col items-end space-y-2 ml-4">
									{#if doc.metadata?.status}
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(doc.metadata.status)}">
											{doc.metadata.status}
										</span>
									{/if}

									{#if isSelected}
										<span class="text-xs text-primary-600 font-medium">
											Selected
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>

					<!-- Selected indicator -->
					{#if isSelected}
						<div 
							class="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none"
							in:scale={{ start: 0.95, duration: 200 }}
						></div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Actions -->
		{#if documents.length > 0}
			<div class="flex justify-between items-center pt-4 border-t border-neutral-200">
				<p class="text-xs text-neutral-500">
					Click on a document to view and edit its metadata
				</p>
				
				<Button
					variant="secondary"
					size="sm"
					onclick={() => dispatch('clearDocuments')}
					class="text-xs"
				>
					Clear All
				</Button>
			</div>
		{/if}
	{/if}
</div>