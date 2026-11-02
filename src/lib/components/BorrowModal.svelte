<script>
  let { 
    isOpen = false, 
    book = null, 
    onConfirm, 
    onClose 
  } = $props();

  let borrowerName = $state('');
  let borrowerEmail = $state('');
  let days = $state('14');
  let notes = $state('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!borrowerName.trim() || !book) return;

    onConfirm({
      bookId: book.id,
      borrowerName: borrowerName.trim(),
      borrowerEmail: borrowerEmail.trim(),
      days: Number(days),
      notes: notes.trim()
    });

    borrowerName = '';
    borrowerEmail = '';
    notes = '';
  }
</script>

{#if isOpen && book}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop animate-fade-in" onclick={onClose}>
    <div class="modal-dialog" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3 class="modal-title">Circulation Checkout</h3>
        <button class="close-btn" onclick={onClose}>✕</button>
      </div>

      <!-- Book snapshot preview -->
      <div class="book-preview-strip">
        <div class="preview-cover">
          {#if book.cover_url}
            <img src={book.cover_url} alt={book.title} />
          {:else}
            <span>📖</span>
          {/if}
        </div>
        <div class="preview-meta">
          <div class="preview-title">{book.title}</div>
          <div class="preview-author">{book.author}</div>
          <div class="preview-stock">
            Available to loan: <strong>{book.available_copies} of {book.total_copies}</strong> copies
          </div>
        </div>
      </div>

      <form onsubmit={handleSubmit} class="borrow-form">
        <div class="form-group">
          <label for="borrower-name">Patron / Borrower Name *</label>
          <input 
            id="borrower-name" 
            type="text" 
            required 
            placeholder="e.g. Florence Miller" 
            bind:value={borrowerName} 
          />
        </div>

        <div class="form-group">
          <label for="borrower-email">Patron Email / Contact</label>
          <input 
            id="borrower-email" 
            type="email" 
            placeholder="florence@example.com" 
            bind:value={borrowerEmail} 
          />
        </div>

        <div class="form-group">
          <label for="loan-duration">Loan Duration</label>
          <div class="duration-chips">
            {#each [
              { val: '7', label: '7 Days' },
              { val: '14', label: '14 Days (Standard)' },
              { val: '21', label: '21 Days' },
              { val: '30', label: '30 Days (Extended)' }
            ] as option}
              <button 
                type="button" 
                class="duration-btn" 
                class:active={days === option.val}
                onclick={() => days = option.val}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="form-group">
          <label for="loan-notes">Checkout Notes / Desk Memo</label>
          <input 
            id="loan-notes" 
            type="text" 
            placeholder="Special loan, condition notes, or patron phone..." 
            bind:value={notes} 
          />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" onclick={onClose}>Cancel</button>
          <button type="submit" class="btn-checkout">
            ✓ Complete Checkout
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(42, 33, 24, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
  }

  .modal-dialog {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    box-shadow: 0 20px 40px rgba(42, 33, 24, 0.2);
    width: 100%;
    max-width: 480px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: 10px;
  }

  .modal-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .close-btn {
    font-size: 1.1rem;
    color: var(--color-text-muted);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
  }

  .close-btn:hover {
    background: var(--color-bg);
  }

  .book-preview-strip {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 12px;
  }

  .preview-cover {
    width: 42px;
    height: 60px;
    border-radius: 3px;
    overflow: hidden;
    background: #E0D6C8;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .preview-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .preview-title {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text-main);
    line-height: 1.2;
  }

  .preview-author {
    font-size: 0.78rem;
    color: var(--color-text-secondary);
  }

  .preview-stock {
    font-size: 0.72rem;
    color: var(--color-accent-sage);
    font-weight: 500;
    margin-top: 2px;
  }

  .borrow-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input {
    padding: 9px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    font-size: 0.85rem;
    color: var(--color-text-main);
    outline: none;
    transition: all 0.18s ease;
  }

  input:focus {
    border-color: var(--color-amber-primary);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px var(--color-amber-light);
  }

  .duration-chips {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .duration-btn {
    padding: 7px 10px;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    text-align: center;
  }

  .duration-btn.active {
    background: var(--color-amber-light);
    border-color: var(--color-amber-border);
    color: var(--color-amber-hover);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid var(--color-border-subtle);
    padding-top: 14px;
    margin-top: 4px;
  }

  .btn-cancel {
    padding: 8px 16px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-radius: var(--radius-md);
  }

  .btn-cancel:hover {
    background: var(--color-bg);
  }

  .btn-checkout {
    padding: 8px 18px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #FFFFFF;
    background: var(--color-amber-primary);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 6px rgba(217, 119, 6, 0.25);
  }

  .btn-checkout:hover {
    background: var(--color-amber-hover);
  }
</style>
