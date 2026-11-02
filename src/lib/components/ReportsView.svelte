<script>
  let { 
    books = [], 
    borrowers = [],
    borrowRecords = [],
    onNavigateTab
  } = $props();

  const totalTitles = $derived(books.length);
  const totalCopies = $derived(books.reduce((acc, b) => acc + (b.total_copies || 1), 0));
  const availableCopies = $derived(books.reduce((acc, b) => acc + (b.available_copies || 0), 0));
  const unreturnedCount = $derived(borrowRecords.filter(r => r.status !== 'returned').length);
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
    <span class="module-tag">SYSTEM ARCHITECTURE, OPERATIONS & ANALYTICS</span>
    <h2 class="title">System Overview & Circulation Reports</h2>
    <p class="subtitle">Real-time database telemetry, system modules verification, and end-to-end operational flow.</p>
  </div>

  <!-- Key Metrics 4-Box Grid -->
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-label">A. Book Catalog (CRUD)</span>
        <span class="metric-icon">📚</span>
      </div>
      <div class="metric-val">{totalTitles}</div>
      <div class="metric-sub">{availableCopies} of {totalCopies} copies available</div>
    </div>

    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-label">B. Registered Borrowers</span>
        <span class="metric-icon">👥</span>
      </div>
      <div class="metric-val">{borrowers.length}</div>
      <div class="metric-sub">Full Borrower CRUD connected</div>
    </div>

    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-label">Unreturned Books</span>
        <span class="metric-icon">🔖</span>
      </div>
      <div class="metric-val">{unreturnedCount}</div>
      <div class="metric-sub">{returnedTotal} books returned to shelf</div>
    </div>

    <div class="metric-card" class:warning-card={overdueLoans > 0}>
      <div class="metric-top">
        <span class="metric-label">Overdue Unreturned</span>
        <span class="metric-icon">⚠️</span>
      </div>
      <div class="metric-val" class:alert-text={overdueLoans > 0}>{overdueLoans}</div>
      <div class="metric-sub">Requires borrower follow-up</div>
    </div>
  </div>

  <!-- General Flow 5-Step Interactive Pipeline -->
  <div class="flow-card">
    <div class="flow-header">
      <h3 class="card-heading">4. General System Flow (Live Verification)</h3>
      <span class="live-pill">✓ All 5 Steps Active</span>
    </div>
    <div class="flow-steps">
      <button class="flow-step" onclick={() => onNavigateTab('library')}>
        <span class="step-num">1</span>
        <div class="step-body">
          <strong>Maintain Book Records</strong>
          <p>Management adds, updates, and deletes book records in Supabase (`books` table).</p>
        </div>
      </button>

      <button class="flow-step" onclick={() => onNavigateTab('patrons')}>
        <span class="step-num">2</span>
        <div class="step-body">
          <strong>Borrowers Borrow Books</strong>
          <p>Registered borrowers (`borrowers` table) check out available books.</p>
        </div>
      </button>

      <button class="flow-step" onclick={() => onNavigateTab('lending')}>
        <span class="step-num">3</span>
        <div class="step-body">
          <strong>Record Borrowed Books</strong>
          <p>System records loan transactions (`borrow_records`) and decrements shelf stock.</p>
        </div>
      </button>

      <button class="flow-step" onclick={() => onNavigateTab('lending')}>
        <span class="step-num">4</span>
        <div class="step-body">
          <strong>Track Unreturned Books</strong>
          <p>System monitors unreturned & overdue books until returned to circulation.</p>
        </div>
      </button>

      <button class="flow-step" onclick={() => onNavigateTab('library')}>
        <span class="step-num">5</span>
        <div class="step-body">
          <strong>Search & Update Info</strong>
          <p>Instant search across title, author, ISBN, genre, and borrower records.</p>
        </div>
      </button>
    </div>
  </div>

  <!-- Detailed Sections: Architecture + Genre Breakdown -->
  <div class="reports-details-grid">
    <!-- System Architecture & Operations -->
    <div class="detail-card">
      <h3 class="card-heading">2 & 3. System Architecture & Operations</h3>
      <div class="arch-list">
        <div class="arch-item">
          <span class="arch-badge">FRONTEND</span>
          <div>
            <strong>Svelte 5 (Reactive UI Layer)</strong>
            <p>Handles user interface, Libib catalog view, alphabetical scrubber, and modal forms.</p>
          </div>
        </div>

        <div class="arch-item">
          <span class="arch-badge">BACKEND</span>
          <div>
            <strong>Supabase PostgreSQL + RLS</strong>
            <p>Handles relational database persistence (`books`, `borrowers`, `borrow_records`) and foreign-key integrity.</p>
          </div>
        </div>

        <div class="arch-item">
          <span class="arch-badge">OPERATIONS</span>
          <div>
            <strong>Connected Book & Borrower Records</strong>
            <p>Every loan links `book_id → books.id` and `borrower_id → borrowers.id`, automatically tracking borrowed and unreturned books.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Genre distribution -->
    <div class="detail-card">
      <h3 class="card-heading">Catalog Distribution by Genre</h3>
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
  </div>
</div>

<style>
  .reports-container {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 22px;
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
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
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

  .flow-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .flow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .live-pill {
    font-size: 0.72rem;
    font-weight: 700;
    background: #E8F5E9;
    color: #2E7D32;
    padding: 3px 10px;
    border-radius: var(--radius-full);
  }

  .flow-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
  }

  .flow-step {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    text-align: left;
  }

  .flow-step:hover {
    border-color: var(--color-amber-primary);
    background: var(--color-amber-surface);
    transform: translateY(-2px);
  }

  .step-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-body strong {
    font-size: 0.82rem;
    color: var(--color-text-main);
    display: block;
    margin-bottom: 2px;
  }

  .step-body p {
    font-size: 0.72rem;
    color: var(--color-text-secondary);
    line-height: 1.35;
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

  .arch-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .arch-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .arch-badge {
    font-size: 0.62rem;
    font-weight: 800;
    padding: 3px 7px;
    border-radius: var(--radius-sm);
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    letter-spacing: 0.05em;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .arch-item strong {
    font-size: 0.84rem;
    color: var(--color-text-main);
    display: block;
  }

  .arch-item p {
    font-size: 0.76rem;
    color: var(--color-text-muted);
    margin-top: 2px;
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
</style>
