<script>
  import { onMount } from 'svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import Header from './lib/components/Header.svelte';
  import AlphabetScrubber from './lib/components/AlphabetScrubber.svelte';
  import BookCard from './lib/components/BookCard.svelte';
  import BookTable from './lib/components/BookTable.svelte';
  import LendingDesk from './lib/components/LendingDesk.svelte';
  import PatronsView from './lib/components/PatronsView.svelte';
  import ReportsView from './lib/components/ReportsView.svelte';
  import SettingsView from './lib/components/SettingsView.svelte';
  import BookModal from './lib/components/BookModal.svelte';
  import BorrowerModal from './lib/components/BorrowerModal.svelte';
  import BorrowModal from './lib/components/BorrowModal.svelte';
  import confetti from 'canvas-confetti';

  import { 
    fetchBooks, 
    fetchBorrowers,
    fetchBorrowRecords, 
    addBook, 
    updateBook, 
    deleteBook, 
    addBorrower,
    updateBorrower,
    deleteBorrower,
    borrowBook, 
    updateBorrowRecord,
    returnBook, 
    deleteBorrowRecord 
  } from './lib/bookService';

  // State
  let books = $state([]);
  let borrowers = $state([]);
  let borrowRecords = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let activeTab = $state('library'); // 'library', 'lending', 'patrons', 'reports', 'settings'

  // Search & Filters
  let searchQuery = $state('');
  let selectedGenre = $state('All');
  let selectedLetter = $state('ALL');
  let viewMode = $state('cover'); // 'cover' or 'table'
  let availabilityFilter = $state('all'); // 'all', 'available', 'borrowed'
  let sortBy = $state('title_asc');

  // Book Modal
  let isBookModalOpen = $state(false);
  let isEditMode = $state(false);
  let selectedBookForEdit = $state(null);

  // Borrower Modal (CRUD)
  let isBorrowerModalOpen = $state(false);
  let isBorrowerEditMode = $state(false);
  let selectedBorrowerForEdit = $state(null);

  // Borrow Checkout Modal
  let isBorrowModalOpen = $state(false);
  let selectedBookForBorrow = $state(null);
  let preselectedBorrower = $state(null);

  // Toast notification
  let toastMsg = $state(null);
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg = msg;
    toastTimer = setTimeout(() => {
      toastMsg = null;
    }, 3500);
  }

  // Load All Relational Data from Supabase
  async function loadData() {
    try {
      loading = true;
      error = null;
      const [fetchedBooks, fetchedBorrowers, fetchedRecords] = await Promise.all([
        fetchBooks(),
        fetchBorrowers(),
        fetchBorrowRecords()
      ]);
      books = fetchedBooks;
      borrowers = fetchedBorrowers;
      borrowRecords = fetchedRecords;
    } catch (err) {
      console.error('Error loading data:', err);
      error = err.message || 'Failed to connect to Supabase';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadData();
  });

  // Extract distinct genres
  const genresList = $derived(() => {
    const set = new Set();
    for (const b of books) {
      if (b.genre) set.add(b.genre);
    }
    return Array.from(set).sort();
  });

  // Available books for borrowing
  const availableBooksList = $derived(
    books.filter(b => (b.available_copies || 0) > 0)
  );

  // Extract letters that currently have books
  const lettersWithBooks = $derived(() => {
    const set = new Set();
    for (const b of books) {
      if (b.title) {
        const first = b.title.trim().charAt(0).toUpperCase();
        if (/[A-Z]/.test(first)) {
          set.add(first);
        }
      }
    }
    return Array.from(set);
  });

  // Filtered & Sorted books
  const processedBooks = $derived(() => {
    let result = [...books];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q) ||
        b.genre?.toLowerCase().includes(q)
      );
    }

    // Genre collection filter
    if (selectedGenre !== 'All') {
      result = result.filter(b => b.genre === selectedGenre);
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      result = result.filter(b => (b.available_copies || 0) > 0);
    } else if (availabilityFilter === 'borrowed') {
      result = result.filter(b => (b.available_copies || 0) < (b.total_copies || 1));
    }

    // Alphabet letter filter
    if (selectedLetter !== 'ALL') {
      if (selectedLetter === '#') {
        result = result.filter(b => !/^[A-Z]/i.test(b.title.trim()));
      } else {
        result = result.filter(b => b.title.trim().toUpperCase().startsWith(selectedLetter));
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      } else if (sortBy === 'author_asc') {
        return a.author.localeCompare(b.author);
      } else if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      } else if (sortBy === 'copies') {
        return (b.available_copies || 0) - (a.available_copies || 0);
      }
      return 0;
    });

    return result;
  });

  // Group books by first letter for Libib section headers
  const booksByLetter = $derived(() => {
    const list = processedBooks();
    const groups = {};

    for (const book of list) {
      let first = book.title.trim().charAt(0).toUpperCase();
      if (!/[A-Z]/.test(first)) first = '#';
      if (!groups[first]) groups[first] = [];
      groups[first].push(book);
    }

    return Object.keys(groups).sort().map(letter => ({
      letter,
      items: groups[letter]
    }));
  });

  // Unreturned books count (both borrowed + overdue)
  const unreturnedCount = $derived(borrowRecords.filter(r => r.status !== 'returned').length);

  /* =========================================================
     MODULE A HANDLERS: BOOK MANAGEMENT (CRUD)
     ========================================================= */
  function openAddModal() {
    isEditMode = false;
    selectedBookForEdit = null;
    isBookModalOpen = true;
  }

  function openEditModal(book) {
    isEditMode = true;
    selectedBookForEdit = book;
    isBookModalOpen = true;
  }

  async function handleSaveBook(payload) {
    try {
      if (isEditMode && payload.id) {
        await updateBook(payload.id, payload);
        showToast(`✓ Updated book "${payload.title}"`);
      } else {
        await addBook(payload);
        showToast(`✓ Added "${payload.title}" to catalog`);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
      }
      isBookModalOpen = false;
      await loadData();
    } catch (err) {
      alert(`Error saving book: ${err.message}`);
    }
  }

  async function handleDeleteBook(id) {
    const book = books.find(b => b.id === id);
    if (!confirm(`Are you sure you want to delete "${book?.title || 'this book'}" from the catalog?`)) {
      return;
    }
    try {
      await deleteBook(id);
      showToast(`✓ Deleted "${book?.title || 'book'}" from catalog`);
      await loadData();
    } catch (err) {
      alert(`Error deleting book: ${err.message}`);
    }
  }

  /* =========================================================
     MODULE B HANDLERS: BORROWERS (CRUD)
     ========================================================= */
  function openAddBorrowerModal() {
    isBorrowerEditMode = false;
    selectedBorrowerForEdit = null;
    isBorrowerModalOpen = true;
  }

  function openEditBorrowerModal(borrower) {
    isBorrowerEditMode = true;
    selectedBorrowerForEdit = borrower;
    isBorrowerModalOpen = true;
  }

  async function handleSaveBorrower(payload) {
    try {
      if (isBorrowerEditMode && payload.id) {
        await updateBorrower(payload.id, payload);
        showToast(`✓ Updated borrower "${payload.full_name}"`);
      } else {
        await addBorrower(payload);
        showToast(`✓ Registered borrower "${payload.full_name}"`);
        confetti({ particleCount: 45, spread: 50, origin: { y: 0.8 } });
      }
      isBorrowerModalOpen = false;
      await loadData();
    } catch (err) {
      alert(`Error saving borrower: ${err.message}`);
    }
  }

  async function handleDeleteBorrower(id) {
    const b = borrowers.find(x => x.id === id);
    if (!confirm(`Remove borrower "${b?.full_name || 'this patron'}" from database?`)) {
      return;
    }
    try {
      await deleteBorrower(id);
      showToast(`✓ Deleted borrower record`);
      await loadData();
    } catch (err) {
      alert(`Error deleting borrower: ${err.message}`);
    }
  }

  /* =========================================================
     CIRCULATION HANDLERS: BORROW BOOKS & UNRETURNED TRACKING
     ========================================================= */
  function openBorrowModalForBook(book = null) {
    selectedBookForBorrow = book;
    preselectedBorrower = null;
    isBorrowModalOpen = true;
  }

  function openBorrowModalForPatron(borrower) {
    selectedBookForBorrow = null;
    preselectedBorrower = borrower;
    isBorrowModalOpen = true;
  }

  async function handleConfirmBorrow(checkoutData) {
    try {
      await borrowBook(checkoutData);
      isBorrowModalOpen = false;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#E08A3C', '#4E785C']
      });
      showToast(`✓ Book borrowed by ${checkoutData.borrowerName}`);
      await loadData();
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    }
  }

  async function handleExtendLoan(record) {
    try {
      const currentDue = new Date(record.due_date);
      currentDue.setDate(currentDue.getDate() + 7);
      await updateBorrowRecord(record.id, {
        due_date: currentDue.toISOString(),
        status: currentDue > new Date() ? 'borrowed' : 'overdue'
      });
      showToast(`✓ Extended due date by 7 days for ${record.borrower_name}`);
      await loadData();
    } catch (err) {
      alert(`Failed to extend due date: ${err.message}`);
    }
  }

  async function handleReturnBook(recordId, bookId) {
    try {
      await returnBook(recordId, bookId);
      showToast(`✓ Book marked as returned & restocked`);
      await loadData();
    } catch (err) {
      alert(`Failed to return book: ${err.message}`);
    }
  }

  async function handleDeleteBorrowRecord(recordId) {
    if (!confirm('Delete this borrowing record?')) return;
    try {
      await deleteBorrowRecord(recordId);
      showToast('✓ Borrowing record deleted');
      await loadData();
    } catch (err) {
      alert(`Failed to delete record: ${err.message}`);
    }
  }
</script>

<div class="app-layout">
  <!-- Left Libib-Style Sidebar -->
  <Sidebar 
    {activeTab}
    onSelectTab={(tab) => activeTab = tab}
    onOpenAddBook={openAddModal}
    onOpenBorrowBook={() => openBorrowModalForBook(null)}
    booksCount={books.length}
    {unreturnedCount}
    borrowersCount={borrowers.length}
  />

  <!-- Main Work Area -->
  <main class="main-content">
    <!-- Top Search & Collection Header -->
    <Header 
      bind:searchQuery
      bind:selectedGenre
      genres={genresList()}
      bind:viewMode
      bind:availabilityFilter
      bind:sortBy
      totalBooksCount={books.length}
      onOpenAddBook={openAddModal}
    />

    {#if activeTab === 'library'}
      <!-- Alphabetical index scrubber bar (Libib signature) -->
      <AlphabetScrubber 
        bind:selectedLetter
        availableLetters={lettersWithBooks()}
      />

      <section class="catalog-viewport">
        {#if loading}
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading library collection...</p>
          </div>
        {:else if error}
          <div class="error-banner">
            <span>⚠️ {error}</span>
            <button onclick={loadData} class="retry-btn">Retry Connection</button>
          </div>
        {:else if processedBooks().length === 0}
          <div class="empty-state">
            <div class="empty-icon">📖</div>
            <h3>No Books Match Your Search</h3>
            <p>Try clearing your search query, choosing another letter, or adding a new title.</p>
            <button class="add-prompt-btn" onclick={openAddModal}>+ Add New Book</button>
          </div>
        {:else}
          {#if viewMode === 'cover'}
            <div class="alphabet-grouped-catalog animate-fade-in">
              {#each booksByLetter() as group}
                <div class="alphabet-section">
                  <!-- Libib section divider letter -->
                  <div class="section-letter-heading">{group.letter}</div>
                  
                  <div class="books-grid">
                    {#each group.items as book (book.id)}
                      <BookCard 
                        {book}
                        onBorrow={openBorrowModalForBook}
                        onEdit={openEditModal}
                        onDelete={handleDeleteBook}
                      />
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="table-view-wrap animate-fade-in">
              <BookTable 
                books={processedBooks()}
                onBorrow={openBorrowModalForBook}
                onEdit={openEditModal}
                onDelete={handleDeleteBook}
              />
            </div>
          {/if}
        {/if}
      </section>

    {:else if activeTab === 'lending'}
      <LendingDesk 
        {borrowRecords}
        onOpenBorrowModal={() => openBorrowModalForBook(null)}
        onReturnBook={handleReturnBook}
        onExtendLoan={handleExtendLoan}
        onDeleteRecord={handleDeleteBorrowRecord}
      />

    {:else if activeTab === 'patrons'}
      <PatronsView 
        {borrowers}
        {borrowRecords}
        onOpenAddBorrower={openAddBorrowerModal}
        onOpenEditBorrower={openEditBorrowerModal}
        onDeleteBorrower={handleDeleteBorrower}
        onBorrowForPatron={openBorrowModalForPatron}
        onReturnBook={handleReturnBook}
      />

    {:else if activeTab === 'reports'}
      <ReportsView 
        {books} 
        {borrowers}
        {borrowRecords} 
        onNavigateTab={(t) => activeTab = t}
      />

    {:else if activeTab === 'settings'}
      <SettingsView onReseedData={loadData} />
    {/if}
  </main>
</div>

<!-- Module A: Book CRUD Modal -->
<BookModal 
  isOpen={isBookModalOpen}
  editMode={isEditMode}
  initialBook={selectedBookForEdit}
  onSave={handleSaveBook}
  onClose={() => isBookModalOpen = false}
/>

<!-- Module B: Borrower CRUD Modal -->
<BorrowerModal 
  isOpen={isBorrowerModalOpen}
  editMode={isBorrowerEditMode}
  initialBorrower={selectedBorrowerForEdit}
  onSave={handleSaveBorrower}
  onClose={() => isBorrowerModalOpen = false}
/>

<!-- Circulation: Borrow Book Modal -->
<BorrowModal 
  isOpen={isBorrowModalOpen}
  book={selectedBookForBorrow}
  {preselectedBorrower}
  availableBooks={availableBooksList}
  {borrowers}
  onConfirm={handleConfirmBorrow}
  onClose={() => isBorrowModalOpen = false}
/>

<!-- Floating Toast Notification -->
{#if toastMsg}
  <div class="toast-pill animate-fade-in">
    <span>{toastMsg}</span>
  </div>
{/if}

<style>
  .app-layout {
    display: flex;
    min-height: 100vh;
    background-color: var(--color-bg);
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .catalog-viewport {
    flex: 1;
    padding: 24px 28px 48px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .alphabet-grouped-catalog {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .alphabet-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section-letter-heading {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-accent-teal);
    line-height: 1;
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 6px;
    width: 100%;
  }

  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 24px 20px;
    align-items: start;
  }

  .table-view-wrap {
    padding-top: 8px;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 14px;
    color: var(--color-text-secondary);
  }

  .loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-amber-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-banner {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #991B1B;
    padding: 14px 20px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .retry-btn {
    background: #991B1B;
    color: #FFFFFF;
    font-size: 0.8rem;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
  }

  /* Empty State */
  .empty-state {
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: 60px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state h3 {
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--color-text-main);
  }

  .empty-state p {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    max-width: 400px;
  }

  .add-prompt-btn {
    margin-top: 8px;
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-weight: 600;
    font-size: 0.84rem;
    padding: 8px 18px;
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.25);
  }

  /* Floating Toast */
  .toast-pill {
    position: fixed;
    bottom: 24px;
    right: 28px;
    background: #2A2118;
    color: #FFF9F0;
    font-size: 0.84rem;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: var(--radius-full);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 200;
  }
</style>
