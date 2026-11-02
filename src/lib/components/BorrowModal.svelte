<script>
  let { 
    isOpen = false, 
    book = null, 
    preselectedBorrower = null,
    availableBooks = [],
    borrowers = [],
    onConfirm, 
    onClose 
  } = $props();

  let selectedBookId = $state('');
  let borrowerMode = $state('existing'); // 'existing' or 'new'
  let selectedBorrowerId = $state('');

  let borrowerName = $state('');
  let borrowerEmail = $state('');
  let borrowerPhone = $state('');
  let borrowerDepartment = $state('General Patron');
  let days = $state('14');
  let notes = $state('');

  $effect(() => {
    if (isOpen) {
      if (book) {
        selectedBookId = book.id;
      } else if (availableBooks.length > 0) {
        selectedBookId = availableBooks[0].id;
      }

      if (preselectedBorrower) {
        borrowerMode = 'existing';
        selectedBorrowerId = preselectedBorrower.id;
        borrowerName = preselectedBorrower.full_name;
        borrowerEmail = preselectedBorrower.email || '';
        borrowerPhone = preselectedBorrower.phone || '';
        borrowerDepartment = preselectedBorrower.department || 'General Patron';
      } else if (borrowers.length > 0) {
        borrowerMode = 'existing';
        const firstActive = borrowers.find(b => b.status !== 'suspended') || borrowers[0];
        selectedBorrowerId = firstActive.id;
        borrowerName = firstActive.full_name;
        borrowerEmail = firstActive.email || '';
        borrowerPhone = firstActive.phone || '';
        borrowerDepartment = firstActive.department || 'General Patron';
      } else {
        borrowerMode = 'new';
        selectedBorrowerId = '';
        borrowerName = '';
        borrowerEmail = '';
        borrowerPhone = '';
      }
    }
  });

  function handleSelectExistingBorrower(e) {
    const id = e.target.value;
    selectedBorrowerId = id;
    const found = borrowers.find(b => b.id === id);
    if (found) {
      borrowerName = found.full_name;
      borrowerEmail = found.email || '';
      borrowerPhone = found.phone || '';
      borrowerDepartment = found.department || 'General Patron';
    }
  }

  const activeBook = $derived(
    book || availableBooks.find(b => b.id === selectedBookId) || null
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedBookId) return;
    if (!borrowerName.trim()) return;

    onConfirm({
      bookId: selectedBookId,
      borrowerId: borrowerMode === 'existing' ? selectedBorrowerId : null,
      borrowerName: borrowerName.trim(),
      borrowerEmail: borrowerEmail.trim(),
      borrowerPhone: borrowerPhone.trim(),
      borrowerDepartment,
      days: Number(days),
      notes: notes.trim()
    });

    notes = '';
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop animate-fade-in" onclick={onClose}>
    <div class="modal-dialog" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <div>
          <span class="module-pill">CIRCULATION • BORROW BOOKS</span>
          <h3 class="modal-title">Issue Book to Borrower</h3>
        </div>
        <button class="close-btn" onclick={onClose}>✕</button>
      </div>

      <form onsubmit={handleSubmit} class="borrow-form">
        <!-- Step 1: Select or Preview Book -->
        {#if !book}
          <div class="form-group">
            <label for="select-book">Select Available Book *</label>
            <select id="select-book" bind:value={selectedBookId} required>
              {#each availableBooks as b}
                <option value={b.id}>
                  {b.title} — {b.author} ({b.available_copies}/{b.total_copies} available)
                </option>
              {/each}
            </select>
          </div>
        {/if}

        {#if activeBook}
          <div class="book-preview-strip">
            <div class="preview-cover">
              {#if activeBook.cover_url}
                <img src={activeBook.cover_url} alt={activeBook.title} />
              {:else}
                <span>📖</span>
              {/if}
            </div>
            <div class="preview-meta">
              <div class="preview-title">{activeBook.title}</div>
              <div class="preview-author">{activeBook.author}</div>
              <div class="preview-stock">
                Available on shelf: <strong>{activeBook.available_copies} of {activeBook.total_copies}</strong> copies
              </div>
            </div>
          </div>
        {/if}

        <!-- Step 2: Select Registered Borrower or New Borrower -->
        <div class="borrower-mode-toggle">
          <button
            type="button"
            class="mode-btn"
            class:active={borrowerMode === 'existing'}
            onclick={() => borrowerMode = 'existing'}
          >
            Select Registered Borrower ({borrowers.length})
          </button>
          <button
            type="button"
            class="mode-btn"
            class:active={borrowerMode === 'new'}
            onclick={() => {
              borrowerMode = 'new';
              selectedBorrowerId = '';
              borrowerName = '';
              borrowerEmail = '';
              borrowerPhone = '';
            }}
          >
            + New Borrower
          </button>
        </div>

        {#if borrowerMode === 'existing' && borrowers.length > 0}
          <div class="form-group">
            <label for="existing-borrower">Registered Borrower *</label>
            <select 
              id="existing-borrower" 
              value={selectedBorrowerId} 
              onchange={handleSelectExistingBorrower}
            >
              {#each borrowers as b}
                <option value={b.id} disabled={b.status === 'suspended'}>
                  {b.full_name} ({b.member_id}) — {b.department} {b.status === 'suspended' ? '[SUSPENDED]' : ''}
                </option>
              {/each}
            </select>
          </div>
        {:else}
          <div class="form-row-two">
            <div class="form-group">
              <label for="borrower-name">Borrower Full Name *</label>
              <input 
                id="borrower-name" 
                type="text" 
                required 
                placeholder="e.g. Florence Miller" 
                bind:value={borrowerName} 
              />
            </div>

            <div class="form-group">
              <label for="borrower-phone">Phone Number</label>
              <input 
                id="borrower-phone" 
                type="text" 
                placeholder="+1 (555) 234-5678" 
                bind:value={borrowerPhone} 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="borrower-email">Borrower Email</label>
            <input 
              id="borrower-email" 
              type="email" 
              placeholder="florence@example.com" 
              bind:value={borrowerEmail} 
            />
          </div>
        {/if}

        <!-- Step 3: Loan Duration -->
        <div class="form-group">
          <span class="field-label">Loan Period (Tracks Unreturned After Due Date)</span>
          <div class="duration-chips">
            {#each [
              { val: '7', label: '7 Days' },
              { val: '14', label: '14 Days (Standard)' },
              { val: '21', label: '21 Days' },
              { val: '30', label: '30 Days' }
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
          <label for="loan-notes">Circulation Notes / Remarks</label>
          <input 
            id="loan-notes" 
            type="text" 
            placeholder="Special loan, book condition, or desk memo..." 
            bind:value={notes} 
          />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" onclick={onClose}>Cancel</button>
          <button type="submit" class="btn-checkout" disabled={!activeBook}>
            ✓ Record Borrowed Book
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
    max-width: 510px;
    max-height: 92vh;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: 10px;
  }

  .module-pill {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--color-amber-primary);
    letter-spacing: 0.06em;
    display: block;
    margin-bottom: 2px;
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
    padding: 10px 12px;
  }

  .preview-cover {
    width: 40px;
    height: 58px;
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
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--color-text-main);
    line-height: 1.2;
  }

  .preview-author {
    font-size: 0.76rem;
    color: var(--color-text-secondary);
  }

  .preview-stock {
    font-size: 0.72rem;
    color: var(--color-accent-sage);
    font-weight: 500;
    margin-top: 2px;
  }

  .borrower-mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 3px;
    gap: 4px;
  }

  .mode-btn {
    padding: 6px 10px;
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-radius: var(--radius-sm);
  }

  .mode-btn.active {
    background: #FFFFFF;
    color: var(--color-amber-hover);
    box-shadow: var(--shadow-sm);
  }

  .borrow-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-row-two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  label, .field-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input, select {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    font-size: 0.84rem;
    color: var(--color-text-main);
    outline: none;
    transition: all 0.18s ease;
  }

  input:focus, select:focus {
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
    padding-top: 12px;
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
