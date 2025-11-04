<script lang="ts">
	import { page } from '$app/stores';
	import { CaseManager, type Case, type CaseDocument } from '$lib/supabase';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import DocumentViewer from '$lib/components/document/DocumentViewer.svelte';
	import CaseHeader from '$lib/components/case-detail/CaseHeader.svelte';
	import DocumentList from '$lib/components/case-detail/DocumentList.svelte';
	import EditCaseModal from '$lib/components/case-detail/EditCaseModal.svelte';
	import AddDocumentModal from '$lib/components/case-detail/AddDocumentModal.svelte';
	import DocumentNotesPanel from '$lib/components/case-detail/DocumentNotesPanel.svelte';
	import LoadingStates from '$lib/components/case-detail/LoadingStates.svelte';
	import CaseNotFound from '$lib/components/case-detail/CaseNotFound.svelte';
	import type { Document } from '$lib/api';
	import * as api from '$lib/api';

	let { data } = $props();
	let { session, user, supabase } = $derived(data);

	// Get case ID from URL
	let caseId = $derived($page.params.caseId);

	// Flag to control animations after initial page load
	let isInitialLoad = $state(true);

	// Case data
	let currentCase = $state<Case | null>(null);
	let caseDocuments = $state<CaseDocument[]>([]);
	let caseManager: CaseManager;
	let isLoadingCase = $state(true);
	let isLoadingDocuments = $state(true);

	// Edit case modal
	let showEditCaseModal = $state(false);
	let editCaseName = $state('');
	let isUpdatingCase = $state(false);

	// Add document modal
	let showAddDocumentModal = $state(false);
	let selectedDocumentId = $state('');
	let documentNotes = $state('');
	let isAddingDocument = $state(false);

	// Document viewer
	let activeDocument = $state<Document | null>(null);
	let showDocumentViewer = $state(false);
	let documentDetails = $state<Map<string, Document>>(new Map());

	// Notes side panel state for viewer
	let activeCaseDoc: CaseDocument | null = $state(null);
	let showNotesPanel = $state(false);
	let notesText = $state('');
	let isSavingNotes = $state(false);
	let saveMessage = $state('');

	onMount(() => {
		console.log('Case detail page mounted', { user: !!user, caseId });
		caseManager = new CaseManager(supabase);

		// Set initial load to false after the first render
		setTimeout(() => {
			isInitialLoad = false;
		}, 100);

		// If user is logged in, load case data
		if (user && caseId) {
			console.log('Loading case data for:', caseId);
			loadCaseData();
		} else {
			console.log('No session or caseId, stopping loading');
			// If no session or caseId, stop loading
			isLoadingCase = false;
			isLoadingDocuments = false;
		}
	});

	// Load case data
	async function loadCaseData() {
		console.log('loadCaseData called', { user: !!user, caseId });
		if (!user || !caseId) {
			console.log('No session or caseId in loadCaseData');
			isLoadingCase = false;
			isLoadingDocuments = false;
			return;
		}
		
		console.log('Setting loading states to true');
		isLoadingCase = true;
		isLoadingDocuments = true;
		
		try {
			console.log('Starting to load case data...');
			// Load case details and documents
			const userCases = await caseManager.getUserCases(user.id);
			currentCase = userCases.find(c => c.id === caseId) || null;
			caseDocuments = await caseManager.getCaseDocuments(caseId);
			console.log('Data loaded', { userCases: userCases.length, documents: caseDocuments.length });

			// Preload document details for better UX (run in background)
			if (caseDocuments.length > 0) {
				preloadDocumentDetails(caseDocuments).catch(error =>
					console.error('Error preloading document details:', error)
				);
			}

			// If case not found, set current case to null but don't redirect
			// Let the template handle showing the "not found" state
			if (!currentCase) {
				console.log('Case not found:', caseId);
			} else {
				console.log('Case found:', currentCase.case_name);
			}

		} catch (error) {
			console.error('Error loading case data:', error);
			// Set currentCase to null so the "not found" state is shown
			currentCase = null;
			caseDocuments = [];
		} finally {
			console.log('Setting loading states to false');
			isLoadingCase = false;
			isLoadingDocuments = false;
		}
	}

	// Open edit case modal
	function openEditCaseModal() {
		if (!currentCase) return;
		editCaseName = currentCase.case_name;
		showEditCaseModal = true;
	}

	// Close edit case modal
	function closeEditCaseModal() {
		showEditCaseModal = false;
		editCaseName = '';
	}

	// Update case name
	async function updateCaseName() {
		if (!currentCase || !editCaseName.trim()) return;
		
		isUpdatingCase = true;
		try {
			const success = await caseManager.updateCaseName(currentCase.id, editCaseName.trim());
			if (success && currentCase) {
				currentCase.case_name = editCaseName.trim();
				closeEditCaseModal();
			}
		} catch (error) {
			console.error('Error updating case:', error);
		} finally {
			isUpdatingCase = false;
		}
	}

	// Open add document modal
	function openAddDocumentModal() {
		selectedDocumentId = '';
		documentNotes = '';
		showAddDocumentModal = true;
	}

	// Close add document modal
	function closeAddDocumentModal() {
		showAddDocumentModal = false;
		selectedDocumentId = '';
		documentNotes = '';
	}

	// Add document to case
	async function addDocumentToCase() {
		if (!caseId || !selectedDocumentId.trim()) return;
		
		isAddingDocument = true;
		try {
			const caseDocument = await caseManager.addDocumentToCase(
				caseId, 
				selectedDocumentId.trim(), 
				documentNotes.trim() || undefined
			);
			if (caseDocument) {
				caseDocuments = [caseDocument, ...caseDocuments];
				closeAddDocumentModal();
			}
		} catch (error) {
			console.error('Error adding document to case:', error);
		} finally {
			isAddingDocument = false;
		}
	}

	// Remove document from case
	async function removeDocumentFromCase(caseDocumentId: string) {
		if (!confirm('Are you sure you want to remove this document from the case?')) return;
		
		const success = await caseManager.removeDocumentFromCase(caseDocumentId);
		if (success) {
			caseDocuments = caseDocuments.filter(d => d.id !== caseDocumentId);
		}
	}

	// Delete entire case
	async function deleteCase() {
		if (!currentCase) return;
		if (!confirm('Are you sure you want to delete this case and all its documents?')) return;
		
		const success = await caseManager.deleteCase(currentCase.id);
		if (success) {
			goto('/cases');
		}
	}

    // Extract a likely PDF filename from an index/supabase ID
    function getPdfNameFromId(id: string): string | null {
        if (!id) return null;
        const lastSeg = id.split('/').pop() || id;
        const m = lastSeg.match(/^doc_[^_]+_(.+\.(pdf|PDF))$/);
        if (m && m[1]) return m[1];
        if (/\.(pdf|PDF)$/.test(lastSeg)) return lastSeg;
        return null;
    }

	// Open viewer for a specific CaseDocument (includes notes)
	async function openDocumentViewer(caseDoc: CaseDocument) {
		const documentId = caseDoc.document_ids;
		activeCaseDoc = caseDoc;
		notesText = caseDoc.notes || '';
		showNotesPanel = false;
		console.log('Opening document viewer for CaseDocument:', { documentId, caseDocId: caseDoc.id });

		// Cache first
		const cached = documentDetails.get(documentId);
		if (cached) {
			activeDocument = cached;
			showDocumentViewer = true;
			return;
		}

		try {
			// Prefer resolving by PDF filename (aligns with / search page flow)
			const pdfName = getPdfNameFromId(documentId);
			if (pdfName) {
				const minimalDoc: Document = {
					id: documentId,
					file_name: pdfName,
					file_path: '', // keep empty so viewer uses search-by-name flow
					doc_type: 'unknown',
					text: '',
					created_at: new Date().toISOString(),
					metadata: {
						document_name: pdfName,
						subject: '',
						processed_at: new Date().toISOString(),
						ai_classified: false
					} as any
				} as any;
				documentDetails.set(documentId, minimalDoc);
				activeDocument = minimalDoc;
				showDocumentViewer = true;
				return;
			}

			// If no PDF name can be derived, try fetching by ID from backend
			try {
				const fullDoc = await api.getDocument(documentId, session);
				if (fullDoc) {
					documentDetails.set(documentId, fullDoc);
					activeDocument = fullDoc;
					showDocumentViewer = true;
					return;
				}
			} catch (e) {
				console.warn('getDocument by ID failed and no PDF name found for search fallback', e);
			}

			// Last resort: minimal placeholder with ID
			const fallbackDoc: Document = {
				id: documentId,
				file_name: documentId,
				file_path: '',
				doc_type: 'unknown',
				text: '',
				created_at: new Date().toISOString(),
				metadata: {
					document_name: documentId,
					subject: '',
					processed_at: new Date().toISOString(),
					ai_classified: false
				} as any
			} as any;
			documentDetails.set(documentId, fallbackDoc);
			activeDocument = fallbackDoc;
			showDocumentViewer = true;
		} catch (error) {
			console.error('Error fetching document details:', error);
		}
	}

	// Close document viewer
	function closeDocumentViewer() {
		activeDocument = null;
		showDocumentViewer = false;
		activeCaseDoc = null;
		showNotesPanel = false;
	}

	// Save notes for the active case document
	async function saveNotes() {
		if (!activeCaseDoc) return;
		isSavingNotes = true;
		saveMessage = '';
		try {
			const ok = await caseManager.updateDocumentNotes(activeCaseDoc.id, notesText.trim());
			if (ok) {
				// Reflect changes in local list
				caseDocuments = caseDocuments.map((d) => d.id === activeCaseDoc!.id ? { ...d, notes: notesText.trim() } : d);
				saveMessage = 'Saved';
				setTimeout(() => (saveMessage = ''), 1500);
			}
		} catch (e) {
			console.error('Error saving notes:', e);
		} finally {
			isSavingNotes = false;
		}
	}

	// Preload document details for all case documents
	async function preloadDocumentDetails(caseDocuments: CaseDocument[]) {
		console.log('Preloading document details for', caseDocuments.length, 'documents');

		for (const caseDoc of caseDocuments) {
			try {
				// Try to search for the document to get full details
				const searchResults = await api.searchDocuments({
					query: caseDoc.document_ids,
					size: 5
				}, session);

				// Look for a matching document
				const matchedDocument = searchResults.hits.find(doc =>
					doc.id === caseDoc.document_ids ||
					doc.file_url?.includes(caseDoc.document_ids) ||
					doc.s3_uri?.includes(caseDoc.document_ids) ||
					doc.file_name?.includes(caseDoc.document_ids)
				);

				if (matchedDocument) {
					documentDetails.set(caseDoc.document_ids, matchedDocument);
					console.log('Preloaded details for document:', caseDoc.document_ids);
				} else {
					console.log('Could not find details for document:', caseDoc.document_ids);
				}
			} catch (error) {
				console.error('Error preloading document details for', caseDoc.document_ids, ':', error);
			}
		}
	}

	// Handle keydown for modal escape
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (showEditCaseModal) {
				closeEditCaseModal();
			} else if (showAddDocumentModal) {
				closeAddDocumentModal();
			} else if (showDocumentViewer) {
				closeDocumentViewer();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-neutral-50 py-8">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<LoadingStates {isLoadingCase} />
		
		{#if !isLoadingCase && currentCase}
			<CaseHeader 
				{currentCase}
				{isInitialLoad}
				onOpenAddDocumentModal={openAddDocumentModal}
				onOpenEditCaseModal={openEditCaseModal}
				onDeleteCase={deleteCase}
			/>

			<DocumentList 
				{caseDocuments}
				{currentCase}
				{isLoadingDocuments}
				{isInitialLoad}
				{documentDetails}
				onOpenDocumentViewer={openDocumentViewer}
				onRemoveDocumentFromCase={removeDocumentFromCase}
				onOpenAddDocumentModal={openAddDocumentModal}
			/>
		{:else if !isLoadingCase && !currentCase}
			<CaseNotFound />
		{/if}
	</div>
</div>

<EditCaseModal 
	{showEditCaseModal}
	bind:editCaseName
	{isUpdatingCase}
	onCloseEditCaseModal={closeEditCaseModal}
	onUpdateCaseName={updateCaseName}
/>

<AddDocumentModal 
	{showAddDocumentModal}
	bind:selectedDocumentId
	bind:documentNotes
	{isAddingDocument}
	onCloseAddDocumentModal={closeAddDocumentModal}
	onAddDocumentToCase={addDocumentToCase}
/>

<!-- Document Viewer -->
<DocumentViewer
	docData={activeDocument}
	isOpen={showDocumentViewer}
	{supabase}
	{session}
	{user}
	toggleNotes={() => (showNotesPanel = !showNotesPanel)}
	onclose={closeDocumentViewer}
/>

{#if showDocumentViewer && activeCaseDoc}
	<DocumentNotesPanel 
		{showNotesPanel}
		{activeCaseDoc}
		{documentDetails}
		bind:notesText
		{isSavingNotes}
		{saveMessage}
		onCloseNotesPanel={() => (showNotesPanel = false)}
		onSaveNotes={saveNotes}
	/>
{/if}