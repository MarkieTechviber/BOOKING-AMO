<script>
  let { books = [], borrowRecords = [] } = $props();

  const totalTitles = $derived(books.length);
  const totalCopies = $derived(books.reduce((acc, b) => acc + (b.total_copies || 1), 0));
  const availableCopies = $derived(books.reduce((acc, b) => acc + (b.available_copies || 0), 0));
  const loanedCopies = $derived(Math.max(0, totalCopies - availableCopies));
  const utilizationRate = $derived(totalCopies > 0 ? Math.round((loanedCopies / totalCopies) * 100) : 0);

  const activeLoans = $derived(borrowRecords.filter(r => r.status === 'borrowed').length);
  const overdueLoans = $derived(borrowRecords.filter(r => r.status === 'overdue').length);
  const returnedTotal = $derived(borrowRecords.filter(r => r.status === 'returned').length);

  // Genre breakdown
  const genreCounts = $derived(() => {
    const counts = {};
    for (const b of books) {
      const g = b.genre || 'General';
      counts[g] = (counts[g] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  });
</script>

<div class="reports-container animate-fade-in">
  <div class="reports-header">
    <h2 class="title">Library Analytics & Circulation Reports</h2>
    <p class="subtitle">Real-time overview of collection capacity, lending velocity, and genre coverage.</p>
  </div>

  <!-- Key Metrics 4-Box Grid -->
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-label">Collection Titles</span>
        <span class="metric-icon">📚</span>
      </div>
      <div class="metric-val">{totalTitles}</div>
      <div class="metric-sub">{totalCopies} total physical volumes</div>
    </div>

    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-label">Currently Loaned</span>
        <span class="metric-icon">🔖</span>
      </div>
      <div class="metric-val">{loanedCopies}</div>
      <div class="metric-sub">{availableCopies} volumes on shelf</div>
    </div>

    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-label">Circulation Utilization</span>
        <span class="metric-icon">📈</span>
      </div>
      <div class="metric-val">{utilizationRate}%</div>
      <div class="metric-sub">Lending rate of total stock</div>
    </div>

    <div class="metric-card" class:warning-card={overdueLoans > 0}>
      <div class="metric-top">
        <span class="metric-label">Overdue Notice</span>
        <span class="metric-icon">⚠️</span>
      </div>
      <div class="metric-val" class:alert-text={overdueLoans > 0}>{overdueLoans}</div>
      <div class="metric-sub">{returnedTotal} completed returns on record</div>
    </div>
  </div>

  <!-- Detailed Sections -->
  <div class="reports-details-grid">
    <!-- Genre distribution -->
    <div class="detail-card">
      <h3 class="card-heading">Catalog by Genre</h3>
      <div class="genre-bars">
        {#each genreCounts() as [genre, count]}
          {@const pct = totalTitles > 0 ? Math.round((count / totalTitles) * 100) : 0}
          <div class="genre-row">
            <div class="genre-info">
              <span class="genre-name">{genre}</span>
              <span class="genre-qty">{count} titles ({pct}%)</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: {pct}%"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Circulation health summary -->
    <div class="detail-card">
      <h3 class="card-heading">Lending Velocity</h3>
      <div class="health-checklist">
        <div class="check-item">
          <span class="check-icon">✓</span>
          <div>
            <strong>Automated Due Date Tracking</strong>
            <p>Calculates standard 14-day checkout windows with real-time overdue alerts.</p>
          </div>
        </div>

        <div class="check-item">
          <span class="check-icon">✓</span>
          <div>
            <strong>Instant Copy Reconciliation</strong>
            <p>Available copies update atomically on checkouts and returns.</p>
          </div>
        </div>

        <div class="check-item">
          <span class="check-icon">✓</span>
          <div>
            <strong>Supabase Cloud Persistence</strong>
            <p>All catalog entries and patron loan histories persist reliably in PostgreSQL.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .reports-container {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 24px;
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

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .metric-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: var(--shadow-sm);
  }

  .metric-card.warning-card {
    border-left: 4px solid var(--color-status-overdue);
  }

  .metric-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .metric-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-val {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-amber-primary);
    line-height: 1;
  }

  .alert-text {
    color: var(--color-status-overdue);
  }

  .metric-sub {
    font-size: 0.74rem;
    color: var(--color-text-secondary);
  }

  .reports-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
  }

  .detail-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card-heading {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .genre-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .genre-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 4px;
  }

  .genre-name {
    font-weight: 600;
    color: var(--color-text-main);
  }

  .genre-qty {
    color: var(--color-text-muted);
  }

  .bar-track {
    width: 100%;
    height: 6px;
    background: var(--color-bg);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #D97706, #E08A3C);
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .health-checklist {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .check-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .check-icon {
    width: 20px;
    height: 20px;
    background: #E8F5E9;
    color: #2E7D32;
    font-weight: bold;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .check-item strong {
    font-size: 0.84rem;
    color: var(--color-text-main);
  }

  .check-item p {
    font-size: 0.76rem;
    color: var(--color-text-muted);
    margin-top: 1px;
  }
</style>
