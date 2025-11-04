<!-- DocumentProperties.svelte -->
<script lang="ts">
	import { 
		formatDate, 
		formatDateTime, 
		formatFileSize, 
		formatPercentage, 
		formatCount, 
		isEmptyValue 
	} from '$lib/utils/utils';
	import type { Document } from '$lib/types';
	import CollapsibleSection from './CollapsibleSection.svelte';

	const {
		docData
	}: {
		docData?: Document | null;
	} = $props();
</script>

{#if docData}
	<CollapsibleSection title="Document Properties" defaultCollapsed={false}>
		<div class="space-y-3">
			{#if docData.size || docData.metadata?.size}
				<div>
					<p class="text-xs text-neutral-500">File Size</p>
					<p class="text-sm font-medium text-neutral-800">{formatFileSize(docData.size || docData.metadata?.size)}</p>
				</div>
			{/if}

			{#if !isEmptyValue(docData.content_type) || !isEmptyValue(docData.metadata?.file_type)}
				<div>
					<p class="text-xs text-neutral-500">File Type</p>
					<p class="text-sm font-medium text-neutral-800">{docData.content_type || docData.metadata?.file_type}</p>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.word_count)}
				<div>
					<p class="text-xs text-neutral-500">Word Count</p>
					<p class="text-sm font-medium text-neutral-800">{formatCount(docData.metadata?.word_count)}</p>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.page_count) || !isEmptyValue(docData.metadata?.pages)}
				<div>
					<p class="text-xs text-neutral-500">Page Count</p>
					<p class="text-sm font-medium text-neutral-800">{docData.metadata?.page_count || docData.metadata?.pages}</p>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.language)}
				<div>
					<p class="text-xs text-neutral-500">Language</p>
					<p class="text-sm font-medium text-neutral-800">{docData.metadata?.language}</p>
				</div>
			{/if}

			{#if docData.metadata?.ai_classified !== undefined || docData.metadata?.confidence !== undefined}
				<div>
					<p class="text-xs text-neutral-500 mb-2">AI Classification</p>
					<div class="flex items-center justify-between space-x-3">
						{#if docData.metadata?.ai_classified !== undefined}
							<div class="flex items-center space-x-2">
								<span class="text-xs text-neutral-500">Status:</span>
								<span class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${docData.metadata?.ai_classified ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}`}>
									{docData.metadata?.ai_classified ? 'Yes' : 'No'}
								</span>
							</div>
						{/if}
						{#if docData.metadata?.confidence !== undefined}
							<div class="flex items-center space-x-2 flex-1">
								<span class="text-xs text-neutral-500 whitespace-nowrap">Confidence:</span>
								<div class="flex items-center space-x-2 flex-1">
									<div class="flex-1 bg-neutral-200 rounded-full h-2 min-w-16">
										<div 
											class="bg-primary-600 h-2 rounded-full" 
											style="width: {formatPercentage(docData.metadata.confidence).replace('%', '')}%"
										></div>
									</div>
									<span class="text-xs font-medium text-neutral-800 whitespace-nowrap">{formatPercentage(docData.metadata.confidence)}</span>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.filing_date)}
				<div>
					<p class="text-xs text-neutral-500">Filing Date</p>
					<span class="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
						📅 {formatDate(docData.metadata?.filing_date)}
					</span>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.event_date)}
				<div>
					<p class="text-xs text-neutral-500">Event Date</p>
					<span class="inline-flex items-center rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
						⚖️ {formatDate(docData.metadata?.event_date)}
					</span>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.hearing_date)}
				<div>
					<p class="text-xs text-neutral-500">Hearing Date</p>
					<span class="inline-flex items-center rounded bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
						🏛️ {formatDate(docData.metadata?.hearing_date)}
					</span>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.decision_date)}
				<div>
					<p class="text-xs text-neutral-500">Decision Date</p>
					<span class="inline-flex items-center rounded bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
						⚡ {formatDate(docData.metadata?.decision_date)}
					</span>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.served_date)}
				<div>
					<p class="text-xs text-neutral-500">Served Date</p>
					<span class="inline-flex items-center rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
						📬 {formatDate(docData.metadata?.served_date)}
					</span>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.timestamp)}
				<div>
					<p class="text-xs text-neutral-500">Document Date</p>
					<p class="text-sm font-medium text-neutral-800">{formatDate(docData.metadata?.timestamp)}</p>
				</div>
			{/if}

			<div>
				<p class="text-xs text-neutral-500">Created</p>
				<p class="text-sm font-medium text-neutral-800">{formatDateTime(docData.created_at)}</p>
			</div>

			{#if !isEmptyValue(docData.updated_at)}
				<div>
					<p class="text-xs text-neutral-500">Updated</p>
					<p class="text-sm font-medium text-neutral-800">{formatDateTime(docData.updated_at)}</p>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.processed_at)}
				<div>
					<p class="text-xs text-neutral-500">Processed</p>
					<p class="text-sm font-medium text-neutral-800">{formatDateTime(docData.metadata?.processed_at)}</p>
				</div>
			{/if}
		</div>
	</CollapsibleSection>
{/if}