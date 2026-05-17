<script lang="ts">
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { Button } from '$lib/components/ui/button';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import type {
    MerchantDocument,
    DocumentType,
    MerchantVerificationUpdate,
    VerificationStatus
  } from '$appmod/features/merchants/domain/entities/Merchant';
  import type { Either, Failure } from '$core/error/Failure';

  let {
    merchantId,
    docs,
    merchantVerificationStatus,
    role,
    onVerificationUpdate
  }: {
    merchantId: string;
    docs: MerchantDocument[];
    merchantVerificationStatus: VerificationStatus;
    role: string | null;
    onVerificationUpdate: (payload: MerchantVerificationUpdate) => Promise<Either<Failure, any>>;
  } = $props();

  const isSupport = $derived(hasPermission(role as AdminRole, 'SUPPORT'));
  const canReview = $derived(
    isSupport && merchantVerificationStatus === 'PENDING_REVIEW'
  );

  const DOC_LABELS: Record<DocumentType, string> = {
    IDENTITY_FRONT:             'Identidade (Frente)',
    IDENTITY_BACK:              'Identidade (Verso)',
    SELFIE:                     'Selfie',
    PROOF_OF_ADDRESS:           'Comprovante de Endereço',
    ARTICLES_OF_INCORPORATION:  'Contrato Social',
    OTHER:                      'Outro'
  };

  let expandedDocId = $state<string | null>(null);
  let pdfLoadingId  = $state<string | null>(null);
  let canvasRefs    = $state<Record<string, HTMLCanvasElement | null>>({});

  function isPdf(fileUrl: string): boolean {
    return fileUrl.toLowerCase().endsWith('.pdf') ||
           fileUrl.toLowerCase().includes('application/pdf');
  }

  async function toggleDocPreview(doc: MerchantDocument) {
    if (expandedDocId === doc.id) {
      expandedDocId = null;
      return;
    }

    expandedDocId = doc.id;

    if (isPdf(doc.fileUrl)) {
      await new Promise(resolve => setTimeout(resolve, 100));
      renderPDF(doc);
    }
  }

  async function renderPDF(doc: MerchantDocument) {
    pdfLoadingId = doc.id;
    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const pdfDoc = await pdfjsLib.getDocument(doc.fileUrl).promise;
      const page   = await pdfDoc.getPage(1);
      const canvas = canvasRefs[doc.id];

      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.4 });
      canvas.width   = viewport.width;
      canvas.height  = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error('PDF render error:', err);
    } finally {
      pdfLoadingId = null;
    }
  }

  // KYC Review form state
  let kycDecision   = $state<'APPROVED' | 'REJECTED' | ''>('');
  let kycNotes      = $state('');
  let submitting    = $state(false);
  let submitError   = $state<string | null>(null);
  let submitSuccess = $state(false);

  async function handleKYCSubmit() {
    if (!kycDecision || !kycNotes.trim()) return;
    submitting = true;
    submitError = null;

    const result = await onVerificationUpdate({
      status: kycDecision as 'APPROVED' | 'REJECTED',
      notes:  kycNotes.trim()
    });

    if (result.ok) {
      submitSuccess = true;
      kycDecision = '';
      kycNotes    = '';
    } else {
      submitError = result.failure.message;
    }
    submitting = false;
  }
</script>

<div class="kyc-tab">
  {#if docs.length === 0}
    <div class="empty-state">
      <p class="empty-text">Nenhum documento enviado para este merchant.</p>
    </div>
  {:else}
    <!-- Grid de cards de documentos -->
    <div class="docs-grid">
      {#each docs as doc (doc.id)}
        <div class="doc-card">
          <div class="doc-card-header">
            <div class="doc-info">
              <span class="doc-type">{DOC_LABELS[doc.documentType] ?? doc.documentType}</span>
              <span class="doc-date">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <StatusBadge status={doc.status} />
          </div>

          {#if doc.notes}
            <p class="doc-notes">{doc.notes}</p>
          {/if}

          <button
            type="button"
            class="btn-preview"
            onclick={() => toggleDocPreview(doc)}
          >
            {expandedDocId === doc.id ? 'Fechar preview' : 'Ver documento'}
          </button>

          <!-- Preview inline -->
          {#if expandedDocId === doc.id}
            <div class="doc-preview">
              {#if isPdf(doc.fileUrl)}
                {#if pdfLoadingId === doc.id}
                  <div class="pdf-loading">Carregando PDF...</div>
                {/if}
                <canvas
                  class="pdf-canvas"
                  bind:this={canvasRefs[doc.id]}
                  style="display: {pdfLoadingId === doc.id ? 'none' : 'block'}"
                ></canvas>
              {:else}
                <img
                  src={doc.fileUrl}
                  alt={DOC_LABELS[doc.documentType] ?? 'Documento'}
                  class="doc-image"
                />
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Ações de revisão KYC — só para SUPPORT+ e quando PENDING_REVIEW -->
    {#if canReview}
      <div class="kyc-review-section">
        <h3 class="review-title">Revisão KYC</h3>
        <p class="review-subtitle">
          Avalie todos os documentos antes de aprovar ou rejeitar a verificação.
        </p>

        <div class="review-form">
          <div class="decision-group" role="group" aria-labelledby="kyc-decision-label">
            <span id="kyc-decision-label" class="review-label">Decisão</span>
            <div class="radio-options">
              <label class="radio-option">
                <input
                  type="radio"
                  name="kycDecision"
                  value="APPROVED"
                  bind:group={kycDecision}
                />
                <span class="radio-label radio-label--approve">Aprovar</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  name="kycDecision"
                  value="REJECTED"
                  bind:group={kycDecision}
                />
                <span class="radio-label radio-label--reject">Rejeitar</span>
              </label>
            </div>
          </div>

          <div class="notes-group">
            <label class="review-label" for="kycNotes">
              Notas de revisão <span class="required">*</span>
            </label>
            <textarea
              id="kycNotes"
              class="notes-input"
              placeholder="Descreva o resultado da revisão, motivos de aprovação ou rejeição..."
              rows="4"
              bind:value={kycNotes}
            ></textarea>
          </div>

          {#if submitError}
            <p class="form-error">{submitError}</p>
          {/if}

          {#if submitSuccess}
            <p class="form-success">Verificação atualizada com sucesso.</p>
          {/if}

          <Button
            onclick={handleKYCSubmit}
            disabled={submitting || !kycDecision || !kycNotes.trim()}
            variant={kycDecision === 'REJECTED' ? 'destructive' : 'default'}
          >
            {submitting ? 'Enviando...' : `Confirmar ${kycDecision === 'APPROVED' ? 'Aprovação' : kycDecision === 'REJECTED' ? 'Rejeição' : 'Decisão'}`}
          </Button>
        </div>
      </div>
    {:else if !isSupport}
      <p class="readonly-note">Apenas SUPPORT+ pode revisar documentos KYC.</p>
    {:else if merchantVerificationStatus !== 'PENDING_REVIEW'}
      <p class="readonly-note">
        Verificação já processada: <strong>{merchantVerificationStatus}</strong>
      </p>
    {/if}
  {/if}
</div>

<style>
  .kyc-tab { display: flex; flex-direction: column; gap: 24px; }

  .empty-state {
    padding: 48px;
    text-align: center;
  }
  .empty-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(218, 212, 196, 0.35);
  }

  /* Docs grid */
  .docs-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media (max-width: 700px) {
    .docs-grid { grid-template-columns: 1fr; }
  }

  .doc-card {
    background: #0a0910;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.18s;
  }
  .doc-card:hover { border-color: rgba(255,255,255,0.12); }

  .doc-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .doc-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .doc-type {
    font-size: 13px;
    font-weight: 600;
    color: rgba(218, 212, 196, 0.85);
  }
  .doc-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(218, 212, 196, 0.35);
  }
  .doc-notes {
    font-size: 12px;
    color: rgba(218, 212, 196, 0.55);
    font-style: italic;
    margin: 0;
    padding: 8px 10px;
    background: rgba(255,255,255,0.03);
    border-radius: 4px;
    border-left: 2px solid rgba(255,255,255,0.10);
  }

  .btn-preview {
    background: none;
    border: 1px solid rgba(1, 250, 251, 0.20);
    color: var(--color-brand-cyan, #01FAFB);
    padding: 6px 12px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    align-self: flex-start;
    transition: background 0.18s, border-color 0.18s;
  }
  .btn-preview:hover {
    background: rgba(1, 250, 251, 0.06);
    border-color: rgba(1, 250, 251, 0.35);
  }

  /* Preview */
  .doc-preview {
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    overflow: hidden;
    background: rgba(0,0,0,0.30);
    max-height: 400px;
    overflow-y: auto;
  }
  .doc-image {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
  }
  .pdf-canvas {
    width: 100%;
    height: auto;
    display: block;
  }
  .pdf-loading {
    padding: 24px;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.35);
  }

  /* KYC Review section */
  .kyc-review-section {
    background: rgba(1, 250, 251, 0.03);
    border: 1px solid rgba(1, 250, 251, 0.12);
    border-radius: 8px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .review-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(218, 212, 196, 0.80);
    margin: 0;
  }
  .review-subtitle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.40);
    margin: 0;
  }
  .review-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .review-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(218, 212, 196, 0.45);
    margin-bottom: 8px;
  }
  .required { color: var(--color-danger, #FF3B5C); }

  .radio-options { display: flex; gap: 16px; }
  .radio-option {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  .radio-label {
    font-size: 13px;
    font-weight: 500;
  }
  .radio-label--approve { color: rgba(1, 250, 251, 0.80); }
  .radio-label--reject  { color: rgba(255, 59, 92, 0.80); }

  .notes-input {
    width: 100%;
    background: rgba(0,0,0,0.30);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 10px 12px;
    color: rgba(218, 212, 196, 0.85);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    resize: vertical;
    transition: border-color 0.18s;
  }
  .notes-input:focus {
    outline: none;
    border-color: rgba(1, 250, 251, 0.30);
  }

  .form-error   { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--color-danger, #FF3B5C); }
  .form-success { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(1, 250, 251, 0.80); }
  .readonly-note {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.30);
    padding: 16px;
    text-align: center;
    border: 1px dashed rgba(255,255,255,0.06);
    border-radius: 6px;
  }
</style>
