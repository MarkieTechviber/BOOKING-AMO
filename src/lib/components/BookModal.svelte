<script>
  let { 
    isOpen = false, 
    editMode = false, 
    initialBook = null, 
    onSave, 
    onClose 
  } = $props();

  let title = $state('');
  let author = $state('');
  let genre = $state('Fiction');
  let isbn = $state('');
  let published_year = $state(new Date().getFullYear());
  let total_copies = $state(1);
  let cover_url = $state('');
  let description = $state('');

  const genres = ['Fiction', 'Classics', 'Graphic Novel', 'Science & Tech', 'Drama', 'Poetry & Arts', 'Philosophy', 'History', 'Biography'];

  const coverPresets = [
    { label: 'Minimalist Clean', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Classic Leather', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
    { label: 'Vintage Art', url: 'https://covers.openlibrary.org/b/id/8226191-L.jpg' },
    { label: 'Modern Graphic', url: 'https://covers.openlibrary.org/b/id/8708304-L.jpg' },
    { label: 'Dune Desert', url: 'https://covers.openlibrary.org/b/id/11181816-L.jpg' }
  ];

  $effect(() => {
    if (initialBook && editMode) {
      title = initialBook.title || '';
      author = initialBook.author || '';
      genre = initialBook.genre || 'Fiction';
      isbn = initialBook.isbn || '';
      published_year = initialBook.published_year || '';
      total_copies = initialBook.total_copies || 1;
      cover_url = initialBook.cover_url || '';
      description = initialBook.description || '';
    } else {
      title = '';
      author = '';
      genre = 'Fiction';
      isbn = '';
      published_year = new Date().getFullYear();
      total_copies = 1;
      cover_url = '';
      description = '';
    }
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    onSave({
      ...(editMode && initialBook ? { id: initialBook.id } : {}),
      title: title.trim(),
      author: author.trim(),
      genre,
      isbn: isbn.trim(),
      published_year: Number(published_year) || null,
      total_copies: Number(total_copies) || 1,
      cover_url: cover_url.trim(),
      description: description.trim()
    });
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop animate-fade-in" onclick={onClose}>
    <div class="modal-dialog" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3 class="modal-title">
          {editMode ? 'Edit Book Record' : 'Add New Book to Collection'}
        </h3>
        <button class="close-btn" onclick={onClose}>✕</button>
      </div>

      <form onsubmit={handleSubmit} class="modal-form">
        <div class="form-grid">
          <div class="form-group full">
            <label for="book-title">Title *</label>
            <input 
              id="book-title" 
              type="text" 
              required 
              placeholder="e.g. The Secret History" 
              bind:value={title} 
            />
          </div>

          <div class="form-group half">
            <label for="book-author">Author *</label>
            <input 
              id="book-author" 
              type="text" 
              required 
              placeholder="e.g. Donna Tartt" 
              bind:value={author} 
            />
          </div>

          <div class="form-group half">
            <label for="book-genre">Genre</label>
            <select id="book-genre" bind:value={genre}>
              {#each genres as g}
                <option value={g}>{g}</option>
              {/each}
            </select>
          </div>

          <div class="form-group half">
            <label for="book-isbn">ISBN / Catalog ID</label>
            <input 
              id="book-isbn" 
              type="text" 
              placeholder="e.g. 978-0140283334" 
              bind:value={isbn} 
            />
          </div>

          <div class="form-group quarter">
            <label for="book-year">Year</label>
            <input 
              id="book-year" 
              type="number" 
              placeholder="2024" 
              bind:value={published_year} 
            />
          </div>

          <div class="form-group quarter">
            <label for="book-copies">Copies</label>
            <input 
              id="book-copies" 
              type="number" 
              min="1" 
              max="50" 
              bind:value={total_copies} 
            />
          </div>

          <!-- Cover Image Selector -->
          <div class="form-group full">
            <label for="cover-url">Cover Image URL</label>
            <input 
              id="cover-url" 
              type="url" 
              placeholder="https://example.com/cover.jpg" 
              bind:value={cover_url} 
            />
            
            <div class="preset-covers">
              <span class="preset-label">Or choose an aesthetic preset:</span>
              <div class="preset-buttons">
                {#each coverPresets as preset}
                  <button 
                    type="button" 
                    class="preset-chip" 
                    onclick={() => cover_url = preset.url}
                  >
                    {preset.label}
                  </button>
                {/each}
              </div>
            </div>
          </div>

          <div class="form-group full">
            <label for="book-desc">Synopsis / Description</label>
            <textarea 
              id="book-desc" 
              rows="3" 
              placeholder="Add summary or notes about this edition..." 
              bind:value={description}
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" onclick={onClose}>Cancel</button>
          <button type="submit" class="btn-submit">
            {editMode ? 'Save Changes' : 'Add to Library'}
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
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
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
    padding-bottom: 12px;
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
    color: var(--color-text-main);
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-group.full { grid-column: span 4; }
  .form-group.half { grid-column: span 2; }
  .form-group.quarter { grid-column: span 1; }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input, select, textarea {
    padding: 9px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    font-size: 0.85rem;
    color: var(--color-text-main);
    outline: none;
    transition: all 0.18s ease;
  }

  input:focus, select:focus, textarea:focus {
    border-color: var(--color-amber-primary);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px var(--color-amber-light);
  }

  .preset-covers {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .preset-label {
    font-size: 0.7rem;
    color: var(--color-text-muted);
  }

  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .preset-chip {
    font-size: 0.72rem;
    background: var(--color-bg-subtle);
    padding: 3px 8px;
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .preset-chip:hover {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    border-color: var(--color-amber-border);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid var(--color-border-subtle);
    padding-top: 14px;
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

  .btn-submit {
    padding: 8px 18px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #FFFFFF;
    background: var(--color-amber-primary);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 6px rgba(217, 119, 6, 0.25);
  }

  .btn-submit:hover {
    background: var(--color-amber-hover);
  }

  @media (max-width: 600px) {
    .form-group.half, .form-group.quarter {
      grid-column: span 4;
    }
  }
</style>
