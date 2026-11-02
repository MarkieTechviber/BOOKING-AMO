<script>
  import confetti from 'canvas-confetti';

  let { 
    borrowRecords = [], 
    onOpenBorrowModal,
    onReturnBook, 
    onExtendLoan,
    onDeleteRecord 
  } = $props();

  let filterTab = $state('unreturned'); // 'unreturned', 'overdue', 'active', 'returned', 'all'
  let searchBorrower = $state('');

  function triggerReturnSuccess(record) {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D97706', '#E08A3C', '#4E785C', '#FDE68A']
    });

    onReturnBook(record.id, record.book_id);
  }

  // Derived stats
  const unreturnedRecords = $derived(borrowRecords.filter(r => r.status !== 'returned'));
  const activeRecords = $derived(borrowRecords.filter(r => r.status === 'borrowed'));
  const overdueRecords = $derived(borrowRecords.filter(r => r.status === 'overdue'));
  const returnedRecords = $derived(borrowRecords.filter(r => r.status === 'returned'));

  // Filtered view
  const filteredList = $derived(borrowRecords.filter(r => {
    if (filterTab === 'unreturned' && r.status === 'returned') return false;
    if (filterTab === 'active' && r.status !== 'borrowed') return false;
    if (filterTab === 'overdue' && r.status !== 'overdue') return false;
    if (filterTab === 'returned' && r.status !== 'returned') return false;

    if (searchBorrower.trim()) {
      const q = searchBorrower.toLowerCase();
      const matchesBorrower =
        r.borrower_name?.toLowerCase().includes(q) ||
        r.borrower_email?.toLowerCase().includes(q) ||
        r.borrowers?.member_id?.toLowerCase().includes(q);
      const matchesBook =
        r.books?.title?.toLowerCase().includes(q) ||
        r.books?.author?.toLowerCase().includes(q);
      return matchesBorrower || matchesBook;
    }
    return true;
  }));

  function formatRelativeDate(isoStr) {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getDueTimeText(dueDateStr, status) {
    if (status === 'returned') return 'Returned to Shelf';
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Unreturned • Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    } else if (diffDays === 0) {
      return 'Unreturned • Due today';
    } else {
      return `Unreturned • Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }
  }
</script>

<div class="lending-container animate-fade-in">
  <!-- Lending Desk Header -->
  <div class="lending-header">
    <div>
      <span class="module-tag">SYSTEM MODULE B • BORROW BOOKS & UNRETURNED TRACKER</span>
      <h2 class="section-title">Unreturned Books & Circulation Records</h2>
      <p class="section-desc">Track borrowed and unreturned books connected to borrower records, extend due dates, or record returns.</p>
    </div>

    <div class="header-right-group">
      <!-- Quick stats overview -->
      <div class="stat-pills">
        <div class="stat-box">
          <span class="stat-num">{unreturnedRecords.length}</span>
          <span class="stat-lbl">Unreturned</span>
        </div>
        <div class="stat-box overdue" class:has-overdue={overdueRecords.length > 0}>
          <span class="stat-num">{overdueRecords.length}</span>
          <span class="stat-lbl">Overdue</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{returnedRecords.length}</span>
          <span class="stat-lbl">Returned</span>
        </div>
      </div>

      <button class="borrow-cta-btn" onclick={onOpenBorrowModal}>
        + Borrow Book
      </button>
    </div>
  </div>

  <!-- Controls Bar: Filter Tabs & Search -->
  <div class="lending-controls">
    <div class="filter-tabs">
      <button 
        class="tab-btn" 
        class:active={filterTab === 'unreturned'}
        onclick={() => filterTab = 'unreturned'}
      >
        All Unreturned Books ({unreturnedRecords.length})
      </button>
      <button 
        class="tab-btn" 
        class:active={filterTab === 'overdue'}
        onclick={() => filterTab = 'overdue'}
      >
        Overdue ({overdueRecords.length})
      </button>
      <button 
        class="tab-btn" 
        class:active={filterTab === 'active'}
        onclick={() => filterTab = 'active'}
      >
        On-Time Loans ({activeRecords.length})
      </button>
      <button 
        class="tab-btn" 
        class:active={filterTab === 'returned'}
        onclick={() => filterTab = 'returned'}
      >
        Returned History ({returnedRecords.length})
      </button>
      <button 
        class="tab-btn" 
        class:active={filterTab === 'all'}
        onclick={() => filterTab = 'all'}
      >
        All Records ({borrowRecords.length})
      </button>
    </div>

    <div class="search-wrap">
      <input 
        type="text" 
        placeholder="Search book title, borrower, or ID..." 
        bind:value={searchBorrower} 
        class="lending-search-input"
      />
    </div>
  </div>

  <!-- Lending Records List -->
  {#if filteredList.length === 0}
    <div class="empty-lending">
      <div class="empty-icon">📚</div>
      <h3>No borrowing records match this filter</h3>
      <p>Use the "+ Borrow Book" button to issue an available book to a borrower.</p>
    </div>
  {:else}
    <div class="records-grid">
      {#each filteredList as record (record.id)}
        {@const isOverdue = record.status === 'overdue'}
        {@const isReturned = record.status === 'returned'}
        
        <div class="record-card" class:overdue-card={isOverdue}>
          <div class="card-left">
            <div class="book-thumbnail">
              {#if record.books?.cover_url}
                <img src={record.books.cover_url} alt={record.books.title} class="thumb-img" />
              {:else}
                <div class="thumb-alt">📖</div>
              {/if}
            </div>

            <div class="record-info">
              <div class="title-line">
                <h4 class="book-title">{record.books?.title || 'Unknown Title'}</h4>
                {#if !isReturned}
                  <span class="unreturned-tag" class:overdue={isOverdue}>
                    {isOverdue ? 'UNRETURNED • OVERDUE' : 'UNRETURNED'}
                  </span>
                {/if}
              </div>
              <p class="book-author">{record.books?.author || 'Unknown Author'}</p>
              
              <div class="borrower-badge">
                <span class="user-icon">👤</span>
                <span class="borrower-name">{record.borrower_name}</span>
                {#if record.borrowers?.member_id}
                  <span class="member-pill">{record.borrowers.member_id}</span>
                {/if}
                {#if record.borrower_email}
                  <span class="borrower-email">({record.borrower_email})</span>
                {/if}
              </div>

              {#if record.notes}
                <p class="record-notes">Note: {record.notes}</p>
              {/if}
            </div>
          </div>

          <div class="card-right">
            <div class="dates-meta">
              <div class="date-row">
                <span class="date-lbl">Borrowed:</span>
                <span class="date-val">{formatRelativeDate(record.borrowed_date)}</span>
              </div>
              <div class="date-row">
                <span class="date-lbl">{isReturned ? 'Returned:' : 'Due Date:'}</span>
                <span class="date-val" class:overdue-text={isOverdue}>
                  {formatRelativeDate(isReturned ? record.returned_date : record.due_date)}
                </span>
              </div>
              <span class="due-pill" class:overdue-pill={isOverdue} class:returned-pill={isReturned}>
                {getDueTimeText(record.due_date, record.status)}
              </span>
            </div>

            <div class="record-actions">
              {#if !isReturned}
                <button 
                  class="extend-btn" 
                  onclick={() => onExtendLoan(record)}
                  title="Extend due date by 7 days"
                >
                  +7d
                </button>
                <button 
                  class="return-btn" 
                  onclick={() => triggerReturnSuccess(record)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Return Book
                </button>
              {:else}
                <span class="returned-badge">✓ Returned</span>
              {/if}

              <button 
                class="del-btn" 
                onclick={() => onDeleteRecord(record.id)} 
                title="Delete record"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lending-container {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .lending-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
  }

  .module-tag {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--color-amber-primary);
    letter-spacing: 0.06em;
    display: block;
    margin-bottom: 2px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .section-desc {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  .header-right-group {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .stat-pills {
    display: flex;
    gap: 10px;
  }

  .stat-box {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 8px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 86px;
  }

  .stat-box.overdue.has-overdue {
    border-color: #FECACA;
    background: #FEF2F2;
  }

  .stat-box.overdue.has-overdue .stat-num {
    color: var(--color-status-overdue);
  }

  .stat-num {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-amber-primary);
    line-height: 1;
  }

  .stat-lbl {
    font-size: 0.66rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    margin-top: 2px;
  }

  .borrow-cta-btn {
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-size: 0.84rem;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.25);
  }

  .borrow-cta-btn:hover {
    background: var(--color-amber-hover);
    transform: translateY(-1px);
  }

  .lending-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 8px 14px;
  }

  .filter-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tab-btn {
    padding: 6px 12px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-radius: var(--radius-sm);
  }

  .tab-btn:hover {
    background: var(--color-bg);
  }

  .tab-btn.active {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
  }

  .lending-search-input {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    padding: 6px 14px;
    font-size: 0.8rem;
    min-width: 240px;
    outline: none;
    color: var(--color-text-main);
  }

  .lending-search-input:focus {
    border-color: var(--color-amber-primary);
    background: #FFFFFF;
  }

  .records-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .record-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    box-shadow: var(--shadow-sm);
    transition: transform 0.18s ease;
  }

  .record-card:hover {
    box-shadow: var(--shadow-md);
  }

  .record-card.overdue-card {
    border-left: 4px solid var(--color-status-overdue);
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .book-thumbnail {
    width: 48px;
    height: 70px;
    border-radius: 4px;
    overflow: hidden;
    background: #E8E0D5;
    flex-shrink: 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-alt {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }

  .record-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .title-line {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .book-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .unreturned-tag {
    font-size: 0.62rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    letter-spacing: 0.04em;
  }

  .unreturned-tag.overdue {
    background: #FEE2E2;
    color: var(--color-status-overdue);
  }

  .book-author {
    font-size: 0.78rem;
    color: var(--color-text-secondary);
  }

  .borrower-badge {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--color-amber-hover);
    font-weight: 600;
    margin-top: 2px;
  }

  .member-pill {
    font-size: 0.68rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    padding: 0 5px;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
  }

  .borrower-email {
    font-weight: 400;
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }

  .record-notes {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .card-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .dates-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .date-row {
    font-size: 0.74rem;
    color: var(--color-text-secondary);
    display: flex;
    gap: 6px;
  }

  .date-lbl {
    color: var(--color-text-muted);
  }

  .overdue-text {
    color: var(--color-status-overdue);
    font-weight: 700;
  }

  .due-pill {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 1px 8px;
    border-radius: var(--radius-full);
    background: var(--color-bg);
    color: var(--color-text-secondary);
    margin-top: 2px;
  }

  .due-pill.overdue-pill {
    background: #FEE2E2;
    color: var(--color-status-overdue);
  }

  .due-pill.returned-pill {
    background: #E8F5E9;
    color: #2E7D32;
  }

  .record-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .extend-btn {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    font-size: 0.74rem;
    font-weight: 700;
    padding: 6px 10px;
    border-radius: var(--radius-md);
  }

  .extend-btn:hover {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    border-color: var(--color-amber-border);
  }

  .return-btn {
    background: var(--color-accent-sage);
    color: #FFFFFF;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 6px rgba(78, 120, 92, 0.25);
  }

  .return-btn:hover {
    background: #3B5E47;
    transform: translateY(-1px);
  }

  .returned-badge {
    font-size: 0.78rem;
    font-weight: 600;
    color: #2E7D32;
    background: #E8F5E9;
    padding: 4px 10px;
    border-radius: var(--radius-sm);
  }

  .del-btn {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .del-btn:hover {
    background: var(--color-bg);
    color: var(--color-status-overdue);
  }

  .empty-lending {
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: 48px;
    text-align: center;
    color: var(--color-text-muted);
  }

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 8px;
  }
</style>
