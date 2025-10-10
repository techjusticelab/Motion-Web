<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
</script>

<div class="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8" in:fade={{ duration: 300, easing: cubicOut }}>
  <div class="mx-auto max-w-2xl">
    <div class="text-center">
      <h1 class="text-3xl font-extrabold text-neutral-900 sm:text-4xl">Help</h1>
      <p class="mt-3 text-neutral-600">Questions, bugs, or ideas? Email us.</p>
    </div>

    <div class="mt-8 rounded-lg bg-white p-8 shadow">
      <p class="text-neutral-700">
        Please send an email with a short description and a screenshot of the bug or the feature you
        would like to see to
        <a href="mailto:info@techjusticelab.org" class="font-medium text-primary-700 hover:text-primary-800">info@techjusticelab.org</a>.
        We will get back to you with an update.
      </p>
    </div>
  </div>
</div>
