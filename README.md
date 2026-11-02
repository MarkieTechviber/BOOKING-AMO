# BOOKING-AMO 📖

> A warm amber-toned modern library circulation and book borrowing management system inspired by classic literary design and Libib aesthetics. Built with **Svelte 5**, **Supabase PostgreSQL**, and deployed on **Vercel**.

🌐 **Live Production URL**: [https://booking-amo.vercel.app](https://booking-amo.vercel.app)  
📁 **GitHub Repository**: [https://github.com/MarkieTechviber/BOOKING-AMO](https://github.com/MarkieTechviber/BOOKING-AMO)  
🗄️ **Supabase Database**: Connected to Project `ajkzcocpptgfovrhjdsr` (`ajkzcocpptgfovrhjdsr.supabase.co`)

---

## ✨ Features

- **Warm Amber Aesthetic**: Honey amber, cream linen, and espresso tones crafted for a serene, tactile library feel without harsh pitch blacks.
- **Libib-Inspired Layout**: Left navigation bar, top search bar with collection dropdown, signature alphabetical scrubber (`A-Z # All`), and book card covers with bookmark ribbon tags.
- **Full Catalog CRUD**:
  - Add new book editions with ISBN, publication year, copies, custom cover or 1-click curated cover presets.
  - Edit catalog records with real-time field synchronization.
  - Delete retired books with automatic relationship cleanup.
- **Circulation Desk (Lending & Returns)**:
  - Check out available books to patrons with custom loan durations (7, 14, 21, or 30 days).
  - One-click book returns with confetti celebration and automatic inventory reconciliation.
  - Real-time overdue tracking and alerts.
- **Patron Directory**: Borrower history, active books currently on loan, and borrower standing.
- **Analytics & Reports**: Visual genre distribution, collection capacity, turnover rate, and circulation velocity.
- **Supabase Cloud Backend**: Row Level Security (RLS) policies and real-time database persistence.

---

## 🛠️ Tech Stack

- **Frontend**: Svelte 5 (Runes: `$state`, `$derived`, `$props`), Vite 8
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Styling**: Modern CSS Custom Properties, Fraunces serif & Plus Jakarta Sans typography
- **Interactions**: Canvas-Confetti celebration engine
- **Hosting & CI/CD**: Vercel

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/MarkieTechviber/BOOKING-AMO.git
cd BOOKING-AMO
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run local development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

---

## 🗄️ Database Schema

### `books`
- `id` (UUID, Primary Key)
- `title` (TEXT, Not Null)
- `author` (TEXT, Not Null)
- `isbn` (TEXT)
- `genre` (TEXT)
- `published_year` (INTEGER)
- `description` (TEXT)
- `cover_url` (TEXT)
- `total_copies` (INTEGER)
- `available_copies` (INTEGER)
- `created_at` (TIMESTAMPTZ)

### `borrow_records`
- `id` (UUID, Primary Key)
- `book_id` (UUID, Foreign Key → `books.id`)
- `borrower_name` (TEXT, Not Null)
- `borrower_email` (TEXT)
- `borrowed_date` (TIMESTAMPTZ)
- `due_date` (TIMESTAMPTZ)
- `returned_date` (TIMESTAMPTZ)
- `status` (`'borrowed'` | `'returned'` | `'overdue'`)
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ)

---

## 📜 License
MIT License. Created with love for book lovers and quiet afternoons.
