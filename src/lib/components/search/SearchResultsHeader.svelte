<script lang="ts">
  import { slide, scale, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import type { SearchResponse } from "$lib/types";

  const { searchResults, isLoading, sortedDocuments }: { 
    searchResults: SearchResponse, 
    isLoading: boolean, 
    sortedDocuments: any[] 
  } = $props();
</script>

<div
  class="flex items-center justify-between border-b border-neutral-100 p-5"
  in:fly={{ y: -10, duration: 500, delay: 100, easing: cubicOut }}
>
  <div class="flex items-center gap-3">
    <h2
      class="text-lg font-semibold text-neutral-800"
      in:slide={{ duration: 500, delay: 200 }}
    >
      Results
    </h2>
    {#if sortedDocuments.length > 0}
      <span
        class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
        title="Documents sorted by relevance to public defenders"
      >
        Ranked by Importance
      </span>
    {/if}
  </div>

  <!-- Results Count -->
  <div
    class="text-sm font-medium"
    in:scale={{ start: 0.95, duration: 600, delay: 300, easing: cubicOut }}
  >
    {#if isLoading}
      <div class="flex items-center text-neutral-500">
        <svg
          class="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading...
      </div>
    {:else if searchResults.total === 0}
      <span class="text-neutral-500">No documents found</span>
    {:else}
      <span
        class="rounded-full bg-secondary-200 px-3 py-1 text-secondary-700"
        in:scale={{ start: 0.9, duration: 500, easing: cubicOut }}
      >
        {searchResults.total} document{searchResults.total !== 1 ? "s" : ""}
      </span>
    {/if}
  </div>
</div>