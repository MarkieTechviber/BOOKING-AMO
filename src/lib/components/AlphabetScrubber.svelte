<script>
  let { selectedLetter = $bindable('ALL'), availableLetters = [] } = $props();

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
</script>

<div class="scrubber-container">
  <div class="scrubber-track">
    {#each alphabet as letter}
      {@const hasBooks = availableLetters.includes(letter)}
      <button
        class="scrubber-letter"
        class:active={selectedLetter === letter}
        class:has-books={hasBooks}
        onclick={() => selectedLetter = (selectedLetter === letter ? 'ALL' : letter)}
        title={hasBooks ? `Filter by ${letter}` : `No books starting with ${letter}`}
      >
        {letter}
      </button>
    {/each}

    <button
      class="scrubber-letter special-char"
      class:active={selectedLetter === '#'}
      onclick={() => selectedLetter = (selectedLetter === '#' ? 'ALL' : '#')}
      title="Numbers and symbols"
    >
      #
    </button>

    <button
      class="scrubber-letter all-btn"
      class:active={selectedLetter === 'ALL'}
      onclick={() => selectedLetter = 'ALL'}
    >
      All
    </button>
  </div>
</div>

<style>
  .scrubber-container {
    width: 100%;
    padding: 10px 28px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border-subtle);
    overflow-x: auto;
  }

  .scrubber-track {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 620px;
    gap: 4px;
  }

  .scrubber-letter {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-muted);
    padding: 3px 6px;
    border-radius: var(--radius-sm);
    transition: all 0.15s ease;
  }

  .scrubber-letter:hover {
    color: var(--color-amber-primary);
    background: var(--color-bg);
  }

  .scrubber-letter.has-books {
    color: var(--color-text-secondary);
    font-weight: 700;
  }

  .scrubber-letter.active {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    font-weight: 800;
    box-shadow: 0 1px 3px rgba(217, 119, 6, 0.15);
  }

  .all-btn {
    font-size: 0.8rem;
    padding: 3px 10px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
  }

  .all-btn.active {
    background: var(--color-amber-primary);
    color: #FFFFFF;
    border-color: var(--color-amber-primary);
  }
</style>
