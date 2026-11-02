<script>
  let { 
    isOpen = false, 
    editMode = false, 
    initialBorrower = null, 
    onSave, 
    onClose 
  } = $props();

  let member_id = $state('');
  let full_name = $state('');
  let email = $state('');
  let phone = $state('');
  let department = $state('General Patron');
  let status = $state('active');

  const departments = [
    'General Patron',
    'Computer Science',
    'Literature & Arts',
    'Philosophy Dept',
    'Design & Architecture',
    'Engineering & Tech',
    'Faculty / Staff'
  ];

  $effect(() => {
    if (initialBorrower && editMode) {
      member_id = initialBorrower.member_id || '';
      full_name = initialBorrower.full_name || '';
      email = initialBorrower.email || '';
      phone = initialBorrower.phone || '';
      department = initialBorrower.department || 'General Patron';
      status = initialBorrower.status || 'active';
    } else {
      const rand = Math.floor(100 + Math.random() * 900);
      member_id = `MEM-2026-${rand}`;
      full_name = '';
      email = '';
      phone = '';
      department = 'General Patron';
      status = 'active';
    }
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!full_name.trim()) return;

    onSave({
      ...(editMode && initialBorrower ? { id: initialBorrower.id } : {}),
      member_id: member_id.trim(),
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      status
    });
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop animate-fade-in" onclick={onClose}>
    <div class="modal-dialog" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <div>
          <span class="module-pill">MODULE B • BORROWERS MANAGEMENT (CRUD)</span>
          <h3 class="modal-title">
            {editMode ? 'Update Borrower Profile' : 'Register New Borrower'}
          </h3>
        </div>
        <button class="close-btn" onclick={onClose}>✕</button>
      </div>

      <form onsubmit={handleSubmit} class="modal-form">
        <div class="form-grid">
          <div class="form-group half">
            <label for="b-member-id">Member / Student ID *</label>
            <input 
              id="b-member-id" 
              type="text" 
              required 
              placeholder="e.g. MEM-2026-005" 
              bind:value={member_id} 
            />
          </div>

          <div class="form-group half">
            <label for="b-status">Membership Status</label>
            <select id="b-status" bind:value={status}>
              <option value="active">Active (Can Borrow)</option>
              <option value="suspended">Suspended (Hold)</option>
            </select>
          </div>

          <div class="form-group full">
            <label for="b-name">Full Name *</label>
            <input 
              id="b-name" 
              type="text" 
              required 
              placeholder="e.g. Clara Oswald" 
              bind:value={full_name} 
            />
          </div>

          <div class="form-group half">
            <label for="b-email">Email Address</label>
            <input 
              id="b-email" 
              type="email" 
              placeholder="clara@library.org" 
              bind:value={email} 
            />
          </div>

          <div class="form-group half">
            <label for="b-phone">Phone / Contact Number</label>
            <input 
              id="b-phone" 
              type="text" 
              placeholder="+1 (555) 123-4567" 
              bind:value={phone} 
            />
          </div>

          <div class="form-group full">
            <label for="b-dept">Department / Group</label>
            <select id="b-dept" bind:value={department}>
              {#each departments as d}
                <option value={d}>{d}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" onclick={onClose}>Cancel</button>
          <button type="submit" class="btn-submit">
            {editMode ? '✓ Save Borrower Changes' : '+ Register Borrower'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(42, 33, 24, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
  }

  .modal-dialog {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    box-shadow: 0 20px 40px rgba(42, 33, 24, 0.2);
    width: 100%;
    max-width: 500px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: 12px;
  }

  .module-pill {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--color-amber-primary);
    letter-spacing: 0.06em;
    display: block;
    margin-bottom: 2px;
  }

  .modal-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .close-btn {
    font-size: 1.1rem;
    color: var(--color-text-muted);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
  }

  .close-btn:hover {
    background: var(--color-bg);
    color: var(--color-text-main);
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-group.full { grid-column: span 2; }
  .form-group.half { grid-column: span 1; }

  label {
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input, select {
    padding: 9px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    font-size: 0.85rem;
    color: var(--color-text-main);
    outline: none;
    transition: all 0.18s ease;
  }

  input:focus, select:focus {
    border-color: var(--color-amber-primary);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px var(--color-amber-light);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid var(--color-border-subtle);
    padding-top: 14px;
  }

  .btn-cancel {
    padding: 8px 16px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-radius: var(--radius-md);
  }

  .btn-cancel:hover {
    background: var(--color-bg);
  }

  .btn-submit {
    padding: 8px 18px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #FFFFFF;
    background: var(--color-amber-primary);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 6px rgba(217, 119, 6, 0.25);
  }

  .btn-submit:hover {
    background: var(--color-amber-hover);
  }
</style>
