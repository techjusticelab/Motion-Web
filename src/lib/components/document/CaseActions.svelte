<!-- CaseActions.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Document } from '$lib/types';
	import { CaseManager, type Case } from '$lib/supabase';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { useModal } from '$lib/composables/useModal.svelte';
	import { useAsyncOperation } from '$lib/composables/useAsyncOperation';
	import { AddToCaseButton, CaseSelectionModal, NewCaseModal } from './case-actions';
	import SuccessNotification from '../shared/SuccessNotification.svelte';

	const {
		docData,
		supabase = null,
		session = null,
		user = null,
		url = ''
	}: {
		docData?: Document | null;
		supabase?: any;
		session?: any;
		user?: any;
		url?: string;
	} = $props();

	// Case management state
	let cases = $state<Case[]>([]);
	let caseManager = $state<CaseManager | null>(null);
	let selectedCaseId = $state('');
	let documentNotes = $state('');
	let newCaseName = $state('');
	let successMessage = $state('');

	// Modal management
	const addToCaseModal = useModal();
	const newCaseModal = useModal();

	// Async operations
	const { execute: executeAddToCase, isLoading: isAddingToCase } = useAsyncOperation();
	const { execute: executeCreateCase, isLoading: isCreatingCase } = useAsyncOperation();

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	onMount(async () => {
		if (supabase && user) {
			caseManager = new CaseManager(supabase);
			await caseManager.testDatabaseAccess();
			loadUserCases();
		}
	});

	// Generate a UUID v5 from document data for database compatibility
	function generateDocumentUUID(docData: Document): string {
		const identifier = docData.file_url || docData.id || docData.file_name || JSON.stringify(docData);
		let hash = 0;
		for (let i = 0; i < identifier.length; i++) {
			const char = identifier.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash;
		}
		const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
		const uuid = `${positiveHash.slice(0, 8)}-${positiveHash.slice(0, 4)}-4${positiveHash.slice(1, 4)}-8${positiveHash.slice(1, 4)}-${positiveHash}${positiveHash.slice(0, 4)}`;
		return uuid;
	}

	// Extract document ID from S3 URI or generate a consistent ID
	function getDocumentId(docData: Document): string {
		if (docData.id && docData.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
			return docData.id;
		}
		return generateDocumentUUID(docData);
	}

	// Load user's cases
	async function loadUserCases() {
		if (!caseManager || !user) return;
		try {
			cases = await caseManager.getUserCases(user.id);
		} catch (error) {
			console.error('Error loading cases:', error);
		}
	}

	// Add document to selected case
	async function addDocumentToCase() {
		if (!caseManager || !docData || !selectedCaseId) {
			return;
		}

		await executeAddToCase(async () => {
			const documentId = getDocumentId(docData);
			const result = await caseManager.addDocumentToCase(
				selectedCaseId,
				documentId,
				documentNotes.trim() || undefined
			);
			
			const selectedCase = cases.find(c => c.id === selectedCaseId);
			successMessage = `Document added to case "${selectedCase?.case_name || 'Unknown'}" successfully!`;
			
			setTimeout(() => {
				successMessage = '';
			}, 3000);
			
			addToCaseModal.close();
			selectedCaseId = '';
			documentNotes = '';
		});
	}

	// Create new case and add document
	async function createCaseAndAddDocument() {
		if (!caseManager || !user || !docData || !newCaseName.trim()) return;
		
		await executeCreateCase(async () => {
			const newCase = await caseManager.createCase(user.id, newCaseName.trim());
			if (newCase) {
				cases = [newCase, ...cases];
				const documentId = getDocumentId(docData);
				await caseManager.addDocumentToCase(newCase.id, documentId, documentNotes.trim() || undefined);
				
				successMessage = `Case "${newCase.case_name}" created and document added successfully!`;
				setTimeout(() => {
					successMessage = '';
				}, 3000);
				
				newCaseModal.close();
				newCaseName = '';
				documentNotes = '';
			}
		});
	}

	// Handle keydown for modal escape
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (addToCaseModal.isOpen) {
				addToCaseModal.close();
			} else if (newCaseModal.isOpen) {
				newCaseModal.close();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if session && supabase}
	<SuccessNotification message={successMessage} variant="success" />
	
	<!-- Case Actions -->
	<div class="m-auto flex flex-col md:flex-row justify-center gap-2 align-middle">
		<AddToCaseButton 
			onClick={() => {
				selectedCaseId = '';
				documentNotes = '';
				addToCaseModal.open();
			}} 
			variant="secondary" 
		/>
		<AddToCaseButton 
			onClick={() => {
				newCaseName = '';
				documentNotes = '';
				newCaseModal.open();
			}} 
			variant="primary" 
		/>
	</div>
	<div class="mt-2 flex justify-center">
		<a
			href={url}
			download={docData?.file_name}
			class="flex items-center text-xs text-primary-600 hover:text-primary-800 underline"
			in:scale={{ start: 0.5, duration: 300, delay: 1400, easing: cubicOut }}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-3 w-3"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			Download
		</a>
	</div>
{/if}

<CaseSelectionModal
	isOpen={addToCaseModal.isOpen}
	{cases}
	{selectedCaseId}
	{documentNotes}
	isSubmitting={isAddingToCase}
	onConfirm={addDocumentToCase}
	onCancel={() => addToCaseModal.close()}
	onCaseIdChange={(id) => selectedCaseId = id}
	onNotesChange={(notes) => documentNotes = notes}
/>

<NewCaseModal
	isOpen={newCaseModal.isOpen}
	caseName={newCaseName}
	{documentNotes}
	isSubmitting={isCreatingCase}
	onConfirm={createCaseAndAddDocument}
	onCancel={() => newCaseModal.close()}
	onCaseNameChange={(name) => newCaseName = name}
	onNotesChange={(notes) => documentNotes = notes}
/>