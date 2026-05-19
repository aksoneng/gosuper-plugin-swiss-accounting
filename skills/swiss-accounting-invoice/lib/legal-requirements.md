# Mentions légales obligatoires sur une facture suisse

Référence pratique des règles du **Code des obligations (CO)** et de **l'Ordonnance régissant la TVA (OTVA)** qui régissent les factures émises par une entreprise en Suisse.

## Cadre légal

| Texte | Sujet | Articles clés |
|-------|-------|---------------|
| CO art. 957a | Tenue des livres et établissement des comptes | Sincérité, intégralité, traçabilité ; conservation 10 ans |
| OTVA art. 26 | Contenu de la facture pour les assujettis TVA | Mentions obligatoires (al. 2 a-g) |
| LTVA art. 24 | Lieu de la prestation | Détermine le taux applicable |
| LTVA art. 23 | Exportations | 0 % avec preuve |
| LTVA art. 21 | Prestations exclues | Médecine, formation, logement, finance |

L'autorité de contrôle est l'**Administration fédérale des contributions (AFC)** — Division principale TVA.

## Mentions obligatoires (OTVA art. 26 al. 2)

| # | Mention | Détail |
|---|---------|--------|
| a | Identité du fournisseur | Nom complet / raison sociale + adresse + numéro IDE (CHE-xxx.xxx.xxx) |
| a' | Numéro TVA | UID + suffixe `TVA` (FR) ou `MWST` (DE), uniquement si assujetti |
| b | Identité du destinataire | Nom + adresse (UID utile mais pas obligatoire) |
| c | Date d'émission + n° facture | Date au format JJ.MM.AAAA ; n° séquentiel continu |
| d | Date de prestation | Date(s) ou période. Distincte de la date d'émission |
| e | Description précise | "Conseil septembre 2025" plutôt que "Services" |
| f | Contre-prestation | Montant HT par ligne + total HT |
| g | Taux et montant TVA | Taux applicable + montant TVA + total TTC |

Si plusieurs taux : afficher chaque montant HT séparément + chaque montant TVA.

## Exemption de l'OTVA art. 26 : factures < CHF 400

**Simplification** : pour les **factures ≤ CHF 400 TTC**, certaines mentions sont allégées. Tu peux omettre :
- Le n° IDE du destinataire
- La date de prestation séparée (si même date que l'émission)

**Recommandation** : par défaut, **toujours appliquer la règle complète**. La simplification est utile pour la caisse enregistreuse, pas pour les factures B2B.

## Mentions complémentaires obligatoires selon le cas

### Si tu n'es PAS assujetti à la TVA (CA < CHF 100'000)

- **Pas de numéro TVA** sur la facture (interdit de mentionner un faux numéro)
- **Pas de TVA séparée**
- Mention recommandée : « TVA non applicable : entreprise non assujettie au sens de l'art. 10 LTVA »

### Si tu factures à l'étranger (B2B, lieu = destinataire)

- TVA 0 % (art. 8 LTVA)
- Mention obligatoire : « Reverse charge — TVA due par le destinataire (Directive 2006/112/CE, art. 196) »
- Conserver une **preuve de domicile/établissement du client** dans un autre pays

### Si tu factures un export hors UE (B2B ou B2C)

- TVA 0 % (art. 23 LTVA)
- Mention obligatoire : « Exportation, TVA 0 % (art. 23 LTVA) »
- Conserver une **preuve d'exportation** (déclaration douanière, BL, tracking)

### Si la prestation est exclue du champ TVA (art. 21 LTVA)

Liste principale : prestations médicales/hospitalières/dentaires, formation, location de logement, opérations financières et assurances, cultures sportives à but non lucratif, paris et loteries.

- Pas de TVA appliquée
- Mention : « Prestation exclue du champ TVA (art. 21 LTVA, ch. X) »

### Si tu appliques la méthode forfaitaire SSS

- **Le client n'en sait rien** : tu factures au taux normal applicable (8.1 % ou autre)
- **La différence forfaitaire reste à ton bilan** comme produit
- **Mention sur la facture** : identique à méthode effective

### Si tu offres un escompte

- Mention : « Escompte X % si paiement sous Y jours »
- Au moment du paiement avec escompte, **émettre une note de crédit** pour la différence (correction TVA proportionnelle)

## Langues

Aucune langue obligatoire en Suisse. Pratique courante :

| Canton du client | Langue |
|------------------|--------|
| GE, VD, FR, NE, JU, BE-FR, VS-FR | Français |
| ZH, BE-DE, BS, LU, SG, AG, … | Allemand (ou allemand standard / "Hochdeutsch") |
| TI | Italien |
| GR | Italien, allemand, romanche (au choix selon zone) |
| Étranger | Anglais ou langue du client si tu la pratiques |

**Astuce** : pour un client suisse alémanique, écrire en allemand standard. Le suisse-allemand (Schweizerdeutsch) n'est pas une langue d'affaires écrite.

## Format des montants

Convention suisse :
- **Apostrophe pour les milliers** : `1'000.00`
- **Point comme séparateur décimal** : `1'000.00`, pas `1.000,00`
- **Centimes obligatoires** : `100.00`, pas `100.-`
- **Devise** : préfixée et espace insécable, `CHF 1'000.00` (pas `1'000.00 CHF`)

Exceptions :
- Si la facture est en français pour un client français/belge, accepter `1 000,00 EUR` (formats locaux)
- Pour l'allemand standard, idem suisse : `1'000.00 CHF`

## Numérotation séquentielle (OTVA art. 26)

**Obligation** : numérotation continue sans saut. L'AFC peut demander la justification d'un saut (facture annulée, erreur). En cas de saut non documenté → présomption de facture cachée → rappel d'impôt.

**Formats acceptables** :
- `INV-2025-001` (réinitialisation annuelle)
- `2025/001`
- `00001` (continu pluriannuel)
- `<entité>-<année>-<n>`

**Mauvais** :
- Sauts non documentés
- Réutilisation d'un numéro après annulation (au lieu d'une note de crédit)
- Format aléatoire genre `INV-c2f8a1` (hash) — pas séquentiel donc non conforme

**En cas d'annulation** : émettre une **note de crédit** avec son propre numéro (e.g. `CN-2025-001`) référençant la facture annulée, **pas** réutiliser le numéro de la facture annulée.

## Date d'émission vs date de prestation

OTVA art. 26 al. 2 c et d distinguent les deux dates :

- **Date d'émission** : quand la facture est créée. Détermine le **taux TVA applicable** (si changement de taux comme en 2024).
- **Date de prestation** : quand le service a été rendu. Détermine la **période de TVA** où la facture sera comptabilisée.

Cas particulier méthode **contre-prestations convenues** (la plus courante) : la TVA est due au moment de l'émission, donc l'écart entre les deux dates n'a pas d'impact sur le timing fiscal.

Cas méthode **contre-prestations reçues** (option dans ePortail) : la TVA est due au moment de l'encaissement.

## Description précise

L'AFC scrute la description en cas de contrôle. Bonnes pratiques :

| Mauvais | Bon |
|---------|-----|
| « Services » | « Conseil en organisation — septembre 2025 » |
| « Prestation » | « Développement web — landing page projet X » |
| « Honoraires » | « Honoraires de conseil — 8 h, 15-30 septembre 2025 » |
| « Forfait » | « Forfait mensuel septembre 2025 — pack support » |

**Cas intercompany** : éviter le détail excessif (« 9 prestations distinctes du 1er au 30 ») qui invite à un contrôle prix de transfert. Préférer « Prestations de conseil — septembre 2025 ». Le détail va dans la convention de prestations.

## Modalités de paiement (recommandé)

- **IBAN** au format CH avec espaces tous les 4 caractères : `CH93 0076 2011 6238 5295 7`
- **Nom de la banque**
- **Bénéficiaire** si différent de l'émetteur de la facture (rare)
- **Référence** si QR-IBAN : code QRR 27 chiffres
- **Terme** : « 30 jours net » par défaut. Pour clients dignes de confiance : 14 jours. Pour gros clients : 60 jours.
- **Pénalité de retard** : pas obligatoire en Suisse (intérêt moratoire = 5 % par défaut LCD). Mentionner si tu veux un taux différent.

## Retention

CO 958f : conservation 10 ans à compter de la fin de l'exercice. Format acceptable :
- **PDF original** signé électroniquement (idéal, mais non obligatoire)
- **PDF simple** dans un dossier versionné (Git ou stockage write-once)
- **Papier** si tu imprimes (mais double avec une copie numérique)

Une copie dans `~/Dropbox/factures/2025/` n'est pas suffisante (modifiable). Préférer un dossier Git ou un service Cloud avec verrouillage en écriture une fois la facture finalisée.

## Notes de crédit

Pour annuler ou corriger une facture émise :

1. **Émettre une note de crédit** avec son propre numéro séquentiel (`CN-YYYY-NNN`)
2. Référencer la facture annulée : « Annulation de la facture INV-YYYY-NNN »
3. Mêmes mentions légales que la facture (parties, date, description, TVA)
4. **Montant négatif** sur la TVA (récupération de la TVA déclarée)
5. **Dans la comptabilité** : contre-passer l'écriture initiale
6. **Dans la TVA** : ajustement à déclarer au prochain décompte (ou en concordance annuelle)

## Garde-fous

| Risque | Conséquence | Remède |
|--------|-------------|--------|
| Numéro TVA absent alors qu'assujetti | Reprise AFC, TVA due | Toujours valider `from.vatNumber` |
| Mention « TVA non due » sans précision | Confusion + reprise possible | Préciser article LTVA (8, 21, 23, ou « non assujetti art. 10 ») |
| Date de prestation absente | Non conforme OTVA 26 al. 2 d | Toujours renseigner, même si = date d'émission |
| Description vague | Reprise possible si contrôle | Préciser nature + période |
| Saut dans la numérotation | Présomption de facture cachée | Note de crédit pour annulations |
| Facture en EUR sans cours | Concordance TVA impossible | Mention BNS du jour obligatoire (art. 45 OTVA) |
| Facture > CHF 400 sans IDE client | Non conforme | Inclure IDE client (ou demander) |
| Description trop détaillée intercompany | Risque contrôle prix de transfert | Garder concis, mettre détail dans la convention |

## Templates de mentions standardisées

À copier dans le champ `vat.note` ou `footer` du JSON selon le cas :

```
Reverse charge UE B2B:
"Reverse charge — TVA due par le destinataire (Directive 2006/112/CE art. 196)"

Export hors UE:
"Exportation, TVA 0 % (art. 23 LTVA)"

Prestation médicale exclue:
"Prestation exclue du champ TVA (art. 21 al. 2 ch. 3 LTVA)"

Prestation formation exclue:
"Prestation exclue du champ TVA (art. 21 al. 2 ch. 11 LTVA)"

Location de logement exclue:
"Prestation exclue du champ TVA (art. 21 al. 2 ch. 21 LTVA)"

Non assujetti:
"TVA non applicable : entreprise non assujettie au sens de l'art. 10 LTVA"

Facture en devise étrangère:
"Cours appliqué : {currency}/CHF {rate} (BNS, {date}). Équivalent CHF {chfAmount}."

Pénalité de retard standard:
"Intérêt moratoire : 5 % l'an dès l'échéance (art. 104 CO)."
```

## Ressources

- ESTV TVA : https://www.estv.admin.ch/estv/fr/accueil/tva.html
- Info TVA 16 (Facturation et procédure de facturation) : recherche sur estv.admin.ch
- Texte intégral OTVA : https://www.fedlex.admin.ch/eli/cc/2009/615/fr
- Vérificateur IDE : https://www.uid.admin.ch/Search.aspx
- BNS cours de change : https://data.snb.ch/fr
