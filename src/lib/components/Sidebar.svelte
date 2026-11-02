<script>
  let { 
    activeTab = 'library', 
    onSelectTab, 
    onOpenAddBook, 
    booksCount = 0, 
    activeLoansCount = 0 
  } = $props();
</script>

<aside class="sidebar">
  <!-- Brand Logo -->
  <div class="brand">
    <div class="logo-icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
      </svg>
    </div>
    <div class="brand-text">
      <span class="brand-name">booking-amo</span>
      <span class="brand-sub">edition 2.0</span>
    </div>
  </div>

  <!-- Primary Navigation -->
  <nav class="nav-menu">
    <div class="nav-section-label">CATALOG</div>
    
    <button 
      class="nav-item" 
      class:active={activeTab === 'library'}
      onclick={() => onSelectTab('library')}
    >
      <span class="nav-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          <path d="M6 6h10"/>
          <path d="M6 10h10"/>
        </svg>
      </span>
      <span class="nav-label">Library</span>
      {#if booksCount > 0}
        <span class="nav-badge">{booksCount}</span>
      {/if}
    </button>

    <button 
      class="nav-item action-btn" 
      onclick={onOpenAddBook}
    >
      <span class="nav-icon add-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </span>
      <span class="nav-label">Add Items</span>
    </button>

    <div class="nav-section-label" style="margin-top: 18px;">CIRCULATION</div>

    <button 
      class="nav-item" 
      class:active={activeTab === 'lending'}
      onclick={() => onSelectTab('lending')}
    >
      <span class="nav-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </span>
      <span class="nav-label">Lending</span>
      {#if activeLoansCount > 0}
        <span class="nav-badge amber-badge">{activeLoansCount}</span>
      {/if}
    </button>

    <button 
      class="nav-item" 
      class:active={activeTab === 'patrons'}
      onclick={() => onSelectTab('patrons')}
    >
      <span class="nav-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </span>
      <span class="nav-label">Patrons</span>
    </button>

    <div class="nav-section-label" style="margin-top: 18px;">INSIGHTS</div>

    <button 
      class="nav-item" 
      class:active={activeTab === 'reports'}
      onclick={() => onSelectTab('reports')}
    >
      <span class="nav-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      </span>
      <span class="nav-label">Reports</span>
    </button>

    <button 
      class="nav-item" 
      class:active={activeTab === 'settings'}
      onclick={() => onSelectTab('settings')}
    >
      <span class="nav-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </span>
      <span class="nav-label">Settings</span>
    </button>
  </nav>

  <!-- Bottom System Status -->
  <div class="sidebar-footer">
    <div class="status-indicator">
      <span class="status-dot"></span>
      <span class="status-label">Supabase Live</span>
    </div>
    <div class="version-tag">Warm Amber Edition</div>
  </div>
</aside>

<style>
  .sidebar {
    width: 220px;
    height: 100vh;
    background-color: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    padding: 20px 14px;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 20;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px 20px 8px;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #D97706, #B45309);
    color: white;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 8px rgba(217, 119, 6, 0.28);
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
    color: var(--color-text-main);
    line-height: 1.1;
  }

  .brand-sub {
    font-size: 0.68rem;
    color: var(--color-amber-primary);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .nav-menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 16px;
  }

  .nav-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 0.08em;
    padding: 0 10px 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 12px;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: 0.88rem;
    font-weight: 500;
    text-align: left;
    width: 100%;
  }

  .nav-item:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text-main);
  }

  .nav-item.active {
    background-color: var(--color-amber-surface);
    color: var(--color-amber-hover);
    font-weight: 600;
    border-left: 3px solid var(--color-amber-primary);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .action-btn {
    color: var(--color-amber-primary);
    font-weight: 600;
  }

  .action-btn:hover {
    background-color: var(--color-amber-light);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
  }

  .nav-item.active .nav-icon {
    opacity: 1;
    color: var(--color-amber-primary);
  }

  .nav-label {
    flex: 1;
  }

  .nav-badge {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 1px 7px;
    background: var(--color-bg-subtle);
    color: var(--color-text-secondary);
    border-radius: var(--radius-full);
  }

  .amber-badge {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
  }

  .sidebar-footer {
    padding-top: 14px;
    border-top: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.76rem;
    color: var(--color-accent-sage);
    font-weight: 600;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #2E7D32;
    box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
    animation: pulseSubtle 2s infinite ease-in-out;
  }

  .version-tag {
    font-size: 0.7rem;
    color: var(--color-text-muted);
  }

  @media (max-width: 860px) {
    .sidebar {
      width: 68px;
      padding: 14px 8px;
    }
    .brand-text, .nav-label, .nav-section-label, .nav-badge, .version-tag, .status-label {
      display: none;
    }
    .nav-item {
      justify-content: center;
      padding: 10px 0;
    }
    .sidebar-footer {
      align-items: center;
    }
  }
</style>
