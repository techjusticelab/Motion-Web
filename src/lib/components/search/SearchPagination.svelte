<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  const { 
    currentPage, 
    totalPages, 
    isLoading, 
    sortedDocuments 
  }: { 
    currentPage: number, 
    totalPages: number, 
    isLoading: boolean, 
    sortedDocuments: any[] 
  } = $props();

  const dispatch = createEventDispatcher<{ goToPage: number }>();

  function goToPage(page: number) {
    dispatch("goToPage", page);
  }
</script>

{#if totalPages > 1}
  <div
    class="mt-6 flex justify-center"
    in:fly={{
      y: 15,
      duration: 600,
      delay: 300 + sortedDocuments.length * 50,
      easing: cubicOut,
    }}
  >
    <div class="inline-flex rounded-md shadow-sm" aria-label="Pagination">
      <button
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        aria-label="Previous page"
        class="relative inline-flex items-center rounded-l-md border border-neutral-200 bg-white px-2 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
        in:scale={{
          start: 0.95,
          duration: 400,
          delay: 350 + sortedDocuments.length * 50,
          easing: cubicOut,
        }}
      >
        <svg
          class="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      {#each Array(Math.min(5, totalPages)) as _, i}
        {#if totalPages <= 5 || (i < 3 && currentPage <= 3) || (i >= 2 && currentPage > totalPages - 3)}
          <button
            onclick={() => goToPage(i + 1)}
            class={`relative inline-flex items-center border px-3 py-2 text-sm font-medium ${currentPage === i + 1 ? "z-10 border-primary-200 bg-primary-50 text-primary-800" : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"}`}
            in:scale={{
              start: 0.95,
              duration: 400,
              delay: 400 + sortedDocuments.length * 50 + i * 50,
              easing: cubicOut,
            }}
          >
            {i + 1}
          </button>
        {:else if i === 2 && currentPage > 3 && currentPage < totalPages - 2}
          <button
            onclick={() => goToPage(currentPage)}
            class="relative z-10 inline-flex items-center border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-800"
            in:scale={{
              start: 0.95,
              duration: 400,
              delay: 400 + sortedDocuments.length * 50 + i * 50,
              easing: cubicOut,
            }}
          >
            {currentPage}
          </button>
        {:else if (i === 1 && currentPage > 3) || (i === 3 && currentPage < totalPages - 2)}
          <span
            class="relative inline-flex items-center border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700"
            in:scale={{
              start: 0.95,
              duration: 400,
              delay: 400 + sortedDocuments.length * 50 + i * 50,
              easing: cubicOut,
            }}
          >
            ...
          </span>
        {/if}
      {/each}

      <button
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        aria-label="Next page"
        class="relative inline-flex items-center rounded-r-md border border-neutral-200 bg-white px-2 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
        in:scale={{
          start: 0.95,
          duration: 400,
          delay: 450 + sortedDocuments.length * 50,
          easing: cubicOut,
        }}
      >
        <svg
          class="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}