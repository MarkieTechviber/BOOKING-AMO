import { supabase } from './supabase';

/**
 * Fetch all books ordered by title
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
 * Add a new book to the catalog
 */
export async function addBook(book) {
  const total = Number(book.total_copies) || 1;
  const payload = {
    title: book.title.trim(),
    author: book.author.trim(),
    isbn: book.isbn ? book.isbn.trim() : null,
    genre: book.genre || 'General',
    published_year: book.published_year ? Number(book.published_year) : null,
    description: book.description ? book.description.trim() : '',
    cover_url: book.cover_url ? book.cover_url.trim() : '',
    total_copies: total,
    available_copies: total
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
 * Update an existing book's details
 */
export async function updateBook(id, updates) {
  const payload = { ...updates };
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
 * Delete a book from the catalog
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

/**
 * Fetch all borrowing records, enriched with book information
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
        cover_url,
        genre,
        available_copies,
        total_copies
      )
    `)
    .order('borrowed_date', { ascending: false });

  if (error) {
    console.error('Error fetching borrow records:', error);
    throw error;
  }

  // Calculate overdue status dynamically
  const now = new Date();
  return (data || []).map(record => {
    let status = record.status;
    if (status === 'borrowed' && new Date(record.due_date) < now) {
      status = 'overdue';
    }
    return {
      ...record,
      status
    };
  });
}

/**
 * Borrow a book: inserts borrow record and decrements available_copies
 */
export async function borrowBook({ bookId, borrowerName, borrowerEmail, days = 14, notes = '' }) {
  // First verify book availability
  const { data: book, error: bookErr } = await supabase
    .from('books')
    .select('available_copies, total_copies')
    .eq('id', bookId)
    .single();

  if (bookErr || !book) {
    throw new Error('Book not found');
  }

  if (book.available_copies <= 0) {
    throw new Error('No available copies left to borrow.');
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(days));

  // Insert record
  const { data: record, error: recErr } = await supabase
    .from('borrow_records')
    .insert([{
      book_id: bookId,
      borrower_name: borrowerName.trim(),
      borrower_email: borrowerEmail ? borrowerEmail.trim() : null,
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

  // Decrement copies
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
 * Return a book: marks record as returned and increments available_copies
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
 * Delete a borrow record
 */
export async function deleteBorrowRecord(recordId) {
  const { error } = await supabase
    .from('borrow_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting borrow record:', error);
    throw error;
  }
  return true;
}
