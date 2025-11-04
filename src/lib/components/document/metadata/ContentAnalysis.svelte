<!-- ContentAnalysis.svelte -->
<script lang="ts">
	import { formatPercentage, isEmptyValue } from '$lib/utils/utils';
	import type { Document } from '$lib/types';
	import CollapsibleSection from './CollapsibleSection.svelte';

	const {
		docData
	}: {
		docData?: Document | null;
	} = $props();
</script>

{#if docData && (docData.metadata?.classification_confidence !== undefined || docData.metadata?.has_redactions !== undefined || docData.metadata?.redaction_score !== undefined || !isEmptyValue(docData.metadata?.extraction_method) || docData.metadata?.sensitive_terms)}
	<CollapsibleSection title="Content Analysis & Privacy" defaultCollapsed={false}>
		<div class="space-y-4">
			{#if docData.metadata?.has_redactions !== undefined || docData.metadata?.sensitive_terms || docData.metadata?.redaction_score !== undefined}
				<div class="rounded-lg bg-neutral-50 p-3">
					<p class="text-xs font-medium text-neutral-700 mb-2">🔐 Privacy & Security Status</p>
					
					{#if docData.metadata?.has_redactions !== undefined}
						<div class="mb-2">
							<span class={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${docData.metadata?.has_redactions ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
								{docData.metadata?.has_redactions ? '🔒 Contains Redactions' : '✅ No Redactions'}
							</span>
						</div>
					{/if}

					{#if docData.metadata?.sensitive_terms && docData.metadata.sensitive_terms.length > 0}
						<div class="mb-2">
							<div class="text-xs text-neutral-600 mb-1">Sensitive Terms Detected:</div>
							<div class="flex flex-wrap gap-1">
								{#each docData.metadata.sensitive_terms.slice(0, 5) as term}
									<span class="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
										⚠️ {term}
									</span>
								{/each}
								{#if docData.metadata.sensitive_terms.length > 5}
									<span class="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
										+{docData.metadata.sensitive_terms.length - 5} more
									</span>
								{/if}
							</div>
						</div>
					{/if}

					{#if docData.metadata?.redaction_score !== undefined}
						<div>
							<div class="flex items-center justify-between text-xs text-neutral-600 mb-1">
								<span>Privacy Score:</span>
								<span class="font-medium">{formatPercentage(docData.metadata.redaction_score)}</span>
							</div>
							<div class="flex items-center space-x-2">
								<div class="flex-1 bg-neutral-200 rounded-full h-2">
									<div 
										class={`h-2 rounded-full ${docData.metadata.redaction_score > 0.7 ? 'bg-red-500' : docData.metadata.redaction_score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}
										style="width: {formatPercentage(docData.metadata.redaction_score).replace('%', '')}%"
									></div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			{#if docData.metadata?.classification_confidence !== undefined}
				<div>
					<p class="text-xs text-neutral-500">AI Classification Confidence</p>
					<div class="flex items-center space-x-2">
						<div class="flex-1 bg-neutral-200 rounded-full h-2">
							<div 
								class="bg-blue-600 h-2 rounded-full" 
								style="width: {formatPercentage(docData.metadata.classification_confidence).replace('%', '')}%"
							></div>
						</div>
						<span class="text-sm font-medium text-neutral-800">{formatPercentage(docData.metadata.classification_confidence)}</span>
					</div>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.extraction_method)}
				<div>
					<p class="text-xs text-neutral-500">Text Extraction Method</p>
					<span class="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
						{docData.metadata?.extraction_method}
					</span>
				</div>
			{/if}
		</div>
	</CollapsibleSection>
{/if}