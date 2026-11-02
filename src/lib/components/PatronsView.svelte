<script>
  let { borrowRecords = [] } = $props();

  // Aggregate patrons
  const patronsMap = $derived(() => {
    const map = new Map();
    for (const r of borrowRecords) {
      const key = (r.borrower_name || '').trim().toLowerCase();
      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, {
          name: r.borrower_name,
          email: r.borrower_email || '—',
          totalBorrowed: 0,
          currentLoans: [],
          overdueCount: 0
        });
      }
      const entry = map.get(key);
      entry.totalBorrowed++;
      if (r.status === 'borrowed') {
        entry.currentLoans.push(r.books?.title || 'Unknown title');
      } else if (r.status === 'overdue') {
        entry.currentLoans.push(r.books?.title || 'Unknown title');
        entry.overdueCount++;
      }
    }
    return Array.from(map.values());
  });
</script>

<div class="patrons-container animate-fade-in">
  <div class="patrons-header">
    <h2 class="title">Library Patrons Directory</h2>
    <p class="subtitle">Borrower history, active circulation status, and patron standing.</p>
  </div>

  {#if patronsMap().length === 0}
    <div class="empty-patrons">
      <div class="empty-icon">👥</div>
      <h3>No Patrons on File</h3>
      <p>Borrowing records will automatically populate the patron directory.</p>
    </div>
  {:else}
    <div class="patrons-grid">
      {#each patronsMap() as p}
        {@const hasOverdue = p.overdueCount > 0}
        <div class="patron-card" class:has-overdue={hasOverdue}>
          <div class="patron-top">
            <div class="patron-avatar">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div class="patron-meta">
              <h4 class="patron-name">{p.name}</h4>
              <span class="patron-email">{p.email}</span>
            </div>
            <span class="standing-tag" class:overdue={hasOverdue}>
              {hasOverdue ? 'Overdue Notice' : 'Good Standing'}
            </span>
          </div>

          <div class="patron-stats">
            <div class="stat-item">
              <span class="stat-v">{p.currentLoans.length}</span>
              <span class="stat-l">Active Loans</span>
            </div>
            <div class="stat-item">
              <span class="stat-v">{p.totalBorrowed}</span>
              <span class="stat-l">Total Checkouts</span>
            </div>
          </div>

          {#if p.currentLoans.length > 0}
            <div class="current-titles">
              <span class="titles-label">Currently Reading:</span>
              <ul class="titles-list">
                {#each p.currentLoans as title}
                  <li>📖 {title}</li>
                {/each}
              </ul>
            </div>
          {/if}
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

  .title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .subtitle {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  .patrons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .patron-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 16px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .patron-card.has-overdue {
    border-left: 4px solid var(--color-status-overdue);
  }

  .patron-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .patron-avatar {
    width: 38px;
    height: 38px;
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    font-weight: 700;
    font-size: 1.1rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .patron-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .patron-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .patron-email {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .standing-tag {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: #E8F5E9;
    color: #2E7D32;
  }

  .standing-tag.overdue {
    background: #FEE2E2;
    color: var(--color-status-overdue);
  }

  .patron-stats {
    display: flex;
    gap: 16px;
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
    font-size: 1.05rem;
    color: var(--color-amber-primary);
  }

  .stat-l {
    font-size: 0.68rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .current-titles {
    font-size: 0.78rem;
    color: var(--color-text-secondary);
  }

  .titles-label {
    font-weight: 600;
    color: var(--color-text-main);
  }

  .titles-list {
    list-style: none;
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
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
