<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { 
		storageDocuments, 
		isLoadingStorage, 
		storageError, 
		isInitialLoad, 
		onDeleteDocument 
	} = $props();

	function formatDate(dateString: string | number | Date) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatFileSize(bytes: number): string {
		if (!bytes) return '0 B';
		
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;
		
		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		
		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}
</script>

<!-- Storage Management Section -->
{#if storageError}
	<div class="mb-6 rounded-md bg-red-50 p-3 text-red-800" in:fly={{ y: -10, duration: 300 }}>
		<p class="text-sm">{storageError}</p>
	</div>
{/if}

<!-- Storage Documents -->
<div
	class="mb-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
	in:fly={{ y: 15, duration: 600, delay: isInitialLoad ? 700 : 0, easing: cubicOut }}
>
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-medium text-neutral-800">Storage Documents</h3>
		<span class="text-sm text-neutral-500">
			{isLoadingStorage ? 'Loading...' : `${storageDocuments.length} documents`}
		</span>
	</div>

	{#if isLoadingStorage}
		<div class="flex items-center justify-center py-8">
			<div class="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600"></div>
		</div>
	{:else if storageDocuments.length === 0}
		<div class="text-center py-8 text-neutral-500">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto h-12 w-12 text-neutral-400 mb-2"
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
			<p class="text-sm">No documents in storage</p>
		</div>
	{:else}
		<div class="max-h-96 overflow-y-auto">
			<div class="divide-y divide-neutral-200">
				{#each storageDocuments as doc, i}
					<div
						class="group py-3 px-2 hover:bg-neutral-50 transition-colors rounded"
						in:fly={{ y: 10, duration: 300, delay: i * 50 }}
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-3 flex-1 min-w-0">
								<!-- File Icon -->
								<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
									<svg
										class="h-4 w-4 text-blue-600"
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

								<!-- Document Info -->
								<div class="flex-1 min-w-0">
									<h4 class="text-sm font-medium text-neutral-900 truncate">
										{doc.file_name || doc.filename || 'Untitled Document'}
									</h4>
									<div class="mt-1 flex items-center space-x-3 text-xs text-neutral-500">
										{#if doc.size}
											<span>{formatFileSize(doc.size)}</span>
										{/if}
										{#if doc.doc_type || doc.document_type}
											<span class="capitalize">{doc.doc_type || doc.document_type}</span>
										{/if}
										{#if doc.created_at}
											<span>{formatDate(doc.created_at)}</span>
										{/if}
									</div>
								</div>
							</div>

							<!-- Actions -->
							<div class="flex items-center space-x-2 flex-shrink-0">
								{#if doc.file_url}
									<a
										href={doc.file_url}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
									>
										<svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
										View
									</a>
								{/if}
								<button
									onclick={() => onDeleteDocument(doc.id)}
									class="text-xs text-red-600 hover:text-red-800 flex items-center"
								>
									<svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Delete
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>