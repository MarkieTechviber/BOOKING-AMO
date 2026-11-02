<script>
  let { onReseedData } = $props();

  let libraryName = $state("Count's Library");
  let patronLoanLimit = $state(5);
  let defaultLoanDays = $state(14);
  let savedMsg = $state(false);

  function handleSaveSettings(e) {
    e.preventDefault();
    savedMsg = true;
    setTimeout(() => savedMsg = false, 2500);
  }
</script>

<div class="settings-container animate-fade-in">
  <div class="settings-header">
    <h2 class="title">Library Configuration & Settings</h2>
    <p class="subtitle">Manage circulation policies, collection branding, and database sync.</p>
  </div>

  <div class="settings-card">
    <h3 class="card-title">Library Profile</h3>
    <form onsubmit={handleSaveSettings} class="settings-form">
      <div class="form-row">
        <label for="lib-name">Library Name</label>
        <input id="lib-name" type="text" bind:value={libraryName} />
      </div>

      <div class="form-row">
        <label for="loan-days">Default Loan Window (Days)</label>
        <input id="loan-days" type="number" min="1" max="90" bind:value={defaultLoanDays} />
      </div>

      <div class="form-row">
        <label for="loan-limit">Max Active Books per Patron</label>
        <input id="loan-limit" type="number" min="1" max="20" bind:value={patronLoanLimit} />
      </div>

      <div class="btn-row">
        <button type="submit" class="save-btn">Save Configuration</button>
        {#if savedMsg}
          <span class="save-toast">✓ Saved successfully!</span>
        {/if}
      </div>
    </form>
  </div>

  <div class="settings-card">
    <h3 class="card-title">Supabase Cloud Database</h3>
    <p class="card-desc">Connected to project: <code>ajkzcocpptgfovrhjdsr.supabase.co</code> with live RLS and Realtime synchronization.</p>
    
    <div class="sync-actions">
      <button class="reseed-btn" onclick={onReseedData}>
        ↻ Re-seed Classic Sample Books & Loans
      </button>
      <span class="info-note">Use this anytime you want to restore the pristine starter catalog.</span>
    </div>
  </div>
</div>

<style>
  .settings-container {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 720px;
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

  .settings-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: var(--shadow-sm);
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
  }

  .card-desc {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }

  code {
    background: var(--color-bg);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-size: 0.76rem;
    color: var(--color-amber-primary);
  }

  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
  }

  input {
    padding: 8px 12px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    color: var(--color-text-main);
    outline: none;
  }

  input:focus {
    border-color: var(--color-amber-primary);
    background: #FFFFFF;
  }

  .btn-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }

  .save-btn {
    background: var(--color-amber-primary);
    color: #FFFFFF;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: var(--radius-md);
  }

  .save-btn:hover {
    background: var(--color-amber-hover);
  }

  .save-toast {
    font-size: 0.8rem;
    color: #2E7D32;
    font-weight: 600;
  }

  .sync-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .reseed-btn {
    align-self: flex-start;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    padding: 8px 14px;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
  }

  .reseed-btn:hover {
    background: var(--color-amber-light);
    color: var(--color-amber-hover);
    border-color: var(--color-amber-border);
  }

  .info-note {
    font-size: 0.72rem;
    color: var(--color-text-muted);
  }
</style>
