#!/usr/bin/env node
// Swiss invoice generator — JSON → HTML+CSS → PDF (via Puppeteer)
// Optionally embeds a Swiss QR-bill via the `swissqrbill` package.
//
// Usage:
//   node generator.mjs <invoice.json>                  Generate PDF
//   node generator.mjs <invoice.json> --md-only        HTML only (debug layout)
//   node generator.mjs <invoice.json> --output PATH    Custom output path
//   node generator.mjs --list                          List from index.json
//
// Requires:
//   npm install puppeteer
//   npm install swissqrbill   (optional, only if qrBill: true)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();

// ============================================================================
// CLI parsing
// ============================================================================
const args = process.argv.slice(2);
let inputFile = null;
let mdOnly = false;
let listMode = false;
let outputPath = null;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--md-only') { mdOnly = true; continue; }
  if (a === '--list') { listMode = true; continue; }
  if (a === '--output') { outputPath = args[++i]; continue; }
  if (a === '--help' || a === '-h') {
    console.log(`
Swiss invoice generator.

Usage:
  node generator.mjs <invoice.json>             Generate PDF
  node generator.mjs <invoice.json> --md-only   HTML only
  node generator.mjs <invoice.json> --output PATH
  node generator.mjs --list                     List from index.json
`);
    process.exit(0);
  }
  if (!a.startsWith('--') && !inputFile) { inputFile = a; }
}

// ============================================================================
// i18n
// ============================================================================
const I18N = {
  fr: {
    invoiceLabel: 'Facture',
    date: 'Date',
    dueDate: 'Échéance',
    period: 'Période de prestation',
    from: 'Émetteur',
    to: 'Destinataire',
    uid: 'IDE',
    vatNo: 'N° TVA',
    description: 'Description',
    qty: 'Qté',
    unit: 'Unité',
    unitPrice: 'Prix unit.',
    amount: 'Montant',
    subtotal: 'Sous-total HT',
    vat: 'TVA',
    total: 'Total TTC',
    payment: 'Paiement',
    iban: 'IBAN',
    bank: 'Banque',
    terms: 'Conditions',
    reference: 'Référence',
  },
  de: {
    invoiceLabel: 'Rechnung',
    date: 'Datum',
    dueDate: 'Fällig am',
    period: 'Leistungszeitraum',
    from: 'Absender',
    to: 'Empfänger',
    uid: 'UID',
    vatNo: 'MWST-Nr.',
    description: 'Beschreibung',
    qty: 'Menge',
    unit: 'Einheit',
    unitPrice: 'Preis/Einheit',
    amount: 'Betrag',
    subtotal: 'Zwischensumme',
    vat: 'MWST',
    total: 'Total',
    payment: 'Zahlung',
    iban: 'IBAN',
    bank: 'Bank',
    terms: 'Bedingungen',
    reference: 'Referenz',
  },
  it: {
    invoiceLabel: 'Fattura',
    date: 'Data',
    dueDate: 'Scadenza',
    period: 'Periodo della prestazione',
    from: 'Emittente',
    to: 'Destinatario',
    uid: 'IDI',
    vatNo: 'N° IVA',
    description: 'Descrizione',
    qty: 'Qtà',
    unit: 'Unità',
    unitPrice: 'Prezzo unit.',
    amount: 'Importo',
    subtotal: 'Subtotale',
    vat: 'IVA',
    total: 'Totale',
    payment: 'Pagamento',
    iban: 'IBAN',
    bank: 'Banca',
    terms: 'Condizioni',
    reference: 'Riferimento',
  },
  en: {
    invoiceLabel: 'Invoice',
    date: 'Date',
    dueDate: 'Due date',
    period: 'Service period',
    from: 'From',
    to: 'Bill to',
    uid: 'UID',
    vatNo: 'VAT no.',
    description: 'Description',
    qty: 'Qty',
    unit: 'Unit',
    unitPrice: 'Unit price',
    amount: 'Amount',
    subtotal: 'Subtotal',
    vat: 'VAT',
    total: 'Total',
    payment: 'Payment',
    iban: 'IBAN',
    bank: 'Bank',
    terms: 'Terms',
    reference: 'Reference',
  },
};

// ============================================================================
// Helpers
// ============================================================================
function fmtDate(iso, lang = 'fr') {
  const [y, m, d] = iso.split('-');
  if (lang === 'en') return `${y}-${m}-${d}`;
  return `${d}.${m}.${y}`;
}

function fmtAmount(n, currency) {
  const formatted = n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency} ${formatted}`;
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function computeTotals(invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatRate = (invoice.vat && invoice.vat.rate) || 0;
  const vatAmount = Math.round(subtotal * vatRate) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  return { subtotal, vatRate, vatAmount, total };
}

function validateInvoice(inv) {
  const errors = [];
  if (!inv.invoiceNumber) errors.push('invoiceNumber required');
  if (!inv.issueDate) errors.push('issueDate required');
  if (!inv.from || !inv.from.company) errors.push('from.company required');
  if (!inv.to || !inv.to.company) errors.push('to.company required');
  if (!inv.items || inv.items.length === 0) errors.push('At least one item required');
  if (!inv.currency) errors.push('currency required');

  // CO 957a / OTVA 26 al. 2 — IDE format check
  if (inv.from && inv.from.uid && !/^CHE-\d{3}\.\d{3}\.\d{3}$/.test(inv.from.uid)) {
    errors.push(`from.uid invalid format: ${inv.from.uid} (expected CHE-xxx.xxx.xxx)`);
  }

  // If VAT applied, vatNumber required
  if (inv.vat && inv.vat.rate > 0 && (!inv.from || !inv.from.vatNumber)) {
    errors.push('from.vatNumber required when VAT rate > 0');
  }

  // If currency != CHF and vat != 0, exchangeRate required
  if (inv.currency !== 'CHF' && inv.vat && inv.vat.rate > 0 && !inv.exchangeRate) {
    errors.push('exchangeRate required when currency ≠ CHF and VAT > 0 (art. 45 OTVA)');
  }

  return errors;
}

// ============================================================================
// List mode
// ============================================================================
if (listMode) {
  const indexPath = join(CWD, 'invoices', 'index.json');
  if (!existsSync(indexPath)) {
    console.error('No invoices/index.json found.');
    process.exit(1);
  }
  const idx = JSON.parse(readFileSync(indexPath, 'utf-8'));
  if (!idx.invoices || idx.invoices.length === 0) {
    console.log('No invoices registered.');
    process.exit(0);
  }
  console.log('\nInvoice #          Date         Status   Currency   Total');
  console.log('─'.repeat(64));
  for (const inv of idx.invoices) {
    console.log(`${inv.invoiceNumber.padEnd(18)} ${inv.issueDate.padEnd(12)} ${(inv.status || '').padEnd(8)} ${(inv.currency || '').padEnd(10)} ${(inv.totalTTC || 0).toFixed(2)}`);
  }
  console.log('');
  process.exit(0);
}

// ============================================================================
// Load and validate
// ============================================================================
if (!inputFile) {
  console.error('Error: no invoice JSON specified.\nUsage: node generator.mjs <invoice.json>');
  process.exit(1);
}

const inputPath = resolve(inputFile);
let invoice;
try {
  invoice = JSON.parse(readFileSync(inputPath, 'utf-8'));
} catch (err) {
  console.error(`Cannot read ${inputPath}: ${err.message}`);
  process.exit(1);
}

const errors = validateInvoice(invoice);
if (errors.length > 0) {
  console.error('Validation errors:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const lang = invoice.lang || 'fr';
const t = I18N[lang] || I18N.fr;
const totals = computeTotals(invoice);

// ============================================================================
// HTML rendering
// ============================================================================
function buildCSS() {
  return `
    @page { size: A4; margin: 18mm 18mm 14mm 18mm; }
    body { font-family: 'Inter', system-ui, sans-serif; font-size: 9.5pt; color: #000; margin: 0; }
    table { border-collapse: collapse; width: 100%; }
    h1, h2, h3 { margin: 0; font-weight: 600; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
    .logo { max-height: 44px; }
    .meta { text-align: right; font-size: 8.5pt; color: #555; }
    .meta-number { font-size: 16pt; font-weight: 700; color: #000; margin-bottom: 12px; }
    .meta-row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 2px; }
    .meta-label { font-weight: 600; color: #000; }

    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 36px; }
    .party-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.15em; color: #999; margin-bottom: 8px; font-weight: 600; }
    .party-name { font-size: 10.5pt; font-weight: 600; margin-bottom: 3px; }
    .party-detail { font-size: 8.5pt; color: #555; line-height: 1.7; }

    .items { margin-bottom: 24px; }
    .items th { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 8px; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; text-align: left; }
    .items th.r { text-align: right; }
    .items td { padding: 14px 8px; border-bottom: 0.5px solid #e0e0e0; vertical-align: top; }
    .items td.r { text-align: right; }
    .items .desc-detail { font-size: 8.5pt; color: #777; margin-top: 4px; }

    .totals { margin-top: 24px; width: 100%; }
    .totals td { padding: 4px 8px; }
    .totals td.r { text-align: right; }
    .totals .total-row { border-top: 1.5px solid #000; font-weight: 700; }
    .totals .total-row td { padding-top: 10px; padding-bottom: 10px; }

    .payment { margin-top: 36px; padding-top: 24px; border-top: 0.5px solid #e0e0e0; }
    .payment-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.15em; color: #999; margin-bottom: 8px; font-weight: 600; }
    .payment-grid { display: grid; grid-template-columns: 110px 1fr; gap: 6px 16px; font-size: 9pt; }

    .notes { margin-top: 24px; padding-top: 16px; font-size: 8.5pt; color: #555; line-height: 1.6; }

    .qr-bill-section { page-break-before: always; width: 210mm; height: 105mm; }
  `;
}

function renderHTML() {
  const items = invoice.items.map(it => `
    <tr>
      <td>${esc(it.description)}${it.details ? `<div class="desc-detail">${esc(it.details)}</div>` : ''}</td>
      <td class="r">${it.quantity}</td>
      <td>${esc(it.unit || '')}</td>
      <td class="r">${fmtAmount(it.unitPrice, invoice.currency)}</td>
      <td class="r">${fmtAmount(it.quantity * it.unitPrice, invoice.currency)}</td>
    </tr>
  `).join('');

  const vatNote = invoice.vat && invoice.vat.note
    ? `<div class="notes">${esc(invoice.vat.note)}</div>` : '';

  const exchangeNote = invoice.exchangeRate
    ? `<div class="notes">Cours appliqué : ${invoice.currency}/CHF ${invoice.exchangeRate.rate} (${invoice.exchangeRate.source}, ${fmtDate(invoice.exchangeRate.date, lang)}). Équivalent CHF ${invoice.exchangeRate.chfEquivalent.toFixed(2)}.</div>`
    : '';

  const generalNotes = invoice.notes ? `<div class="notes">${esc(invoice.notes)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <title>${esc(t.invoiceLabel)} ${esc(invoice.invoiceNumber)}</title>
  <style>${buildCSS()}</style>
</head>
<body>
  <div class="header">
    <div>
      ${invoice.from.logoPath ? `<img class="logo" src="${esc(invoice.from.logoPath)}" alt="logo">` : `<h1>${esc(invoice.from.company)}</h1>`}
    </div>
    <div class="meta">
      <div class="meta-number">${esc(invoice.invoiceNumber)}</div>
      <div class="meta-row"><span class="meta-label">${t.date}</span><span>${fmtDate(invoice.issueDate, lang)}</span></div>
      ${invoice.dueDate ? `<div class="meta-row"><span class="meta-label">${t.dueDate}</span><span>${fmtDate(invoice.dueDate, lang)}</span></div>` : ''}
      ${invoice.serviceDate ? `<div class="meta-row"><span class="meta-label">${t.period}</span><span>${esc(invoice.serviceDate)}</span></div>` : ''}
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-label">${t.from}</div>
      <div class="party-name">${esc(invoice.from.company)}</div>
      <div class="party-detail">
        ${esc(invoice.from.address || '')}<br>
        ${esc(invoice.from.zip || '')} ${esc(invoice.from.city || '')}<br>
        ${invoice.from.uid ? `${t.uid}: ${esc(invoice.from.uid)}<br>` : ''}
        ${invoice.from.vatNumber ? `${t.vatNo}: ${esc(invoice.from.vatNumber)}<br>` : ''}
        ${invoice.from.email ? `${esc(invoice.from.email)}` : ''}
      </div>
    </div>
    <div>
      <div class="party-label">${t.to}</div>
      <div class="party-name">${esc(invoice.to.company)}</div>
      <div class="party-detail">
        ${esc(invoice.to.address || '')}<br>
        ${esc(invoice.to.zip || '')} ${esc(invoice.to.city || '')}<br>
        ${invoice.to.uid ? `${t.uid}: ${esc(invoice.to.uid)}<br>` : ''}
        ${invoice.to.contact ? `${esc(invoice.to.contact)}<br>` : ''}
        ${invoice.to.email ? `${esc(invoice.to.email)}` : ''}
      </div>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>${t.description}</th>
        <th class="r">${t.qty}</th>
        <th>${t.unit}</th>
        <th class="r">${t.unitPrice}</th>
        <th class="r">${t.amount}</th>
      </tr>
    </thead>
    <tbody>${items}</tbody>
  </table>

  <table class="totals">
    <tr>
      <td></td><td></td><td></td>
      <td class="r">${t.subtotal}</td>
      <td class="r">${fmtAmount(totals.subtotal, invoice.currency)}</td>
    </tr>
    ${totals.vatRate > 0 ? `
    <tr>
      <td></td><td></td><td></td>
      <td class="r">${t.vat} ${totals.vatRate}%</td>
      <td class="r">${fmtAmount(totals.vatAmount, invoice.currency)}</td>
    </tr>` : ''}
    <tr class="total-row">
      <td></td><td></td><td></td>
      <td class="r">${t.total}</td>
      <td class="r">${fmtAmount(totals.total, invoice.currency)}</td>
    </tr>
  </table>

  ${vatNote}
  ${exchangeNote}
  ${generalNotes}

  ${invoice.payment ? `
  <div class="payment">
    <div class="payment-label">${t.payment}</div>
    <div class="payment-grid">
      <div class="meta-label">${t.iban}</div><div>${esc(invoice.payment.iban || '')}</div>
      ${invoice.payment.bank ? `<div class="meta-label">${t.bank}</div><div>${esc(invoice.payment.bank)}</div>` : ''}
      ${invoice.payment.reference ? `<div class="meta-label">${t.reference}</div><div>${esc(invoice.payment.reference)}</div>` : ''}
      ${invoice.payment.terms ? `<div class="meta-label">${t.terms}</div><div>${esc(invoice.payment.terms)}</div>` : ''}
    </div>
  </div>` : ''}

  ${invoice.qrBill ? '<div class="qr-bill-section"><!-- QR-bill SVG injected at PDF generation --></div>' : ''}
</body>
</html>`;
}

// ============================================================================
// QR-bill generation (optional)
// ============================================================================
async function generateQRBill() {
  if (!invoice.qrBill) return null;
  try {
    const { SwissQRBill } = await import('swissqrbill');
    const [streetParts, ...rest] = (invoice.from.address || '').split(' ');
    const qr = new SwissQRBill({
      currency: invoice.currency === 'EUR' ? 'EUR' : 'CHF',
      amount: totals.total,
      reference: invoice.payment.reference || undefined,
      message: invoice.payment.additionalInfo || `Facture ${invoice.invoiceNumber}`,
      creditor: {
        name: invoice.from.company,
        address: invoice.from.address,
        zip: parseInt(invoice.from.zip, 10) || invoice.from.zip,
        city: invoice.from.city,
        account: (invoice.payment.qrIban || invoice.payment.iban).replace(/\s/g, ''),
        country: invoice.from.country || 'CH',
      },
      debtor: invoice.to.address ? {
        name: invoice.to.company,
        address: invoice.to.address,
        zip: parseInt(invoice.to.zip, 10) || invoice.to.zip,
        city: invoice.to.city,
        country: invoice.to.country || 'CH',
      } : undefined,
    });
    return qr.toSVG();
  } catch (err) {
    console.error(`Warning: swissqrbill not available or failed (${err.message}). PDF will be generated without QR-bill.`);
    return null;
  }
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  let html = renderHTML();

  const qrSvg = await generateQRBill();
  if (qrSvg) {
    html = html.replace('<!-- QR-bill SVG injected at PDF generation -->', qrSvg);
  }

  if (mdOnly) {
    const out = outputPath || inputPath.replace(/\.json$/, '.html');
    writeFileSync(out, html);
    console.log(`✓ HTML written to ${out}`);
    return;
  }

  // PDF generation via Puppeteer
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.error('Error: puppeteer not installed. Run: npm install puppeteer');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Resolve output path
  const out = outputPath || (() => {
    const invDir = join(CWD, 'invoices', 'pdf');
    if (!existsSync(invDir)) mkdirSync(invDir, { recursive: true });
    return join(invDir, `${invoice.invoiceNumber}.pdf`);
  })();

  await page.pdf({
    path: out,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();

  console.log(`✓ PDF generated: ${out}`);

  // Update index.json
  const indexPath = join(CWD, 'invoices', 'index.json');
  let idx = { nextNumber: {}, invoices: [] };
  if (existsSync(indexPath)) {
    idx = JSON.parse(readFileSync(indexPath, 'utf-8'));
  }
  const year = invoice.issueDate.slice(0, 4);
  const num = parseInt(invoice.invoiceNumber.split('-').pop(), 10);
  idx.nextNumber[year] = Math.max(idx.nextNumber[year] || 0, num) + 1;

  const existing = idx.invoices.findIndex(i => i.invoiceNumber === invoice.invoiceNumber);
  const entry = {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status || 'draft',
    currency: invoice.currency,
    subtotalHT: totals.subtotal,
    vatAmount: totals.vatAmount,
    totalTTC: totals.total,
    to: invoice.to.company,
    dataFile: inputPath.replace(CWD + '/', ''),
    pdfFile: out.replace(CWD + '/', ''),
  };
  if (existing >= 0) idx.invoices[existing] = entry;
  else idx.invoices.push(entry);

  writeFileSync(indexPath, JSON.stringify(idx, null, 2));
  console.log(`✓ Index updated: ${indexPath}`);

  // Generate hledger snippet next to the JSON
  const hledger = `
${invoice.issueDate} ! Facture ${invoice.invoiceNumber} — ${invoice.to.company}
    ; client:${invoice.to.company.toLowerCase().replace(/[^a-z0-9]/g, '-')}
    ; tva:${totals.vatRate || 0}-${invoice.vat?.method || 'exempt'}
    ; pj:${out.replace(CWD + '/', '')}
    assets:current:receivables:trade           ${invoice.currency} ${totals.total.toFixed(2)}
    revenues:sales:services                   ${invoice.currency} ${(-totals.subtotal).toFixed(2)}
${totals.vatAmount > 0 ? `    liabilities:current:vat:output             ${invoice.currency} ${(-totals.vatAmount).toFixed(2)}` : ''}
`.trim();
  const hledgerPath = inputPath.replace(/\.json$/, '.hledger.txt');
  writeFileSync(hledgerPath, hledger + '\n');
  console.log(`✓ Hledger entry: ${hledgerPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
