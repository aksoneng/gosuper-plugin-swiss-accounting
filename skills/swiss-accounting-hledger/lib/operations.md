# Opérations courantes en hledger pour PME suisse

Catalogue des écritures types pour une Sàrl/GmbH. Chaque section :
1. **Cas pratique** (situation concrète)
2. **Écriture hledger** (sous la forme finale)
3. **Variantes** (TVA effective vs forfaitaire, devises, etc.)
4. **Pièges à éviter**

Tous les exemples utilisent le plan de `lib/plan-comptable.md`.

## Conventions de saisie

### Tags utilisés systématiquement

```hledger
2025-03-15 * Facture client #2025-014
    ; client:acme-sa
    ; projet:website-redesign
    ; tva:8.1-effective
    assets:current:receivables:trade           CHF 1'081.00
    revenues:sales:services                   CHF -1'000.00
    liabilities:current:vat:output             CHF -81.00
```

- `client:` — slug du client pour requêtes par compte
- `projet:` — pour analytique par projet
- `tva:` — méthode et taux (`8.1-effective`, `2.6-effective`, `forfaitaire-sss`, `exempt`)
- `pj:` — référence pièce justificative dans `pieces/2025/03/`
- `paye-le:` — date de paiement effective (pour le rapprochement)

### Statuts d'écriture

- `*` = pointée / rapprochée (paiement confirmé par extrait bancaire)
- `!` = en attente (facture émise, paiement pas encore reçu)
- (rien) = saisie brute, à valider

Workflow : `!` à l'émission de la facture, `*` au rapprochement bancaire.

### Référencement pièces

Stocker les PDF dans `pieces/{YEAR}/{MM}/` et référencer par tag `pj:`. Convention de nommage :
`{date}_{type}_{tiers}_{ref}.pdf` → ex. `2025-03-15_facture-emise_acme-sa_2025-014.pdf`

---

## Cycle des ventes (clients)

### V1 — Facture client encaissée immédiatement (TVA effective 8.1 %)

**Situation** : prestation rendue ce jour, payée le jour même par virement.

```hledger
2025-03-15 * Facture #2025-014 — Conseil stratégique Acme SA
    ; client:acme-sa
    ; projet:strategy
    ; tva:8.1-effective
    ; pj:2025-03-15_facture-emise_acme-sa_2025-014.pdf
    assets:current:bank:ubs                    CHF 5'405.00
    revenues:sales:services                   CHF -5'000.00
    liabilities:current:vat:output             CHF -405.00  ; 5000 × 8.1 %
```

### V2 — Facture client avec délai de paiement (méthode contre-passation)

**Situation** : facture émise le 15.03, payable à 30 j, reçue le 14.04.

```hledger
2025-03-15 ! Facture #2025-014 — Conseil stratégique Acme SA
    ; client:acme-sa
    ; tva:8.1-effective
    ; pj:2025-03-15_facture-emise_acme-sa_2025-014.pdf
    assets:current:receivables:trade           CHF 5'405.00
    revenues:sales:services                   CHF -5'000.00
    liabilities:current:vat:output             CHF -405.00

2025-04-14 * Encaissement facture #2025-014
    ; client:acme-sa
    assets:current:bank:ubs                    CHF 5'405.00
    assets:current:receivables:trade          CHF -5'405.00
```

**Pourquoi deux écritures** : la TVA est due dès l'émission (méthode contre-prestations convenues) sauf si tu as opté pour la méthode contre-prestations reçues à l'ESTV (voir `tva-mwst.md`).

### V3 — Facture en EUR encaissée en EUR (multi-devises)

**Situation** : client UE, facture EUR 1'200, encaissée sur compte Revolut EUR.

```hledger
2025-03-15 ! Facture #2025-015 — Conseil EU GmbH
    ; client:eu-gmbh
    ; tva:exempt-export
    ; pj:2025-03-15_facture-emise_eu-gmbh_2025-015.pdf
    assets:current:receivables:trade   EUR 1'200.00 @@ CHF 1'128.00  ; cours BNS du jour
    revenues:sales:export             CHF -1'128.00

2025-04-10 * Encaissement facture #2025-015
    ; client:eu-gmbh
    assets:current:bank:revolut        EUR 1'200.00 @@ CHF 1'135.20  ; cours du jour
    assets:current:receivables:trade  EUR -1'200.00 @@ CHF 1'128.00
    revenues:financial:fx-gains              CHF -7.20             ; gain de change réalisé
```

Note : pas de TVA car prestation à l'étranger (lieu de prestation = destinataire pour services B2B, art. 8 LTVA).

### V4 — Avance reçue d'un client (acompte)

**Situation** : Acme verse CHF 2'000 le 01.03 pour une prestation qui sera rendue en avril.

```hledger
2025-03-01 * Acompte client Acme SA — Projet website
    ; client:acme-sa
    ; tva:8.1-effective
    assets:current:bank:ubs                    CHF 2'162.00
    liabilities:current:accruals:deferred-income  CHF -2'000.00
    liabilities:current:vat:output             CHF -162.00  ; TVA due dès encaissement de l'acompte

2025-04-30 * Facture finale #2025-022 — Projet website Acme SA
    ; client:acme-sa
    ; tva:8.1-effective
    ; pj:2025-04-30_facture-emise_acme-sa_2025-022.pdf
    liabilities:current:accruals:deferred-income   CHF 2'000.00
    assets:current:receivables:trade               CHF 3'243.00
    revenues:sales:services                       CHF -5'000.00
    liabilities:current:vat:output                 CHF -243.00  ; TVA solde : (5000 − 2000) × 8.1 %
```

### V5 — Note de crédit (annulation)

**Situation** : annulation totale de la facture #2025-014.

```hledger
2025-04-20 * Note de crédit #2025-NC-001 — Annulation facture #2025-014
    ; client:acme-sa
    ; tva:8.1-effective
    ; pj:2025-04-20_note-credit_acme-sa_NC-001.pdf
    revenues:sales:services                    CHF 5'000.00
    liabilities:current:vat:output             CHF 405.00
    assets:current:receivables:trade          CHF -5'405.00
```

### V6 — Créance douteuse / radiation

**Situation** : Acme SA en faillite, créance CHF 5'405 jugée irrécouvrable.

```hledger
2025-12-31 * Radiation créance Acme SA (faillite)
    ; client:acme-sa
    ; pj:2025-12-15_attestation-faillite_acme-sa.pdf
    expenses:office:other                      CHF 5'000.00       ; perte sur créance
    liabilities:current:vat:output             CHF 405.00         ; récupération TVA collectée
    assets:current:receivables:trade          CHF -5'405.00
```

Note : la TVA collectée peut être récupérée via formulaire ESTV en cas d'irrécouvrabilité prouvée (art. 89 al. 6 LTVA).

### V7 — Vente forfaitaire SSS

**Situation** : Acme paye CHF 5'405 (TTC). Tu es en méthode SSS, taux 6.1 % (catégorie "Conseil"). Pas de séparation TVA par écriture.

```hledger
2025-03-15 * Facture #2025-014 — Conseil Acme SA
    ; client:acme-sa
    ; tva:forfaitaire-sss-6.1
    assets:current:bank:ubs                    CHF 5'405.00
    revenues:sales:services                   CHF -5'405.00       ; TTC, la TVA est calculée au décompte
```

La TVA due se calcule au décompte trimestriel : `5'405 × 6.1 % = CHF 329.71`. Voir `lib/tva-mwst.md`.

---

## Cycle des achats (fournisseurs)

### A1 — Facture fournisseur Suisse (TVA effective récupérable)

**Situation** : facture fournisseur CHF 1'081 TTC dont CHF 81 TVA, reçue le 10.03, payée le 25.03.

```hledger
2025-03-10 ! Facture fournisseur Office Suppliers SA
    ; fournisseur:office-suppliers
    ; tva:8.1-recuperable
    ; pj:2025-03-10_facture-recue_office-suppliers_F-2025-456.pdf
    expenses:office:supplies                    CHF 1'000.00
    assets:current:receivables:vat:material     CHF 81.00          ; impôt préalable récupérable
    liabilities:current:payables:trade         CHF -1'081.00

2025-03-25 * Paiement Office Suppliers SA
    ; fournisseur:office-suppliers
    liabilities:current:payables:trade          CHF 1'081.00
    assets:current:bank:ubs                    CHF -1'081.00
```

### A2 — Facture fournisseur étranger (reverse charge, art. 45 LTVA)

**Situation** : achat de service auprès d'un freelance UE pour CHF 2'000. Pas de TVA sur la facture (l'émetteur est étranger). Tu auto-déclares la TVA suisse.

```hledger
2025-03-20 ! Facture EU Freelance — Développement site
    ; fournisseur:eu-freelance
    ; tva:reverse-charge-8.1
    ; pj:2025-03-20_facture-recue_eu-freelance_INV-2025-12.pdf
    expenses:office:professional-services:consultants  CHF 2'000.00
    assets:current:receivables:vat:material            CHF 162.00   ; TVA déductible auto-déclarée
    liabilities:current:payables:trade                CHF -2'000.00
    liabilities:current:vat:output                    CHF -162.00   ; TVA due déclarée

2025-03-30 * Paiement EU Freelance
    liabilities:current:payables:trade                 CHF 2'000.00
    assets:current:bank:revolut                EUR -1'835.00 @@ CHF -1'995.00
    expenses:financial:fx-losses                       CHF 5.00     ; ou gain
```

⚠ Reverse charge obligatoire uniquement si tu es assujetti TVA ET que le seuil de CHF 10'000/an d'achats étrangers est dépassé. Voir `lib/tva-mwst.md`.

### A3 — Facture fournisseur en EUR

**Situation** : facture EUR 500 reçue le 15.03, payée depuis Revolut EUR le 20.03.

```hledger
2025-03-15 ! Facture Adobe Ireland — Licences logiciel
    ; fournisseur:adobe
    ; tva:reverse-charge-8.1
    ; pj:2025-03-15_facture-recue_adobe_INV-2025-A789.pdf
    expenses:office:software            EUR 500.00 @@ CHF 470.00
    assets:current:receivables:vat:material            CHF 38.07    ; 470 × 8.1 %
    liabilities:current:payables:trade  EUR -500.00 @@ CHF -470.00
    liabilities:current:vat:output                    CHF -38.07

2025-03-20 * Paiement Adobe
    liabilities:current:payables:trade  EUR 500.00 @@ CHF 470.00
    assets:current:bank:revolut         EUR -500.00 @@ CHF -474.00
    expenses:financial:fx-losses                       CHF 4.00
```

### A4 — Achat de matériel informatique à immobiliser (> CHF 1'000)

**Situation** : achat d'un MacBook Pro CHF 3'241 TTC (CHF 3'000 HT + CHF 241 TVA).

```hledger
2025-03-15 * Achat MacBook Pro M4 — Apple Store
    ; fournisseur:apple
    ; tva:8.1-recuperable
    ; pj:2025-03-15_facture-recue_apple_W-2025-1234.pdf
    assets:non-current:tangible:it             CHF 3'000.00
    assets:current:receivables:vat:investments CHF 241.00       ; TVA récup sur investissement
    assets:current:bank:ubs                   CHF -3'241.00
```

L'amortissement se fait en clôture (voir `lib/cloture.md`). Pour l'IT : 40 % par an max selon AFC.

**Seuil d'immobilisation** : la pratique courante est CHF 1'000 HT par bien. En-dessous, comptabiliser en charge directe (`expenses:office:supplies` ou `expenses:maintenance:it`).

### A5 — Note de frais d'un employé / dirigeant (Spesen)

**Situation** : tu avances CHF 350 de tes propres deniers (taxi, repas client à 50 % déductible, billets de train). Tu te rembourses depuis le compte société.

```hledger
2025-03-15 * Note de frais mars — Antoine
    ; employe:antoine
    ; pj:2025-03-15_note-frais_antoine_mars.pdf
    expenses:travel:transport                  CHF 180.00
    expenses:travel:meals                      CHF 120.00       ; à 50 % déductible TVA
    expenses:office:other                      CHF 50.00
    assets:current:receivables:vat:material    CHF 14.58        ; TVA 8.1 % sur 180
    assets:current:receivables:vat:material    CHF 4.86         ; TVA 8.1 % sur 60 (50 % de 120)
    assets:current:receivables:vat:material    CHF 4.05         ; TVA 8.1 % sur 50
    liabilities:current:payables:other        CHF -373.49       ; dette envers l'employé
                                                                  ; (ou direct virement bancaire ci-dessous)

2025-03-25 * Remboursement note de frais — Antoine
    liabilities:current:payables:other         CHF 373.49
    assets:current:bank:ubs                   CHF -373.49
```

**Documentation requise** (Spesen vs honoraires) :

| Type de dépense | Justificatif minimum |
|-----------------|---------------------|
| Train, avion, taxi, hôtel | E-ticket ou booking au nom du voyageur + but professionnel |
| Repas en mission | Quittance avec date, ville, but professionnel (50 % TVA récup) |
| Abonnement SaaS connu (Notion, Adobe, Google Workspace) | Reçu PayPal/email avec vendeur identifiable, période, montant |
| **Prestation freelance / consultant** | **Facture émise par le prestataire (obligatoire art. 957a CO)** |
| **Honoraires d'avocat, fiduciaire, formation** | **Facture obligatoire** |

⚠ Sans facture du prestataire pour les services, l'AFC requalifie en **prélèvement caché** (= dividende imposable à 35 % impôt anticipé + impôt sur le revenu personnel) ou **salaire dissimulé** (= charges sociales rétroactives).

---

## Salaires et charges sociales (approfondi)

### Cadre 2026

**Taux légaux 2026** (à vérifier chaque 1er janvier) :

| Charge | Taux total | Part employé | Part employeur | Plafond annuel |
|--------|-----------|--------------|---------------|----------------|
| AVS (vieillesse, survivants) | 8.7 % | 4.35 % | 4.35 % | aucun |
| AI (invalidité) | 1.4 % | 0.7 % | 0.7 % | aucun |
| APG (allocations pour perte de gain) | 0.5 % | 0.25 % | 0.25 % | aucun |
| AC (chômage) | 2.2 % | 1.1 % | 1.1 % | CHF 148'200 (2026) |
| AC solidarité | 1.0 % | 0.5 % | 0.5 % | au-delà de CHF 148'200 |
| **Total déduction salariale (AVS+AI+APG+AC)** | **12.8 %** | **6.4 %** | **6.4 %** | (jusqu'au plafond) |
| LPP (2e pilier) | variable | min 50 % | min 50 % | barème selon âge |
| LAA accidents professionnels | ~1 % | 0 % | 100 % | CHF 148'200 |
| LAA accidents non-professionnels | ~1.5 % | 100 % | 0 % | CHF 148'200 |
| LAA complémentaire (couvre au-dessus du plafond) | variable | négociable | négociable | — |
| Allocations familiales (cantonal, varie 1.2-3.0 %) | ~2.0 % | 0 % | 100 % | aucun |
| Maternité cantonale (GE, VS, NE) | ~0.07 % | 50 % | 50 % | — |

**Taux LPP minimum 2026** (Bonifications de vieillesse, art. 16 LPP) :
- 25-34 ans : 7 %
- 35-44 ans : 10 %
- 45-54 ans : 15 %
- 55-65 ans : 18 %

Salaire coordonné LPP = salaire annuel − déduction de coordination (CHF 26'460 en 2026), avec un seuil d'entrée à CHF 22'680.

### S1 — Salaire mensuel simple (sans 13e, sans IS, sans LPP complémentaire)

**Situation** : Marie, employée, salaire brut CHF 6'000/mois, 100 %, < 35 ans, non frontalière. Versement le 25 du mois.

**Calcul du net** :

```
Brut                                CHF 6'000.00
- AVS/AI/APG  6.4 % × 6'000        CHF   384.00
- AC          1.1 % × 6'000        CHF    66.00
- LAA-NP     ~1.5 % × 6'000        CHF    90.00       (à vérifier avec contrat LAA)
- LPP         7 %  × (72'000 - 26'460) / 12 ≈ CHF 265.65   (part employée)
                                   ────────────
                              Net : CHF 5'194.35
```

**Écritures** :

```hledger
2025-03-25 * Salaire mars 2025 — Marie Dupont
    ; employe:marie
    ; pj:2025-03_fiche-salaire_marie.pdf

    ; Charge brute employeur
    expenses:salaries:gross                    CHF 6'000.00

    ; Charges sociales employeur (idem que parts employées)
    expenses:social:avs                        CHF 450.00       ; 6.4 % × 6'000 (employeur + part déjà incl. dans gross? NON)
    expenses:social:lpp                        CHF 265.65       ; part employeur
    expenses:social:laa                        CHF 60.00        ; LAA prof. 1 % × 6'000
    expenses:social:family                     CHF 120.00       ; allocations cantonales 2 %

    ; Dettes sociales (parts employé + employeur, à reverser)
    liabilities:current:social:avs            CHF -900.00       ; total AVS/AI/APG/AC : 12.8 % × 6'000 = 768 (manque LAA-NP)
    liabilities:current:social:lpp            CHF -531.30       ; total LPP 14 % × salaire coordonné
    liabilities:current:social:laa            CHF -150.00       ; LAA prof + non-prof
    liabilities:current:social:family         CHF -120.00

    ; Net versé
    assets:current:bank:ubs                  CHF -5'194.35
```

**⚠ Important** : la méthode standard est de **passer le salaire brut en charge** (`expenses:salaries:gross`) et **ajouter UNIQUEMENT les parts employeur** en charge (`expenses:social:*`). Les parts employées ne sont **pas** des charges supplémentaires : elles sont **déjà incluses dans le brut**. L'employé reçoit le net, l'employeur garde les parts employées en dette puis les reverse à la caisse.

**Version corrigée** (formule canonique) :

```hledger
2025-03-25 * Salaire mars 2025 — Marie Dupont
    ; employe:marie

    ; Brut en charge (= ce que coûte le salaire avant cotisations employeur)
    expenses:salaries:gross                            CHF 6'000.00

    ; Cotisations EMPLOYEUR en charge supplémentaire
    expenses:social:avs                                CHF 384.00      ; 6.4 % part employeur
    expenses:social:lpp                                CHF 265.65      ; part employeur
    expenses:social:laa                                CHF 60.00       ; LAA prof entièrement employeur
    expenses:social:family                             CHF 120.00      ; allocations entièrement employeur

    ; Dettes vers les caisses (parts employé + employeur)
    liabilities:current:social:avs                    CHF -768.00      ; 384 emp + 384 employeur
    liabilities:current:social:lpp                    CHF -531.30      ; 265.65 × 2
    liabilities:current:social:laa                    CHF -150.00      ; 60 prof (employeur) + 90 non-prof (employé)
    liabilities:current:social:family                 CHF -120.00      ; entièrement employeur

    ; Net versé
    assets:current:bank:ubs                          CHF -5'194.35     ; 6000 - 384 - 66 - 90 - 265.65
```

**Vérification de cohérence** :
- Total débits = 6'000 + 384 + 265.65 + 60 + 120 = **CHF 6'829.65** (= coût total employeur)
- Total crédits = 768 + 531.30 + 150 + 120 + 5'194.35 = **CHF 6'763.65**

Différence : il faut équilibrer. La part LAA-NP côté employé (CHF 90) crée le déséquilibre. Recompter :

```
Brut 6'000
↓ déductions employé (AVS 384, AC 66, LAA-NP 90, LPP 265.65) = 805.65
↓ Net   5'194.35

Caisses :
- AVS/AC : 384 (emp) + 66 (emp) + 384 (employeur) + 66 (employeur) = 900
  → liabilities:current:social:avs : 900
- LAA : 90 (emp non-prof) + 60 (employeur prof) = 150
  → liabilities:current:social:laa : 150
- LPP : 265.65 × 2 = 531.30
  → liabilities:current:social:lpp : 531.30
- Family : 120 (employeur) = 120
  → liabilities:current:social:family : 120

Charges employeur (en plus du brut) :
- AVS/AC : 384 + 66 = 450
- LAA prof : 60
- LPP : 265.65
- Family : 120
Total : 895.65

Coût total employeur : 6'000 + 895.65 = 6'895.65
```

**Écriture finale équilibrée** :

```hledger
2025-03-25 * Salaire mars 2025 — Marie Dupont
    expenses:salaries:gross                            CHF 6'000.00
    expenses:social:avs                                CHF 450.00       ; AVS/AC employeur
    expenses:social:lpp                                CHF 265.65       ; LPP employeur
    expenses:social:laa                                CHF 60.00        ; LAA prof employeur
    expenses:social:family                             CHF 120.00       ; allocations employeur

    liabilities:current:social:avs                    CHF -900.00       ; AVS/AC total à verser
    liabilities:current:social:lpp                    CHF -531.30       ; LPP total
    liabilities:current:social:laa                    CHF -150.00       ; LAA total
    liabilities:current:social:family                 CHF -120.00       ; allocations

    assets:current:bank:ubs                          CHF -5'194.35      ; net versé
```

**Total débit** : 6'895.65 = **Total crédit** : 5'194.35 + 900 + 531.30 + 150 + 120 = 6'895.65 ✓

### S2 — Versement des cotisations sociales aux caisses

**Situation** : versement des cotisations Q1 (janv + fév + mars) à la caisse cantonale en avril.

```hledger
2025-04-15 * Versement cotisations AVS/AI/APG/AC Q1 2025 — CSC
    ; caisse:csc-ge
    ; pj:2025-04-15_decompte_csc_Q1.pdf
    liabilities:current:social:avs                 CHF 2'700.00      ; 3 × 900
    assets:current:bank:ubs                       CHF -2'700.00

2025-04-15 * Versement LPP Q1 2025 — Swiss Life
    liabilities:current:social:lpp                 CHF 1'593.90
    assets:current:bank:ubs                       CHF -1'593.90

2025-04-15 * Versement LAA Q1 2025 — Suva
    liabilities:current:social:laa                 CHF 450.00
    assets:current:bank:ubs                       CHF -450.00

2025-04-15 * Versement allocations familiales Q1 — Caisse cantonale
    liabilities:current:social:family              CHF 360.00
    assets:current:bank:ubs                       CHF -360.00
```

**Rythme courant** :
- AVS/AC : trimestriel ou mensuel selon caisse, avec décompte annuel en janvier (taux exact appliqué)
- LPP : mensuel ou trimestriel selon institution
- LAA : annuel sur base estimée, ajusté l'année suivante
- Allocations familiales : trimestriel

### S3 — 13e salaire (provision)

**Situation** : Marie reçoit un 13e salaire payé en décembre. Au lieu de tout passer en décembre, on **provisionne 1/12 chaque mois** pour éviter l'effet de seuil sur le résultat.

```hledger
2025-03-25 * Provision 13e salaire mars — Marie
    expenses:salaries:13th                       CHF 500.00         ; 6'000 / 12
    expenses:social:avs                          CHF 37.50          ; 6.4 % × 500 part employeur (proportionnelle)
    expenses:social:lpp                          CHF 22.14          ; idem proportionnel
    liabilities:current:accruals:accrued-expenses  CHF -500.00      ; à payer en décembre
    liabilities:current:social:avs              CHF -75.00          ; cotisations sur 13e
    liabilities:current:social:lpp              CHF -44.28
```

**Versement en décembre** :

```hledger
2025-12-25 * Paiement 13e salaire — Marie
    liabilities:current:accruals:accrued-expenses  CHF 6'000.00     ; total provisionné
    assets:current:bank:ubs                       CHF -5'194.35     ; net (mêmes déductions)
    liabilities:current:social:avs                CHF -384.00       ; AVS employé sur 13e
    liabilities:current:social:lpp                CHF -265.65
    ; et idem pour AC, LAA-NP...
```

**Astuce** : si tu n'as pas envie de provisionner mois par mois, fais une seule écriture en décembre. La conformité CO 958c (prudence) accepte les deux tant que tu es cohérent d'une année à l'autre.

### S4 — Impôt à la source (IS) pour frontalier ou permis B

**Situation** : Marie est frontalière française, soumise à IS. Taux IS Genève : 15 % de son brut.

```hledger
2025-03-25 * Salaire mars — Marie (frontalière, IS 15 %)
    expenses:salaries:gross                       CHF 6'000.00
    expenses:social:avs                           CHF 450.00
    expenses:social:lpp                           CHF 265.65
    expenses:social:laa                           CHF 60.00
    expenses:social:family                        CHF 120.00

    liabilities:current:social:avs               CHF -900.00
    liabilities:current:social:lpp               CHF -531.30
    liabilities:current:social:laa               CHF -150.00
    liabilities:current:social:family            CHF -120.00
    liabilities:current:source-tax               CHF -779.15        ; 15 % × (6'000 - 805.65 net taxable)
    assets:current:bank:ubs                     CHF -4'415.20       ; net après IS
```

Le calcul exact de l'IS dépend du **barème cantonal** (groupe A/B/C selon situation familiale), du **canton de travail**, et de **conventions de double imposition** (accord franco-suisse pour les frontaliers GE/VD/FR).

**Versement IS au canton** :

```hledger
2025-04-15 * Versement IS Q1 — Administration fiscale GE
    liabilities:current:source-tax                CHF 2'337.45       ; 3 × 779.15
    assets:current:bank:ubs                      CHF -2'337.45
```

### S5 — Indemnité de vacances non prises

**Situation** : Marie quitte la société le 30.06.2025 avec un solde de 8 jours de vacances non pris.

```hledger
2025-06-30 * Solde vacances non prises — Marie (départ)
    expenses:salaries:gross                       CHF 2'215.38       ; 8 × (6'000/22) = 2'181.82, arrondi
    expenses:social:avs                           CHF 166.15
    liabilities:current:social:avs               CHF -332.31
    assets:current:bank:ubs                     CHF -2'049.22
```

Mieux : **provisionner les vacances dues** en cours d'année (compte `liabilities:current:accruals:vacation`) pour éviter le saut de charge au départ. Voir `cloture.md` pour la provision annuelle.

### S6 — Allocations familiales reçues pour un employé

**Situation** : Marie a un enfant, droit à CHF 300/mois d'allocations. La caisse paye à la société, qui reverse à Marie avec son salaire.

```hledger
2025-03-25 * Salaire mars — Marie (avec alloc familiales)
    expenses:salaries:gross                       CHF 6'000.00
    expenses:social:avs                           CHF 450.00       ; basé sur salaire seul
    [... charges sociales habituelles ...]
    assets:current:receivables:other              CHF 300.00       ; à recevoir de la caisse
    liabilities:current:social:avs               CHF -900.00
    liabilities:current:social:lpp               CHF -531.30
    liabilities:current:social:laa               CHF -150.00
    liabilities:current:social:family            CHF -120.00
    assets:current:bank:ubs                     CHF -5'494.35     ; net + 300 alloc

2025-04-15 * Réception allocations familiales mars (caisse cantonale)
    assets:current:bank:ubs                       CHF 300.00
    assets:current:receivables:other             CHF -300.00
```

Les allocations transitent par la société mais ne sont **ni un produit ni une charge** : c'est un flux pour le compte de l'employé.

### S7 — Dirigeant-actionnaire qui se paye un salaire (Sàrl gérant-associé)

**Situation** : Antoine est associé unique-gérant de sa Sàrl. Il se verse CHF 8'000 brut/mois.

Les écritures sont **identiques à un salarié normal** (S1). La spécificité est fiscale :
- Le salaire est **déductible** au niveau de la société
- Soumis à AVS/AI/APG/AC/LAA comme un salarié
- LPP obligatoire si salaire annuel > seuil d'entrée
- L'AFC peut **requalifier en dividende** si le salaire est trop bas par rapport aux dividendes versés (ratio 50/50 prudent ; voir doctrine)

**Garde-fou** : si le ratio salaire/dividende dépasse 1:1 dans un sens ou l'autre, documenter pourquoi (niveau du marché pour la fonction). Voir un fiscaliste pour les cas limites.

---

## Banque, FX, virements

### B1 — Frais bancaires mensuels

```hledger
2025-03-31 * Frais de tenue de compte UBS mars
    ; pj:2025-03-31_extrait_ubs.pdf
    expenses:financial:bank-fees               CHF 25.00
    assets:current:bank:ubs                   CHF -25.00
```

### B2 — Virement interne entre comptes (CHF → CHF)

```hledger
2025-03-15 * Virement UBS → PostFinance
    assets:current:bank:postfinance            CHF 10'000.00
    assets:current:bank:ubs                  CHF -10'000.00
```

### B3 — Conversion CHF → EUR (achat de devises)

```hledger
2025-03-15 * Achat EUR — UBS
    ; tva:exempt
    assets:current:bank:ubs-eur            EUR 5'000.00 @@ CHF 4'700.00
    expenses:financial:fx-losses                       CHF 25.00         ; frais conversion
    assets:current:bank:ubs                          CHF -4'725.00
```

### B4 — Réévaluation FX au 31.12 (clôture)

Voir `lib/cloture.md` pour la procédure complète. Principe : tous les soldes en devises étrangères sont réévalués au cours de clôture BNS.

---

## Intercompany et parties liées

### IC1 — Facture à une société liée (transfert de prestation)

**Situation** : ta Sàrl A facture une prestation de CHF 10'000 à ta Sàrl B (dont tu es aussi associé).

```hledger
2025-03-15 ! Facture intercompany #2025-IC-005 — Sàrl B
    ; client:sarl-b
    ; tva:8.1-effective
    ; partie-liee:oui
    ; pj:2025-03-15_facture-emise_sarl-b_IC-005.pdf
    ; pj-convention:convention-prestations-2025.pdf
    assets:current:receivables:related-parties        CHF 10'810.00
    revenues:sales:related-parties                   CHF -10'000.00
    liabilities:current:vat:output                    CHF -810.00
```

**À retenir** :
- Soumis à TVA comme une facture tierce (sauf groupe d'imposition TVA constitué auprès ESTV)
- **Prix doit être à conditions de marché** (art. 58 LIFD) — risque de requalification
- Toujours adossé à une **convention de prestations** écrite, signée et datée
- Le fait d'utiliser un compte dédié (`related-parties`) facilite la divulgation CO 959c al. 1 ch. 4

### IC2 — Prêt entre sociétés du groupe

**Situation** : Sàrl A prête CHF 50'000 à Sàrl B, taux 0.25 % (taux d'intérêt de référence AFC pour 2025).

```hledger
2025-03-01 * Prêt à Sàrl B
    ; partie-liee:oui
    ; pj:2025-03-01_convention-pret_sarl-b.pdf
    assets:non-current:financial:loans         CHF 50'000.00
    assets:current:bank:ubs                  CHF -50'000.00

2025-12-31 * Intérêts sur prêt Sàrl B 2025
    ; partie-liee:oui
    assets:current:receivables:other           CHF 125.00          ; 50'000 × 0.25 %
    revenues:financial:interest-loans         CHF -125.00
```

⚠ Si tu prêtes à **taux < taux AFC officiel** (publié annuellement, ~0.25 % à 0.5 %), l'AFC requalifie la différence en **prestation appréciable en argent** = dividende imposable. Toujours appliquer au minimum le taux officiel.

### IC3 — Compte courant associé (prêt actionnaire à la société)

**Situation** : Antoine, associé, prête CHF 20'000 à sa Sàrl pour combler un manque de trésorerie. Pas d'intérêt (toléré jusqu'au taux AFC).

```hledger
2025-03-01 * Prêt actionnaire (Antoine → Sàrl)
    ; partie-liee:oui
    ; pj:2025-03-01_convention-pret-actionnaire.pdf
    assets:current:bank:ubs                    CHF 20'000.00
    liabilities:non-current:shareholder-loan  CHF -20'000.00
```

Cas inverse (société prête à l'associé, **dangereux fiscalement** car risque de requalification en distribution dissimulée) :

```hledger
2025-03-01 * Prêt à l'associé Antoine
    ; partie-liee:oui
    ; pj:2025-03-01_convention-pret-associe.pdf
    assets:current:advances                    CHF 5'000.00
    assets:current:bank:ubs                  CHF -5'000.00
```

⚠ L'AFC scrute particulièrement ces prêts si :
- Pas de convention écrite
- Pas de taux d'intérêt (taux AFC minimum)
- Pas de calendrier de remboursement
- Pas de garantie

Risque : requalification en **dividende caché** + impôt anticipé 35 % + amende 100 % de l'IA.

---

## Cas spéciaux

### X1 — Acquisition d'un véhicule en leasing

**Situation** : leasing 3 ans d'une voiture, valeur catalogue CHF 40'000, mensualité CHF 850.

**Option A — Leasing opérationnel** (pas inscrit à l'actif) :

```hledger
2025-03-15 * Mensualité leasing véhicule mars
    ; pj:2025-03-15_facture-recue_leasing_mars.pdf
    expenses:vehicle:leasing                   CHF 786.31
    assets:current:receivables:vat:material    CHF 63.69        ; 8.1 %
    assets:current:bank:ubs                  CHF -850.00
```

**Option B — Leasing financier** (à activer selon doctrine CO 960e si rationnel d'usage) : très rare pour PME, demander à un comptable spécialisé.

### X2 — Création de provision pour litige

**Situation** : un client te poursuit, risque de devoir payer CHF 15'000. Provision à constituer à la clôture.

```hledger
2025-12-31 * Provision pour litige client X
    ; pj:2025-12-15_avis-avocat_litige-client-X.pdf
    expenses:office:other                      CHF 15'000.00
    liabilities:current:provisions            CHF -15'000.00
```

L'AFC tolère les provisions **probables** (pas seulement possibles) et **chiffrables** raisonnablement. Documenter avec un avis d'avocat.

### X3 — Dividende décidé par l'AG

**Situation** : l'AG du 15.05.2025 décide de distribuer CHF 30'000 de dividende sur le bénéfice 2024.

```hledger
2025-05-15 * Décision AG : dividende 2024
    equity:retained:prior-years                CHF 30'000.00
    equity:distributions                      CHF -30'000.00      ; en attente de paiement

2025-05-30 * Paiement dividende à l'associé Antoine
    ; partie-liee:oui
    ; pj:2025-05-30_paiement-dividende.pdf
    equity:distributions                       CHF 30'000.00
    liabilities:current:withholding            CHF -10'500.00     ; impôt anticipé 35 %
    assets:current:bank:ubs                  CHF -19'500.00      ; net à l'associé

2025-06-30 * Versement IA à l'AFC
    liabilities:current:withholding            CHF 10'500.00
    assets:current:bank:ubs                  CHF -10'500.00
```

L'associé récupère ensuite l'IA via sa déclaration personnelle (formulaire 25). L'IA doit être versée dans les 30 j de l'échéance du dividende, sinon intérêts moratoires 5 %.

### X4 — Émission d'une facture proforma (pas de comptabilisation)

Les **factures proforma** ne sont **pas comptabilisées** : pas de fait générateur (CO 957). Ne créer une écriture qu'à l'émission de la facture définitive.

### X5 — Échange / barter (troc)

**Situation** : tu fournis du conseil à un graphiste en échange d'un logo (valeur CHF 1'500 chacun).

```hledger
2025-03-15 * Échange prestation contre logo — Graphiste X
    ; tva:8.1-effective
    expenses:office:professional-services      CHF 1'500.00
    assets:current:receivables:vat:material    CHF 121.50
    revenues:sales:services                   CHF -1'500.00
    liabilities:current:vat:output            CHF -121.50
```

TVA due côté société pour la prestation rendue, TVA récupérable pour la prestation reçue.

---

## Workflow d'import CSV

Voir `templates/rules/{ubs,postfinance}.rules` pour les fichiers de règles complets.

**Cycle d'import** :

```bash
# 1. Télécharger le CSV depuis l'e-banking
# UBS : Statements > Export > CSV
# PostFinance : Trafic des paiements > Export > CSV

# 2. Importer avec règles
hledger import -f 2025/main.journal --rules-file rules/ubs.rules raw/ubs-2025-05.csv

# 3. Vérifier les écritures uncategorized
hledger -f 2025/main.journal reg expenses:uncategorized

# 4. Éditer manuellement les écritures ambiguës
# Éditer 2025/ubs.journal pour réaffecter aux bons comptes

# 5. Rapprocher
hledger -f 2025/main.journal balance assets:current:bank:ubs -e 2025-06-01
```

## Requêtes utiles

```bash
# Toutes les écritures liées à un client
hledger -f 2025/main.journal reg tag:client=acme-sa

# CA H1 2025
hledger -f 2025/main.journal reg revenues:sales -p 'H1 2025' --total

# Total des charges par catégorie
hledger -f 2025/main.journal bal expenses -p 2025 --depth 2

# Marge brute par projet
hledger -f 2025/main.journal reg tag:projet -p 2025

# Détail TVA collectée Q1
hledger -f 2025/main.journal reg liabilities:current:vat:output -p 'Q1 2025'

# Mouvements compte courant associé (pour annexe)
hledger -f 2025/main.journal reg liabilities:non-current:shareholder-loan -p 2025

# Solde de tous les comptes au 31.12
hledger -f 2025/main.journal bal -e 2025-12-31 --tree --depth 4

# Détecter les écritures non équilibrées (devrait être vide)
hledger -f 2025/main.journal check
```

## Pièges classiques

| Piège | Détection | Remède |
|-------|-----------|--------|
| Confondre charge brute employeur et déduction employé | Total débit ≠ total crédit | Toujours : brut + parts employeur = dette caisses + net |
| Oublier la TVA sur acompte | Décompte TVA faussé | TVA due à l'encaissement de l'acompte (méthode contre-prestations reçues) ou à la facturation (convenues) |
| Booker repas à 100 % TVA | Reprise AFC | 50 % seulement pour les repas business |
| Cadeau client > CHF 50/personne | Non déductible au-delà | Booker à part dans `expenses:marketing:gifts`, flagger en clôture |
| Confondre intercompany et tiers | Mauvaise divulgation annexe | Tag `partie-liee:oui` + compte dédié `revenues:sales:related-parties` |
| Pas de convention écrite pour intercompany | Risque requalification | Convention signée AVANT la première facture |
| Provisionner sans justification | Reprise AFC | Documenter chaque provision (avis tiers, calcul) |
| Mauvais cours FX | Résultat fluctuant | Cours BNS du jour pour transactions, clôture pour bilan |
