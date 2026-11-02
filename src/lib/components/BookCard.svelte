<script>
  let { 
    book, 
    onBorrow, 
    onEdit, 
    onDelete 
  } = $props();

  let imgError = $state(false);

  const isAvailable = $derived((book.available_copies || 0) > 0);
</script>

<div class="book-card-container">
  <div class="book-cover-frame">
    {#if book.cover_url && !imgError}
      <img 
        src={book.cover_url} 
        alt={book.title} 
        class="book-cover-img" 
        onerror={() => imgError = true}
        loading="lazy"
      />
    {:else}
      <!-- Aesthetic Fallback Book Cover -->
      <div class="fallback-cover">
        <div class="fallback-spine"></div>
        <div class="fallback-content">
          <div class="fallback-genre">{book.genre || 'Literature'}</div>
          <div class="fallback-title">{book.title}</div>
          <div class="fallback-author">{book.author}</div>
        </div>
      </div>
    {/if}

    <!-- Libib signature bookmark ribbon on bottom left of cover -->
    <div class="bookmark-ribbon" class:checked-out={!isAvailable} title={isAvailable ? `${book.available_copies} copies ready to borrow` : 'All copies checked out'}>
      <svg width="18" height="22" viewBox="0 0 24 28" fill="currentColor">
        <path d="M0 0h24v28l-12-7-12 7z" />
      </svg>
    </div>

    <!-- Quick action hover overlay -->
    <div class="cover-overlay">
      {#if isAvailable}
        <button class="overlay-action-btn borrow-btn" onclick={() => onBorrow(book)} title="Borrow this book">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Borrow
        </button>
      {:else}
        <span class="checked-out-pill">All Loaned</span>
      {/if}

      <div class="card-mini-actions">
        <button class="mini-icon-btn" onclick={() => onEdit(book)} title="Edit details">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
        <button class="mini-icon-btn delete" onclick={() => onDelete(book.id)} title="Remove book">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Book Meta (Title & Author Libib style) -->
  <div class="book-details">
    <h4 class="book-title" title={book.title}>{book.title}</h4>
    <p class="book-author" title={book.author}>{book.author}</p>
    
    <div class="book-meta-footer">
      <span class="availability-tag" class:avail={isAvailable} class:none={!isAvailable}>
        {book.available_copies || 0}/{book.total_copies || 1} available
      </span>
      {#if book.genre}
        <span class="genre-pill">{book.genre}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .book-card-container {
    display: flex;
    flex-direction: column;
    width: 175px;
    transition: transform 0.2s ease;
  }

  .book-cover-frame {
    position: relative;
    width: 175px;
    height: 250px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #E2D9CC;
    box-shadow: var(--shadow-book);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .book-card-container:hover .book-cover-frame {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
  }

  .book-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Aesthetic Fallback Cover */
  .fallback-cover {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4A3B32 0%, #2D231E 100%);
    color: #F8F4EC;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }

  .fallback-spine {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 12px;
    background: rgba(0, 0, 0, 0.25);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .fallback-content {
    margin-left: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .fallback-genre {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-amber-primary);
    font-weight: 700;
  }

  .fallback-title {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.25;
    color: #FFF9F0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .fallback-author {
    font-size: 0.75rem;
    color: #D1C5B6;
    font-weight: 500;
  }

  /* Libib Bookmark Ribbon */
  .bookmark-ribbon {
    position: absolute;
    bottom: 0;
    left: 12px;
    color: #FFFFFF;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    z-index: 2;
    transition: transform 0.18s ease;
  }

  .bookmark-ribbon.checked-out {
    color: var(--color-amber-primary);
  }

  .book-card-container:hover .bookmark-ribbon {
    transform: translateY(2px);
  }

  /* Hover Overlay */
  .cover-overlay {
    position: absolute;
    inset: 0;
    background: rgba(42, 33, 24, 0.72);
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 3;
    padding: 12px;
  }

  .book-cover-frame:hover .cover-overlay {
    opacity: 1;
  }

  .borrow-btn {
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-weight: 600;
    font-size: 0.8rem;
    padding: 7px 16px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
    transform: translateY(4px);
    transition: all 0.18s ease;
  }

  .borrow-btn:hover {
    background: var(--color-amber-hover);
    transform: translateY(2px) scale(1.04);
  }

  .checked-out-pill {
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-text-main);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: var(--radius-full);
  }

  .card-mini-actions {
    display: flex;
    gap: 8px;
  }

  .mini-icon-btn {
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-text-main);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mini-icon-btn:hover {
    background: #FFFFFF;
    color: var(--color-amber-primary);
  }

  .mini-icon-btn.delete:hover {
    color: var(--color-status-overdue);
  }

  /* Details Area */
  .book-details {
    padding-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .book-title {
    font-size: 0.84rem;
    font-weight: 700;
    color: var(--color-text-main);
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .book-author {
    font-size: 0.74rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .book-meta-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    margin-top: 3px;
  }

  .availability-tag {
    font-size: 0.68rem;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: var(--radius-sm);
  }

  .availability-tag.avail {
    background: #E8F5E9;
    color: #2E7D32;
  }

  .availability-tag.none {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
  }

  .genre-pill {
    font-size: 0.65rem;
    color: var(--color-text-muted);
  }
</style>
