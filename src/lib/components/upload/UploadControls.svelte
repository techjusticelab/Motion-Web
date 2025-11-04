<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button, LoadingSpinner } from '$lib/components/ui';
	import { fly, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	const dispatch = createEventDispatcher();

	interface Props {
		selectedFile: File | null;
		isUploading: boolean;
		uploadStatus: string;
		showRedactionTest?: boolean;
		disableRedaction?: boolean;
		class?: string;
	}

	let {
		selectedFile = null,
		isUploading = false,
		uploadStatus = '',
		showRedactionTest = true,
		disableRedaction = false,
		class: className = ''
	}: Props = $props();

	// Handle upload
	function handleUpload() {
		dispatch('upload');
	}

	// Handle redaction test
	function handleRedactionTest() {
		dispatch('redactionTest');
	}

	// Clear selected file
	function clearFile() {
		dispatch('clearFile');
	}

	// Get status styling
	function getStatusStyling(status: string): string {
		if (status.toLowerCase().includes('error') || status.toLowerCase().includes('failed')) {
			return 'bg-red-50 text-red-700 border-red-200';
		}
		if (status.toLowerCase().includes('success') || status.toLowerCase().includes('completed')) {
			return 'bg-green-50 text-green-700 border-green-200';
		}
		return 'bg-blue-50 text-blue-700 border-blue-200';
	}
</script>

<div class="space-y-4 {className}">
	<!-- Upload Status -->
	{#if uploadStatus}
		<div 
			class="rounded-lg border p-3 text-sm {getStatusStyling(uploadStatus)}"
			in:fly={{ y: -10, duration: 300 }}
		>
			<div class="flex items-center space-x-2">
				{#if isUploading}
					<LoadingSpinner size="sm" />
				{:else if uploadStatus.toLowerCase().includes('success') || uploadStatus.toLowerCase().includes('completed')}
					<svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
				{:else if uploadStatus.toLowerCase().includes('error') || uploadStatus.toLowerCase().includes('failed')}
					<svg class="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				{:else}
					<svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
				{/if}
				<span>{uploadStatus}</span>
			</div>
		</div>
	{/if}

	<!-- Action Buttons -->
	{#if selectedFile}
		<div 
			class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
			in:scale={{ start: 0.95, duration: 400, easing: backOut }}
		>
			<!-- Main Upload Button -->
			<Button
				onclick={handleUpload}
				disabled={isUploading}
				loading={isUploading}
				class="flex-1"
			>
				{#if isUploading}
					Processing...
				{:else}
					Upload & Categorize Document
				{/if}
			</Button>

			<!-- Redaction Test Button (for PDFs) - Temporarily Disabled -->
			{#if showRedactionTest && !disableRedaction && selectedFile.name.toLowerCase().endsWith('.pdf')}
				<Button
					variant="secondary"
					onclick={handleRedactionTest}
					disabled={isUploading}
					class="sm:w-auto"
				>
					Test Redaction Only
				</Button>
			{/if}

			<!-- Clear File Button -->
			<Button
				variant="outline"
				onclick={clearFile}
				disabled={isUploading}
				class="sm:w-auto"
			>
				Clear File
			</Button>
		</div>

		<!-- File Info Summary -->
		<div class="text-center">
			<p class="text-sm text-neutral-600">
				Ready to process: <span class="font-medium">{selectedFile.name}</span>
			</p>
			<p class="text-xs text-neutral-500">
				{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
			</p>
		</div>
	{:else}
		<!-- No file selected state -->
		<div class="text-center py-4">
			<p class="text-sm text-neutral-500">
				Select a file to begin processing
			</p>
		</div>
	{/if}

	<!-- Processing Indicator -->
	{#if isUploading}
		<div 
			class="flex items-center justify-center space-x-2 py-4"
			in:fly={{ y: 10, duration: 300 }}
		>
			<LoadingSpinner size="md" />
			<span class="text-sm text-neutral-600">
				Processing your document...
			</span>
		</div>
	{/if}

	<!-- Help Text -->
	{#if !selectedFile && !isUploading}
		<div class="text-center space-y-2">
			<p class="text-xs text-neutral-400">
				Supported formats: PDF, DOCX, TXT
			</p>
			<p class="text-xs text-neutral-400">
				Maximum file size: 50MB
			</p>
		</div>
	{/if}
</div>