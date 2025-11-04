<!-- CaseInfo.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		formatPersonName, 
		formatCourtName, 
		formatCaseInfo, 
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

{#if docData && (docData.metadata?.case || docData.metadata?.case_number || docData.metadata?.case_name || docData.metadata?.court || docData.metadata?.judge)}
	<CollapsibleSection title="Case & Legal Information" defaultCollapsed={false}>
		<div class="space-y-3">
			{#if docData.metadata?.case || docData.metadata?.case_number || docData.metadata?.case_name}
				{@const caseInfo = formatCaseInfo(docData.metadata?.case)}
				
				{#if !isEmptyValue(caseInfo.number) || !isEmptyValue(docData.metadata?.case_number)}
					<div>
						<p class="text-xs text-neutral-500">Case Number</p>
						<button
							type="button"
							onclick={() => createSearchForField('case_number', caseInfo.number || docData.metadata?.case_number)}
							class="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
						>
							{caseInfo.number || docData.metadata?.case_number}
						</button>
					</div>
				{/if}

				{#if !isEmptyValue(caseInfo.name) || !isEmptyValue(docData.metadata?.case_name)}
					<div>
						<p class="text-xs text-neutral-500">Case Name</p>
						<button
							type="button"
							onclick={() => createSearchForField('case_name', caseInfo.name || docData.metadata?.case_name)}
							class="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
						>
							{caseInfo.name || docData.metadata?.case_name}
						</button>
					</div>
				{/if}
			{/if}

			{#if !isEmptyValue(docData.metadata?.court)}
				<div>
					<p class="text-xs text-neutral-500">Court</p>
					<button
						type="button"
						onclick={() => createSearchForField('court', formatCourtName(docData.metadata?.court))}
						class="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
					>
						{formatCourtName(docData.metadata?.court)}
					</button>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.judge)}
				<div>
					<p class="text-xs text-neutral-500">Judge</p>
					<button
						type="button"
						onclick={() => createSearchForField('judge', formatPersonName(docData.metadata?.judge))}
						class="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
					>
						{formatPersonName(docData.metadata?.judge)}
					</button>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.author)}
				<div>
					<p class="text-xs text-neutral-500">Author</p>
					<button
						type="button"
						onclick={() => createSearchForField('author', docData.metadata?.author)}
						class="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
					>
						{docData.metadata?.author}
					</button>
				</div>
			{/if}

			{#if !isEmptyValue(docData.metadata?.status)}
				<div>
					<p class="text-xs text-neutral-500">Status</p>
					<span class="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
						{docData.metadata?.status}
					</span>
				</div>
			{/if}

			{#if docData.metadata?.parties && Array.isArray(docData.metadata.parties) && docData.metadata.parties.length > 0}
				<div>
					<p class="text-xs text-neutral-500">Parties</p>
					<div class="mt-1 space-y-2">
						{#each docData.metadata.parties as party}
							<div class="text-sm">
								<div class="font-medium text-neutral-800 break-words">{party.name}</div>
								{#if party.role}
									<div class="text-xs text-neutral-500 mt-0.5">{party.role}</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if docData.metadata?.attorneys && Array.isArray(docData.metadata.attorneys) && docData.metadata.attorneys.length > 0}
				<div>
					<p class="text-xs text-neutral-500">Attorneys</p>
					<div class="mt-1 space-y-2">
						{#each docData.metadata.attorneys as attorney}
							<div class="text-sm">
								<div class="font-medium text-neutral-800 break-words">{attorney.name}</div>
								{#if attorney.role}
									<div class="text-xs text-neutral-500 mt-0.5">{attorney.role}</div>
								{/if}
								{#if attorney.organization}
									<div class="text-xs text-neutral-500 mt-0.5 break-words">{attorney.organization}</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</CollapsibleSection>
{/if}