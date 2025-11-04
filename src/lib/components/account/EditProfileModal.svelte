<script lang="ts">
	let { 
		showEditProfileModal, 
		displayNameInput, 
		onCloseEditProfile, 
		onSaveProfile 
	} = $props();
</script>

<!-- Edit Profile Modal -->
{#if showEditProfileModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onclick={onCloseEditProfile}>
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onclick={(e) => e.stopPropagation()}>
			<h3 class="text-lg font-semibold text-neutral-800 mb-4">Edit Profile</h3>
			<label class="block text-sm font-medium text-neutral-700 mb-1">Display name</label>
			<input
				type="text"
				bind:value={displayNameInput}
				placeholder="Your name"
				class="mb-4 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-900 focus:outline-none focus:ring-primary-900"
			/>
			<div class="mt-4 flex justify-end gap-2">
				<button class="rounded-md border border-neutral-300 px-4 py-2 text-sm" onclick={onCloseEditProfile}>Cancel</button>
				<button class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700" onclick={onSaveProfile}>Save</button>
			</div>
		</div>
	</div>
{/if}