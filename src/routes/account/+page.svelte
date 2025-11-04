<script lang="ts">
	import { page } from '$app/stores';
	import { CaseManager, type Case } from '$lib/supabase';
	import { onMount } from 'svelte';
	import { fade, fly, slide, scale } from 'svelte/transition';
	import { invalidate, goto } from '$app/navigation';
	import { quintOut } from 'svelte/easing';
	import UserProfile from '$lib/components/account/UserProfile.svelte';
	import CaseManagement from '$lib/components/account/CaseManagement.svelte';
	import StorageManagement from '$lib/components/account/StorageManagement.svelte';
	import EditProfileModal from '$lib/components/account/EditProfileModal.svelte';
	import NewCaseModal from '$lib/components/account/NewCaseModal.svelte';
	import StatusMessage from '$lib/components/account/StatusMessage.svelte';
	import * as api from '$lib/api';

	let { data } = $props();
	let { session, user, supabase } = $derived(data);

	// Flag to control animations after initial page load
	let isInitialLoad = $state(true);

	// User data
	let isLoadingUserDetails = $state(false);
	let userDetails = $state<{ email: string; user_metadata?: any } | null>(null);
	let cases = $state<Case[]>([]);
	let showNewCaseModal = $state(false);
	let newCaseName = $state('');
	let caseManager: CaseManager;
	let caseDocuments = $page.data.caseDocuments || [];
	let isCreatingCase = $state(false);
	let updateSuccess = $state<boolean | null>(null);
	let updateMessage = $state('');

	// Edit profile modal state
	let showEditProfileModal = $state(false);
	let displayNameInput = $state('');

	// Storage management state
	let storageDocuments = $state<any[]>([]);
	let totalDocuments = $state(0);
	let isLoadingStorage = $state(false);
	let storageError = $state('');
	let documentStats = $state<any>(null);

	// Timer for success/error message
	let messageTimer: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		console.log('User session:', session);
		caseManager = new CaseManager(supabase);
		
		// Set initial load to false after the first render
		setTimeout(() => {
			isInitialLoad = false;
		}, 100);

		// Auth state change listener
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// If user is logged in, load their details
		if (user) {
			loadUserDetails();
			loadUserCases();
			loadStorageData();
		}

		return () => data.subscription.unsubscribe();
	});

	function openEditProfile() {
		// Prefill from current metadata
		displayNameInput =
			user?.user_metadata?.full_name ||
			user?.user_metadata?.name ||
			'';
		showEditProfileModal = true;
	}

	function closeEditProfile() {
		showEditProfileModal = false;
	}

	async function saveProfile() {
		try {
			updateSuccess = null;
			updateMessage = '';
			const { error } = await supabase.auth.updateUser({
				data: { full_name: displayNameInput }
			});
			if (error) throw error;
			updateSuccess = true;
			updateMessage = 'Profile updated successfully';
			await invalidate('supabase:auth');
			await loadUserDetails();
			showEditProfileModal = false;
		} catch (err: any) {
			console.error('Error updating profile:', err);
			updateSuccess = false;
			updateMessage = err?.message || 'Failed to update profile';
		} finally {
			resetUpdateStatus();
		}
	}

	async function loadUserDetails() {
		isLoadingUserDetails = true;

		try {
			// Use the authenticated user data directly
			userDetails = {
				email: user.email,
				user_metadata: user.user_metadata || {}
			};
		} catch (error) {
			console.error('Error loading user details:', error);
		} finally {
			isLoadingUserDetails = false;
		}
	}

	// Open case creation modal
	function openNewCaseModal() {
		newCaseName = '';
		showNewCaseModal = true;
	}

	// Close case creation modal
	function closeNewCaseModal() {
		showNewCaseModal = false;
		newCaseName = '';
	}

	// Reset the update status message after a delay
	function resetUpdateStatus() {
		if (messageTimer) clearTimeout(messageTimer);

		messageTimer = setTimeout(() => {
			updateSuccess = null;
			updateMessage = '';
		}, 5000); // Message disappears after 5 seconds
	}

	// Sign out function
	async function signOut() {
		try {
			// Use the dedicated logout route which handles proper session cleanup
			await goto('/auth/logout');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	// Load user's cases
	async function loadUserCases() {
		if (!user) return;
		cases = await caseManager.getUserCases(user.id);
	}

	// Create new case
	async function createCase() {
		if (!user || !newCaseName.trim()) return;
		
		isCreatingCase = true;
		try {
			const newCase = await caseManager.createCase(user.id, newCaseName.trim());
			if (newCase) {
				cases = [newCase, ...cases];
				closeNewCaseModal();
			}
		} catch (error) {
			console.error('Error creating case:', error);
		} finally {
			isCreatingCase = false;
		}
	}

	// Delete case
	async function deleteCase(caseId: string) {
		if (!confirm('Are you sure you want to delete this case and all its documents?')) return;
		
		const success = await caseManager.deleteCase(caseId);
		if (success) {
			cases = cases.filter(c => c.id !== caseId);
		}
	}

	// Load storage data
	async function loadStorageData() {
		isLoadingStorage = true;
		storageError = '';

		try {
			// Get document stats for storage overview
			documentStats = await api.getDocumentStats(session);
			
			// Get list of storage documents for management
			const storageResponse = await api.getStorageDocuments(session);
			storageDocuments = storageResponse.documents || [];
			totalDocuments = storageResponse.total || 0;
		} catch (error) {
			console.error('Error loading storage data:', error);
			storageError = 'Failed to load storage information';
		} finally {
			isLoadingStorage = false;
		}
	}

	// Delete document from storage
	async function deleteDocument(documentId: string) {
		if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
			return;
		}

		try {
			await api.deleteDocument(documentId, session);
			
			// Refresh storage data
			await loadStorageData();
			
			updateSuccess = true;
			updateMessage = 'Document deleted successfully';
			resetUpdateStatus();
		} catch (error) {
			console.error('Error deleting document:', error);
			updateSuccess = false;
			updateMessage = 'Failed to delete document';
			resetUpdateStatus();
		}
	}

	// Handle keydown for modal escape
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showNewCaseModal) {
			closeNewCaseModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex min-h-[80vh] items-center justify-center p-4">
	<!-- Main container with responsive layout -->
	<div
		class="w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-xl"
		in:fly={{ y: 30, duration: 800, easing: quintOut, delay: isInitialLoad ? 0 : 0 }}
	>
		<!-- Two column layout for user profile (left) and cases (right) -->
		<div class="flex flex-col md:flex-row">
			<!-- User profile panel (left side) -->
			<UserProfile 
				{user} 
				{userDetails} 
				{isLoadingUserDetails} 
				{isInitialLoad}
				{cases}
				{documentStats}
				{totalDocuments}
				{isLoadingStorage}
				onEditProfile={openEditProfile}
				onSignOut={signOut}
				onRefreshStorage={loadStorageData}
			/>

			<!-- Cases and Storage management (right side) -->
			<div
				class="w-full p-6 md:w-3/5"
				in:fly={{ x: 20, duration: 700, delay: isInitialLoad ? 200 : 0, easing: quintOut }}
			>
				<h1
					class="mb-6 text-center text-2xl font-bold text-primary-700"
					in:slide={{ duration: 600, delay: isInitialLoad ? 300 : 0 }}
				>
					Your Cases & Storage
				</h1>

				<StatusMessage {updateSuccess} {updateMessage} />

				<CaseManagement 
					{cases} 
					{isInitialLoad}
					onOpenNewCaseModal={openNewCaseModal}
					onDeleteCase={deleteCase}
				/>

				<StorageManagement 
					{storageDocuments} 
					{isLoadingStorage} 
					{storageError} 
					{isInitialLoad}
					onDeleteDocument={deleteDocument}
				/>
			</div>
		</div>
	</div>
</div>

<EditProfileModal 
	{showEditProfileModal} 
	{displayNameInput}
	onCloseEditProfile={closeEditProfile}
	onSaveProfile={saveProfile}
/>

<NewCaseModal 
	{showNewCaseModal} 
	{newCaseName} 
	{isCreatingCase}
	onCloseNewCaseModal={closeNewCaseModal}
	onCreateCase={createCase}
/>