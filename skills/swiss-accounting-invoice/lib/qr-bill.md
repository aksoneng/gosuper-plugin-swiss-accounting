# QR-facture suisse

Référence pratique pour intégrer la QR-facture (Swiss QR-bill) sur tes factures. Standard officiel publié par PaymentStandards.CH (https://www.paymentstandards.ch), maintenu par SIX.

## Statut

- **Obligatoire de facto pour les paiements en CHF/EUR depuis la Suisse** depuis le 30.09.2022. Les anciens bulletins rouges (BVR) et bulletins de versement orange (BVR/ESR) ne sont plus émis ni acceptés par les banques suisses.
- **Format unique** remplaçant BVR, BVR-bancaire et bulletin sans référence.
- **Lisible par toute app bancaire suisse** (UBS, PostFinance, ZKB, Raiffeisen, Crédit Suisse, Neon, Yuh, Revolut Suisse, etc.) via scan du QR-code.

## Composition d'une facture avec QR

La page A4 finale comprend :

```
┌─────────────────────────────────────────────┐
│                                             │
│     Facture (zone haute, classique)         │
│                                             │
│  - Logo, n° facture, dates                  │
│  - Parties (émetteur, destinataire)         │
│  - Lignes de prestation                     │
│  - Totaux HT, TVA, TTC                      │
│  - Modalités de paiement                    │
│                                             │
├─────────────────────────────────────────────┤  ← ligne de séparation (perforation)
│                                             │
│   ┌─────────────┬──────────────────────┐    │
│   │             │ Section paiement     │    │
│   │  Récépissé  │                      │    │
│   │             │ - Compte / Payable à │    │
│   │ 62 mm × 105 │ - Référence          │    │
│   │             │ - Informations supp. │    │
│   │             │ - Montant            │    │
│   │             │ - Payable par        │    │
│   │             │                      │    │
│   │             │  [QR-Code 46×46 mm]  │    │
│   └─────────────┴──────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Dimensions strictes** : la section paiement fait **105 mm × 210 mm** (1/3 inférieur d'une A4). La spec impose ces dimensions pour le scan automatique.

## IBAN vs QR-IBAN

C'est la première décision technique :

| Type | Format | Référence requise | Quand utiliser |
|------|--------|-------------------|----------------|
| **IBAN standard CH** | `CH XX BBBBB AAAA AAAA AAAA A` | Aucune (mode "sans référence" ou message texte) | Compte courant normal, paiement classique |
| **QR-IBAN** | Idem mais l'IID (chiffres 5-9 de l'IBAN) commence par `30` à `31` | Référence QRR (27 chiffres) obligatoire | Compte BVR historique converti, automatisation de réconciliation |

### Comment savoir si c'est un QR-IBAN

Regarde l'IID (Institut Identifier) — les chiffres 5 à 9 de l'IBAN après les 2 lettres pays et 2 chiffres de contrôle :

```
IBAN standard : CH93 0076 2011 6238 5295 7
                     ────
                     0076 = IID UBS (compte normal)

QR-IBAN       : CH44 3199 9123 0008 8901 2
                     ────
                     3199 = IID UBS pour comptes QR-bill
```

Si l'IID commence par **3** (en réalité `3000` à `3199` sont la plage QR), c'est un QR-IBAN. Ta banque te dit lequel tu utilises (ou tu vois deux IBAN dans ton e-banking).

**Pour la plupart des PME** : utiliser l'IBAN standard avec mode "sans référence" est le plus simple. La référence QRR n'est nécessaire que pour automatiser la réconciliation de gros volumes.

## Types de référence

| Type | Format | Quand |
|------|--------|-------|
| **QRR** (QR Reference) | 27 chiffres, contrôle modulo 10 récursif | Avec QR-IBAN, obligatoire |
| **SCOR** (Creditor Reference) | RFxx + 21 caractères alphanumériques (ISO 11649) | Avec IBAN standard, optionnel, format international |
| **NON** | (vide) | Avec IBAN standard, paiement libre, message texte optionnel |

### Génération d'une QRR

27 chiffres = jusqu'à 26 chiffres d'information + 1 chiffre de contrôle. Convention courante :

```
00 00000 INVOICE-NUM CUSTOMER-CODE CHECK
└─ banque/agence (5)
        └─ filler         
                  └─ numéro facture (variable)
                              └─ code client (variable)
                                          └─ check digit
```

`swissqrbill` (lib npm) génère le check digit automatiquement. Tu fournis 26 chiffres, elle calcule le 27e.

### Génération d'une SCOR

Plus simple, format international ISO 11649. Exemple :

```
RF18 1234 5678 9012
```

Préfixe `RF`, 2 chiffres de contrôle, jusqu'à 21 caractères alphanumériques. `swissqrbill` le gère aussi.

## Structure du QR-code (techniquement)

Le QR-code encode une chaîne UTF-8 multi-ligne (32 segments fixes) selon le standard "Swiss QR Code v2.2". Exemple décodé :

```
SPC                                  ← header (Swiss Payments Code)
0200                                 ← version 2.2
1                                    ← coding type
CH9300762011623852957                ← IBAN
S                                    ← creditor address type (S = structured)
Acme Sàrl
Rue de la Gare
10
1003
Lausanne
CH
                                     ← (ultimate creditor — vide)
1557.36                              ← montant
CHF                                  ← devise
S                                    ← debtor address type
Client SA
Rue du Marché
5
1204
Genève
CH
NON                                  ← reference type (NON / QRR / SCOR)
                                     ← reference (vide ici)
Facture INV-2025-014                 ← additional info (unstructured)
EPD                                  ← end payment data
                                     ← (optional billing info)
```

Tu n'as **jamais à écrire ce blob à la main**. `swissqrbill` génère tout depuis un objet JS structuré.

## Intégration `swissqrbill`

Installation :

```bash
npm install swissqrbill puppeteer
```

Usage dans le generator :

```js
import { SwissQRBill } from 'swissqrbill';
import { writeFileSync } from 'node:fs';

const data = {
  currency: "CHF",
  amount: 1557.36,
  reference: "00 00000 12345 67890",   // optionnel selon mode
  message: "Facture INV-2025-014",
  creditor: {
    name: "Acme Sàrl",
    address: "Rue de la Gare 10",
    zip: 1003,
    city: "Lausanne",
    account: "CH9300762011623852957",
    country: "CH"
  },
  debtor: {
    name: "Client SA",
    address: "Rue du Marché 5",
    zip: 1204,
    city: "Genève",
    country: "CH"
  }
};

// Pour intégrer dans un PDF existant (pdf-lib) :
import { PDFDocument } from 'pdf-lib';
const pdfDoc = await PDFDocument.load(existingPdfBytes);
const qrBill = new SwissQRBill(data);
await qrBill.attachTo(pdfDoc);    // ajoute la section paiement à la dernière page
writeFileSync('out.pdf', await pdfDoc.save());

// Pour rendre comme image (PNG/SVG) à intégrer dans un HTML :
const svg = qrBill.toSVG();        // retourne string SVG
const png = await qrBill.toPNG();  // retourne Buffer PNG
```

**Pour le pipeline Puppeteer** : le plus propre est de générer le SVG, l'inliner dans le HTML, puis Puppeteer rend tout en PDF. Pas besoin de pdf-lib séparément.

## Workflow recommandé

1. Générer le HTML de la facture (template normal)
2. À la fin du HTML, ajouter une div `.qr-bill-section` avec le SVG retourné par `swissqrbill.toSVG()`
3. Forcer un `page-break-before: always` sur cette div pour qu'elle occupe la 2e page (ou bas de la 1ère si layout serré)
4. Puppeteer génère le PDF final

CSS minimal :

```css
.qr-bill-section {
  page-break-before: always;
  width: 210mm;
  height: 105mm;
  position: relative;
}

.qr-bill-section svg {
  width: 210mm;
  height: 105mm;
}
```

## Cas particuliers

### Facture en EUR avec compte en CHF

Le QR-bill **supporte CHF et EUR uniquement** (pas USD, GBP, etc.). Tu peux émettre une facture en EUR avec un IBAN CH normal :

```js
{
  currency: "EUR",
  amount: 1480.00,
  creditor: { account: "CH9300762011623852957", ... }
}
```

L'app bancaire suisse convertira au taux du jour. Pour USD/GBP, pas de QR — utiliser un virement SWIFT classique.

### Pas de montant (facture acompte ouvert)

Tu peux omettre `amount` pour laisser le client saisir le montant à payer (utile pour les dons, abonnements à montant libre). À éviter pour les factures standards.

### Adresse débiteur inconnue

Si tu factures à un nouveau client sans connaître son adresse complète, tu peux laisser `debtor` à `null`. Le QR sera valide mais l'app bancaire demandera l'adresse au moment du paiement.

### Référence client custom

Si ton client veut son propre numéro de référence dans le message (pour son ERP) :

```js
message: "Réf. client: ACME-PO-2025-042 / Facture INV-2025-014"
```

140 caractères max pour le message libre.

## Vérification

Avant d'envoyer, scanner le QR-code avec une app bancaire (en mode "paiement" → "scan") :
- Le bénéficiaire est correct ?
- Le montant et la devise sont corrects ?
- La référence (si QRR) est valide (l'app refuse si check digit faux) ?

Outils de validation :
- https://www.swiss-qr-invoice.org/ (vérificateur visuel en ligne)
- `swissqrbill` valide automatiquement à la génération (lance une erreur si données invalides)
- Test PostFinance : https://www.postfinance.ch/en/business/products/debtors-management/qr-bill.html

## Erreurs fréquentes

| Erreur | Cause | Remède |
|--------|-------|--------|
| Check digit QRR invalide | Reference 26 chiffres au lieu de 27 | Laisser swissqrbill calculer le digit |
| Adresse trop longue | Champ > 70 caractères | Raccourcir ou utiliser structure ligne1+ligne2 |
| Currency ≠ CHF/EUR | QR-bill n'accepte que ces deux | Pour USD/GBP, virement SWIFT |
| IBAN non suisse (e.g. FR, DE) | QR-bill n'accepte que CH/LI | Virement SWIFT classique |
| QR-IBAN sans référence | QRR obligatoire | Soit fournir une QRR valide, soit utiliser IBAN standard |
| Zone QR coupée à l'impression | Margins PDF mal réglés | `@page { size: A4; margin: 0; }` pour la zone QR |
| QR illisible | Résolution PDF trop basse | Min 300 DPI, ou SVG vectoriel |

## Ressources

- Spec officielle : https://www.paymentstandards.ch/dam/downloads/ig-qr-bill-fr.pdf
- swissqrbill (npm) : https://www.npmjs.com/package/swissqrbill
- swissqrbill GitHub : https://github.com/schoero/swissqrbill
- Test online : https://www.swiss-qr-invoice.org/
- PostFinance guide : https://www.postfinance.ch/en/business/products/debtors-management/qr-bill.html
