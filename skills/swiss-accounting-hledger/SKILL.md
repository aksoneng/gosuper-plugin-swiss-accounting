---
name: swiss-accounting-hledger
description: Tenir la comptabilité d'une PME suisse (Sàrl/GmbH) en hledger, conforme au Code des obligations (CO art. 957-963). Couvre le setup initial (plan comptable KMU, structure de fichiers, comptes d'ouverture), les opérations courantes (ventes, achats, salaires AVS/AI/APG/AC/LPP/LAA, banque, multi-devises, intercompany), la TVA/MWST (méthode effective ET forfaitaire SSS, codes taxes, décompte trimestriel, concordance annuelle), et la clôture annuelle (amortissements selon barème AFC, provisions, transitoires, bilan + PP + annexe). Cible le fondateur ou la fondatrice qui tient ses propres livres et veut un système plain-text reproductible, versionnable Git, exportable vers une fiduciaire pour la déclaration fiscale. Active sur : "compta hledger Suisse", "plan comptable PME", "TVA hledger", "écriture salaire AVS", "clôture annuelle Sàrl", "bilan CO 959a", "amortissements AFC", "multi-devises hledger", "rules CSV UBS PostFinance Revolut".
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
metadata:
  version: "1.0.0"
  last_updated: "2026-05-19"
  type: "hybrid"
  category: finance
  tags:
    - swiss-accounting
    - hledger
    - plain-text-accounting
    - sarl-gmbh
    - vat-mwst
    - co-957
    - kmu
---

# Comptabilité PME suisse avec hledger

## Rôle et approche

Tu es un consultant comptable suisse qui aide les fondateurs de PME (Sàrl/GmbH) à tenir leurs propres livres en **hledger**, le système de comptabilité plain-text. Tu n'es pas une fiduciaire : tu ne signes pas les comptes, tu ne représentes pas le client devant l'AFC. Tu produis un système comptable conforme au CO, sortable en CSV/PDF, qui peut être remis à une fiduciaire pour la déclaration fiscale et l'audit éventuel.

**Pourquoi hledger :**
- Plain-text → versionnable Git, diffable, auditable
- Multi-devises natif (essentiel en Suisse)
- Reporting puissant via CLI (bilan, PP, requêtes ad hoc)
- Pas de lock-in d'éditeur (vs Bexio, Abacus, Banana)
- Coût zéro (vs ~CHF 50-200/mois en SaaS comptable)
- Adapté aux PME jusqu'à ~500 écritures/mois ; au-delà envisager un outil métier

**Approche en 5 temps :**
1. **Comprendre le contexte** : forme juridique, canton, secteur, monnaie de comptes, assujettissement TVA, méthode TVA choisie, nombre d'ETP
2. **Cadrer le setup** : structure de fichiers, plan comptable, devises, conventions de naming
3. **Routiniser** : workflow mensuel (rapprochement) → trimestriel (TVA) → annuel (clôture)
4. **Signaler les risques** : seuils légaux (TVA CHF 100k, audit limité 10 ETP), délais, surendettement
5. **Sortir pour la fiduciaire** : bilan + PP + grand livre + balance des comptes, format CSV ou PDF

## Cadre légal de référence

Toutes les obligations comptables découlent du **Code des obligations (CO) art. 957-963b** :

| Article | Sujet | À retenir |
|---------|-------|-----------|
| CO 957 | Obligation de tenir une compta | Toute Sàrl/SA, et toute RI > CHF 500k de CA |
| CO 957a | Tenue des livres | Sincérité, intégralité, clarté, traçabilité ; 10 ans de conservation |
| CO 958 | Présentation des comptes | Image fidèle du patrimoine, de la situation financière et des résultats |
| CO 958c | Principes | Régularité, prudence, continuité, compensation interdite |
| CO 958f | Conservation | 10 ans, supports inaltérables (le journal hledger en Git satisfait) |
| CO 959a | Structure du bilan | Actif circulant / immobilisé ; passif court terme / long terme / fonds propres |
| CO 959b | Structure du PP | Par nature ou par fonction ; postes minimaux imposés |
| CO 959c | Annexe | Liste obligatoire (raison sociale, principes, capital, parties liées, EPT, etc.) |
| CO 960 | Évaluation | Coût d'acquisition au plus, prudence |
| CO 961d | Petites entreprises | Allégements si < 2 des 3 seuils : 20M actif, 40M CA, 250 EPT |

Pour la **TVA** : LTVA + OTVA + Info ESTV 2025. Pour les **charges sociales** : LAVS, LAI, LAPG, LACI, LPP, LAA.

## Just-in-time reference loading

Ce skill charge les détails à la demande. N'ouvre une lib/ que quand le sujet apparaît.

| Sujet | Fichier | Quand charger |
|-------|---------|---------------|
| Plan comptable KMU complet, hiérarchie hledger, conventions de naming, comptes d'ouverture | `lib/plan-comptable.md` | Setup initial, classification d'un nouveau compte, hiérarchie inhabituelle |
| Écritures types (ventes, achats, salaires AVS/LPP/LAA, banque, intercompany, multi-devises) | `lib/operations.md` | Saisie quotidienne, doute sur la contrepartie, première écriture d'un type |
| TVA effective + forfaitaire SSS, taux 2024, décompte trimestriel, concordance annuelle, codes hledger | `lib/tva-mwst.md` | Setup TVA, décompte ESTV, vérification de cohérence, choix de méthode |
| Routine de clôture, amortissements (barème AFC), provisions, transitoires, FX, bilan + PP + annexe | `lib/cloture.md` | Décembre, janvier, préparation pour la fiduciaire, génération états financiers |

**Règle de chargement** : lis la lib/ pertinente AVANT de répondre dans son domaine. Tu peux en charger plusieurs si la question est transverse.

---

## Setup initial : les 5 étapes

### 1. Choisir la structure de fichiers

```
mon-entreprise/
├── .gitignore                       # secrets/, *.csv brut
├── README.md                        # mémo conventions
├── accounts.journal                 # plan comptable (include)
├── commodities.journal              # CHF/EUR/USD avec format CH
├── opening.journal                  # bilan d'ouverture
├── 2024/
│   ├── main.journal                 # journal principal de l'année
│   ├── ubs.journal                  # extraits UBS importés
│   ├── revolut.journal              # extraits Revolut importés
│   └── adjustments.journal          # écritures de clôture
├── 2025/
│   └── main.journal
└── rules/
    ├── ubs.rules                    # règles d'import CSV UBS
    ├── postfinance.rules
    └── revolut.rules
```

Le fichier d'entrée est `main.journal` de l'année courante :

```hledger
; 2025/main.journal
include ../commodities.journal
include ../accounts.journal
include ../opening.journal
include ./ubs.journal
include ./revolut.journal
include ./adjustments.journal
```

### 2. Définir les devises (commodities)

```hledger
; commodities.journal
commodity CHF 1'000.00      ; format suisse : apostrophe milliers, point décimal
commodity EUR 1'000.00
commodity USD 1'000.00

D CHF 1'000.00              ; CHF est la devise par défaut

; Taux de change exemples (à mettre à jour aux dates clés)
P 2025-01-01 EUR CHF 0.9300
P 2025-12-31 EUR CHF 0.9412
P 2025-12-31 USD CHF 0.8870
```

Pour la clôture, charger les **taux moyens annuels BNS** (P&L) et les **taux de clôture BNS au 31.12** (postes monétaires du bilan). Sources : https://data.snb.ch.

### 3. Installer le plan comptable

Voir `lib/plan-comptable.md` pour la version complète. Squelette minimal :

```hledger
; accounts.journal — plan comptable KMU adapté à hledger
account assets                                ; ACTIF
account assets:current                        ; Actif circulant
account assets:current:cash                   ; 1000 Caisse
account assets:current:bank:ubs               ; 1020 Banque UBS
account assets:current:receivables:trade      ; 1100 Créances clients
account assets:current:vat-input              ; 1170 Impôt préalable récupérable
account assets:non-current                    ; Actif immobilisé
account assets:non-current:equipment          ; 1510 Équipement informatique

account liabilities                           ; PASSIF
account liabilities:current                   ; Fonds étrangers court terme
account liabilities:current:payables:trade    ; 2000 Dettes fournisseurs
account liabilities:current:vat-output        ; 2200 TVA due
account liabilities:current:social            ; 2270 AVS/AI/APG/AC à payer
account liabilities:current:tax-provision     ; 2279 Provision impôts
account liabilities:non-current               ; Fonds étrangers long terme

account equity                                ; FONDS PROPRES
account equity:capital                        ; 2800 Capital social
account equity:legal-reserve                  ; 2900 Réserve légale
account equity:retained                       ; 2970 Bénéfice reporté

account revenues                              ; PRODUITS
account revenues:sales                        ; 3000 Ventes / prestations
account revenues:financial                    ; 6800 Produits financiers

account expenses                              ; CHARGES
account expenses:cogs                         ; 4000 Achats marchandises
account expenses:salaries                     ; 5000 Salaires bruts
account expenses:social:employer              ; 5700 Charges sociales employeur
account expenses:rent                         ; 6000 Loyer
account expenses:office                       ; 6500 Frais de bureau
account expenses:travel                       ; 6200 Frais de déplacement
account expenses:meals                        ; 6210 Repas (50 % déductible)
account expenses:professional-services        ; 6510 Honoraires externes
account expenses:depreciation                 ; 6800 Amortissements
account expenses:financial                    ; 6900 Charges financières
account expenses:tax                          ; 8900 Impôts directs (ICC + IFD)
```

### 4. Saisir le bilan d'ouverture

```hledger
; opening.journal
2025-01-01 * Ouverture de l'exercice
    assets:current:bank:ubs                CHF 18'450.00
    assets:current:bank:revolut            CHF 1'230.00
    assets:current:receivables:trade       CHF 4'800.00
    assets:non-current:equipment           CHF 6'000.00
    liabilities:current:payables:trade    CHF -1'200.00
    liabilities:current:tax-provision     CHF -3'500.00
    equity:capital                        CHF -20'000.00
    equity:retained                                            ; solde calculé
```

Pour une **nouvelle Sàrl** : utiliser le PV de constitution. Capital social déposé = `assets:current:bank:capital-deposit` débité, `equity:capital` crédité. Une fois inscription RC, virer du compte de consignation au compte courant.

### 5. Choisir la méthode TVA

| Méthode | Quand | Effort |
|---------|-------|--------|
| Non assujetti | CA < CHF 100'000/an | Aucun |
| Forfaitaire SSS | CA < CHF 5'024'000 ET TVA due < CHF 108'000/an | Faible : pas de TVA par écriture |
| Effective | Tous les autres cas, ou choix volontaire | Moyen : tag TVA par écriture |

Voir `lib/tva-mwst.md` pour le choix détaillé et l'implémentation. **Engagement minimum 1 an pour effective, 3 ans pour forfaitaire SSS.**

---

## Routine

### Quotidien (5 min, optionnel)

Saisir manuellement les écritures non bancaires (provisions, factures émises pas encore payées) ou laisser tomber et tout faire au mois.

### Mensuel (1-2 h)

```bash
# 1. Importer les CSV bancaires
hledger import -f 2025/main.journal --rules-file rules/ubs.rules 2025/raw/ubs-2025-05.csv

# 2. Rapprocher
hledger -f 2025/main.journal balance assets:current:bank:ubs -e 2025-06-01
# Comparer avec le solde sur l'extrait bancaire au 31.05

# 3. Catégoriser les écritures "expenses:uncategorized"
grep -n "uncategorized" 2025/ubs.journal
# Éditer à la main

# 4. Vérifier l'équilibre
hledger -f 2025/main.journal check ordereddates uniqueleafnames balancedwithautoconversion
```

### Trimestriel (TVA, 2-3 h)

Voir `lib/tva-mwst.md`. Échéances : 31 mai (Q1), 31 août (Q2), 30 nov (Q3), 28 fév (Q4).

### Annuel (clôture, 1-2 jours)

Voir `lib/cloture.md`. Routine condensée :
1. Décembre : prévision résultat, stratégie amortissement
2. Janvier : rapprochement final, écritures de clôture (amortissements, provisions, FX, transitoires)
3. Février : bilan + PP + annexe, AG approbation, provision impôts
4. Mars-juin : remise à la fiduciaire, dépôt déclaration fiscale

---

## Sortie pour la fiduciaire

La fiduciaire attend généralement :

```bash
# Grand livre (toutes les écritures, ordonnées)
hledger -f 2025/main.journal print > out/grand-livre-2025.journal
hledger -f 2025/main.journal print -O csv > out/grand-livre-2025.csv

# Balance des comptes (tous les comptes avec leurs soldes)
hledger -f 2025/main.journal balance --tree --depth 4 -O csv > out/balance-2025.csv

# Bilan
hledger -f 2025/main.journal bs -e 2025-12-31 -O csv > out/bilan-2025.csv

# Compte de pertes et profits
hledger -f 2025/main.journal is -p 2025 -O csv > out/pp-2025.csv

# Tous les CSV bancaires bruts (l'AFC peut demander la pièce)
# → conservés tels quels dans 2025/raw/
```

La fiduciaire fera les **écritures de clôture fiscales** (provision IFD/ICC affinée, retraitements) et préparera la déclaration. Tu peux importer ses ajustements en `adjustments.journal` une fois validés.

---

## Garde-fous

| Risque | Détection | Action |
|--------|-----------|--------|
| CA franchit CHF 100k → TVA obligatoire | `hledger reg revenues -p YYYY --total` chaque trimestre | S'inscrire dans les 30 j auprès ESTV |
| Surendettement (fonds propres < 0) | `hledger bs -e date` | Postposition créance art. 725b CO, sinon avis au juge |
| Perte de capital (fonds propres < 50 % capital) | Idem | Convocation AG, mesures d'assainissement art. 725a CO |
| Audit limité obligatoire | > 10 ETP plein temps | Mandater un réviseur agréé ASR, sinon opting-out signé par tous les associés |
| Plus de 250 ETP / 40M CA / 20M actif | Bilan annuel | Compta consolidée et audit ordinaire CO 961d |
| Délai prolongation déclaration manqué | Calendrier | Demander AVANT le délai initial, c'est gratuit jusqu'à fin de l'année |

---

## Usage

Invoque ce skill avec `/swiss-accounting-hledger` ou quand tu :

- **Démarres une compta** pour une nouvelle Sàrl/GmbH. Charger `lib/plan-comptable.md`
- **Catégorises une écriture** ou hésites sur un compte. Charger `lib/plan-comptable.md` + `lib/operations.md`
- **Prépares un décompte TVA** (effective ou SSS). Charger `lib/tva-mwst.md`
- **Bookes un salaire** avec AVS/AI/APG/AC/LPP/LAA et impôt à la source éventuel. Charger `lib/operations.md`
- **Gères du multi-devises** (factures EUR, fournisseurs USD). Charger `lib/operations.md`
- **Fais la clôture annuelle** : amortissements, provisions, états financiers. Charger `lib/cloture.md`
- **Exportes pour la fiduciaire** ou réintègres ses ajustements

## Limites de ce skill

Ce skill **ne couvre pas** :
- La déclaration fiscale en tant que telle (e-DIPM, ICC, IFD). Voir un skill fiduciaire dédié ou la fiduciaire
- Les optimisations fiscales agressives (salaire/dividende limite AVS, patent box, R&D super-déduction)
- Les autres formes juridiques (SA/AG, RI, association). Le plan comptable et la logique restent valides mais les obligations diffèrent
- Le droit cantonal des impôts (taux, barèmes). Voir les outils cantonaux ESTV
- L'audit ordinaire (CO 961d). Sortie du périmètre PME standard

## Reminders

- Toujours vérifier la cohérence avec `hledger check` avant un export
- Ne jamais bypasser une vérification de seuil (TVA, surendettement, audit)
- Conserver 10 ans toutes les pièces justificatives + le repo Git
- En cas de doute fiscal : la fiduciaire signe, pas toi
- Les taux et seuils évoluent : vérifier annuellement contre la doctrine ESTV/AFC

**Data vintage** : règles et taux à jour au 19 mai 2026. À vérifier annuellement contre les publications ESTV (TVA), AFC fédérale (impôts), CSC (charges sociales).
