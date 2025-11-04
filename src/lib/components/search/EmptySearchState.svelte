<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly, fade, scale } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";

  const dispatch = createEventDispatcher<{ resetFilters: void }>();

  function resetFilters() {
    dispatch("resetFilters");
  }
</script>

<div class="py-10 text-center" in:fly={{ y: 20, duration: 600, easing: cubicOut }}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="mx-auto mb-4 h-12 w-12 text-neutral-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    in:scale={{ start: 0.8, duration: 700, delay: 200, easing: quintOut }}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
  <p class="text-sm text-neutral-500" in:fade={{ duration: 600, delay: 400 }}>
    No documents found matching your search criteria
  </p>
  <button
    type="button"
    onclick={resetFilters}
    class="mt-4 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-100"
    in:scale={{
      start: 0.95,
      duration: 600,
      delay: 600,
      easing: cubicOut,
    }}
  >
    Reset filters
  </button>
</div>