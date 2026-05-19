# Plan comptable PME suisse en hledger

Ce fichier détaille le **plan comptable PME (KMU Kontenrahmen)** version Sterchi/veb.ch, traduit dans la hiérarchie hledger. C'est la référence standard pour les Sàrl/SA suisses sans obligation d'audit ordinaire.

## Principes hledger appliqués au plan KMU

| Plan KMU | hledger | Pourquoi |
|----------|---------|----------|
| Classe à 4 chiffres (1000, 2000, 3000…) | Hiérarchie par mots-clés (`assets:current:bank:ubs`) | Lisibilité, requêtes par sous-arbre |
| Comptes uniques | Sous-comptes infinis | Subdiviser par banque, projet, devise sans nouveau code |
| Codes immuables | Renaming via `alias` | Refactoriser sans casser l'historique |
| Pas de tags natifs | Tags inline (`; tva:..., projet:..., client:...`) | Reporting multi-axes (par projet, par client, par société) |

**Convention naming** :
- Toujours en anglais minuscules : `assets`, `revenues`, `expenses`. Évite les ambiguïtés FR/DE/IT pour les requêtes.
- Les libellés humains dans les **descriptions de transactions** (français OK).
- Inclure le **numéro KMU à 4 chiffres** en commentaire dans `accounts.journal` pour traçabilité avec la fiduciaire.

## Plan comptable complet

### Classe 1 : ACTIFS

```hledger
; ───── ACTIF CIRCULANT (CO 959a al. 1 ch. 1) ─────
account assets:current                                        ; 10 Actif circulant

; Liquidités
account assets:current:cash                                   ; 1000 Caisse
account assets:current:cash:chf                               ; 1000 Caisse CHF
account assets:current:cash:eur                               ; 1001 Caisse EUR (si nécessaire)
account assets:current:postal                                 ; 1010 Compte postal
account assets:current:bank                                   ; 1020 Banques
account assets:current:bank:ubs                               ; 1020.01 UBS Compte courant
account assets:current:bank:ubs-savings                       ; 1020.02 UBS Compte épargne
account assets:current:bank:postfinance                       ; 1020.10 PostFinance
account assets:current:bank:revolut                           ; 1020.20 Revolut Business
account assets:current:bank:wise                              ; 1020.30 Wise Business
account assets:current:capital-deposit                        ; 1090 Compte de consignation (avant inscription RC)

; Créances
account assets:current:receivables:trade                      ; 1100 Créances clients (débiteurs)
account assets:current:receivables:trade:doubtful             ; 1109 Créances clients douteuses
account assets:current:receivables:trade:provision            ; 1109.01 Ducroire (correction de valeur)
account assets:current:receivables:other                      ; 1140 Autres créances à court terme
account assets:current:receivables:related-parties            ; 1150 Créances envers parties liées
account assets:current:receivables:vat                        ; 1170 Impôt préalable (TVA récupérable)
account assets:current:receivables:vat:material               ; 1170.01 TVA récup. matériel/services
account assets:current:receivables:vat:investments            ; 1171 TVA récup. investissements
account assets:current:receivables:tax-prepaid                ; 1176 Impôt anticipé à récupérer (35 %)
account assets:current:advances                               ; 1180 Avances et prêts à court terme

; Stocks
account assets:current:inventory                              ; 1200 Stocks
account assets:current:inventory:merchandise                  ; 1200.01 Marchandises commerciales
account assets:current:inventory:raw-materials                ; 1210 Matières premières
account assets:current:inventory:wip                          ; 1260 Travaux en cours
account assets:current:inventory:finished-goods               ; 1280 Produits finis

; Actifs de régularisation
account assets:current:accruals                               ; 1300 Actifs transitoires
account assets:current:accruals:prepaid-expenses              ; 1300.01 Charges payées d'avance
account assets:current:accruals:accrued-income                ; 1301 Produits à recevoir

; ───── ACTIF IMMOBILISÉ (CO 959a al. 1 ch. 2) ─────
account assets:non-current                                    ; 14 Actif immobilisé

; Immobilisations financières
account assets:non-current:financial                          ; 1400 Immobilisations financières
account assets:non-current:financial:loans                    ; 1400.01 Prêts à long terme accordés
account assets:non-current:financial:securities               ; 1410 Titres à long terme
account assets:non-current:financial:participations           ; 1480 Participations (≥ 20 %)

; Immobilisations corporelles
account assets:non-current:tangible                           ; 1500 Immobilisations corporelles
account assets:non-current:tangible:machinery                 ; 1500 Machines et appareils
account assets:non-current:tangible:furniture                 ; 1510 Mobilier et installations
account assets:non-current:tangible:it                        ; 1520 Équipement informatique
account assets:non-current:tangible:vehicles                  ; 1530 Véhicules
account assets:non-current:tangible:real-estate               ; 1600 Immeubles
account assets:non-current:tangible:depreciation              ; 1509 Amortissements cumulés (cumulative)
                                                              ; ⚠ Compte de correction de valeur (signe inverse)

; Immobilisations incorporelles
account assets:non-current:intangible                         ; 1700 Immobilisations incorporelles
account assets:non-current:intangible:patents                 ; 1700.01 Brevets, licences, marques
account assets:non-current:intangible:software                ; 1710 Logiciels
account assets:non-current:intangible:goodwill                ; 1770 Goodwill
account assets:non-current:intangible:depreciation            ; 1709 Amortissements cumulés
```

### Classe 2 : PASSIFS

```hledger
; ───── FONDS ÉTRANGERS À COURT TERME (CO 959a al. 2 ch. 1) ─────
account liabilities:current                                   ; 20 Fonds étrangers à court terme

; Dettes commerciales
account liabilities:current:payables:trade                    ; 2000 Dettes fournisseurs (créanciers)
account liabilities:current:payables:trade:foreign            ; 2001 Dettes fournisseurs étranger
account liabilities:current:payables:related-parties          ; 2100 Dettes envers parties liées
account liabilities:current:payables:other                    ; 2110 Autres dettes à court terme

; Dettes bancaires court terme
account liabilities:current:bank-debt                         ; 2100 Banques (découverts, crédit court terme)
account liabilities:current:bank-debt:ubs-credit              ; 2100.01 Crédit UBS

; Dettes fiscales et sociales
account liabilities:current:vat                               ; 2200 TVA due (impôt sur le CA)
account liabilities:current:vat:output                        ; 2200.01 TVA collectée 8.1 %
account liabilities:current:vat:output-reduced                ; 2200.02 TVA collectée 2.6 %
account liabilities:current:vat:output-lodging                ; 2200.03 TVA collectée 3.8 %
account liabilities:current:vat:settlement                    ; 2201 Décompte TVA (compte de passage)
account liabilities:current:withholding                       ; 2206 Impôt anticipé à verser (35 %)
account liabilities:current:source-tax                        ; 2208 Impôt à la source (frontaliers/permis B)
account liabilities:current:tax-provision                     ; 2279 Provision impôts directs (ICC + IFD)
account liabilities:current:social                            ; 2270 Charges sociales à payer
account liabilities:current:social:avs                        ; 2270.01 AVS/AI/APG/AC à payer
account liabilities:current:social:lpp                        ; 2271 LPP à payer
account liabilities:current:social:laa                        ; 2272 LAA à payer
account liabilities:current:social:laac                       ; 2273 LAA complémentaire à payer
account liabilities:current:social:family                     ; 2274 Allocations familiales à payer
account liabilities:current:salary-payable                    ; 2275 Salaires à payer

; Passifs transitoires
account liabilities:current:accruals                          ; 2300 Passifs transitoires
account liabilities:current:accruals:accrued-expenses         ; 2300.01 Charges à payer (factures non reçues)
account liabilities:current:accruals:deferred-income          ; 2301 Produits encaissés d'avance
account liabilities:current:accruals:vacation                 ; 2330 Provision vacances non prises

; Provisions court terme
account liabilities:current:provisions                        ; 2330 Provisions court terme

; ───── FONDS ÉTRANGERS À LONG TERME (CO 959a al. 2 ch. 2) ─────
account liabilities:non-current                               ; 24 Fonds étrangers à long terme
account liabilities:non-current:bank-debt                     ; 2400 Dettes bancaires long terme
account liabilities:non-current:loans                         ; 2430 Emprunts (obligations, prêts)
account liabilities:non-current:related-parties               ; 2450 Dettes long terme envers parties liées
account liabilities:non-current:shareholder-loan              ; 2451 Prêt d'associé (compte courant associé)
account liabilities:non-current:provisions                    ; 2600 Provisions long terme
```

### Classe 2 : FONDS PROPRES

```hledger
; ───── FONDS PROPRES (CO 959a al. 2 ch. 3) ─────
account equity                                                ; 28 Capitaux propres

account equity:capital                                        ; 2800 Capital social / capital-actions
account equity:capital:paid-in                                ; 2800.01 Capital libéré
account equity:capital:unpaid                                 ; 2810 Capital non libéré (à appeler)

account equity:legal-reserve                                  ; 2900 Réserve légale issue du bénéfice
account equity:legal-reserve:capital                          ; 2901 Réserve légale issue du capital (agio)
account equity:voluntary-reserve                              ; 2940 Réserves volontaires (statutaires)

account equity:retained                                       ; 2970 Bénéfice / perte reporté
account equity:retained:prior-years                           ; 2970.01 Report bénéfice/perte des années antérieures
account equity:retained:current                               ; 2979 Bénéfice/perte de l'exercice (calculé)

account equity:treasury-shares                                ; 2980 Parts sociales propres (Sàrl rare)

; Distributions (compte temporaire d'AG)
account equity:distributions                                  ; 2980 Dividendes décidés (avant paiement)
```

### Classe 3 : PRODUITS D'EXPLOITATION

```hledger
; ───── PRODUITS NETS DES VENTES (CO 959b al. 2 ch. 1) ─────
account revenues                                              ; 3 Produits

account revenues:sales                                        ; 3000 Ventes de marchandises / prestations
account revenues:sales:goods                                  ; 3000.01 Ventes de marchandises
account revenues:sales:services                               ; 3400 Prestations de services
account revenues:sales:domestic                               ; 3000.10 Ventes Suisse (TVA 8.1 %)
account revenues:sales:export                                 ; 3000.20 Exportations (TVA 0 %)
account revenues:sales:eu                                     ; 3000.21 Ventes UE (TVA 0 %)
account revenues:sales:related-parties                        ; 3000.30 Ventes intercompany
account revenues:sales:reduced                                ; 3001 Ventes TVA 2.6 % (alimentation, livres)
account revenues:sales:lodging                                ; 3002 Hébergement TVA 3.8 %

account revenues:discounts                                    ; 3800 Réductions de produits (rabais, escomptes)

; Variations de stocks (compte non monétaire de PP)
account revenues:inventory-change                             ; 3900 Variation de stocks de produits finis/WIP

; Autres produits d'exploitation
account revenues:other                                        ; 3940 Autres produits d'exploitation
account revenues:other:rental                                 ; 3941 Loyers reçus
account revenues:other:fx-gains                               ; 3960 Gains de change réalisés
account revenues:other:fx-gains-unrealised                    ; 3961 Gains de change non réalisés
```

### Classe 4-6 : CHARGES

```hledger
; ───── CHARGES DE MATÉRIEL ET MARCHANDISES (CO 959b al. 2 ch. 2) ─────
account expenses                                              ; 4-6 Charges
account expenses:cogs                                         ; 40 Charges de marchandises et matières
account expenses:cogs:goods                                   ; 4000 Achats de marchandises
account expenses:cogs:raw-materials                           ; 4200 Achats de matières premières
account expenses:cogs:subcontracting                          ; 4400 Travaux de sous-traitance
account expenses:cogs:freight-in                              ; 4500 Frais d'achat (transport, douane)

; ───── CHARGES DE PERSONNEL (CO 959b al. 2 ch. 3) ─────
account expenses:salaries                                     ; 50 Charges de personnel
account expenses:salaries:gross                               ; 5000 Salaires bruts
account expenses:salaries:13th                                ; 5005 13e salaire
account expenses:salaries:bonus                               ; 5010 Bonus et gratifications
account expenses:salaries:directors                           ; 5060 Indemnités d'organes (CA, gérance)
account expenses:salaries:freelance                           ; 5080 Honoraires de travail temporaire

account expenses:social                                       ; 57 Charges sociales employeur
account expenses:social:avs                                   ; 5700 AVS/AI/APG/AC part employeur
account expenses:social:lpp                                   ; 5710 LPP part employeur
account expenses:social:laa                                   ; 5720 LAA prime
account expenses:social:laac                                  ; 5721 LAA complémentaire
account expenses:social:family                                ; 5730 Allocations familiales (caisse)
account expenses:social:maternity                             ; 5740 Maternité cantonale

account expenses:personnel-other                              ; 58 Autres charges de personnel
account expenses:personnel-other:training                     ; 5800 Formation, perfectionnement
account expenses:personnel-other:recruitment                  ; 5810 Frais de recrutement
account expenses:personnel-other:catering                     ; 5820 Repas du personnel
account expenses:personnel-other:travel-reimbursement         ; 5830 Frais effectifs remboursés (Spesen)
account expenses:personnel-other:vehicle-allowance            ; 5840 Indemnités véhicules
account expenses:personnel-other:other                        ; 5880 Autres frais de personnel

; ───── AUTRES CHARGES D'EXPLOITATION (CO 959b al. 2 ch. 4) ─────
account expenses:occupancy                                    ; 60 Charges de locaux
account expenses:occupancy:rent                               ; 6000 Loyer locaux
account expenses:occupancy:utilities                          ; 6030 Charges chauffage, électricité, eau
account expenses:occupancy:cleaning                           ; 6040 Nettoyage
account expenses:occupancy:maintenance                        ; 6050 Entretien locaux

account expenses:maintenance                                  ; 61 Entretien équipement
account expenses:maintenance:equipment                        ; 6100 Entretien machines, mobilier
account expenses:maintenance:it                               ; 6110 Maintenance informatique
account expenses:maintenance:vehicles                         ; 6200 Entretien véhicules

account expenses:vehicle                                      ; 62 Charges de véhicules
account expenses:vehicle:fuel                                 ; 6210 Carburant
account expenses:vehicle:insurance                            ; 6220 Assurance véhicules
account expenses:vehicle:tax                                  ; 6230 Taxes véhicules
account expenses:vehicle:leasing                              ; 6240 Leasing véhicules

account expenses:insurance                                    ; 63 Assurances de choses
account expenses:insurance:property                           ; 6300 Assurance choses (incendie, RC)
account expenses:insurance:liability                          ; 6310 RC professionnelle
account expenses:insurance:legal-protection                   ; 6320 Protection juridique
account expenses:insurance:cyber                              ; 6330 Cyber-assurance

account expenses:fees-licenses                                ; 64 Taxes, autorisations
account expenses:fees-licenses:permits                        ; 6400 Patentes, autorisations
account expenses:fees-licenses:taxes-other                    ; 6410 Autres impôts (sauf directs)

account expenses:office                                       ; 65 Frais d'administration
account expenses:office:supplies                              ; 6500 Fournitures de bureau
account expenses:office:print                                 ; 6510 Imprimés
account expenses:office:postage                               ; 6520 Frais de port
account expenses:office:phone                                 ; 6530 Téléphone, internet
account expenses:office:software                              ; 6540 Logiciels (SaaS, licences)
account expenses:office:professional-services                 ; 6570 Honoraires juridiques, comptables, fiduciaires
account expenses:office:professional-services:legal           ; 6571 Frais d'avocat
account expenses:office:professional-services:accounting      ; 6572 Honoraires fiduciaires
account expenses:office:professional-services:tax             ; 6573 Honoraires conseil fiscal
account expenses:office:professional-services:audit           ; 6574 Honoraires réviseur
account expenses:office:professional-services:notary          ; 6575 Frais de notaire
account expenses:office:professional-services:consultants     ; 6576 Honoraires consultants
account expenses:office:bank-charges                          ; 6580 Frais bancaires
account expenses:office:other                                 ; 6590 Autres frais d'administration

account expenses:marketing                                    ; 66 Marketing et communication
account expenses:marketing:advertising                        ; 6600 Publicité
account expenses:marketing:web                                ; 6610 Site web, SEO, SEA
account expenses:marketing:events                             ; 6620 Salons, événements
account expenses:marketing:gifts                              ; 6640 Cadeaux clients (CHF 50 max déductible)
account expenses:marketing:representation                     ; 6650 Frais de représentation (50 % déductible)

account expenses:travel                                       ; 67 Voyages et représentation
account expenses:travel:transport                             ; 6700 Transports (train, avion, taxi)
account expenses:travel:lodging                               ; 6710 Hôtels, hébergement
account expenses:travel:meals                                 ; 6720 Repas en mission (50 % déductible TVA)
account expenses:travel:per-diem                              ; 6730 Per diem / forfaits

; ───── AMORTISSEMENTS (CO 959b al. 2 ch. 5) ─────
account expenses:depreciation                                 ; 68 Amortissements
account expenses:depreciation:machinery                       ; 6800 Amortissement machines
account expenses:depreciation:it                              ; 6810 Amortissement IT
account expenses:depreciation:furniture                       ; 6820 Amortissement mobilier
account expenses:depreciation:vehicles                        ; 6830 Amortissement véhicules
account expenses:depreciation:real-estate                     ; 6840 Amortissement immeubles
account expenses:depreciation:intangible                      ; 6850 Amortissement incorporels

; ───── RÉSULTAT FINANCIER (CO 959b al. 2 ch. 6) ─────
account expenses:financial                                    ; 69 Charges financières
account expenses:financial:interest-bank                      ; 6900 Intérêts dette bancaire
account expenses:financial:interest-loans                     ; 6910 Intérêts emprunts
account expenses:financial:bank-fees                          ; 6940 Frais et commissions bancaires
account expenses:financial:fx-losses                          ; 6950 Pertes de change réalisées
account expenses:financial:fx-losses-unrealised               ; 6951 Pertes de change non réalisées

account revenues:financial                                    ; 68 Produits financiers
account revenues:financial:interest-bank                      ; 6800 Intérêts bancaires reçus
account revenues:financial:interest-loans                     ; 6810 Intérêts prêts accordés
account revenues:financial:dividends                          ; 6820 Dividendes reçus
```

### Classe 7-9 : RÉSULTATS HORS EXPLOITATION ET IMPÔTS

```hledger
; ───── RÉSULTAT HORS EXPLOITATION (CO 959b al. 3 ch. 1) ─────
account revenues:non-operating                                ; 7 Produits hors exploitation
account revenues:non-operating:rental                         ; 7000 Loyers d'immeubles non commerciaux
account revenues:non-operating:other                          ; 7900 Autres produits hors exploitation

account expenses:non-operating                                ; 7 Charges hors exploitation
account expenses:non-operating:rental                         ; 7010 Charges immeubles non commerciaux

; ───── RÉSULTAT EXCEPTIONNEL (CO 959b al. 3 ch. 2) ─────
account revenues:exceptional                                  ; 8 Produits exceptionnels
account revenues:exceptional:gain-on-disposal                 ; 8000 Bénéfices sur cessions d'actifs
account revenues:exceptional:insurance                        ; 8500 Indemnités d'assurance

account expenses:exceptional                                  ; 8 Charges exceptionnelles
account expenses:exceptional:loss-on-disposal                 ; 8100 Pertes sur cessions d'actifs
account expenses:exceptional:writedowns                       ; 8510 Pertes exceptionnelles, sinistres

; ───── IMPÔTS DIRECTS (CO 959b al. 4) ─────
account expenses:tax                                          ; 89 Impôts directs
account expenses:tax:cantonal                                 ; 8900 Impôt cantonal et communal (ICC)
account expenses:tax:federal                                  ; 8901 Impôt fédéral direct (IFD)
account expenses:tax:prior-year                               ; 8910 Ajustement impôts années antérieures
```

## Comptes de validation (hors PP)

À déclarer dans `accounts.journal` avec une directive `account` même s'ils ne servent que de check :

```hledger
account checking:vat                                          ; Compte de contrôle TVA (toujours 0 hors période)
account checking:rounding                                     ; Différences d'arrondi (≤ CHF 1)
```

## Hierarchy declarations bloc complet

À copier dans `accounts.journal` :

```hledger
; ────────────────────────────────────────────────────────────
;  Plan comptable PME suisse (KMU) — version hledger
;  Source : Sterchi/veb.ch 2022 + adaptations LTVA 2025
;  Convention : sous-comptes infinis pour subdiviser sans nouveau code KMU
; ────────────────────────────────────────────────────────────

; Toutes les déclarations `account` ci-dessus, agrégées

; Directives de cohérence (à valider via `hledger check`)
account assets        ; type:A
account liabilities   ; type:L
account equity        ; type:E
account revenues      ; type:R
account expenses      ; type:X

; Format CHF par défaut
D CHF 1'000.00
```

## Comment ajouter un compte

1. **Trouve son code KMU** (Sterchi ou plan en ligne veb.ch)
2. **Place-le dans la hiérarchie hledger** par catégorie (assets/liabilities/...)
3. **Ajoute la déclaration** dans `accounts.journal` avec le code KMU en commentaire
4. **Run `hledger check uniqueleafnames`** pour vérifier l'absence de collision

```hledger
; Exemple : créer un compte pour les frais d'abonnement à des plateformes
account expenses:office:software:subscriptions                ; 6541 Abonnements SaaS
```

## Alias et refactoring

Si tu te trompes de hiérarchie ou veux renommer, utilise des **alias** dans `accounts.journal` plutôt que d'éditer toutes les écritures :

```hledger
alias expenses:office:phone = expenses:office:telecom
```

Tous les rapports utilisent désormais `expenses:office:telecom`, sans toucher au journal historique. Garder l'alias indéfiniment ou laisser à la prochaine clôture pour le faire proprement.

## Codes KMU vs hierarchy : tableau de correspondance condensé

| Classe KMU | Préfixe hledger | Type CO |
|------------|-----------------|---------|
| 1xxx | `assets:` | Actif |
| 2xxx | `liabilities:` ou `equity:` | Passif / FP |
| 3xxx | `revenues:sales:`, `revenues:other:`, `revenues:inventory-change:` | Produits exploitation |
| 4xxx | `expenses:cogs:` | Charges matières |
| 5xxx | `expenses:salaries:`, `expenses:social:`, `expenses:personnel-other:` | Charges personnel |
| 6xxx | `expenses:occupancy/maintenance/vehicle/insurance/fees-licenses/office/marketing/travel:` | Autres charges expl. |
| 68xx (R) | `revenues:financial:` | Produits financiers |
| 69xx (C) | `expenses:financial:` | Charges financières |
| 68xx (CH) | `expenses:depreciation:` | Amortissements |
| 7xxx | `revenues:non-operating:` ou `expenses:non-operating:` | Hors exploitation |
| 8xxx | `revenues:exceptional:` ou `expenses:exceptional:` ou `expenses:tax:` | Exceptionnel et impôts |
| 9xxx | (clôture, non utilisés en hledger) | — |

## Pièges classiques

| Piège | Conséquence | Remède |
|-------|-------------|--------|
| Compter `assets:non-current:tangible:depreciation` en charge | Double amortissement | Compte de correction de valeur, contre-actif (signe négatif) |
| Confondre `equity:legal-reserve` et `equity:voluntary-reserve` | Mauvaise affectation du bénéfice | Réserve légale = obligation art. 671 CO ; volontaire = décision AG |
| TVA collectée dans `liabilities:current:vat` mais TVA récup. dans `expenses:` | Sous-déduction de TVA | TVA récup = créance, jamais une charge |
| Frais de représentation 100 % déduits | Reprise AFC | 50 % seulement (repas business), traitement TVA aussi |
| Cadeaux clients > CHF 50 | Non déductible au-delà | Tracer en `expenses:marketing:gifts` mais flagger en clôture |
| Compter le 13e salaire en `equity:retained` | Effacement de charge | `expenses:salaries:13th` en provision si payé en janvier |
| Confondre `assets:current:capital-deposit` et `assets:current:bank:ubs` | Capital social mal libéré | Tant que pas d'inscription RC, c'est consigné ; puis transfert |
