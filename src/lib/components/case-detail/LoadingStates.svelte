<script lang="ts">
	let { 
		isLoadingCase 
	} = $props<{
		isLoadingCase: boolean;
	}>();
</script>

{#if isLoadingCase}
	<div class="flex items-center justify-center py-12">
		<div class="flex items-center space-x-3">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-indigo-600"></div>
			<span class="text-neutral-600">Loading case...</span>
		</div>
	</div>
{/if}