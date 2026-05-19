# swiss-accounting

2 AI skills pour la comptabilité PME suisse (Sàrl/GmbH/SA/RI) :

- **swiss-accounting-hledger** — Tenir ses livres en hledger (plain-text, Git-versionable), conforme au CO 957-963. Couvre le setup, le plan comptable KMU, les opérations quotidiennes (ventes, achats, salaires AVS/AI/APG/AC/LPP/LAA), la TVA (méthode effective + forfaitaire SSS), et la clôture annuelle (amortissements AFC, provisions, bilan + PP + annexe).
- **swiss-accounting-invoice** — Générer des factures PDF conformes (CO 957a, OTVA art. 26) avec QR-facture suisse optionnelle. Multi-langue FR/DE/IT/EN, multi-devises avec mention BNS, taux séparés 8.1 %/2.6 %/3.8 %/0 %, reverse charge UE, export 0 %.

Conçu pour le fondateur ou la fondatrice qui tient ses propres livres et veut un système reproductible, exportable vers une fiduciaire pour la déclaration fiscale.

## Installation

C'est un **bundle payant** — l'accès est gating par licence achetée sur [gosuper.ai](https://gosuper.ai).

Après réception de ton lien de licence, dans Claude Code ou Claude Desktop :

```
/plugin marketplace add gosuper.ai/m/<ta-clé>
/plugin install swiss-accounting@gosuper
```

Puis redémarrer Claude. Les skills se chargent automatiquement quand tu poses une question de compta suisse (TVA, salaires, écritures, facture, QR-bill, etc.).

## Prérequis

```bash
# Tenue de comptes
brew install hledger

# Génération de factures (PDF + QR-bill optionnel)
brew install node
npm install puppeteer swissqrbill
```

## Support

hello@gosuper.ai
