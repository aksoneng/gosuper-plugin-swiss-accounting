---
name: swiss-accounting-invoice
description: Génère des factures PDF conformes au droit suisse pour PME (Sàrl/GmbH/SA/RI). Couvre les mentions légales obligatoires (CO 957a, OTVA art. 26), la TVA séparée par taux (8.1 %/2.6 %/3.8 %/0 %), la numérotation séquentielle, la facturation multi-devises avec mention du cours, la QR-facture suisse optionnelle (obligatoire pour paiements CH depuis 30.09.2022), et la production de PDF brandés via le pipeline `markdown-to-pdf` (HTML+CSS → Puppeteer). Active quand l'utilisateur demande "créer une facture", "générer facture PME", "facture suisse", "QR-bill", "QR-facture", "mentions légales facture", "facturer un client", "modèle de facture", "invoice template", ou veut produire une facture PDF conforme.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
metadata:
  version: "1.0.0"
  last_updated: "2026-05-19"
  type: "hybrid"
  category: finance
  tags:
    - swiss-invoicing
    - qr-bill
    - vat
    - co-957a
    - billing
    - pme
---

# Générateur de factures suisse

## Rôle

Tu génères des factures PDF pour PME suisses, conformes au CO et à la LTVA/OTVA. Tu produis :

1. Un **fichier JSON de données** (source modifiable) — voir `templates/sample-invoice.json`
2. Un **PDF final** via le générateur fourni (`templates/generator.mjs`) qui appelle Puppeteer
3. Optionnellement une **QR-facture suisse** intégrée au PDF (zone de paiement bas de page)

Tu **ne tiens pas la comptabilité** : pour les écritures hledger correspondantes, voir le skill `swiss-accounting-hledger`. Tu **ne suis pas les statuts** non plus : c'est à la PME (CRM, tableur, ou fichier `index.json` simple).

## Approche en 4 temps

1. **Comprendre le contexte** : forme juridique, assujetti TVA, devise, langue (FR/DE/IT/EN), client (CH ou étranger)
2. **Identifier la TVA applicable** : taux, méthode (effective ou SSS), reverse charge, export 0 %
3. **Vérifier les mentions légales** : raison sociale, IDE, adresse, n° séquentiel, date, TVA séparée
4. **Générer** : JSON → HTML+CSS → PDF, avec QR-facture si paiement en CHF depuis un compte suisse

## Just-in-time reference loading

| Sujet | Fichier | Quand charger |
|-------|---------|---------------|
| Mentions obligatoires CO 957a, OTVA art. 26, langues, taux 2024, retention 10 ans | `lib/legal-requirements.md` | Première facture, doute sur une mention, client demande modifications |
| QR-facture suisse : structure, IBAN vs QR-IBAN, types de référence (QRR/SCOR/NON), zones du formulaire, vérificateurs | `lib/qr-bill.md` | Inclusion de QR-bill, debug d'une référence, choix entre QRR/SCOR |

---

## Setup initial

### Prérequis

```bash
# macOS
brew install node

# Node packages (utilisés par le generator)
npm install -g puppeteer
# OU dans un projet
npm install puppeteer swissqrbill
```

`swissqrbill` est la lib officielle pour le QR-code suisse (npm: https://www.npmjs.com/package/swissqrbill, MIT license, maintenue, à jour avec la spec 2022).

### Structure de fichiers recommandée

```
mon-entreprise/
├── invoices/
│   ├── data/                       # Fichiers JSON par facture
│   │   ├── INV-2025-001.json
│   │   └── INV-2025-002.json
│   ├── pdf/                        # PDFs générés
│   │   └── INV-2025-001.pdf
│   ├── assets/
│   │   ├── logo.png                # Logo entreprise
│   │   └── signature.png           # Optionnel
│   ├── index.json                  # Compteur + index master
│   ├── generator.mjs               # Copie du template fourni
│   └── invoice-template.html       # Template HTML+CSS (intégré au generator)
└── ...
```

### Numérotation

OTVA art. 26 impose une **numérotation séquentielle continue**, sans saut. Convention courante :

- `INV-YYYY-NNN` ou `FAC-YYYY-NNN` (réinitialisation annuelle autorisée)
- `2025-001` (sans préfixe lettre)
- `<ABC>-NNNN` avec compteur continu pluriannuel

Maintenir un compteur dans `index.json` :

```json
{
  "nextNumber": { "2025": 14, "2026": 1 },
  "invoices": []
}
```

## Workflow standard

### 1. Créer le fichier JSON de la facture

Copier `templates/sample-invoice.json` et adapter. Schéma minimal :

```json
{
  "invoiceNumber": "INV-2025-014",
  "issueDate": "2025-12-15",
  "dueDate": "2026-01-14",
  "serviceDate": "Décembre 2025",
  "lang": "fr",
  "currency": "CHF",
  "status": "draft",

  "from": {
    "company": "Acme Sàrl",
    "uid": "CHE-123.456.789",
    "address": "Rue de la Gare 10, 1003 Lausanne",
    "vatNumber": "CHE-123.456.789 TVA",
    "email": "contact@acme.ch"
  },

  "to": {
    "company": "Client SA",
    "uid": "CHE-987.654.321",
    "address": "Rue du Marché 5, 1204 Genève",
    "email": "ap@client.ch"
  },

  "items": [
    {
      "description": "Prestation de conseil — décembre 2025",
      "quantity": 8,
      "unit": "heure",
      "unitPrice": 180.00
    }
  ],

  "vat": { "rate": 8.1, "method": "effective" },

  "payment": {
    "iban": "CH93 0076 2011 6238 5295 7",
    "bank": "UBS Switzerland AG",
    "terms": "30 jours net",
    "reference": null
  },

  "qrBill": true
}
```

### 2. Générer le PDF

```bash
node generator.mjs invoices/data/INV-2025-014.json

# Markdown only (debug layout sans Puppeteer)
node generator.mjs invoices/data/INV-2025-014.json --md-only

# Sortie spécifique
node generator.mjs invoices/data/INV-2025-014.json --output /tmp/preview.pdf
```

Sortie : `invoices/pdf/INV-2025-014.pdf`, mise à jour de `index.json`.

### 3. Vérifier les mentions obligatoires

Avant d'envoyer, contrôler que la facture contient (voir `lib/legal-requirements.md`) :

```
[] Nom complet et adresse du fournisseur (CO 957a + OTVA 26 al. 2 a)
[] N° IDE/UID du fournisseur (OTVA 26 al. 2 a, format CHE-xxx.xxx.xxx)
[] N° TVA du fournisseur SI assujetti (CHE-xxx.xxx.xxx TVA ou MWST)
[] Nom et adresse du client (OTVA 26 al. 2 b)
[] Date d'émission de la facture (OTVA 26 al. 2 c)
[] N° séquentiel de la facture (OTVA 26 al. 2 c)
[] Date ou période de la prestation (OTVA 26 al. 2 d)
[] Description précise du bien/service (OTVA 26 al. 2 e)
[] Montant HT (OTVA 26 al. 2 f)
[] Taux TVA et montant TVA (OTVA 26 al. 2 g)
[] Mention "TVA non due / Hors champ" si applicable
[] Modalités de paiement (IBAN, terme)
[] (Optionnel mais recommandé) QR-facture si paiement en CHF/EUR depuis CH
```

### 4. Envoyer

L'envoi par email sort du périmètre de ce skill. Joins le PDF à un email manuel ou intègre dans ton outil CRM. Marque `status: sent` dans le JSON après envoi.

---

## Cas particuliers TVA

### Méthode effective (la plus courante)

TVA séparée par écriture, taux applicable selon prestation. Le générateur calcule automatiquement à partir de `vat.rate` :

```json
"vat": { "rate": 8.1, "method": "effective" }
```

### Méthode forfaitaire SSS (PME < CHF 5M CA)

Tu factures à 8.1 % normal au client, mais tu ne reverses qu'un taux SSS à l'ESTV. **Sur la facture, le taux à indiquer est toujours le taux légal applicable au client**, pas ton taux SSS. La PME garde la différence en interne.

```json
"vat": { "rate": 8.1, "method": "sss-forfaitaire", "sssRate": 6.2 }
```

Le champ `sssRate` est purement informatif (n'apparaît pas sur le PDF).

### Reverse charge (service à un client UE, art. 8 LTVA)

Lieu de prestation à l'étranger → 0 % TVA suisse. Mention obligatoire sur la facture.

```json
"vat": { "rate": 0, "method": "reverse-charge",
         "note": "Reverse charge — TVA due par le destinataire (art. 196 directive 2006/112/CE)" }
```

### Export hors UE

0 % TVA, mention "Exportation, art. 23 LTVA" requise.

```json
"vat": { "rate": 0, "method": "export",
         "note": "Exportation — TVA 0 % (art. 23 LTVA)" }
```

### Prestation exclue (médical, formation, logement)

Pas de TVA, mention "Hors champ TVA" requise.

```json
"vat": { "rate": null, "method": "exempt",
         "note": "Prestation exclue du champ TVA (art. 21 LTVA)" }
```

### Plusieurs taux dans une même facture

Décomposer par groupe d'items :

```json
"items": [
  { "description": "Conseil", "quantity": 5, "unit": "h", "unitPrice": 180, "vatRate": 8.1 },
  { "description": "Manuel papier", "quantity": 1, "unit": "ex.", "unitPrice": 50, "vatRate": 2.6 }
]
```

Le générateur applique `vatRate` par ligne et affiche un total par taux dans le récapitulatif.

---

## Multi-devises

Le franc suisse est la devise principale. Pour facturer en EUR/USD/GBP :

```json
"currency": "EUR",
"items": [{ "description": "...", "quantity": 1, "unit": "forfait", "unitPrice": 2000 }],
"vat": { "rate": 8.1, "method": "effective" },
"exchangeRate": { "source": "BNS", "date": "2025-12-15", "rate": 0.94, "chfEquivalent": 1880 }
```

Le générateur inclut au bas du PDF :
> Cours appliqué : EUR/CHF 0.9400 (BNS, 15.12.2025). Équivalent CHF 1'880.00.

Cette mention est **requise** pour la concordance TVA car la TVA est due en CHF même si la facture est en EUR (art. 45 OTVA).

---

## QR-facture suisse

Depuis le 30.09.2022, le QR-bill remplace le BVR. Toute facture envoyée à un client suisse devrait l'inclure pour faciliter le paiement.

Activer :

```json
"qrBill": true,
"payment": {
  "iban": "CH93 0076 2011 6238 5295 7",
  "qrIban": null,
  "reference": null,
  "additionalInfo": "Facture INV-2025-014",
  "bank": "UBS Switzerland AG"
}
```

| Type | Quand | Référence requise |
|------|-------|-------------------|
| IBAN standard | Compte CH normal | NON (champ vide) |
| QR-IBAN (commence par CH...3 ou CH...30, position 5-7) | Compte BVR | OUI (référence QRR 27 chiffres) |

**Détails complets** : voir `lib/qr-bill.md`.

Le générateur intègre `swissqrbill` pour produire le QR-code. Si tu veux un test rapide sans installer la lib, mets `qrBill: false` — le PDF s'imprime sans QR (à compléter manuellement).

---

## Langues

Le générateur supporte FR, DE, IT, EN. Sélection :

```json
"lang": "fr"  // ou "de", "it", "en"
```

Les libellés ("Facture / Rechnung / Fattura / Invoice", "Échéance / Fällig am", etc.) sont traduits automatiquement.

**Règle pratique** :
- Client suisse alémanique → DE
- Client romand → FR
- Client tessinois → IT
- Client étranger → EN (souvent) ou langue du client si tu la pratiques

Pour un client suisse, **la langue de la facture peut différer de la langue de la convention**. Aucune obligation légale de langue spécifique.

---

## Branding

Le template HTML+CSS du generator est neutre (B&W, Swiss grid, Inter font). Pour brander :

1. **Logo** : place `logo.png` (ou `.svg`) dans `invoices/assets/`, référencer `from.logoPath`
2. **Couleur d'accent** : variable CSS `--accent` (header, totaux, surlignages)
3. **Font custom** : embarquer en base64 dans le CSS (voir generator.mjs section `buildInvoiceCSS`)
4. **Footer** : champs `from.companyExtra` (mentions complémentaires : IBAN secondaire, mentions légales, etc.)

Garder la grille de base : c'est ce qui rend une facture lisible et professionnelle (vs un design overdécoré).

---

## Intégration hledger

L'écriture comptable correspondante (à insérer dans le journal du skill `swiss-accounting-hledger`) :

```hledger
2025-12-15 ! Facture INV-2025-014 — Client SA
    ; client:client-sa
    ; tva:8.1-effective
    ; pj:invoices/pdf/INV-2025-014.pdf
    assets:current:receivables:trade           CHF 1'557.36
    revenues:sales:services                   CHF -1'440.00
    liabilities:current:vat:output             CHF -117.36
```

Au paiement :

```hledger
2025-12-30 * Encaissement INV-2025-014
    assets:current:bank:ubs                    CHF 1'557.36
    assets:current:receivables:trade          CHF -1'557.36
```

Le générateur produit **un objet JSON additionnel** par appel (`out.hledger.txt`) avec ces écritures pré-formatées, prêtes à coller dans le journal.

---

## Garde-fous

| Risque | Détection | Action |
|--------|-----------|--------|
| Saut dans la numérotation | Vérifier `index.json` avant chaque création | Toujours utiliser le compteur, jamais un numéro arbitraire |
| Mention TVA manquante alors que assujetti | Validation script du generator | Refuser la génération si `from.vatNumber` absent ET TVA appliquée |
| Cours FX absent sur facture EUR | Validation script | Bloquer si `currency != "CHF"` et `exchangeRate` manquant |
| QR-IBAN sans référence QRR | Validation script `swissqrbill` | swissqrbill émet une erreur, le generator stoppe |
| Format IDE invalide | Regex `CHE-\d{3}\.\d{3}\.\d{3}` | Validation au chargement du JSON |
| Description trop vague ("Prestations") | Manuel | Préférer "Prestation de conseil — décembre 2025" pour la traçabilité TVA |
| Pas de date de prestation | Auto | Le generator copie `issueDate` dans `serviceDate` si absente |
| Échéance > 30 j sans raison | Manuel | Conventions de marché : 30 j net. Plus = client préférentiel |

---

## Usage

Invoque ce skill avec `/swiss-accounting-invoice` ou quand tu :
- Crées une nouvelle facture pour une PME suisse
- Veux comprendre les mentions légales requises. Charger `lib/legal-requirements.md`
- Dois ajouter un QR-bill à une facture. Charger `lib/qr-bill.md`
- Gères du multi-devises (EUR/USD avec mention BNS)
- Travailles avec reverse charge UE ou export hors UE
- Adaptes le template HTML+CSS pour le branding d'une entreprise

## Limites de ce skill

Ce skill **ne couvre pas** :
- Le suivi des paiements et relances (CRM, ou un script dédié à intégrer)
- L'envoi automatique par email (à intégrer avec un SMTP ou Resend)
- La déclaration TVA (voir `swiss-accounting-hledger`, section TVA)
- Les notes de crédit en série (formellement, c'est une "facture corrective" avec son propre numéro)
- L'e-invoicing B2G obligatoire en UE (Peppol/SDI/CFDI — pas suisse-suisse pertinent)

**Data vintage** : règles et taux à jour au 19 mai 2026. Vérifier annuellement contre ESTV (TVA) et swissqrbill (QR spec).
