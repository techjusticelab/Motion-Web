<!-- AddToCaseButton.svelte -->
<script lang="ts">
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		onClick: () => void;
		variant?: 'primary' | 'secondary';
	}

	const { onClick, variant = 'secondary' }: Props = $props();
</script>

<button
	onclick={onClick}
	class="mt-4 flex w-full items-center justify-center rounded-lg {variant === 'primary' 
		? 'bg-primary-600 text-white hover:bg-primary-700' 
		: 'border-primary-600 bg-white text-black hover:bg-primary-600 hover:text-white'} px-2 md:px-3 py-2 text-xs font-medium transition-colors"
	in:scale={{ start: 0.5, duration: 300, delay: variant === 'primary' ? 1350 : 1300, easing: cubicOut }}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="mr-1 h-3 w-3"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		{#if variant === 'primary'}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 4v16m8-8H4"
			/>
		{:else}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		{/if}
	</svg>
	{#if variant === 'primary'}
		New Case
	{:else}
		<span class="hidden md:inline">Add to Case</span>
		<span class="md:hidden">Add Case</span>
	{/if}
</button>