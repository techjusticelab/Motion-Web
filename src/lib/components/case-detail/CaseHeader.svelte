<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Case } from '$lib/supabase';

	let { 
		currentCase,
		isInitialLoad,
		onOpenAddDocumentModal,
		onOpenEditCaseModal,
		onDeleteCase
	} = $props<{
		currentCase: Case;
		isInitialLoad: boolean;
		onOpenAddDocumentModal: () => void;
		onOpenEditCaseModal: () => void;
		onDeleteCase: () => void;
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
</script>

<div 
	class="mb-8 flex items-start justify-between"
	in:fly={{ y: -30, duration: 800, easing: quintOut, delay: isInitialLoad ? 0 : 0 }}
>
	<div>
		<nav class="mb-4">
			<a 
				href="/cases" 
				class="text-sm text-primary-600 hover:text-primary-800"
			>
				← Back to Cases
			</a>
		</nav>
		<h1 class="text-3xl font-bold text-neutral-900">{currentCase.case_name}</h1>
		<p class="mt-2 text-sm text-neutral-600">
			Created {formatDate(currentCase.created_at)} • Updated {formatDate(currentCase.updated_at)}
		</p>
	</div>
	<div class="flex space-x-3">
		<button
			onclick={onOpenAddDocumentModal}
			class="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none"
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
			Add Document
		</button>
		<button
			onclick={onOpenEditCaseModal}
			class="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
			</svg>
			Edit Case
		</button>
		<button
			onclick={onDeleteCase}
			class="inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
			</svg>
			Delete Case
		</button>
	</div>
</div>