<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Document } from "$lib/types";
  import { formatDate } from "$lib/utils";
  import {
    extractJudgeName,
    extractCourtInfo,
    formatParties,
    formatAttorneys,
    formatCharges,
    getDocumentPriority,
    getRelevantDate,
    getMotionStatus,
    formatCaseInfo,
    calculateDocumentImportanceScore,
  } from "$lib/utils/legal-metadata";
  import { fly, fade, slide, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  const { document, index }: { document: Document, index: number } = $props();
  
  const dispatch = createEventDispatcher<{ openDocument: Document }>();

  function openDocumentViewer() {
    dispatch("openDocument", document);
  }

  const priority = getDocumentPriority(document);
  const relevantDate = getRelevantDate(document);
  const motionStatus = getMotionStatus(document);
  const caseInfo = formatCaseInfo(document);
  const judgeName = extractJudgeName(document.metadata?.judge);
  const courtInfo = extractCourtInfo(document.metadata?.court);
  const parties = formatParties(document.metadata?.parties);
  const attorneys = formatAttorneys(document.metadata?.attorneys);
  const charges = formatCharges(document.metadata?.charges);
  const importanceScore = calculateDocumentImportanceScore(document);
</script>

<div
  class="relative cursor-pointer rounded-lg border transition-all hover:shadow-md {priority === 'high'
    ? 'border-red-200 bg-red-50'
    : priority === 'medium'
      ? 'border-yellow-200 bg-yellow-50'
      : 'border-neutral-100 bg-white'}"
  onclick={openDocumentViewer}
  onkeydown={(e) => e.key === "Enter" && openDocumentViewer()}
  role="button"
  tabindex="0"
  aria-label="View document {document.metadata?.subject ||
    document.file_name ||
    'Untitled'}"
  in:fly={{
    y: 20,
    duration: 600,
    delay: 200 + index * 100,
    easing: cubicOut,
  }}
>
  <!-- Priority Indicator -->
  {#if priority === "high"}
    <div class="absolute -left-1 top-4 h-8 w-1 rounded-r bg-red-500"></div>
  {/if}

  <div class="p-4">
    <!-- Header: Document Type, Status, and Date -->
    <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div class="flex items-center gap-2">
        <!-- Importance Indicator -->
        {#if index < 3}
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold {index === 0
              ? 'bg-red-500 text-white'
              : index === 1
                ? 'bg-orange-500 text-white'
                : 'bg-yellow-500 text-white'}"
            title="Ranked #{index + 1} by importance (Score: {importanceScore})"
            in:scale={{
              start: 0.8,
              duration: 500,
              delay: 300 + index * 100,
              easing: cubicOut,
            }}
          >
            {index + 1}
          </span>
        {:else if importanceScore > 800}
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-800"
            title="High importance (Score: {importanceScore})"
            in:scale={{
              start: 0.8,
              duration: 500,
              delay: 300 + index * 100,
              easing: cubicOut,
            }}
          >
            !
          </span>
        {/if}

        <span
          class="rounded-md px-2 py-1 text-xs font-medium {motionStatus.color === 'green'
            ? 'bg-green-100 text-green-800'
            : motionStatus.color === 'red'
              ? 'bg-red-100 text-red-800'
              : motionStatus.color === 'yellow'
                ? 'bg-yellow-100 text-yellow-800'
                : motionStatus.color === 'blue'
                  ? 'bg-blue-100 text-blue-800'
                  : motionStatus.color === 'purple'
                    ? 'bg-purple-100 text-purple-800'
                    : motionStatus.color === 'indigo'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-neutral-100 text-neutral-800'}"
          in:scale={{
            start: 0.9,
            duration: 500,
            delay: 350 + index * 100,
            easing: cubicOut,
          }}
        >
          {motionStatus.type}
        </span>
        {#if motionStatus.outcome}
          <span
            class="rounded-md px-2 py-1 text-xs font-semibold {motionStatus.outcome === 'Granted'
              ? 'bg-green-200 text-green-900'
              : motionStatus.outcome === 'Denied'
                ? 'bg-red-200 text-red-900'
                : 'bg-yellow-200 text-yellow-900'}"
            in:scale={{
              start: 0.9,
              duration: 500,
              delay: 400 + index * 100,
              easing: cubicOut,
            }}
          >
            {motionStatus.outcome}
          </span>
        {/if}
      </div>
      <div class="flex flex-col items-end text-right">
        <span class="text-xs text-neutral-500">{relevantDate.label}</span>
        <span class="text-sm font-medium text-neutral-900">{formatDate(relevantDate.date)}</span>
      </div>
    </div>

    <!-- Title and Case Information -->
    <div class="mb-3">
      <h3
        class="text-lg font-semibold text-neutral-900 leading-tight"
        in:slide={{ duration: 500, delay: 250 + index * 100 }}
      >
        {document.metadata?.subject ||
          document.metadata?.document_name ||
          document.file_name ||
          "Untitled Document"}
      </h3>

      {#if caseInfo.name}
        <div class="mt-1 flex flex-wrap gap-x-4 text-sm text-neutral-700">
          {#if caseInfo.name}
            <span><strong>Case:</strong> {caseInfo.name}</span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Court and Judge Information -->
    {#if courtInfo.name || judgeName}
      <div class="mb-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {#if courtInfo.name}
          <div>
            <span class="text-neutral-500">Court:</span>
            <span class="ml-1 font-medium text-neutral-900">{courtInfo.name}</span>
            {#if courtInfo.jurisdiction}
              <span class="text-neutral-500">({courtInfo.jurisdiction})</span>
            {/if}
          </div>
        {/if}
        {#if judgeName}
          <div>
            <span class="text-neutral-500">Judge:</span>
            <span class="ml-1 font-medium text-neutral-900">{judgeName}</span>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Charges Information -->
    {#if charges.length > 0}
      <div class="mb-3">
        <span class="text-sm text-neutral-500">Charges:</span>
        <div class="mt-1">
          {#each charges as charge, j}
            <div class="text-sm text-neutral-700">{charge}</div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Parties and Attorneys -->
    {#if parties || attorneys}
      <div class="mb-3 text-sm">
        {#if parties}
          <div class="text-neutral-700">{parties}</div>
        {/if}
        {#if attorneys}
          <div class="text-neutral-700">{attorneys}</div>
        {/if}
      </div>
    {/if}

    <!-- Document Content Preview -->
    {#if document.highlight?.text}
      <div
        class="mb-3 rounded-md bg-yellow-100 p-3 text-sm text-neutral-700"
        in:fade={{ duration: 700, delay: 450 + index * 100 }}
      >
        <div class="font-medium text-yellow-800 mb-1">Relevant Content:</div>
        {#each document.highlight.text as highlight}
          <p class="mb-1">...{@html highlight}...</p>
        {/each}
      </div>
    {:else if document.metadata?.summary}
      <p
        class="mb-3 text-sm text-neutral-600 line-clamp-2"
        in:fade={{ duration: 700, delay: 450 + index * 100 }}
      >
        {document.metadata.summary.substring(0, 200)}{document.metadata.summary.length > 200 ? "..." : ""}
      </p>
    {/if}

    <!-- Enhanced Metadata with Security & Privacy Information -->
    <div class="mt-3 space-y-2">
      <!-- Document Metadata -->
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        {#if document.metadata?.pages}
          <span>{document.metadata.pages} pages</span>
        {/if}
        {#if document.metadata?.word_count}
          <span>{document.metadata.word_count.toLocaleString()} words</span>
        {/if}
        {#if document.metadata?.author}
          <span>Author: {document.metadata.author}</span>
        {/if}
        {#if document.metadata?.language && document.metadata.language !== "en"}
          <span>Language: {document.metadata.language.toUpperCase()}</span>
        {/if}
      </div>

      <!-- Enhanced Date Fields -->
      {#if document.metadata?.filing_date || document.metadata?.event_date || document.metadata?.hearing_date || document.metadata?.decision_date || document.metadata?.served_date}
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {#if document.metadata.filing_date}
            <span class="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-blue-700">
              📅 Filed: {formatDate(document.metadata.filing_date)}
            </span>
          {/if}
          {#if document.metadata.event_date}
            <span class="inline-flex items-center rounded bg-green-50 px-2 py-0.5 text-green-700">
              ⚖️ Event: {formatDate(document.metadata.event_date)}
            </span>
          {/if}
          {#if document.metadata.hearing_date}
            <span class="inline-flex items-center rounded bg-purple-50 px-2 py-0.5 text-purple-700">
              🏛️ Hearing: {formatDate(document.metadata.hearing_date)}
            </span>
          {/if}
          {#if document.metadata.decision_date}
            <span class="inline-flex items-center rounded bg-orange-50 px-2 py-0.5 text-orange-700">
              ⚡ Decision: {formatDate(document.metadata.decision_date)}
            </span>
          {/if}
          {#if document.metadata.served_date}
            <span class="inline-flex items-center rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">
              📬 Served: {formatDate(document.metadata.served_date)}
            </span>
          {/if}
        </div>
      {/if}

      <!-- Privacy & Security Indicators -->
      {#if document.metadata?.has_redactions || document.metadata?.sensitive_terms || document.metadata?.redaction_score}
        <div class="flex flex-wrap gap-2 text-xs">
          {#if document.metadata.has_redactions}
            <span class="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-red-700 font-medium">
              🔒 Contains Redactions
            </span>
          {/if}
          {#if document.metadata.sensitive_terms && document.metadata.sensitive_terms.length > 0}
            <span class="inline-flex items-center rounded bg-yellow-50 px-2 py-0.5 text-yellow-700 font-medium">
              ⚠️ {document.metadata.sensitive_terms.length} Sensitive Term{document.metadata.sensitive_terms.length !== 1 ? "s" : ""}
            </span>
          {/if}
          {#if document.metadata.redaction_score && document.metadata.redaction_score > 0}
            <span class="inline-flex items-center rounded bg-orange-50 px-2 py-0.5 text-orange-700 font-medium">
              🛡️ Privacy Score: {Math.round(document.metadata.redaction_score * 100)}%
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Legal Tags -->
    {#if document.metadata?.legal_tags && document.metadata.legal_tags.length > 0}
      <div class="mt-3">
        <div class="flex flex-wrap gap-1">
          {#each document.metadata.legal_tags.slice(0, 5) as tag, j}
            <span
              class="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
              in:scale={{
                start: 0.9,
                duration: 400,
                delay: 550 + index * 100 + j * 50,
                easing: cubicOut,
              }}
            >
              {tag}
            </span>
          {/each}
          {#if document.metadata.legal_tags.length > 5}
            <span class="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              +{document.metadata.legal_tags.length - 5} more
            </span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>