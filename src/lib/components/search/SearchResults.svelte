<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Document, SearchResponse } from "$lib/types";
  import { sortDocumentsByImportance } from "$lib/utils/legal-metadata";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import SearchResultsHeader from './SearchResultsHeader.svelte';
  import SearchErrorMessage from './SearchErrorMessage.svelte';
  import DocumentCard from './DocumentCard.svelte';
  import SearchPagination from './SearchPagination.svelte';
  import EmptySearchState from './EmptySearchState.svelte';

  export let searchResults: SearchResponse;
  export let isLoading: boolean = false;
  export let error: string = "";
  export let currentPage: number = 1;
  export let totalPages: number = 0;

  const dispatch = createEventDispatcher<{
    openDocument: Document;
    goToPage: number;
    resetFilters: void;
  }>();

  function handleOpenDocument(event: CustomEvent<Document>) {
    dispatch("openDocument", event.detail);
  }

  function handleGoToPage(event: CustomEvent<number>) {
    dispatch("goToPage", event.detail);
  }

  function handleResetFilters() {
    dispatch("resetFilters");
  }

  // Sort documents by importance for public defenders
  $: sortedDocuments = sortDocumentsByImportance(searchResults.hits || []);
</script>

<div
  class="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm"
  in:fly={{ y: 15, duration: 600, easing: cubicOut }}
>
  <SearchResultsHeader {searchResults} {isLoading} {sortedDocuments} />
  
  <SearchErrorMessage {error} />

  <!-- Results List -->
  <div class="p-5">
    {#if sortedDocuments.length > 0}
      <div class="space-y-4">
        {#each sortedDocuments as document, i}
          <DocumentCard {document} index={i} on:openDocument={handleOpenDocument} />
        {/each}
      </div>

      <SearchPagination 
        {currentPage} 
        {totalPages} 
        {isLoading} 
        {sortedDocuments} 
        on:goToPage={handleGoToPage} 
      />
    {:else if !isLoading}
      <EmptySearchState on:resetFilters={handleResetFilters} />
    {/if}
  </div>
</div>
