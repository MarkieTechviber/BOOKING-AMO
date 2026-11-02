<script>
  let {
    searchQuery = $bindable(''),
    selectedGenre = $bindable('All'),
    genres = [],
    viewMode = $bindable('cover'), // 'cover' or 'table'
    availabilityFilter = $bindable('all'), // 'all', 'available', 'borrowed'
    sortBy = $bindable('title_asc'),
    totalBooksCount = 0,
    onOpenAddBook
  } = $props();

  let showFilterDropdown = $state(false);
  let showCollectionDropdown = $state(false);
</script>

<header class="app-header">
  <!-- Top Global Search & Profile Bar -->
  <div class="header-top">
    <div class="search-box">
      <span class="search-icon">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
      <input 
        type="text" 
        placeholder="Start Searching by title, author, genre or ISBN..." 
        bind:value={searchQuery}
        class="search-input"
      />
      {#if searchQuery}
        <button class="clear-btn" onclick={() => searchQuery = ''} title="Clear search">
          ✕
        </button>
      {/if}
    </div>

    <div class="header-profile">
      <div class="library-tag">
        <span class="library-name">Count's Library</span>
        <div class="avatar-ring">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Librarian Avatar" class="avatar-img" />
        </div>
      </div>
    </div>
  </div>

  <!-- Subheader: Collection, View Switcher & Filters (Libib style) -->
  <div class="header-controls">
    <div class="collection-selector-wrapper">
      <button 
        class="collection-pill-btn" 
        onclick={() => showCollectionDropdown = !showCollectionDropdown}
      >
        <span class="collection-title">
          {selectedGenre === 'All' ? 'My Books' : selectedGenre}
        </span>
        <span class="collection-badge">{totalBooksCount}</span>
        <span class="arrow-icon">›</span>
      </button>

      {#if showCollectionDropdown}
        <div class="dropdown-menu">
          <div class="dropdown-header">COLLECTIONS & GENRES</div>
          <button 
            class="dropdown-item" 
            class:active={selectedGenre === 'All'}
            onclick={() => { selectedGenre = 'All'; showCollectionDropdown = false; }}
          >
            All Books
          </button>
          {#each genres as g}
            <button 
              class="dropdown-item" 
              class:active={selectedGenre === g}
              onclick={() => { selectedGenre = g; showCollectionDropdown = false; }}
            >
              {g}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Right Controls: View Toggle, Filters, Add Book -->
    <div class="controls-right">
      <!-- View mode toggles -->
      <div class="view-toggle-group">
        <button 
          class="toggle-btn" 
          class:active={viewMode === 'cover'} 
          onclick={() => viewMode = 'cover'}
          title="Cover Grid View"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="toggle-text">Cover</span>
        </button>

        <button 
          class="toggle-btn" 
          class:active={viewMode === 'table'} 
          onclick={() => viewMode = 'table'}
          title="Table / List View"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span class="toggle-text">Title</span>
        </button>
      </div>

      <!-- Sort dropdown selector -->
      <div class="sort-selector">
        <select bind:value={sortBy} class="sort-select">
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
          <option value="author_asc">Author</option>
          <option value="newest">Newest Added</option>
          <option value="copies">Availability</option>
        </select>
      </div>

      <!-- Filter button -->
      <div class="filter-wrapper">
        <button 
          class="filter-pill-btn" 
          class:active={availabilityFilter !== 'all'}
          onclick={() => showFilterDropdown = !showFilterDropdown}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filters</span>
          {#if availabilityFilter !== 'all'}
            <span class="filter-indicator"></span>
          {/if}
        </button>

        {#if showFilterDropdown}
          <div class="dropdown-menu filter-menu">
            <div class="dropdown-header">AVAILABILITY</div>
            <button 
              class="dropdown-item" 
              class:active={availabilityFilter === 'all'}
              onclick={() => { availabilityFilter = 'all'; showFilterDropdown = false; }}
            >
              All Items
            </button>
            <button 
              class="dropdown-item" 
              class:active={availabilityFilter === 'available'}
              onclick={() => { availabilityFilter = 'available'; showFilterDropdown = false; }}
            >
              Available Now Only
            </button>
            <button 
              class="dropdown-item" 
              class:active={availabilityFilter === 'borrowed'}
              onclick={() => { availabilityFilter = 'borrowed'; showFilterDropdown = false; }}
            >
              Checked Out / Borrowed
            </button>
          </div>
        {/if}
      </div>

      <!-- Quick Add Item button -->
      <button class="add-book-btn" onclick={onOpenAddBook}>
        <span class="plus-sign">+</span> Add Book
      </button>
    </div>
  </div>
</header>

<style>
  .app-header {
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 14px 28px 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .search-box {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    max-width: 580px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    padding: 9px 34px 9px 38px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    font-size: 0.88rem;
    color: var(--color-text-main);
    transition: all 0.18s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-amber-primary);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px var(--color-amber-light);
  }

  .clear-btn {
    position: absolute;
    right: 12px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    padding: 2px 5px;
    border-radius: 50%;
  }

  .header-profile {
    display: flex;
    align-items: center;
  }

  .library-tag {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--color-bg);
    padding: 4px 6px 4px 14px;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
  }

  .library-name {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-text-main);
  }

  .avatar-ring {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--color-amber-primary);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .header-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .collection-selector-wrapper {
    position: relative;
  }

  .collection-pill-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--color-bg-subtle);
    padding: 6px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .collection-title {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .collection-badge {
    background: #FFFFFF;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .arrow-icon {
    font-size: 1.1rem;
    color: var(--color-text-muted);
    font-weight: bold;
  }

  .controls-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .view-toggle-group {
    display: flex;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 3px;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-radius: var(--radius-sm);
  }

  .toggle-btn.active {
    background: #FFFFFF;
    color: var(--color-text-main);
    box-shadow: var(--shadow-sm);
  }

  .sort-select {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 6px 10px;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    font-weight: 500;
    cursor: pointer;
    outline: none;
  }

  .sort-select:focus {
    border-color: var(--color-amber-primary);
  }

  .filter-wrapper {
    position: relative;
  }

  .filter-pill-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .filter-pill-btn.active {
    background: var(--color-amber-light);
    border-color: var(--color-amber-border);
    color: var(--color-amber-hover);
  }

  .filter-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--color-amber-primary);
  }

  .add-book-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: var(--radius-md);
    box-shadow: 0 2px 6px rgba(217, 119, 6, 0.25);
  }

  .add-book-btn:hover {
    background: var(--color-amber-hover);
    transform: translateY(-1px);
  }

  .plus-sign {
    font-size: 1rem;
    font-weight: bold;
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    background: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    min-width: 170px;
    z-index: 50;
    padding: 6px;
    animation: fadeIn 0.15s ease;
  }

  .filter-menu {
    right: 0;
    left: auto;
  }

  .dropdown-header {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--color-text-muted);
    padding: 4px 8px;
    letter-spacing: 0.05em;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 6px 10px;
    font-size: 0.82rem;
    color: var(--color-text-secondary);
    border-radius: var(--radius-sm);
  }

  .dropdown-item:hover {
    background: var(--color-bg);
    color: var(--color-text-main);
  }

  .dropdown-item.active {
    background: var(--color-amber-surface);
    color: var(--color-amber-hover);
    font-weight: 600;
  }
</style>
