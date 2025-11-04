<script lang="ts">
	import { fade, fly, slide, scale } from 'svelte/transition';
	import { quintOut, elasticOut, cubicOut, backOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import AccountStats from './AccountStats.svelte';

	let { 
		user, 
		userDetails, 
		isLoadingUserDetails, 
		isInitialLoad, 
		cases,
		documentStats,
		totalDocuments,
		isLoadingStorage,
		onEditProfile, 
		onSignOut,
		onRefreshStorage
	} = $props();

	function getUserDisplayName() {
		if (!userDetails) return 'User';

		const metadata = userDetails.user_metadata;
		if (!metadata) return 'User';

		return (
			metadata.full_name || metadata.name || metadata.display_name || userDetails.email || 'User'
		);
	}
</script>

<div
	class="w-full border-r border-neutral-200 bg-neutral-50 p-6 md:w-2/5"
	in:fly={{ x: -20, duration: 700, easing: quintOut, delay: isInitialLoad ? 100 : 0 }}
>
	<h2
		class="mb-4 text-xl font-semibold text-neutral-800"
		in:slide={{ duration: 500, delay: isInitialLoad ? 200 : 0 }}
	>
		Account Information
	</h2>

	<!-- User profile card -->
	<div class="mb-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm">
		<div class="flex items-center">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600"
				in:scale={{
					start: 0.9,
					duration: 600,
					delay: isInitialLoad ? 300 : 0,
					easing: elasticOut
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			</div>
			<div class="ml-4" in:slide={{ duration: 500, delay: isInitialLoad ? 400 : 0 }}>
				<h3 class="text-lg font-medium text-neutral-800">
					{user?.email || 'User'}
				</h3>
				<p class="text-sm text-neutral-500">
					{isLoadingUserDetails ? 'Loading details...' : getUserDisplayName()}
				</p>
			</div>
		</div>
	</div>

	<AccountStats 
		{cases} 
		{documentStats} 
		{totalDocuments} 
		{isLoadingStorage} 
		{isInitialLoad}
		{onRefreshStorage}
	/>

	<!-- Account actions -->
	<div class="space-y-3" in:slide={{ duration: 500, delay: isInitialLoad ? 900 : 0 }}>
		<h3 class="text-md font-semibold text-neutral-700">Account Actions</h3>
		<button
			onclick={onEditProfile}
			class="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-white p-3 text-left text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
		>
			<span class="flex items-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-5 w-5 text-neutral-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
					/>
				</svg>
				Edit Profile
			</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-neutral-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
		</button>
		<button
			onclick={() => goto('/auth/reset')}
			class="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-white p-3 text-left text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
		>
			<span class="flex items-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-5 w-5 text-neutral-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				Change Password
			</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-neutral-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
		</button>
		<button
			onclick={onSignOut}
			class="flex w-full items-center justify-between rounded-lg border border-red-200 bg-white p-3 text-left text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
		>
			<span class="flex items-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					/>
				</svg>
				Sign Out
			</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>
</div>