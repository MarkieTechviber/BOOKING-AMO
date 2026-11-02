<script>
  import confetti from 'canvas-confetti';

  let { 
    borrowers = [], 
    borrowRecords = [],
    onOpenAddBorrower,
    onOpenEditBorrower,
    onDeleteBorrower,
    onBorrowForPatron,
    onReturnBook
  } = $props();

  let searchQuery = $state('');
  let filterStatus = $state('all'); // 'all', 'unreturned', 'overdue'

  function handleQuickReturn(recordId, bookId) {
    confetti({
      particleCount: 70,
      spread: 55,
      origin: { y: 0.7 },
      colors: ['#D97706', '#E08A3C', '#4E785C']
    });
    onReturnBook(recordId, bookId);
  }

  // Enrich borrowers with their borrow_records (unreturned & total)
  const enrichedBorrowers = $derived(() => {
    return borrowers.map(b => {
      const records = borrowRecords.filter(
        r => r.borrower_id === b.id || r.borrower_name?.toLowerCase() === b.full_name?.toLowerCase()
      );
      const unreturnedLoans = records.filter(r => r.status !== 'returned');
      const overdueLoans = unreturnedLoans.filter(r => r.status === 'overdue');
      const returnedLoans = records.filter(r => r.status === 'returned');

      return {
        ...b,
        totalLoans: records.length,
        unreturnedLoans,
        overdueLoans,
        returnedCount: returnedLoans.length
      };
    });
  });

  const filteredBorrowers = $derived(() => {
    return enrichedBorrowers().filter(b => {
      if (filterStatus === 'unreturned' && b.unreturnedLoans.length === 0) return false;
      if (filterStatus === 'overdue' && b.overdueLoans.length === 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          b.full_name?.toLowerCase().includes(q) ||
          b.member_id?.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q) ||
          b.phone?.toLowerCase().includes(q) ||
          b.department?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  const totalUnreturnedHolders = $derived(
    enrichedBorrowers().filter(b => b.unreturnedLoans.length > 0).length
  );
  const totalOverdueHolders = $derived(
    enrichedBorrowers().filter(b => b.overdueLoans.length > 0).length
  );
</script>

<div class="patrons-container animate-fade-in">
  <!-- Module Header -->
  <div class="patrons-header">
    <div>
      <span class="module-tag">SYSTEM MODULE B • BORROWERS (C.R.U.D.)</span>
      <h2 class="title">Borrower Management & Unreturned Tracker</h2>
      <p class="subtitle">Create, search, update, and delete borrowers; issue books and monitor unreturned titles per patron.</p>
    </div>

    <button class="add-borrower-btn" onclick={onOpenAddBorrower}>
      <span>+</span> Register New Borrower
    </button>
  </div>

  <!-- Search & Filter Bar -->
  <div class="controls-bar">
    <div class="filter-tabs">
      <button 
        class="tab-btn" 
        class:active={filterStatus === 'all'}
        onclick={() => filterStatus = 'all'}
      >
        All Borrowers ({borrowers.length})
      </button>
      <button 
        class="tab-btn" 
        class:active={filterStatus === 'unreturned'}
        onclick={() => filterStatus = 'unreturned'}
      >
        With Unreturned Books ({totalUnreturnedHolders})
      </button>
      <button 
        class="tab-btn" 
        class:active={filterStatus === 'overdue'}
        onclick={() => filterStatus = 'overdue'}
      >
        Overdue ({totalOverdueHolders})
      </button>
    </div>

    <div class="search-wrap">
      <input 
        type="text" 
        placeholder="Search borrower by name, ID, email, phone..." 
        bind:value={searchQuery}
        class="borrower-search"
      />
    </div>
  </div>

  <!-- Borrowers Grid -->
  {#if filteredBorrowers().length === 0}
    <div class="empty-patrons">
      <div class="empty-icon">👥</div>
      <h3>No Borrowers Found</h3>
      <p>Try adjusting your search filter or register a new borrower into the system.</p>
      <button class="add-borrower-btn" style="margin: 12px auto 0;" onclick={onOpenAddBorrower}>
        + Register Borrower
      </button>
    </div>
  {:else}
    <div class="patrons-grid">
      {#each filteredBorrowers() as b (b.id)}
        {@const hasOverdue = b.overdueLoans.length > 0}
        {@const hasUnreturned = b.unreturnedLoans.length > 0}
        <div class="patron-card" class:has-overdue={hasOverdue}>
          <!-- Top Profile & CRUD Controls -->
          <div class="patron-top">
            <div class="patron-avatar">
              {b.full_name.charAt(0).toUpperCase()}
            </div>
            <div class="patron-meta">
              <div class="name-row">
                <h4 class="patron-name">{b.full_name}</h4>
                <span class="member-code">{b.member_id}</span>
              </div>
              <span class="patron-dept">{b.department}</span>
            </div>

            <div class="crud-icons">
              <button 
                class="icon-btn" 
                onclick={() => onOpenEditBorrower(b)} 
                title="Update Borrower Info"
              >
                ✎
              </button>
              <button 
                class="icon-btn delete" 
                onclick={() => onDeleteBorrower(b.id)} 
                title="Delete Borrower"
              >
                🗑
              </button>
            </div>
          </div>

          <!-- Contact Details -->
          <div class="contact-strip">
            <span>✉ {b.email || 'No email'}</span>
            {#if b.phone}
              <span>• ☎ {b.phone}</span>
            {/if}
          </div>

          <!-- Borrower Metrics -->
          <div class="patron-stats">
            <div class="stat-item">
              <span class="stat-v" class:warn={hasUnreturned}>{b.unreturnedLoans.length}</span>
              <span class="stat-l">Unreturned Books</span>
            </div>
            <div class="stat-item">
              <span class="stat-v">{b.returnedCount}</span>
              <span class="stat-l">Returned</span>
            </div>
            <div class="stat-item">
              <span class="stat-v">{b.totalLoans}</span>
              <span class="stat-l">Total Borrowed</span>
            </div>
            <div class="stat-status">
              <span class="standing-tag" class:overdue={hasOverdue} class:suspended={b.status === 'suspended'}>
                {b.status === 'suspended' ? 'Suspended' : hasOverdue ? 'Overdue Alert' : 'Good Standing'}
              </span>
            </div>
          </div>

          <!-- Unreturned Books Held by This Borrower -->
          <div class="unreturned-section">
            <div class="unreturned-header">
              <span class="titles-label">
                {hasUnreturned ? `Unreturned Books (${b.unreturnedLoans.length})` : 'No Unreturned Books'}
              </span>
              <button 
                class="borrow-action-link" 
                onclick={() => onBorrowForPatron(b)}
                disabled={b.status === 'suspended'}
              >
                + Borrow Book
              </button>
            </div>

            {#if hasUnreturned}
              <ul class="unreturned-list">
                {#each b.unreturnedLoans as loan}
                  <li class="unreturned-item" class:overdue-item={loan.status === 'overdue'}>
                    <div class="loan-book-info">
                      <span class="loan-book-title">📖 {loan.books?.title || 'Book Title'}</span>
                      <span class="loan-due-date">
                        Due: {new Date(loan.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {#if loan.status === 'overdue'}
                          <strong class="overdue-badge">OVERDUE</strong>
                        {/if}
                      </span>
                    </div>
                    <button 
                      class="mini-return-btn"
                      onclick={() => handleQuickReturn(loan.id, loan.book_id)}
                      title="Mark book as returned"
                    >
                      ✓ Return
                    </button>
                  </li>
                {/each}
              </ul>
            {:else}
              <p class="all-clear-note">All borrowed books have been returned.</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .patrons-container {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .patrons-header {
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

  .title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .subtitle {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  .add-borrower-btn {
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-size: 0.84rem;
    font-weight: 600;
    padding: 9px 16px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.25);
  }

  .add-borrower-btn:hover {
    background: var(--color-amber-hover);
    transform: translateY(-1px);
  }

  .controls-bar {
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
    font-size: 0.8rem;
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

  .borrower-search {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    padding: 6px 14px;
    font-size: 0.8rem;
    min-width: 260px;
    outline: none;
    color: var(--color-text-main);
  }

  .borrower-search:focus {
    border-color: var(--color-amber-primary);
    background: #FFFFFF;
  }

  .patrons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 18px;
  }

  .patron-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 18px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: box-shadow 0.18s ease;
  }

  .patron-card:hover {
    box-shadow: var(--shadow-md);
  }

  .patron-card.has-overdue {
    border-left: 4px solid var(--color-status-overdue);
  }

  .patron-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .patron-avatar {
    width: 40px;
    height: 40px;
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    font-weight: 700;
    font-size: 1.1rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .patron-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .patron-name {
    font-size: 0.96rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .member-code {
    font-size: 0.68rem;
    font-weight: 700;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
  }

  .patron-dept {
    font-size: 0.74rem;
    color: var(--color-text-muted);
  }

  .crud-icons {
    display: flex;
    gap: 4px;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .icon-btn:hover {
    background: var(--color-bg);
    color: var(--color-amber-primary);
  }

  .icon-btn.delete:hover {
    color: var(--color-status-overdue);
  }

  .contact-strip {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .patron-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: var(--color-bg);
    padding: 8px 12px;
    border-radius: var(--radius-sm);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-v {
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-text-main);
  }

  .stat-v.warn {
    color: var(--color-amber-primary);
  }

  .stat-l {
    font-size: 0.64rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .standing-tag {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: #E8F5E9;
    color: #2E7D32;
  }

  .standing-tag.overdue {
    background: #FEE2E2;
    color: var(--color-status-overdue);
  }

  .standing-tag.suspended {
    background: #F3F4F6;
    color: #4B5563;
  }

  .unreturned-section {
    border-top: 1px solid var(--color-border-subtle);
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .unreturned-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .titles-label {
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .borrow-action-link {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-amber-primary);
    background: var(--color-amber-surface);
    padding: 3px 10px;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-amber-border);
  }

  .borrow-action-link:hover {
    background: var(--color-amber-light);
  }

  .unreturned-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .unreturned-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: var(--color-bg);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--color-amber-primary);
  }

  .unreturned-item.overdue-item {
    border-left-color: var(--color-status-overdue);
    background: #FEF2F2;
  }

  .loan-book-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .loan-book-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-main);
  }

  .loan-due-date {
    font-size: 0.68rem;
    color: var(--color-text-muted);
  }

  .overdue-badge {
    color: var(--color-status-overdue);
    margin-left: 4px;
  }

  .mini-return-btn {
    background: var(--color-accent-sage);
    color: #FFFFFF;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 4px 9px;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .mini-return-btn:hover {
    background: #3B5E47;
  }

  .all-clear-note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .empty-patrons {
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: 48px;
    text-align: center;
    color: var(--color-text-muted);
  }
</style>
