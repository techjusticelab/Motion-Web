<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  const { error }: { error: string } = $props();
</script>

{#if error}
  <div
    class="m-5 border-l-4 border-red-500 bg-red-50 p-4 text-red-700"
    role="alert"
    in:fly={{ x: -5, y: 0, duration: 600, easing: cubicOut }}
  >
    <p class="text-sm">{error}</p>
  </div>
{/if}