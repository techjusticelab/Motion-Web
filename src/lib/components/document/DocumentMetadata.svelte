<!-- DocumentMetadata.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Document } from '$lib/types';
	import DocumentInfo from './metadata/DocumentInfo.svelte';
	import CaseInfo from './metadata/CaseInfo.svelte';
	import ContentAnalysis from './metadata/ContentAnalysis.svelte';
	import DocumentProperties from './metadata/DocumentProperties.svelte';

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

	function handleSearch(event: CustomEvent<{ field: string; value: string }>) {
		dispatch('search', event.detail);
	}
</script>

{#if docData}
	<div class="space-y-4 overflow-hidden">
		<h3 class="text-sm font-medium text-neutral-700">Document Details</h3>

		<DocumentInfo {docData} on:search={handleSearch} />
		<CaseInfo {docData} on:search={handleSearch} />
		<ContentAnalysis {docData} />
		<DocumentProperties {docData} />
	</div>
{/if}