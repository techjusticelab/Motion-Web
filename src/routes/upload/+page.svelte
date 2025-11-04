<script lang="ts">
	import { 
		uploadAndClassifyDocument,
		updateDocumentMetadata, 
		createRedactedDocument, 
		analyzeRedactionsOnly,
		type Document
	} from '$lib/api';
	import { 
		FileDropzone, 
		MetadataEditor, 
		RedactionAnalyzer,
		UploadedDocumentsList,
		UploadControls
	} from '$lib/components/upload';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { data } = $props();
	let { session, user, supabase } = $derived(data);

	// File upload state
	let selectedFile = $state<File | null>(null);
	let uploadStatus = $state('');
	let documentResponse = $state<Document | null>(null);
	let uploadedDocuments = $state<Array<{ name: string; type: string; response: Document }>>([]);
	let isUploading = $state(false);
	let isUpdatingMetadata = $state(false);

	// Redaction state
	let redactionAnalysis = $state<any>(null);
	let showRedactionResults = $state(false);
	let isCreatingRedactedDocument = $state(false);


	// Handle file selection from dropzone
	function handleFileSelected(event: CustomEvent<{ file: File }>) {
		selectedFile = event.detail.file;
		uploadStatus = '';
	}

	// Handle file upload with new dry classification endpoint
	async function handleFileUpload() {
		if (!selectedFile) {
			uploadStatus = 'Please select a file to upload.';
			return;
		}

		isUploading = true;
		uploadStatus = 'Uploading and classifying document...';

		try {
			const response = await uploadAndClassifyDocument(selectedFile, session);
			documentResponse = response.document;

			// Handle redaction analysis if present
			if (response.redaction_analysis) {
				redactionAnalysis = response.redaction_analysis;
				showRedactionResults = true;
				uploadStatus = `Document uploaded successfully! Found ${response.redaction_analysis.redactions_found} potential redactions.`;
			} else {
				uploadStatus = 'Document uploaded and saved to storage successfully!';
			}

			// Add to uploaded documents list
			uploadedDocuments = [
				...uploadedDocuments,
				{
					name: selectedFile.name,
					type: selectedFile.type,
					response: response.document
				}
			];

			// Clear the selected file
			selectedFile = null;
		} catch (error) {
			uploadStatus = 'Failed to upload document. Please try again.';
			console.error(error);
		} finally {
			isUploading = false;
		}
	}

	// Handle redaction-only test
	async function handleRedactionOnlyTest() {
		if (!selectedFile) {
			uploadStatus = 'Please select a PDF file to test redaction.';
			return;
		}

		if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
			uploadStatus = 'Only PDF files can be analyzed for redactions.';
			return;
		}

		isUploading = true;
		uploadStatus = 'Analyzing PDF for sensitive information...';

		try {
			const response = await analyzeRedactionsOnly(selectedFile, session);

			if (response.redaction_analysis) {
				redactionAnalysis = response.redaction_analysis;
				showRedactionResults = true;
				uploadStatus = `Redaction analysis completed! Found ${response.redaction_analysis.redactions_found} potential redactions.`;
			} else {
				uploadStatus = 'Redaction analysis completed - no sensitive information detected.';
			}
		} catch (error) {
			uploadStatus = 'Failed to analyze document for redactions. Please try again.';
			console.error('Error analyzing redactions:', error);
		} finally {
			isUploading = false;
		}
	}

	// Handle document selection from list
	function handleDocumentSelected(event: CustomEvent<{ document: Document }>) {
		documentResponse = event.detail.document;
	}

	// Handle metadata save
	function handleMetadataSave(event: CustomEvent<{ documentId: string; metadata: any }>) {
		const { documentId, metadata } = event.detail;
		saveMetadata(documentId, metadata);
	}

	// Save metadata
	async function saveMetadata(documentId: string, metadata: any) {
		try {
			isUpdatingMetadata = true;
			await updateDocumentMetadata(documentId, metadata, session);

			// Update the document in our list
			uploadedDocuments = uploadedDocuments.map((doc) => {
				if (doc.response.id === documentId) {
					return {
						...doc,
						response: { ...doc.response, metadata }
					};
				}
				return doc;
			});

			// Update current document response
			if (documentResponse && documentResponse.id === documentId) {
				documentResponse = { ...documentResponse, metadata };
			}

			uploadStatus = 'Document metadata updated successfully!';
		} catch (error) {
			uploadStatus = 'Failed to update document metadata. Please try again.';
			console.error(error);
		} finally {
			isUpdatingMetadata = false;
		}
	}

	// Handle creating redacted document
	async function handleCreateRedactedDocument(event: CustomEvent<{ documentId: string }>) {
		const { documentId } = event.detail;
		
		isCreatingRedactedDocument = true;
		uploadStatus = 'Creating redacted document...';

		try {
			await createRedactedDocument(documentId, true, session);
			uploadStatus = 'Redacted document created successfully!';
		} catch (error) {
			uploadStatus = 'Failed to create redacted document. Please try again.';
			console.error('Error creating redacted document:', error);
		} finally {
			isCreatingRedactedDocument = false;
		}
	}


	// Clear uploaded documents
	function handleClearDocuments() {
		uploadedDocuments = [];
		documentResponse = null;
		uploadStatus = 'Documents cleared.';
	}

	// Clear selected file
	function handleClearFile() {
		selectedFile = null;
		uploadStatus = '';
	}
</script>

<div class="flex min-h-[80vh] items-center justify-center p-4">
	<div
		class="w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-xl"
		in:fly={{ y: 30, duration: 800, easing: quintOut }}
	>
		<div class="flex flex-col lg:flex-row">
			<!-- Left Panel: Metadata Editor and Redaction Analysis -->
			{#if documentResponse}
				<div
					class="w-full border-r border-neutral-200 bg-neutral-50 p-6 lg:w-2/5"
					in:fly={{ x: -20, duration: 700, easing: quintOut }}
				>
					<MetadataEditor
						document={documentResponse}
						isUpdating={isUpdatingMetadata}
						on:save={handleMetadataSave}
					/>

					{#if false}
						<!-- Redaction functionality temporarily disabled -->
						<RedactionAnalyzer
							analysis={redactionAnalysis}
							documentId={documentResponse?.id}
							isCreatingRedacted={isCreatingRedactedDocument}
							visible={showRedactionResults}
							class="mt-6"
							on:createRedacted={handleCreateRedactedDocument}
							on:dismiss={() => showRedactionResults = false}
						/>
					{/if}
				</div>
			{/if}

			<!-- Right Panel: Upload Interface -->
			<div
				class="w-full {documentResponse ? 'lg:w-3/5' : 'lg:w-full'} p-6"
				in:fly={{
					x: documentResponse ? 20 : 0,
					duration: 700,
					delay: documentResponse ? 100 : 0,
					easing: quintOut
				}}
			>
				<h1 class="mb-6 text-center text-2xl font-bold text-primary-800">
					Upload Document
				</h1>

				<!-- File Dropzone -->
				<div class="mb-6">
					<FileDropzone
						on:fileSelected={handleFileSelected}
						disabled={isUploading}
					/>
				</div>

				<!-- Upload Controls -->
				<UploadControls
					{selectedFile}
					{isUploading}
					{uploadStatus}
					on:upload={handleFileUpload}
					on:redactionTest={handleRedactionOnlyTest}
					on:clearFile={handleClearFile}
					disableRedaction={true}
					class="mb-6"
				/>


				<!-- Uploaded Documents List -->
				{#if uploadedDocuments.length > 0}
					<div in:fade={{ duration: 300, delay: 200 }}>
						<UploadedDocumentsList
							documents={uploadedDocuments}
							currentDocument={documentResponse}
							on:documentSelected={handleDocumentSelected}
							on:clearDocuments={handleClearDocuments}
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>