import { supabase } from './supabase';

/* =========================================================
   MODULE A: BOOK MANAGEMENT (C.R.U.D.)
   ========================================================= */

/**
 * READ / SEARCH: Fetch all books ordered by title
 */
export async function fetchBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
  return data || [];
}

/**
 * CREATE: Add a new book to the catalog
 */
export async function addBook(book) {
  const total = Number(book.total_copies) || 1;
  const avail = book.available_copies !== undefined ? Number(book.available_copies) : total;
  const payload = {
    title: book.title.trim(),
    author: book.author.trim(),
    isbn: book.isbn ? book.isbn.trim() : null,
    genre: book.genre || 'General',
    published_year: book.published_year ? Number(book.published_year) : null,
    description: book.description ? book.description.trim() : '',
    cover_url: book.cover_url ? book.cover_url.trim() : '',
    total_copies: total,
    available_copies: Math.min(total, Math.max(0, avail))
  };

  const { data, error } = await supabase
    .from('books')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error adding book:', error);
    throw error;
  }
  return data;
}

/**
 * UPDATE: Update an existing book's details
 */
export async function updateBook(id, updates) {
  const payload = { ...updates };
  delete payload.id;
  if (payload.total_copies !== undefined) {
    payload.total_copies = Number(payload.total_copies);
  }
  if (payload.available_copies !== undefined) {
    payload.available_copies = Number(payload.available_copies);
  }

  const { data, error } = await supabase
    .from('books')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating book:', error);
    throw error;
  }
  return data;
}

/**
 * DELETE: Delete a book from the catalog
 */
export async function deleteBook(id) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
  return true;
}

/* =========================================================
   MODULE B: BORROWERS MANAGEMENT (C.R.U.D.)
   ========================================================= */

/**
 * READ: Fetch all registered borrowers
 */
export async function fetchBorrowers() {
  const { data, error } = await supabase
    .from('borrowers')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching borrowers:', error);
    throw error;
  }
  return data || [];
}

/**
 * CREATE: Register a new borrower
 */
export async function addBorrower(borrower) {
  const randomNum = Math.floor(100 + Math.random() * 900);
  const payload = {
    member_id: borrower.member_id?.trim() || `MEM-2026-${randomNum}`,
    full_name: borrower.full_name.trim(),
    email: borrower.email ? borrower.email.trim() : null,
    phone: borrower.phone ? borrower.phone.trim() : null,
    department: borrower.department ? borrower.department.trim() : 'General Patron',
    status: borrower.status || 'active'
  };

  const { data, error } = await supabase
    .from('borrowers')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error adding borrower:', error);
    throw error;
  }
  return data;
}

/**
 * UPDATE: Update an existing borrower's profile
 */
export async function updateBorrower(id, updates) {
  const payload = { ...updates };
  delete payload.id;

  const { data, error } = await supabase
    .from('borrowers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating borrower:', error);
    throw error;
  }

  // Also sync borrower_name / email in active borrow_records linked to this borrower
  if (payload.full_name || payload.email || payload.phone) {
    const syncFields = {};
    if (payload.full_name) syncFields.borrower_name = payload.full_name;
    if (payload.email !== undefined) syncFields.borrower_email = payload.email;
    if (payload.phone !== undefined) syncFields.borrower_phone = payload.phone;
    await supabase
      .from('borrow_records')
      .update(syncFields)
      .eq('borrower_id', id);
  }

  return data;
}

/**
 * DELETE: Delete a borrower record
 */
export async function deleteBorrower(id) {
  const { error } = await supabase
    .from('borrowers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting borrower:', error);
    throw error;
  }
  return true;
}

/* =========================================================
   CIRCULATION: BORROW BOOKS & UNRETURNED BOOKS TRACKING
   ========================================================= */

/**
 * READ: Fetch all borrowing records, enriched with book & borrower information
 */
export async function fetchBorrowRecords() {
  const { data, error } = await supabase
    .from('borrow_records')
    .select(`
      *,
      books (
        id,
        title,
        author,
        isbn,
        cover_url,
        genre,
        available_copies,
        total_copies
      ),
      borrowers (
        id,
        member_id,
        full_name,
        email,
        phone,
        department,
        status
      )
    `)
    .order('borrowed_date', { ascending: false });

  if (error) {
    console.error('Error fetching borrow records:', error);
    throw error;
  }

  // Dynamically evaluate unreturned & overdue status
  const now = new Date();
  return (data || []).map(record => {
    let status = record.status;
    if (status !== 'returned' && new Date(record.due_date) < now) {
      status = 'overdue';
    }
    const isUnreturned = status === 'borrowed' || status === 'overdue';
    return {
      ...record,
      status,
      isUnreturned
    };
  });
}

/**
 * CREATE LOAN (Borrow Book):
 * Connects Book Management with Borrower Records and decrements available_copies
 */
export async function borrowBook({
  bookId,
  borrowerId = null,
  borrowerName,
  borrowerEmail = '',
  borrowerPhone = '',
  borrowerDepartment = 'General Patron',
  days = 14,
  notes = ''
}) {
  // 1. Verify book availability
  const { data: book, error: bookErr } = await supabase
    .from('books')
    .select('id, title, available_copies, total_copies')
    .eq('id', bookId)
    .single();

  if (bookErr || !book) {
    throw new Error('Selected book not found in catalog.');
  }

  if (book.available_copies <= 0) {
    throw new Error('No available copies left to borrow for this title.');
  }

  // 2. Connect or auto-register Borrower in borrowers table
  let resolvedBorrowerId = borrowerId;
  let resolvedName = borrowerName?.trim();
  let resolvedEmail = borrowerEmail?.trim() || null;
  let resolvedPhone = borrowerPhone?.trim() || null;

  if (!resolvedBorrowerId && resolvedName) {
    // Check if borrower already exists by name or email
    const { data: existingList } = await supabase
      .from('borrowers')
      .select('*')
      .ilike('full_name', resolvedName)
      .limit(1);

    if (existingList && existingList.length > 0) {
      resolvedBorrowerId = existingList[0].id;
      resolvedEmail = resolvedEmail || existingList[0].email;
      resolvedPhone = resolvedPhone || existingList[0].phone;
    } else {
      // Auto-create borrower in borrowers table so Borrower CRUD is always synced
      const newBorrower = await addBorrower({
        full_name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        department: borrowerDepartment
      });
      resolvedBorrowerId = newBorrower.id;
    }
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(days));

  // 3. Insert borrow record
  const { data: record, error: recErr } = await supabase
    .from('borrow_records')
    .insert([{
      book_id: bookId,
      borrower_id: resolvedBorrowerId,
      borrower_name: resolvedName,
      borrower_email: resolvedEmail,
      borrower_phone: resolvedPhone,
      due_date: dueDate.toISOString(),
      status: 'borrowed',
      notes: notes ? notes.trim() : null
    }])
    .select()
    .single();

  if (recErr) {
    console.error('Error creating borrow record:', recErr);
    throw recErr;
  }

  // 4. Decrement book available_copies
  const { error: updateErr } = await supabase
    .from('books')
    .update({ available_copies: Math.max(0, book.available_copies - 1) })
    .eq('id', bookId);

  if (updateErr) {
    console.warn('Could not update available copies automatically:', updateErr);
  }

  return record;
}

/**
 * UPDATE LOAN: Modify due date, borrower notes, or loan details
 */
export async function updateBorrowRecord(recordId, updates) {
  const payload = { ...updates };
  delete payload.id;

  const { data, error } = await supabase
    .from('borrow_records')
    .update(payload)
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error('Error updating borrow record:', error);
    throw error;
  }
  return data;
}

/**
 * RETURN BOOK: Marks record as returned and increments available_copies
 */
export async function returnBook(recordId, bookId) {
  const { error: recErr } = await supabase
    .from('borrow_records')
    .update({
      status: 'returned',
      returned_date: new Date().toISOString()
    })
    .eq('id', recordId);

  if (recErr) {
    console.error('Error updating return record:', recErr);
    throw recErr;
  }

  if (bookId) {
    const { data: book } = await supabase
      .from('books')
      .select('available_copies, total_copies')
      .eq('id', bookId)
      .single();

    if (book) {
      const newAvailable = Math.min(book.total_copies, (book.available_copies || 0) + 1);
      await supabase
        .from('books')
        .update({ available_copies: newAvailable })
        .eq('id', bookId);
    }
  }

  return true;
}

/**
 * DELETE LOAN: Deletes a borrow record and restores stock if it was unreturned
 */
export async function deleteBorrowRecord(recordId) {
  // Fetch first to check if it was unreturned so stock stays accurate
  const { data: existing } = await supabase
    .from('borrow_records')
    .select('id, book_id, status')
    .eq('id', recordId)
    .single();

  const { error } = await supabase
    .from('borrow_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting borrow record:', error);
    throw error;
  }

  if (existing && existing.status !== 'returned' && existing.book_id) {
    const { data: book } = await supabase
      .from('books')
      .select('available_copies, total_copies')
      .eq('id', existing.book_id)
      .single();

    if (book) {
      const newAvailable = Math.min(book.total_copies, (book.available_copies || 0) + 1);
      await supabase
        .from('books')
        .update({ available_copies: newAvailable })
        .eq('id', existing.book_id);
    }
  }

  return true;
}
