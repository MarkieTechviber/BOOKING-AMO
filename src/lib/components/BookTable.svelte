<script>
  let { 
    books = [], 
    onBorrow, 
    onEdit, 
    onDelete 
  } = $props();
</script>

<div class="table-container">
  <table class="books-table">
    <thead>
      <tr>
        <th style="width: 50px;">Cover</th>
        <th>Title</th>
        <th>Author</th>
        <th>Genre</th>
        <th>Year</th>
        <th>Availability</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each books as book}
        {@const isAvail = (book.available_copies || 0) > 0}
        <tr>
          <td>
            <div class="thumb-frame">
              {#if book.cover_url}
                <img src={book.cover_url} alt={book.title} class="thumb-img" />
              {:else}
                <div class="thumb-placeholder">📖</div>
              {/if}
            </div>
          </td>
          <td>
            <div class="table-title">{book.title}</div>
            {#if book.isbn}
              <div class="table-isbn">ISBN: {book.isbn}</div>
            {/if}
          </td>
          <td class="table-author">{book.author}</td>
          <td>
            <span class="genre-tag">{book.genre || 'General'}</span>
          </td>
          <td class="table-year">{book.published_year || '—'}</td>
          <td>
            <span class="stock-pill" class:in-stock={isAvail} class:out-stock={!isAvail}>
              {book.available_copies} of {book.total_copies} available
            </span>
          </td>
          <td style="text-align: right;">
            <div class="row-actions">
              {#if isAvail}
                <button class="action-pill-btn borrow" onclick={() => onBorrow(book)}>
                  Borrow
                </button>
              {/if}
              <button class="row-icon-btn" onclick={() => onEdit(book)} title="Edit">
                ✎
              </button>
              <button class="row-icon-btn delete" onclick={() => onDelete(book.id)} title="Delete">
                🗑
              </button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow-x: auto;
    box-shadow: var(--shadow-sm);
  }

  .books-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    text-align: left;
  }

  th {
    background: var(--color-bg);
    padding: 10px 14px;
    font-weight: 700;
    font-size: 0.72rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-border);
  }

  td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--color-border-subtle);
    vertical-align: middle;
  }

  tr:hover td {
    background: var(--color-surface-hover);
  }

  .thumb-frame {
    width: 36px;
    height: 52px;
    border-radius: 3px;
    overflow: hidden;
    background: #EAE2D5;
  }

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .table-title {
    font-weight: 600;
    color: var(--color-text-main);
  }

  .table-isbn {
    font-size: 0.72rem;
    color: var(--color-text-muted);
  }

  .table-author {
    color: var(--color-text-secondary);
  }

  .genre-tag {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    color: var(--color-text-secondary);
  }

  .table-year {
    color: var(--color-text-muted);
  }

  .stock-pill {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-full);
  }

  .stock-pill.in-stock {
    background: #E8F5E9;
    color: #2E7D32;
  }

  .stock-pill.out-stock {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
  }

  .row-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .action-pill-btn.borrow {
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-weight: 600;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: var(--radius-sm);
  }

  .action-pill-btn.borrow:hover {
    background: var(--color-amber-hover);
  }

  .row-icon-btn {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
  }

  .row-icon-btn:hover {
    background: var(--color-bg);
    color: var(--color-text-main);
  }

  .row-icon-btn.delete:hover {
    color: var(--color-status-overdue);
  }
</style>
