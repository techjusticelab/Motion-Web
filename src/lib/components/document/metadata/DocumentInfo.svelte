<!-- DocumentInfo.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		formatDocumentType, 
		isEmptyValue 
	} from '$lib/utils/utils';
	import type { Document } from '$lib/types';
	import CollapsibleSection from './CollapsibleSection.svelte';

	const {
		docData
	}: {
		docData?: Document | null;
	} = $props();

	const dispatch = createEventDispatcher<{
		search: {
			field: string;
			value: string;
		};
	}>();

	function createSearchForField(field: string, value: string) {
		if (!value) return;
		dispatch('search', { field, value });
	}
</script>

{#if docData}
	<CollapsibleSection title="Document Information" defaultCollapsed={false}>
		<div class="space-y-3">
			<div>
				<p class="text-xs text-neutral-500">Document Name</p>
				<p class="text-sm font-medium text-neutral-800">{docData.metadata?.document_name || docData.file_name || 'Untitled Document'}</p>
			</div>

			{#if !isEmptyValue(docData.metadata?.subject)}
				<div>
					<p class="text-xs text-neutral-500">Subject</p>
					<p class="text-sm font-medium text-neutral-800">{docData.metadata?.subject}</p>
				</div>
			{/if}

			<div>
				<p class="text-xs text-neutral-500">Document Type</p>
				<span class="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
					{formatDocumentType(docData.doc_type)}
				</span>
			</div>

			{#if !isEmptyValue(docData.metadata?.summary)}
				<div>
					<p class="text-xs text-neutral-500">Summary</p>
					<p class="mt-1 text-sm text-neutral-700 leading-relaxed">{docData.metadata.summary}</p>
				</div>
			{/if}

			{#if docData.metadata?.legal_tags && docData.metadata.legal_tags.length > 0}
				<div>
					<p class="text-xs text-neutral-500">Legal Tags</p>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each docData.metadata?.legal_tags || [] as tag}
							<button
								type="button"
								onclick={() => createSearchForField('legal_tags', tag)}
								class="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800 hover:bg-neutral-200 transition-colors"
							>
								{tag}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if docData.metadata?.authorities}
				<div>
					<p class="text-xs text-neutral-500">Authorities</p>
					<div class="mt-1 flex flex-wrap gap-1">
						{#if Array.isArray(docData.metadata.authorities)}
							{#each docData.metadata.authorities as authority}
								<span class="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
									{typeof authority === 'object' ? authority.citation || authority.case_title : authority}
								</span>
							{/each}
						{:else}
							<span class="text-sm font-medium text-neutral-800">
								{typeof docData.metadata.authorities === 'object' ? JSON.stringify(docData.metadata.authorities) : docData.metadata.authorities}
							</span>
						{/if}
					</div>
				</div>
			{/if}

			{#if docData.metadata?.charges && Array.isArray(docData.metadata.charges) && docData.metadata.charges.length > 0}
				<div>
					<p class="text-xs text-neutral-500">Charges</p>
					<div class="mt-1 space-y-1">
						{#each docData.metadata.charges as charge}
							<div class="text-sm">
								<span class="font-medium text-neutral-800">{charge.statute}</span>
								{#if charge.description}
									<div class="text-xs text-neutral-600">{charge.description}</div>
								{/if}
								{#if charge.grade || charge.class}
									<div class="text-xs text-neutral-500">
										{charge.grade ? `Grade: ${charge.grade}` : ''}
										{charge.class ? `Class: ${charge.class}` : ''}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if docData.metadata?.sensitive_terms && docData.metadata.sensitive_terms.length > 0}
				<div>
					<p class="text-xs text-neutral-500">Sensitive Terms</p>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each docData.metadata?.sensitive_terms || [] as term}
							<span class="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
								{term}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</CollapsibleSection>
{/if}