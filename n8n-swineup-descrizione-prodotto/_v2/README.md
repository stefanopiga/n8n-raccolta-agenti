# N8N Agent - Swineup (_v2) — Dedup per `domain`

Questa versione introduce **deduplicazione della ricerca “cantina” per dominio**: per ogni `domain` viene effettuata **una sola** chiamata a Perplexity per ottenere un profilo della cantina, poi tale profilo viene **riutilizzato** per tutti i vini di quella cantina.

## File

- `N8N-agent-Swineup_dedup-domain.json`: export del workflow aggiornato.

## Cosa cambia rispetto a `_v1`

- **Nuova branch “cantina”**:
  - `Remove Duplicates Domains`: tiene un solo item per `domain`.
  - `Prepare Perplexity Cantina Request` → `Call Perplexity API (Cantina)` → `Extract Cantina Research`: esegue la ricerca cantina e produce `{ domain, cantina_research }`.
  - `Merge Cantina Research`: merge per `domain` in modalità **Enrich Input 1** per arricchire ogni vino con `cantina_research`.

- **Ricerca Perplexity per vino ottimizzata**:
  - il prompt per vino è stato modificato per **non ripetere** la storia della cantina (“Senza ripetere la storia della cantina…”).

- **Prompt LLM arricchito**:
  - il nodo `AI Agent` riceve anche `cantina_research` come input (campo “Profilo Cantina (dedup domain)”).

## Note operative

- La chiave di join è `domain` (match esatto). Se cambi la normalizzazione del `domain`, aggiorna di conseguenza.
- La dedup “cantina” riduce chiamate e token quando più vini condividono lo stesso `domain`.
- Nel nodo `Prepare Perplexity Cantina Request` viene propagato anche `domain` (oltre a `searchQuery`) per poterlo riusare nel parsing.
- Nel nodo `Extract Cantina Research` il codice legge la risposta Perplexity da `$json.body` quando `fullResponse=true` e gira in modalità **Run Once for Each Item**.


