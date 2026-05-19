# Clôture annuelle en hledger pour PME suisse

Procédure complète de clôture pour une Sàrl/GmbH : écritures de fin d'exercice, génération des états financiers conformes au CO 957-963, export pour la fiduciaire.

## Calendrier

Pour un exercice qui clôt au 31 décembre :

| Mois | Tâche | Effort |
|------|-------|--------|
| **Décembre** | Prévision de résultat, stratégie d'amortissement, planification provisions | 0.5 j |
| **Janvier** | Rapprochement bancaire final, écritures de clôture (amortissements, provisions, FX, transitoires) | 1 j |
| **Février** | Finaliser bilan + PP + annexe, calcul provision impôt, AG d'approbation des comptes | 1 j |
| **Mars-juin** | Remise à la fiduciaire, dépôt déclaration fiscale (e-DIPM ou équivalent cantonal) | (fiduciaire) |

**Délais légaux** :
- Tenue des comptes finalisée : dans les **6 mois** après la fin de l'exercice (CO 958 al. 3)
- AG d'approbation : dans les **6 mois**
- Conservation : **10 ans** des comptes, journaux, pièces justificatives, correspondance (CO 958f)

## Phase 1 — Préparation (décembre)

### 1.1 Prévision de résultat

```bash
# Résultat provisoire au 30 novembre
hledger -f 2025/main.journal is -p 'Q1-Q3 2025' -O csv

# Extrapolation Q4 (approximative)
# Décider : on amortit beaucoup (si profit élevé) ou peu (si proche du break-even)
```

### 1.2 Inventaire physique

Obligatoire CO 958c pour les stocks. Documenter avec :
- Liste détaillée par référence/produit
- Quantités physiquement comptées
- Prix de revient / prix du marché (valeur la plus basse : principe de prudence)
- Signature(s) de la ou des personnes ayant compté

### 1.3 Identification des provisions

| Type | Quand | Calcul |
|------|-------|--------|
| **Vacances non prises** | Tous employés | Solde de jours × salaire journalier |
| **Bonus & 13e** | Bonus décidés non payés au 31.12 | Montant brut + charges sociales |
| **Litiges en cours** | Si risque > CHF 1'000 | Avis avocat |
| **Créances douteuses** | Clients en retard > 6 mois | Ducroire individuel ou forfait 5 % |
| **Garanties / SAV** | Si activité avec garantie | Pourcentage statistique du CA |
| **Impôts directs** | Toujours | Résultat × ~14 % (varie canton) |

## Phase 2 — Écritures de clôture (janvier)

Toutes les écritures dans `2025/adjustments.journal`. Date : `2025-12-31`.

### 2.1 Amortissements

**Barème AFC maximum** (notice 1995, encore en vigueur — toujours vérifier) :

| Actif | Taux max linéaire | Taux max dégressif |
|-------|------------------|---------------------|
| Immeubles d'exploitation | 2-4 % | 4-8 % |
| Mobilier et installations | 12.5 % | 25 % |
| Machines et appareils | 20 % | 40 % |
| Équipement informatique | 20-40 % | 40 % |
| Véhicules | 20-40 % | 40 % |
| Logiciels, brevets, licences | 20-40 % | 40 % |
| Goodwill | (en principe non, sauf exception ; 5-20 ans) | — |

**Méthode dégressive** (souvent retenue par AFC) : amortissement = valeur résiduelle × taux.

**Méthode linéaire** : amortissement = valeur d'acquisition × taux, jusqu'à 0.

```hledger
2025-12-31 * Amortissement IT 2025 (MacBook Pro acquis 2025-03-15)
    ; pj:2025-12-31_calcul-amortissements.pdf
    expenses:depreciation:it                   CHF 1'200.00       ; 40 % × 3'000 dégressif
    assets:non-current:tangible:depreciation  CHF -1'200.00       ; correction de valeur cumulée

2025-12-31 * Amortissement mobilier 2025
    expenses:depreciation:furniture            CHF 500.00         ; 20 % × 2'500
    assets:non-current:tangible:depreciation  CHF -500.00
```

**Stratégie** :
- Année profitable → amortir au maximum (réduction du résultat imposable)
- Année déficitaire → amortir au minimum (préserver le report de pertes 7 ans)
- Cohérence pluriannuelle : ne pas changer de méthode brutalement (CO 958c continuité)

### 2.2 Provision pour vacances non prises

```hledger
2025-12-31 * Provision vacances non prises 2025
    ; pj:2025-12-31_calcul-vacances.xlsx
    expenses:salaries:gross                    CHF 4'800.00       ; total brut dû
    expenses:social:avs                        CHF 384.00         ; charges sociales employeur
    expenses:social:lpp                        CHF 336.00
    liabilities:current:accruals:vacation     CHF -5'520.00
```

L'écriture est **contre-passée** au 1er janvier suivant (méthode classique) :

```hledger
2026-01-01 * Reprise provision vacances 2025 (cf adjustements 2025)
    liabilities:current:accruals:vacation      CHF 5'520.00
    expenses:salaries:gross                   CHF -4'800.00
    expenses:social:avs                       CHF -384.00
    expenses:social:lpp                       CHF -336.00
```

Puis l'année 2026, on reprovision à nouveau au 31.12.2026.

### 2.3 Provision pour créances douteuses (Ducroire)

**Option A — Ducroire individuel** (préféré par l'AFC) :

```hledger
2025-12-31 * Provision créance douteuse Acme SA
    ; pj:2025-12-15_relance-3_acme-sa.pdf
    expenses:office:other                      CHF 5'000.00
    assets:current:receivables:trade:provision CHF -5'000.00
```

**Option B — Ducroire forfaitaire** : 5 % du total des créances clients suisses, 10 % étrangères (toléré sans justification fiscale individuelle, mais doit être documenté en annexe).

```hledger
2025-12-31 * Ducroire forfaitaire 5 % CH + 10 % étranger
    ; pj:2025-12-31_calcul-ducroire.xlsx
    expenses:office:other                      CHF 1'200.00
    assets:current:receivables:trade:provision CHF -1'200.00
```

### 2.4 Passifs et actifs transitoires

**Charges à payer** (facture non reçue au 31.12 pour prestation 2025) :

```hledger
2025-12-31 * Charge à payer — Honoraires fiduciaire Q4
    ; fournisseur:fiduciaire-x
    expenses:office:professional-services:accounting  CHF 1'500.00
    liabilities:current:accruals:accrued-expenses    CHF -1'500.00
```

Contre-passation au 01.01.2026 (réception facture en mars 2026 normalement).

**Produits à recevoir** (prestation 2025 facturée en 2026) :

```hledger
2025-12-31 * Produit à recevoir — Acme SA décembre 2025
    ; client:acme-sa
    assets:current:accruals:accrued-income     CHF 3'000.00
    revenues:sales:services                   CHF -3'000.00
```

**Charges payées d'avance** (assurance 2026 payée en décembre 2025) :

```hledger
2025-12-31 * Charges payées d'avance — Prime LAA 2026
    assets:current:accruals:prepaid-expenses   CHF 600.00
    expenses:insurance:property                CHF -600.00       ; reprise de charge
```

**Produits encaissés d'avance** (abonnement 2026 facturé en décembre 2025) :

```hledger
2025-12-31 * Produit encaissé d'avance — Acme SA abonnement 2026
    revenues:sales:services                    CHF 6'000.00
    liabilities:current:accruals:deferred-income  CHF -6'000.00
```

### 2.5 Réévaluation des soldes en devises étrangères

**Principe CO 960e** : tous les actifs et passifs en devises étrangères sont convertis au **cours de clôture** (taux BNS au 31.12).

Source officielle : https://www.snb.ch (Devises > Cours de change moyens mensuels)

**Workflow** :

```bash
# 1. Lister tous les comptes en devises étrangères
hledger -f 2025/main.journal balance -V -X CHF --tree -e 2025-12-31

# 2. Identifier les écarts (différence entre la conversion historique et la conversion au cours de clôture)

# 3. Booker l'écart en résultat de change
```

**Exemple** : compte Revolut EUR a EUR 5'000 au 31.12. Cours acquisition moyen : 1 EUR = CHF 0.94. Cours BNS 31.12.2025 : 1 EUR = CHF 0.9412.

Valeur historique : 5'000 × 0.94 = CHF 4'700  
Valeur clôture : 5'000 × 0.9412 = CHF 4'706  
Écart : CHF +6 → gain de change non réalisé

```hledger
2025-12-31 * Réévaluation FX compte Revolut EUR au 31.12
    ; cours-bns:0.9412
    assets:current:bank:revolut                CHF 6.00            ; écart positif
    revenues:other:fx-gains-unrealised        CHF -6.00
```

**Si écart négatif** :

```hledger
2025-12-31 * Réévaluation FX compte fournisseur EUR au 31.12
    expenses:financial:fx-losses-unrealised    CHF 50.00
    liabilities:current:payables:trade        CHF -50.00         ; augmentation de la dette en CHF
```

**Prudence CO 958c** : les pertes de change non réalisées sont **obligatoirement** comptabilisées. Les gains de change non réalisés sont **autorisés** (pas obligatoires en méthode prudentielle).

### 2.6 Provision d'impôts

**Estimation du résultat avant impôt** :

```bash
hledger -f 2025/main.journal is -p 2025 --no-elide
```

**Taux global d'impôt sur le bénéfice** (cantonal + fédéral, 2026) :

| Canton | Taux global approximatif |
|--------|--------------------------|
| Zoug (ZG) | 11.85 % |
| Lucerne (LU) | 12.32 % |
| Nidwald (NW) | 11.97 % |
| Schwytz (SZ) | 14.06 % |
| Genève (GE) | 14.00 % |
| Vaud (VD) | 13.79 % |
| Zurich (ZH) | 19.65 % |
| Berne (BE) | 21.04 % |

(Source : KPMG Swiss Tax Report, à vérifier annuellement.)

```hledger
2025-12-31 * Provision impôts directs 2025 (ICC + IFD)
    ; pj:2025-12-31_calcul-impots.xlsx
    expenses:tax:cantonal                      CHF 7'500.00       ; ICC + commune
    expenses:tax:federal                       CHF 4'250.00       ; IFD 8.5 %
    liabilities:current:tax-provision         CHF -11'750.00
```

L'estimation est ajustée lorsque la fiduciaire fait le calcul final (mars-juin) :

```hledger
2026-05-15 * Ajustement provision impôts 2025 (taxation reçue)
    liabilities:current:tax-provision          CHF 250.00         ; surestimation → remboursement
    revenues:other                            CHF -250.00         ; reprise de charge fiscale antérieure
```

### 2.7 Affectation du bénéfice (post-AG)

Une fois les comptes approuvés par l'AG, affecter le bénéfice :

```hledger
2026-05-15 * AG : affectation du bénéfice 2025
    ; pj:2026-05-15_pv-ag.pdf
    equity:retained:current                    CHF 25'000.00      ; bénéfice à affecter
    equity:legal-reserve                      CHF -1'250.00       ; 5 % réserve légale (CO 672, jusqu'à 20 % capital)
    equity:retained:prior-years              CHF -23'750.00       ; reporté sur exercices suivants
    ; (ou distribution en dividende)
```

**Réserve légale CO 672** : 5 % du bénéfice annuel doit être affecté à la réserve légale jusqu'à ce qu'elle atteigne 20 % du capital social.

### 2.8 Cohérence finale

```bash
# Vérifier que tout équilibre
hledger -f 2025/main.journal check

# Vérifier que Actif = Passif au 31.12
hledger -f 2025/main.journal bs -e 2025-12-31

# Vérifier que résultat bilan = résultat PP
hledger -f 2025/main.journal is -p 2025
# Le "Net" du PP doit apparaître à l'identique dans equity:retained:current
```

## Phase 3 — Génération des états financiers

### 3.1 Structure obligatoire CO 959a (Bilan)

```
ACTIF
  Actif circulant
    Trésorerie (caisse, comptes bancaires)
    Créances résultant de livraisons et prestations
    Autres créances à court terme
    Stocks et prestations non facturées
    Actifs de régularisation (transitoires actifs)
  Actif immobilisé
    Immobilisations financières
    Participations
    Immobilisations corporelles
    Immobilisations incorporelles
  TOTAL DE L'ACTIF

PASSIF
  Fonds étrangers à court terme
    Dettes résultant de livraisons et prestations
    Dettes à court terme portant intérêts
    Autres dettes à court terme
    Passifs de régularisation (transitoires passifs) et provisions à court terme
  Fonds étrangers à long terme
    Dettes à long terme portant intérêts
    Autres dettes à long terme
    Provisions à long terme
  Fonds propres
    Capital social
    Réserves légales
    Réserves volontaires (le cas échéant)
    Bénéfice / perte reporté
    Bénéfice / perte de l'exercice
  TOTAL DU PASSIF
```

**Ordre obligatoire** :
- Actif : par **liquidité décroissante** (cash en haut, immeubles en bas)
- Passif : par **échéance croissante** (CT en haut, FP en bas)

**Colonne comparatif N-1** obligatoire dès le 2e exercice (CO 958d al. 2).

### 3.2 Structure obligatoire CO 959b (Compte de pertes et profits)

**Méthode par nature** (la plus courante en PME) :

```
+ Chiffre d'affaires net
- Charges de matières / marchandises
- Variation des stocks et produits finis
- Charges de personnel
- Autres charges d'exploitation
- Amortissements et corrections de valeur sur immobilisations
= Résultat d'exploitation (EBIT)
+/- Résultat financier (produits financiers - charges financières)
= Résultat avant impôts
+/- Résultat hors exploitation (si applicable)
+/- Résultat exceptionnel (si applicable)
- Impôts directs
= Bénéfice / perte de l'exercice
```

**Méthode par fonction** : alternative, plus rare en PME. Coût des ventes, frais commerciaux, frais administratifs.

### 3.3 Annexe obligatoire CO 959c

15 sections obligatoires (state "Néant" si non applicable, ne **jamais** omettre une section) :

| # | Sujet | Référence | Contenu type |
|---|-------|-----------|--------------|
| 1 | Raison sociale, forme, siège, IDE | 959c al. 2 ch. 1 | Tableau identité |
| 2 | Organe de révision ou renonciation | 727a al. 2 | "Les associés ont renoncé au contrôle restreint conformément à l'art. 727a al. 2 CO" |
| 3 | Principes comptables appliqués | 959c al. 1 ch. 1 | CHF, comptabilité d'engagement, méthode d'évaluation |
| 4 | Capital social et détenteurs | 959c al. 2 ch. 5 / 785 | Capital, parts, libération, détenteurs |
| 5 | Participations détenues | 959c al. 2 ch. 2 | Si > 20 % d'une autre société |
| 6 | Parts au personnel / options | 959c al. 2 ch. 3 | "Néant" si non applicable |
| 7 | Transactions parties liées | 959c al. 1 ch. 4 | Liste des transactions importantes |
| 8 | Provisions et passifs significatifs | 959c al. 1 ch. 2 | Détail nature/montant |
| 9 | Dissolution de réserves latentes | 959c al. 1 ch. 3 | "Néant" courant |
| 10 | Valeur incendie des immobilisations | 959c al. 2 ch. 4 | Valeur assurance ECA / cantonale |
| 11 | Engagements bail et leasing | 959c al. 2 ch. 6 | Liste durée et montant restant |
| 12 | Engagements conditionnels et cautionnements | 959c al. 2 ch. 7 | "Néant" si non applicable |
| 13 | Actifs grevés en faveur de tiers | 959c al. 2 ch. 8 | Nantissements, gages |
| 14 | Dettes envers institutions de prévoyance | 959c al. 2 ch. 9 | LPP solde au 31.12 |
| 15 | Nombre moyen d'emplois à temps plein | 959c al. 2 ch. 12 | "< 10 EPT", "10-50", etc. |
| 16 | Événements postérieurs à la clôture | 959c al. 1 ch. 5 | "Aucun événement significatif..." |

### 3.4 Templates d'annexe

Voir `templates/annexe-template.md` pour les structures HTML/Markdown réutilisables.

**Section 1 (identité)** :

```markdown
| Élément | Valeur |
|---------|--------|
| Raison sociale | {COMPANY} Sàrl |
| Forme juridique | Société à responsabilité limitée |
| Siège | {CITY} ({CANTON}) |
| N° IDE | CHE-xxx.xxx.xxx |
| Activité | {DESCRIPTION} |
| Organe de révision | Les associés ont renoncé au contrôle restreint conformément à l'art. 727a al. 2 CO |
```

**Section 3 (principes)** :

```markdown
Les comptes annuels ont été établis conformément aux dispositions du Code des obligations suisse (art. 957 ss CO).

- Exercice : 1er janvier au 31 décembre 2025
- Monnaie de présentation : franc suisse (CHF)
- Méthode de comptabilisation : comptabilité d'engagement
- Évaluation : au coût d'acquisition, sous déduction des amortissements nécessaires
- Conversion des devises : cours du jour pour les transactions, cours de clôture BNS pour les postes monétaires
- TVA : assujetti, méthode {effective | forfaitaire SSS [taux]}
```

**Section 4 (capital)** :

```markdown
Le capital social s'élève à CHF 20'000.00, divisé en 200 parts sociales de CHF 100.00 chacune, entièrement libérées.

Détenteurs au 31.12.2025 :
- Antoine Schaller : 200 parts (100 %)
```

**Section 7 (parties liées)** :

```markdown
A) Société sœur Acme Sàrl (IDE : CHE-yyy.yyy.yyy)

| Élément | Montant |
|---------|---------|
| Prestations facturées | CHF 10'000.00 |
| Solde au 31.12.2025 | CHF 0.00 |

Conditions de marché (art. 58 LIFD).
```

## Phase 4 — Export pour la fiduciaire

```bash
mkdir -p out/2025

# Grand livre (tous les comptes, toutes les transactions)
hledger -f 2025/main.journal print > out/2025/grand-livre.journal
hledger -f 2025/main.journal print -O csv > out/2025/grand-livre.csv

# Balance détaillée
hledger -f 2025/main.journal balance --tree --depth 5 -e 2026-01-01 -O csv > out/2025/balance.csv

# Bilan
hledger -f 2025/main.journal bs -e 2026-01-01 -O csv > out/2025/bilan.csv
hledger -f 2025/main.journal bs -e 2026-01-01 > out/2025/bilan.txt

# Compte de pertes et profits
hledger -f 2025/main.journal is -p 2025 -O csv > out/2025/pp.csv
hledger -f 2025/main.journal is -p 2025 > out/2025/pp.txt

# Détail par compte (un fichier par groupe)
hledger -f 2025/main.journal reg revenues -p 2025 -O csv > out/2025/revenues.csv
hledger -f 2025/main.journal reg expenses -p 2025 -O csv > out/2025/expenses.csv

# Annexe : éléments pour les sections 7-8
hledger -f 2025/main.journal reg tag:partie-liee=oui -p 2025 -O csv > out/2025/parties-liees.csv

# Pièces justificatives (toutes dans le dossier pieces/2025/)
zip -r out/2025/pieces.zip pieces/2025/
```

Remettre à la fiduciaire :
- `out/2025/*.csv` (lisibles dans Excel)
- `out/2025/grand-livre.journal` (texte plain, traçable)
- `out/2025/pieces.zip` (pièces justificatives PDF organisées par mois)
- Une note explicative sur la méthode TVA, le canton de domicile fiscal, les particularités (intercompany, etc.)

## Phase 5 — Réintégrer les ajustements fiduciaires

La fiduciaire renvoie souvent un fichier d'ajustements (provision d'impôts ajustée, reclassements, etc.).

Importer en `2025/adjustments-fiduciaire.journal` et inclure dans `main.journal` :

```hledger
; main.journal
include ./adjustments.journal
include ./adjustments-fiduciaire.journal  ; ajustements finaux post-fiduciaire
```

Re-vérifier la cohérence :

```bash
hledger -f 2025/main.journal check
hledger -f 2025/main.journal bs -e 2026-01-01    # comparer au bilan signé par la fiduciaire
hledger -f 2025/main.journal is -p 2025          # comparer au PP signé par la fiduciaire
```

Si écart : isoler par binary search sur les écritures d'ajustement et harmoniser.

## Phase 6 — Archiver et démarrer l'exercice suivant

```bash
# Verrouiller l'exercice 2025 en lecture seule (Git)
git add 2025/ out/2025/ pieces/2025/
git commit -m "Clôture 2025 — signée par fiduciaire le 2026-05-15"
git tag closure-2025

# Préparer 2026
mkdir -p 2026 pieces/2026
cp 2025/main.journal 2026/main.journal       # adapter les include
```

Mettre à jour `2026/main.journal` :

```hledger
include ../commodities.journal
include ../accounts.journal
include ./opening-2026.journal      ; nouveau bilan d'ouverture (= bilan fermeture 2025)
include ./ubs-2026.journal
include ./adjustments-2026.journal
```

Générer le `opening-2026.journal` à partir du bilan de clôture :

```bash
hledger -f 2025/main.journal close -p 2025 --close-acct='equity:retained:current' \
  > 2026/opening-2026.journal
```

La commande `hledger close` génère automatiquement l'écriture de réouverture.

## Pièges classiques de clôture

| Piège | Conséquence | Remède |
|-------|-------------|--------|
| Oublier la concordance TVA annuelle | Pénalité ESTV | Toujours faire avant le 28 février N+1 |
| Sur-amortir en année déficitaire | Perte de report 7 ans | Amortir au minimum si déficit |
| Sous-amortir en année profitable | Impôt trop élevé | Amortir au maximum AFC |
| Provision sans justification | Reprise AFC | Documenter chaque provision |
| Ducroire forfaitaire sans annexe | Reprise AFC | Toujours indiquer la méthode en annexe |
| Affecter < 5 % à réserve légale | Non conforme CO 672 | Vérifier seuil 20 % du capital |
| Pas de PV d'AG | Non conforme | PV obligatoire + procuration si associé absent |
| Oublier un poste obligatoire d'annexe | Non conforme CO 959c | Toujours toutes les sections, "Néant" si N/A |
| Mauvais cours FX au 31.12 | Bilan faussé | Cours BNS officiels uniquement |
| Pas de comparaison N-1 | Non conforme CO 958d | Toujours sauf 1er exercice |
| Surendettement non flaggé | Risque art. 725b CO | Vérifier fonds propres ≥ 0 ; sinon postposition |
| Bénéfice non affecté au PV | Affectation implicite invalide | AG doit décider explicitement |

## Cas spécial : surendettement (CO 725b)

**Définition** : fonds propres négatifs (capital + réserves + bénéfice reporté + résultat exercice < 0).

**Vérification** :

```bash
hledger -f 2025/main.journal balance equity -e 2026-01-01
```

**Si surendettement** :
1. **Action immédiate** : convoquer AG, présenter mesures d'assainissement
2. **Postposition de créance** (Rangrücktritt) : un créancier (typiquement l'associé) signe une postposition pour le montant nécessaire à ramener les fonds propres ≥ 0
3. **Sinon** : avis au juge dans les 90 j (art. 725b al. 3 CO)

**Écriture postposition** :

La postposition ne change pas les comptes (la dette existe toujours, juste rendue subordonnée). Elle est documentée en **annexe section 8** :

```markdown
**8. Provisions et passifs significatifs**

La société présente au 31.12.2025 des fonds propres négatifs de CHF -15'000.

Une postposition de créance a été signée le 15.12.2025 par l'associé Antoine Schaller pour un montant de CHF 25'000 (compte courant associé). Cette postposition rétablit l'équilibre financier au sens de l'art. 725b al. 4 ch. 1 CO et permet la continuité de l'exploitation.
```

Pièce jointe obligatoire : `pieces/2025/12/2025-12-15_postposition-creance.pdf`

## Cas spécial : perte de capital (CO 725a)

**Définition** : fonds propres < 50 % du capital social.

**Si applicable** :
1. Convoquer AG
2. Adopter des mesures d'assainissement (apport, postposition, augmentation de capital)
3. Mentionner en annexe

Pas obligatoire de prévenir le juge (différence avec 725b), mais responsabilité des gérants engagée si pas d'action.

## Checklist finale de clôture

```
[] Inventaire physique effectué et documenté
[] Rapprochement bancaire de tous les comptes au 31.12 (différence ≤ CHF 1)
[] Toutes les factures émises de l'année comptabilisées
[] Toutes les factures fournisseurs reçues comptabilisées (charges à payer pour les manquantes)
[] Amortissements bookés selon politique
[] Provisions évaluées et bookées (vacances, créances douteuses, litiges, impôts)
[] Transitoires actifs et passifs identifiés et bookés
[] Soldes FX réévalués au cours BNS de clôture
[] Provision d'impôts directe calculée
[] hledger check passe sans erreur
[] Actif = Passif au 31.12
[] Résultat PP = résultat dans equity:retained:current
[] Décompte TVA Q4 préparé (échéance 28 février)
[] Concordance TVA annuelle prête (échéance 240 j)
[] Bilan, PP, annexe générés (avec comparatif N-1)
[] PV d'AG préparé et signé
[] Affectation du bénéfice décidée
[] Réserve légale 5 % si applicable
[] Export pour fiduciaire (CSV, journal, pièces)
[] Fonds propres vérifiés (pas de surendettement non couvert)
[] Pieces zippées et archivées sur support stable
[] Repo Git commité et taggué (closure-YYYY)
```
