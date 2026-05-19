# TVA / MWST en hledger pour PME suisse

Référence pratique pour gérer la TVA suisse dans hledger : assujettissement, choix de méthode (effective vs forfaitaire SSS), saisie des écritures, décompte trimestriel, concordance annuelle.

## Cadre légal

| Texte | Sujet |
|-------|-------|
| LTVA (RS 641.20) | Loi fédérale régissant la TVA |
| OTVA (RS 641.201) | Ordonnance d'application |
| Info TVA ESTV | Doctrine pratique (publiée et mise à jour annuellement) |

**Autorité** : Administration fédérale des contributions (AFC) — Division principale de la TVA.

**Portail** : ePortail ESTV pour décomptes, échanges, autorisations (https://www.estv.admin.ch/estv/fr/accueil/tva.html).

## Taux 2024-2026

Depuis le **1er janvier 2024** (relèvement AVS) :

| Taux | Catégorie | Exemples |
|------|-----------|----------|
| **8.1 %** | Taux normal | Conseil, services, biens de consommation, électronique |
| **3.8 %** | Taux spécial hébergement | Hôtels (nuitée + petit-déjeuner) |
| **2.6 %** | Taux réduit | Aliments, boissons non alcoolisées, médicaments, livres, journaux, plantes, ventes de billets de manifestations culturelles |
| **0 %** | Exporté / hors champ | Exportations B2C, services B2B à l'étranger (lieu de prestation art. 8 LTVA) |
| **Exclu** | Hors champ TVA | Prestations médicales, formation, location de logement, opérations financières (LTVA art. 21) |

Taux **avant le 31.12.2023** (encore pertinent si tu corriges du historique) : 7.7 % / 3.7 % / 2.5 %.

## Seuils d'assujettissement

| Critère | Seuil | Conséquence |
|---------|-------|-------------|
| CA mondial annuel | < CHF 100'000 | Non assujetti obligatoire (mais peut s'inscrire volontairement) |
| CA mondial annuel | ≥ CHF 100'000 | Assujettissement obligatoire dans les 30 j |
| CA mondial annuel | < CHF 150'000 et associations sportives/culturelles | Non assujetti même au-dessus de 100k |
| Achats étrangers de services | > CHF 10'000/an | Reverse charge même si non assujetti |
| CA + TVA due | CA < CHF 5'024'000 ET TVA < CHF 108'000 | Méthode forfaitaire SSS éligible |

## Choix de méthode

### Méthode effective (Abrechnung nach effektiver Methode)

**Principe** : tu déclares la TVA collectée sur tes ventes ET récupères la TVA payée sur tes achats. Solde = différence à verser/récupérer.

**Pour qui** :
- Sàrl/SA avec achats significatifs (matériel, sous-traitance, immobilisations)
- Sociétés avec investissements importants (TVA récupérable sur amortissement)
- Cabinets de service avec sous-traitance significative
- Toute société dont la marge brute est faible

**Avantages** :
- Restitution intégrale de l'impôt préalable
- Pas de plafond
- Précis et conforme à la logique économique

**Inconvénients** :
- Saisie TVA par écriture (effort)
- Risque de discordance en cas d'erreur de taux
- Engagement minimum 1 an

### Méthode forfaitaire SSS (Saldosteuersatz / Taux de dette fiscale nette)

**Principe** : tu factures à tes clients le taux normal (8.1 %), mais tu ne reverses à l'AFC qu'un **taux forfaitaire SSS** propre à ton activité. La différence reste dans tes poches (compensation forfaitaire pour la TVA récupérable que tu ne déduis plus).

**Eligibilité** : CA < CHF 5'024'000/an ET TVA effective < CHF 108'000/an.

**Pour qui** :
- Sociétés de service avec peu d'achats taxés (consulting, design, software)
- Indépendants avec faible structure de coûts
- PME qui veulent simplifier la comptabilité

**Avantages** :
- Pas de TVA par écriture (juste le taux SSS au décompte)
- Plus rapide à boucler
- Souvent gagnant pour les sociétés à haute marge

**Inconvénients** :
- Pas de récupération de TVA sur les gros investissements
- Engagement minimum **3 ans**
- Liste de taux SSS publiée par ESTV par branche (consulter avant de choisir)

**Taux SSS principaux 2024** (extraits, à vérifier sur le site ESTV — Info TVA 12 "Taux forfaitaires") :

| Activité | Taux SSS |
|----------|----------|
| Conseil en gestion, en organisation | 6.2 % |
| Coaching, conseil personnel | 6.2 % |
| Design graphique, web design | 6.2 % |
| Programmation informatique, software | 6.2 % |
| Activité d'enseignement (hors écoles agréées) | 6.2 % |
| Architecte, ingénieur civil | 6.2 % |
| Avocat | 6.2 % |
| Cabinet médical (non exclu) | 6.2 % |
| Commerce de détail (alimentation) | 0.6 % |
| Restauration | 5.2 % |
| Hôtellerie | 3.7 % |
| Artisanat (peinture, plâtrerie, charpenterie) | 4.2-5.2 % |
| Coiffeur, esthétique | 6.2 % |
| Photographie | 6.2 % |
| Vidéo, production audiovisuelle | 6.2 % |
| Service de livraison, transport | 4.2 % |

⚠ La liste officielle compte 200+ activités. **Toujours vérifier sur estv.admin.ch avant adhésion.**

### Comparaison chiffrée

Scénario : Sàrl de conseil, CA HT CHF 200'000, achats taxés CHF 20'000 (frais bureau, software).

| Méthode | TVA collectée | TVA récup. | À verser ESTV |
|---------|---------------|-----------|---------------|
| Effective | 200'000 × 8.1 % = 16'200 | 20'000 × 8.1 % = 1'620 | **14'580** |
| Forfaitaire SSS 6.2 % | (200'000 × 1.081) × 6.2 % = **13'404** | 0 (incluse dans forfait) | **13'404** |

Économie SSS dans cet exemple : **CHF 1'176/an**. Avantage augmente avec la marge brute (peu d'achats taxés).

Scénario inverse : Sàrl de commerce, CA HT 200'000, achats marchandises CHF 100'000.

| Méthode | TVA collectée | TVA récup. | À verser ESTV |
|---------|---------------|-----------|---------------|
| Effective | 16'200 | 100'000 × 8.1 % = 8'100 | **8'100** |
| Forfaitaire SSS 0.6 % (commerce) | (216'200) × 0.6 % = **1'297** | 0 | **1'297** |

Ici aussi SSS gagne. Mais si tu fais un gros investissement (CHF 50'000 d'équipement) :

| Méthode | À verser cette année |
|---------|---------------------|
| Effective | 8'100 − (50'000 × 8.1 % = 4'050) = **4'050** |
| SSS | **1'297** (sans récup sur l'investissement) |

SSS gagne encore. Mais **sur un gros investissement isolé** (immeuble CHF 1M) :

| Méthode | À verser cette année |
|---------|---------------------|
| Effective | 8'100 − 81'000 = **-72'900 (récupération)** |
| SSS | **1'297** |

Effective gagne nettement. → **Pour les sociétés à gros CAPEX, choisir effective**.

## Configuration hledger selon méthode

### Pour méthode effective

**Comptes nécessaires** dans `accounts.journal` :

```hledger
account assets:current:receivables:vat:material            ; TVA récup. sur matériel/services
account assets:current:receivables:vat:investments         ; TVA récup. sur investissements
account liabilities:current:vat:output                      ; TVA collectée 8.1 %
account liabilities:current:vat:output-reduced              ; TVA collectée 2.6 %
account liabilities:current:vat:output-lodging              ; TVA collectée 3.8 %
account liabilities:current:vat:settlement                  ; Compte de passage décompte
```

**Convention tags** :

```hledger
; tva:8.1-effective        — vente avec TVA normale collectée
; tva:8.1-recuperable      — achat avec TVA récup
; tva:reverse-charge-8.1   — service étranger, auto-déclaration
; tva:2.6-effective        — taux réduit
; tva:3.8-effective        — hébergement
; tva:exempt-export        — export à 0 %
; tva:exclu                — hors champ (médical, formation, logement)
```

### Pour méthode forfaitaire SSS

**Comptes nécessaires** :

```hledger
account liabilities:current:vat:sss-due                     ; TVA SSS due au décompte
account expenses:tax:vat-sss                                ; Charge TVA SSS au moment du décompte
```

Pas de séparation par écriture. Tous les produits sont enregistrés **TTC**. Le calcul TVA se fait au moment du décompte trimestriel.

**Convention tags** :

```hledger
; tva:forfaitaire-sss-6.2  — vente normale, TTC enregistré
; tva:exempt-export        — export, à exclure de la base SSS
```

## Saisie pratique

### Écriture vente effective 8.1 %

```hledger
2025-03-15 * Facture #2025-014 Acme SA
    ; client:acme-sa
    ; tva:8.1-effective
    assets:current:receivables:trade           CHF 5'405.00
    revenues:sales:services                   CHF -5'000.00
    liabilities:current:vat:output             CHF -405.00
```

### Écriture achat effective 8.1 % récupérable

```hledger
2025-03-15 * Facture fournisseur Office Suppliers
    ; tva:8.1-recuperable
    expenses:office:supplies                   CHF 1'000.00
    assets:current:receivables:vat:material    CHF 81.00
    liabilities:current:payables:trade        CHF -1'081.00
```

### Écriture vente forfaitaire SSS

```hledger
2025-03-15 * Facture #2025-014 Acme SA
    ; client:acme-sa
    ; tva:forfaitaire-sss-6.2
    assets:current:bank:ubs                    CHF 5'405.00     ; TTC encaissé
    revenues:sales:services                   CHF -5'405.00     ; TTC enregistré
```

Pas de TVA séparée. La TVA SSS due se calculera au trimestre :  
`5'405 × 6.2 % = CHF 335.11`

### Reverse charge (service étranger)

Facture EU Freelance EUR 2'000, taux CHF 0.94 → CHF 1'880.

```hledger
2025-03-15 ! Facture EU Freelance
    ; fournisseur:eu-freelance
    ; tva:reverse-charge-8.1
    expenses:office:professional-services:consultants  EUR 2'000.00 @@ CHF 1'880.00
    assets:current:receivables:vat:material                       CHF 152.28      ; 1'880 × 8.1 %
    liabilities:current:payables:trade                EUR -2'000.00 @@ CHF -1'880.00
    liabilities:current:vat:output                                CHF -152.28     ; TVA due auto-déclarée
```

Effet net : 0 (récupération = collecte). Mais ça **doit apparaître au décompte** (case 220 + case 401).

### Cas exclus (médical, formation, logement)

```hledger
2025-03-15 * Loyer cabinet médical mars
    ; tva:exclu
    expenses:occupancy:rent                    CHF 2'000.00
    assets:current:bank:ubs                  CHF -2'000.00
```

Pas de TVA récupérable même en méthode effective (le bailleur ne facture pas de TVA car activité de location de logement exclue art. 21).

## Décompte trimestriel

### Calendrier ESTV

| Trimestre | Période | Échéance dépôt + paiement |
|-----------|---------|---------------------------|
| Q1 | janv-mars | 31 mai |
| Q2 | avril-juin | 31 août |
| Q3 | juillet-sept | 30 novembre |
| Q4 | oct-déc | 28 février (année suivante) |

Tous les décomptes via **ePortail ESTV** (login SuisseID, Mobile ID, ou compte utilisateur).

### Décompte effective : workflow hledger

```bash
# 1. Total des ventes par taux (Q2 2025)
hledger -f 2025/main.journal reg revenues:sales -p 'Q2 2025' --total

# 2. Détail par taux et catégorie
hledger -f 2025/main.journal balance revenues:sales -p 'Q2 2025' --depth 3

# 3. TVA collectée Q2
hledger -f 2025/main.journal reg liabilities:current:vat:output -p 'Q2 2025' --total

# 4. TVA récupérable Q2
hledger -f 2025/main.journal reg assets:current:receivables:vat -p 'Q2 2025' --total

# 5. Solde à verser
# Solde = TVA collectée - TVA récupérable
```

**Cases du formulaire ESTV 0566 (effective)** :

| Case | Contenu | Requête hledger |
|------|---------|----------------|
| 200 | Chiffre d'affaires total (CHF) | `reg revenues:sales -p 'Q2 2025' --total` |
| 220 | CA exclu (médical, etc.) | `reg revenues:sales tag:tva=exclu -p 'Q2 2025' --total` |
| 221 | Exportations à 0 % | `reg revenues:sales:export -p 'Q2 2025' --total` |
| 230 | Total CA imposable (200 − 220 − 221) | calculé |
| 300 | TVA 8.1 % collectée | `reg liabilities:current:vat:output tag:tva=8.1-effective -p 'Q2 2025' --total` |
| 310 | TVA 2.6 % collectée | idem `tag:tva=2.6-effective` |
| 340 | TVA 3.8 % collectée | idem `tag:tva=3.8-effective` |
| 400 | Impôt préalable sur matériel/services | `reg assets:current:receivables:vat:material -p 'Q2 2025' --total` |
| 405 | Impôt préalable sur investissements | `reg assets:current:receivables:vat:investments -p 'Q2 2025' --total` |
| 500 | TVA due (300 + 310 + 340 − 400 − 405) | calculé |

### Décompte SSS : workflow hledger

```bash
# 1. Total CA encaissé Q2 (TTC)
hledger -f 2025/main.journal reg revenues:sales -p 'Q2 2025' --total

# 2. Soustraire les opérations exclues / exportées
hledger -f 2025/main.journal reg revenues:sales \
  not:tag:tva=exempt-export not:tag:tva=exclu -p 'Q2 2025' --total

# 3. Appliquer le taux SSS (ex : 6.2 %)
# TVA due = total imposable × 0.062

# 4. Si plusieurs activités → décomposer par taux
hledger -f 2025/main.journal reg revenues:sales tag:tva=forfaitaire-sss-6.2 -p 'Q2 2025' --total
hledger -f 2025/main.journal reg revenues:sales tag:tva=forfaitaire-sss-3.7 -p 'Q2 2025' --total
```

**Cases du formulaire ESTV 0566 SSS** : plus court (200, 230, 320 SSS, etc.).

### Écriture de décompte (effective)

À la clôture du trimestre, solder les comptes TVA et constater la dette ESTV :

```hledger
2025-06-30 * Décompte TVA Q2 2025 — effective
    ; pj:2025-06-30_decompte-tva_Q2.pdf
    liabilities:current:vat:output             CHF 4'500.00       ; total TVA collectée Q2
    assets:current:receivables:vat:material   CHF -800.00         ; total TVA récup Q2
    assets:current:receivables:vat:investments  CHF -200.00       ; idem investissements
    liabilities:current:vat:settlement         CHF -3'500.00      ; solde à verser ESTV
```

Au paiement :

```hledger
2025-08-25 * Paiement décompte TVA Q2 — ESTV
    liabilities:current:vat:settlement         CHF 3'500.00
    assets:current:bank:ubs                  CHF -3'500.00
```

### Écriture de décompte (SSS)

```hledger
2025-06-30 * Décompte TVA Q2 2025 — SSS 6.2 %
    ; pj:2025-06-30_decompte-tva-sss_Q2.pdf
    expenses:tax:vat-sss                       CHF 3'350.00       ; TVA SSS due (calculée)
    liabilities:current:vat:settlement        CHF -3'350.00
```

Au paiement :

```hledger
2025-08-25 * Paiement décompte TVA SSS Q2 — ESTV
    liabilities:current:vat:settlement         CHF 3'350.00
    assets:current:bank:ubs                  CHF -3'350.00
```

**Note SSS** : la TVA SSS est en charge (`expenses:tax:vat-sss`) car la société garde la différence entre la TVA facturée client et la TVA reversée AFC. Cette différence est un revenu implicite (déjà comptabilisé dans le CA TTC). La charge `vat-sss` ramène l'effet net.

## Concordance annuelle

**Obligation** : à la clôture, vérifier la cohérence entre la TVA déclarée trimestriellement et la TVA effectivement due selon les comptes annuels. Toute différence doit être corrigée via une **concordance annuelle** déposée auprès ESTV dans les **240 jours après la clôture** (LTVA art. 72).

### Workflow

```bash
# 1. Total CA annuel par catégorie TVA
hledger -f 2025/main.journal balance revenues:sales -p 2025 --depth 4

# 2. Total TVA collectée année
hledger -f 2025/main.journal reg liabilities:current:vat:output -p 2025 --total

# 3. Total TVA récupérable année
hledger -f 2025/main.journal reg assets:current:receivables:vat -p 2025 --total

# 4. Solde TVA annuel = collectée - récupérable

# 5. Somme des 4 décomptes trimestriels (case 500 cumulée)
# Comparer avec le solde calculé en 4

# Si discordance : déposer concordance annuelle
```

### Causes typiques de discordance

| Cause | Effet | Correction |
|-------|-------|------------|
| Erreur de taux sur une vente | TVA déclarée ≠ TVA due | Reprise dans concordance + paiement complémentaire |
| Reverse charge oublié | TVA manquante sur achat étranger | Concordance + paiement |
| TVA récupérable manquée | Trop versé | Concordance + remboursement |
| Note de crédit non déclarée | Trop versé | Concordance + remboursement |
| Conversion FX erronée | Variations marginales | Concordance |

### Écriture de concordance (exemple positif : on a trop versé)

```hledger
2026-02-28 * Concordance TVA 2025 — remboursement ESTV
    ; pj:2026-02-28_concordance-tva-2025.pdf
    assets:current:receivables:vat:material    CHF 500.00         ; correction TVA récup manquée
    revenues:financial:other                  CHF -500.00          ; gain comptable
    ; ou
    expenses:office:other                      CHF -500.00         ; reprise de charge
```

## Cas particuliers

### Changement de méthode

Tu peux changer une fois par an, avec **demande à l'ESTV avant la fin du dernier trimestre précédent**. Engagement minimum :
- **Effective** : 1 an
- **SSS** : 3 ans

**Régularisation au changement** :
- De SSS vers effective : aucune régularisation
- D'effective vers SSS : **dégrèvement ultérieur** des immobilisations encore au bilan (TVA récup déjà reçue doit être en partie restituée). Calcul complexe : voir Info TVA 12.

### Inscription tardive

Tu as dépassé CHF 100'000 de CA en mars 2025 mais ne t'es inscrit qu'en novembre.

**Conséquences** :
- Assujettissement rétroactif au 01.04.2025 (1er jour du 2e trimestre suivant le mois de dépassement)
- TVA due sur toutes les ventes Q2-Q3
- Pénalité possible (intérêts moratoires 4.75 % en 2025) + amende selon gravité

**Écritures de rattrapage** :

```hledger
2025-11-15 * Rattrapage TVA inscription tardive Q2-Q3
    ; pj:2025-11-15_courrier-inscription-tva.pdf
    expenses:office:other                       CHF 12'150.00      ; TVA collectée non récupérable auprès clients
    liabilities:current:vat:output             CHF -12'150.00      ; TVA due Q2-Q3
    ; (puis décompte Q4 ou demande de paiement)
```

### Dégroupement TVA (groupe d'imposition)

Si tu as plusieurs Sàrl liées, tu peux constituer un **groupe d'imposition TVA** (art. 13 LTVA) :
- Les transactions intercompany ne sont **plus soumises à TVA**
- Un seul décompte pour toutes les sociétés du groupe
- Conditions : direction commune, > 50 % de participation

Demande à l'ESTV (formulaire de constitution). Effet à partir du trimestre suivant.

## Saisie en cas d'erreur

### J'ai oublié de mettre la TVA sur une facture du Q1

Cas A — La facture n'a pas encore été payée :
- Émettre une note de crédit pour annuler
- Réémettre la facture correctement
- Pas de problème déclaration tant que pas encore déclarée

Cas B — La facture est déjà payée mais Q1 pas encore déclaré :
- Booker une écriture correctrice : ajouter la TVA, débiter `assets:current:receivables:trade` ou `expenses:office:other` selon récupération possible

Cas C — Q1 déjà déclaré, erreur découverte plus tard :
- Concordance annuelle (si découverte avant 28 février N+1)
- OU décompte corrigé (formulaire 0566 avec "correction")

### Le client a payé un montant différent (escompte 2 %)

```hledger
2025-04-14 * Encaissement facture #2025-014 avec escompte 2 %
    assets:current:bank:ubs                    CHF 5'296.90       ; 5'405 - 2 %
    revenues:discounts                         CHF 100.00         ; rabais 2 % HT
    liabilities:current:vat:output             CHF 8.10           ; correction TVA sur rabais (réintégrée)
    assets:current:receivables:trade          CHF -5'405.00
```

## Garde-fous

| Risque | Détection | Action |
|--------|-----------|--------|
| Approche du seuil 100k | `hledger reg revenues -p YYYY --total` chaque mois | S'inscrire AVANT dépassement |
| Décompte oublié | Calendrier auto, alertes 14 j avant | Toujours dans le rappel + paiement avant échéance |
| Erreur de taux | Diff entre décompte attendu et hledger | Concordance ou décompte corrigé |
| Reverse charge non déclaré | Achats étrangers > CHF 10k | Inclure systématiquement dans les écritures `tva:reverse-charge-8.1` |
| TVA récup sur charges 100 % exclues | Bilan TVA récup absurde | Filtrer `tag:tva=exclu` |
| Frais représentation/repas à 100 % | Reprise AFC | 50 % seulement sur ces postes |
| Mauvaise classification entre effective et SSS | Sous-déclaration ou sur-versement | Recalculer chaque année si proche d'un changement |

## Ressources

- ESTV TVA : https://www.estv.admin.ch/estv/fr/accueil/tva.html
- Info TVA 12 (taux SSS) : recherche "Info TVA 12" sur estv.admin.ch
- ePortail : https://www.gate.estv.admin.ch
- Liste complète des taux SSS par activité : Info TVA 12 (mise à jour annuelle)
- Calculatrice TVA SSS : https://www.estv.admin.ch (rubrique "Calculatrices")
