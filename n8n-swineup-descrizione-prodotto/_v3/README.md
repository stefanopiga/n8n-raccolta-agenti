# N8N Agent - Swineup (_v3) — Generazione Descrizioni Prodotto e Domain

Workflow n8n per la generazione automatica di descrizioni tecniche ed emozionali di vini e cantine utilizzando AI. Questa versione introduce la generazione separata di descrizioni per **prodotti** e **domain** (cantine), con gestione avanzata di duplicati e flussi condizionali.

## File

- `N8N-agent-Swineup_v3.json`: Export del workflow completo
- `WORKFLOW_INDEX.md`: Indice strutturale dettagliato dei nodi
- `README.md`: Questa documentazione

---

## Cosa cambia rispetto a `_v2`

### Nuove funzionalità

1. **Generazione separata Domain (Cantine)**
   - Nuova sezione dedicata alla generazione di descrizioni per le cantine
   - File salvati nella sottocartella `descrizioni-DOMAIN` con formato `{domain}.md`
   - Ricerca cantina deduplicata per `domain` (una sola chiamata Perplexity per cantina)
   - Filtro automatico dei domain già generati

2. **Struttura cartelle gerarchica**
   - Cartella root: `descrizioni_2026`
   - Sottocartella prodotti: `descrizioni-PRODOTTO`
   - Sottocartella domain: `descrizioni-DOMAIN`
   - Creazione automatica delle cartelle se non esistenti

3. **Filtro duplicati migliorato**
   - Confronto basato su **chiave base** (`domain` + `nome_vino`)
   - Ignora varianti di annata e litraggio nel confronto
   - Evita duplicati quando lo stesso vino ha varianti di formato

4. **Gestione flusso vuoto**
   - Fix critico: quando tutti i file esistono già, il workflow continua fino al messaggio Telegram
   - Restituzione di item con flag `isEmpty: true` invece di array vuoto
   - Messaggio Telegram mostra sempre l'elenco completo dei file esistenti

5. **Riepilogo unificato**
   - Messaggio Telegram finale combina riepilogo prodotti e domain
   - Formattazione strutturata con conteggi separati

---

## Architettura del Workflow

### Flusso generale

```
Manual Trigger
  → Workflow Configuration
    → Setup Cartelle Root (Find/Create)
      → Setup Sottocartella PRODOTTO
        → Setup Sottocartella DOMAIN
          → Download File JSON (parallelo con Get Existing Files)
            → Parse e Validazione
              → Deduplica Domain per Ricerca Cantina
                → Ricerca Cantina (Perplexity)
                  → Merge Cantina Research con Vini
                    → Filter Duplicati Prodotti
                      → Generazione Prodotti (loop)
                        → Generazione Domain (loop)
                          → Riepilogo Unificato
                            → Telegram Notification
```

### Fasi dettagliate

#### 1. TRIGGER & CONFIGURAZIONE

**Nodi:**
- `Manual Trigger`: Avvio manuale del workflow
- `Workflow Configuration`: Impostazione variabili globali

**Variabili configurabili:**
- `templateSheetName`: `template_descrizione_PRODOTTO`
- `templateDomainName`: `template_descrizione_DOMAIN`
- `parentFolderName`: `YOUR_PARENT_FOLDER_NAME`
- `outputFolderName`: `descrizioni_2026`
- `domainDescriptionsFolderName`: `descrizioni-DOMAIN`
- `ProductDescriptionsFolderName`: `descrizioni-PRODOTTO`
- `perplexityModel`: `sonar-pro`
- `inputFileId`: ID file Google Drive con lista vini

#### 2. GESTIONE CARTELLE DRIVE

**Cartella Root (`descrizioni_2026`):**
- `Find Parent Folder`: Cerca cartella `YOUR_PARENT_FOLDER_NAME` nella root
- `Extract Parent Folder ID`: Estrae ID con validazione
- `Check Output Folder Exists`: Verifica esistenza `descrizioni_2026`
- `IF Folder Exists`: Branch condizionale
  - TRUE → `Use Existing Folder`: Usa cartella esistente
  - FALSE → `Create Output Folder`: Crea nuova cartella
- `Store Folder ID`: Memorizza `outputFolderId`

**Sottocartella PRODOTTO (`descrizioni-PRODOTTO`):**
- `Check Product Folder Exists`: Verifica esistenza nella cartella root
- `IF Product Folder Exists`: Branch condizionale
  - TRUE → `Use Existing Product Folder`
  - FALSE → `Create Product Folder`
- `Store Product Folder ID`: Memorizza `productFolderId`

**Sottocartella DOMAIN (`descrizioni-DOMAIN`):**
- `Check Domain Folder Exists`: Verifica esistenza nella cartella root
- `IF Domain Folder Exists`: Branch condizionale
  - TRUE → `Use Existing Domain Folder`
  - FALSE → `Create Domain Folder`
- `Store Domain Folder ID`: Memorizza `domainFolderId`

#### 3. DOWNLOAD & PARSING LISTA VINI

**Nodi:**
- `Extract File ID`: Prepara ID file `Lista_vini.json`
- `Download file`: Scarica JSON da Google Drive
- `Extract from File`: Parsing JSON
- `Estrae primo prodotto`: 
  - Validazione formato (supporta array diretto o oggetto con campo `data`)
  - Validazione campi obbligatori (`domain`, `nome_vino`)
  - Conversione in items separati (uno per vino)
  - Aggiunta `outputFolderId` e `productFolderId` a ogni vino

**Formato JSON supportato:**

```json
[
  {
    "domain": "Agrapart-et-Fils",
    "nome_vino": "Minéral",
    "anno": "2021",
    "litraggio": "0.75L"
  }
]
```

Oppure:

```json
{
  "data": [
    {
      "domain": "Agrapart-et-Fils",
      "nome_vino": "Minéral",
      "anno": "",
      "litraggio": "0.75L"
    }
  ]
}
```

#### 4. RICERCA CANTINA (DOMAIN DEDUP)

**Nodi:**
- `Remove Duplicates Domains`: Deduplica per campo `domain` (mantiene un solo item per cantina)
- `Prepare Perplexity Cantina Request`: Prepara query ricerca cantina con 5 punti specifici:
  1. Storia della cantina e filosofia produttiva
  2. Approccio in vigna (bio/biodinamica, rese, parcelle)
  3. Approccio in cantina (fermentazioni, legni, affinamenti tipici)
  4. Stile dei vini e tratti distintivi
  5. Terroir e zona di riferimento
- `Call Perplexity API (Cantina)`: Chiamata API Perplexity
  - Endpoint: `https://api.perplexity.ai/chat/completions`
  - Model: configurabile (default: `sonar-pro`)
  - Temperature: `0.2`
  - Return citations: `true`
- `Extract Cantina Research`: Estrae risposta Perplexity
- `Merge Cantina Research`: Merge per `domain` in modalità **Enrich Input 2**
  - Input 0: cantina_research (domain unici)
  - Input 1: prodotti filtrati (tutti i vini)
  - Join mode: `enrichInput2` (arricchisce prodotti con cantina_research)

**Risultato:** Ogni vino riceve il campo `cantina_research` con le informazioni della cantina.

#### 5. FILTRO PRODOTTI ESISTENTI

**Nodi:**
- `Get Existing Files`: Recupera file `.md` esistenti da `descrizioni-PRODOTTO`
- `Merge Files Data`: Combina vini + file esistenti (nodo disabilitato, merge implicito)
- `Filter Existing Files`: 
  - **Logica confronto:** Basata su **chiave base** (`domain` + `nome_vino`)
  - Ignora varianti di annata (`_2021`, `_2022`, ecc.)
  - Ignora varianti di litraggio (`_0.75L`, `_1.5L`, `_magnum`, ecc.)
  - Estrae chiave base dai nomi file esistenti
  - Confronta con chiave base dei vini
  - **Fix:** Se nessun vino da processare, restituisce item con `isEmpty: true` e lista file esistenti
- `Check Empty Array`: Verifica `!$input.all()[0].json.isEmpty`
  - TRUE → Procede con generazione → `Split In Batches`
  - FALSE → Tutti i vini già processati → `Prepare Empty Message`

**Esempio confronto:**
- File esistente: `agrapart-et-fils_mineral_2021_0.75l.md`
- Chiave base estratta: `agrapart-et-fils_mineral`
- Vino nuovo: `{ domain: "Agrapart-et-Fils", nome_vino: "Minéral", anno: "2022", litraggio: "1.5L" }`
- Chiave base vino: `agrapart-et-fils_mineral`
- **Risultato:** Vino già esistente, skip

#### 6. GENERAZIONE PRODOTTI

**Nodi:**
- `Split In Batches`: Processa 1 vino alla volta (`batchSize: 1`)
  - Output "done": quando tutti i batch completati → `Prepare Final Message`
  - Output "data": per ogni batch → `Prepare Perplexity Request`
- `Prepare Perplexity Request`: Prepara query ricerca vino
  - Estrae: cantina (domain), nome_vino, annata, categoria (litraggio)
  - Genera query con 5 punti specifici (senza ripetere storia cantina)
- `Call Perplexity API`: Chiamata API Perplexity per ricerca vino
- `Combine Data`: Combina dati Perplexity + dati vino + cantina_research
- `AI Agent`: Genera descrizione HTML seguendo template strutturato
  - Model: OpenAI GPT-5-mini
  - Input: dati vino + ricerca Perplexity + cantina_research
- `OpenAI Chat Model`: Modello AI (gpt-5-mini)
- `Combine AI Output`: Combina output AI + dati vino
- `Pulizia+Formattazione Testo`: 
  - Estrae HTML dall'output AI
  - Rimuove tag strutturali (DOCTYPE, html, head, body, meta, title)
  - Genera nome file: `{domain}_{nome_vino}_{anno}_{litraggio}.md`
- `Create file from text`: Salva `.md` su Google Drive nella cartella `descrizioni-PRODOTTO`
- Loop: torna a `Split In Batches` per il prossimo batch

**Template HTML prodotto:**

1. **Titolo**: `<h2>[Nome Cantina] - [Nome Vino] [Anno]</h2>`
2. **Introduzione**: `<p><strong>[Nome Vino]</strong> nasce da...`
3. **Tecnica**: `<p>[Dettagli fermentazione, legno, lieviti, solfiti]</p>`
4. **Esame Organolettico**: 4 paragrafi distinti:
   - (Vista)
   - (Bouquet)
   - (Palato)
   - (Equilibrio e Potenziale di invecchiamento)
5. **Sintesi**: `<p>[Identità territoriale e eleganza]</p>`
6. **IDEALE PER**: `<h3>🎁 IDEALE PER:</h3>` + 5 punti elenco
7. **ABBINAMENTI GASTRONOMICI**: `<h3>🎁 ABBINAMENTI GASTRONOMICI:</h3>` + 5 punti elenco
8. **Frase evocativa**: `<p><em>[Frase poetica in corsivo, ultimo paragrafo]</em></p>`

#### 7. GENERAZIONE DOMAIN

**Nodi:**
- `Get Existing Domain Files`: Recupera file `.md` esistenti da `descrizioni-DOMAIN`
- `Merge Domain Files Data`: Combina domain + file esistenti
- `Filter Existing Domain Files`: 
  - Filtra domain già generati (confronta `{domain}.md`)
  - **Fix:** Se nessun domain da processare, restituisce item con `isEmpty: true`
- `Check Empty Array (Domain)`: Verifica `!$input.all()[0].json.isEmpty`
  - TRUE → Procede con generazione
  - FALSE → Tutti i domain già processati → `Prepare Empty Message (Domain)`
- `Split In Batches (Domain)`: Processa 1 domain alla volta
- `AI Agent (Domain)`: Genera descrizione domain seguendo template
  - Input: `domain` + `cantina_research`
- `Combine Domain AI Output`: Combina output AI
- `Pulizia+Formattazione Testo (Domain)`: Pulisce HTML, genera nome file `{domain}.md`
- `Create file from text (Domain)`: Salva `.md` su Google Drive nella cartella `descrizioni-DOMAIN`
- `Prepare Final Message (Domain)`: Messaggio riepilogo domain

**Template HTML domain:**
- Profilo completo della cantina basato su `cantina_research`
- Struttura simile al template prodotto ma focalizzata sulla cantina

#### 8. RIEPILOGO & TELEGRAM

**Nodi:**
- `Set Product Summary`: Normalizza output prodotti
- `Set Domain Summary`: Normalizza output domain
- `Merge Summaries`: Combina prodotti + domain
- `Compose Telegram Message`: Compone messaggio finale strutturato
- `messaggio Telegram WF completo`: Invia notifica Telegram
  - Chat ID: `YOUR_TELEGRAM_CHAT_ID`
  - Messaggio: riepilogo prodotti + domain con conteggi separati

**Formato messaggio Telegram:**

```
✅ Workflow completato

📦 PRODOTTI:
- Generati: X file
- Già esistenti: Y file
[Lista file generati]

🏛️ DOMAIN:
- Generati: X file
- Già esistenti: Y file
[Lista file generati]
```

---

## Configurazione

### Credenziali Richieste

Il workflow richiede le seguenti credenziali configurate in n8n:

| Servizio | Credential ID | Nome | Utilizzo |
|----------|---------------|------|----------|
| Google Drive OAuth2 API | `YOUR_GOOGLE_DRIVE_CREDENTIAL_ID` | Google Drive account | Lettura/scrittura file e cartelle |
| Perplexity API | `YOUR_PERPLEXITY_CREDENTIAL_ID` | Perplexity account 2 | Ricerche approfondite vini e cantine |
| OpenAI API | `YOUR_OPENAI_CREDENTIAL_ID` | OpenAi account | Generazione contenuti (gpt-5-mini) |
| Telegram API | `YOUR_TELEGRAM_CREDENTIAL_ID` | Telegram account | Notifiche completamento workflow |

### Parametri Configurabili

Tutti i parametri sono configurabili nel nodo `Workflow Configuration`:

| Variabile | Valore Default | Descrizione |
|-----------|----------------|-------------|
| `templateSheetName` | `template_descrizione_PRODOTTO` | Nome template prodotti |
| `templateDomainName` | `template_descrizione_DOMAIN` | Nome template domain |
| `parentFolderName` | `YOUR_PARENT_FOLDER_NAME` | Cartella root Drive (deve esistere nella root) |
| `outputFolderName` | `descrizioni_2026` | Cartella output principale |
| `domainDescriptionsFolderName` | `descrizioni-DOMAIN` | Sottocartella domain |
| `ProductDescriptionsFolderName` | `descrizioni-PRODOTTO` | Sottocartella prodotti |
| `perplexityModel` | `sonar-pro` | Modello Perplexity da utilizzare |
| `inputFileId` | `YOUR_GOOGLE_DRIVE_FILE_ID` | ID file Google Drive con lista vini |

### File di Input

Il workflow si aspetta un file JSON su Google Drive identificato tramite `inputFileId`.

**Campi obbligatori per ogni vino:**
- `domain`: Nome della cantina (obbligatorio)
- `nome_vino`: Nome del vino (obbligatorio)

**Campi opzionali:**
- `anno`: Anno di produzione (stringa, es. `"2021"`)
- `litraggio`: Formato della bottiglia (stringa, es. `"0.75L"`, `"1.5L"`)

**Formato nome file generato:**

**Prodotti:** `{domain}_{nome_vino}_{anno}_{litraggio}.md`
- Se `anno` è vuoto o assente, viene omesso
- Se `litraggio` è vuoto o assente, viene omesso
- Esempio: `agrapart-et-fils_mineral_2021_0.75l.md`
- Il nome viene convertito in lowercase

**Domain:** `{domain}.md`
- Esempio: `agrapart-et-fils.md`

---

## Problemi Risolti

### 1. Filter Existing Files - Confronto chiavi base

**Problema originale:**
Il confronto includeva annata e litraggio nel nome file, causando duplicati quando lo stesso vino aveva varianti di formato.

**Soluzione applicata:**
Confronto basato su **chiave base** (`domain` + `nome_vino`), ignorando varianti di annata/litraggio.

**Esempio:**
- File esistente: `chateau-la-gontelle_cotes-de-bordeaux_2021_0.75l.md`
- Vino nuovo: `{ domain: "Chateau-La-Gontelle", nome_vino: "Cotes-de-Bordeaux", anno: "2022", litraggio: "1.5L" }`
- **Risultato:** Vino già esistente (stessa chiave base), skip

### 2. Filter Existing Files / Filter Existing Domain Files - Flusso bloccato

**Problema originale (FIX 2026-01-13):**
Quando tutti i file esistevano già, i nodi restituivano `return []` (array vuoto). In n8n, questo significa "nessun output", quindi il flusso si **bloccava** e il messaggio Telegram non veniva mai inviato.

**Soluzione applicata:**
Invece di restituire `[]`, ora restituiscono un item con flag `isEmpty: true` e l'elenco dei file esistenti:

```javascript
// Prima (BUG):
if (viniDaProcessare.length === 0) {
  return [];  // ← BLOCCAVA IL FLUSSO
}

// Dopo (FIX):
if (viniDaProcessare.length === 0) {
  return [{ json: { 
    isEmpty: true, 
    existingFiles: existingFilesArray.map(f => f.name),
    existingFilesCount: existingFilesArray.length
  } }];
}
```

**Nodi Check Empty Array aggiornati:**
Ora verificano `!$input.all()[0].json.isEmpty` invece di `$input.all().length > 0`.

**Nodi Prepare Empty Message aggiornati:**
Ora usano i file esistenti passati direttamente dall'input, con fallback su Get Existing Files.

**Risultato:** Anche quando tutti i file esistono già, il workflow:
1. Continua fino al messaggio Telegram
2. Mostra l'elenco completo dei file già presenti nelle cartelle

---

## Installazione

1. Importa il file `N8N-agent-Swineup_v3.json` in n8n
2. Configura le credenziali richieste:
   - Google Drive OAuth2 API (ID: `YOUR_GOOGLE_DRIVE_CREDENTIAL_ID`)
   - Perplexity API (ID: `YOUR_PERPLEXITY_CREDENTIAL_ID`)
   - OpenAI API (ID: `YOUR_OPENAI_CREDENTIAL_ID`)
   - Telegram API (ID: `YOUR_TELEGRAM_CREDENTIAL_ID`, opzionale per notifiche)
3. Verifica che il file JSON con la lista vini sia accessibile su Google Drive e aggiorna `inputFileId` se necessario
4. Verifica che la cartella padre (`parentFolderName`) esista nella root del Drive
5. Configura i parametri nel nodo `Workflow Configuration` se necessario
6. Esegui il workflow tramite il trigger manuale

---

## Utilizzo

1. Clicca sul nodo `Manual Trigger` per avviare il workflow
2. Il workflow processerà automaticamente **tutti i vini** presenti nel file JSON
3. **Fase 1 - Ricerca Cantina:** Per ogni `domain` unico viene effettuata una ricerca Perplexity
4. **Fase 2 - Generazione Prodotti:** I vini vengono processati sequenzialmente in batch di 1
   - I vini con file già esistenti vengono automaticamente saltati (confronto chiave base)
   - Ogni vino riceve le informazioni della cantina dal merge
5. **Fase 3 - Generazione Domain:** I domain vengono processati sequenzialmente
   - I domain con file già esistenti vengono automaticamente saltati
6. I file generati verranno salvati nelle cartelle Google Drive specificate:
   - Prodotti: `descrizioni_2026/descrizioni-PRODOTTO/`
   - Domain: `descrizioni_2026/descrizioni-DOMAIN/`
7. Al termine dell'elaborazione, riceverai una notifica Telegram con il riepilogo completo
8. Se tutti i file esistono già, riceverai un messaggio informativo con l'elenco dei file esistenti

---

## Note Tecniche

### Elaborazione

- **Elaborazione sequenziale:** Il workflow processa un vino/domain alla volta (`batchSize: 1`)
- **Deduplicazione cantina:** Una sola chiamata Perplexity per `domain`, riutilizzata per tutti i vini della cantina
- **Gestione duplicati:** Confronto basato su chiave base (`domain` + `nome_vino`) per prodotti, `domain` per domain
- **Gestione errori:** Validazione dati di input, ignora vini con campi obbligatori mancanti
- **Flusso continuo:** Anche quando tutti i file esistono già, il workflow continua fino al messaggio Telegram

### API e Modelli

- **Perplexity API:** 
  - Model: configurabile (default: `sonar-pro`)
  - Temperature: `0.2`
  - Return citations: `true`
  - Due chiamate separate: una per cantina (dedup), una per vino
- **OpenAI API:**
  - Model: `gpt-5-mini`
  - Utilizzato tramite nodo `AI Agent` per generazione contenuti
- **Google Drive API:**
  - Utilizzato per lettura file JSON, creazione cartelle, salvataggio file `.md`
- **Telegram API:**
  - Notifica finale con riepilogo prodotti e domain

### Formato File

- **File generati:** Markdown (`.md`) con struttura HTML incorporata
- **Pulizia HTML:** Rimozione tag strutturali pesanti (DOCTYPE, html, head, body, meta, title)
- **Naming convention:**
  - Prodotti: `{domain}_{nome_vino}_{anno}_{litraggio}.md` (lowercase)
  - Domain: `{domain}.md` (lowercase)

### Architettura Flusso

Il workflow utilizza un pattern di elaborazione batch con loop:

```
Setup Cartelle
  → Download & Parse JSON
    → Deduplica Domain
      → Ricerca Cantina (Perplexity)
        → Merge Cantina Research
          → Filter Duplicati Prodotti
            → Split In Batches (loop prodotti)
              → Per ogni vino:
                → Perplexity Research Vino
                  → AI Generation
                    → Clean & Format
                      → Save to Drive
                        → Loop al prossimo batch
            → Filter Duplicati Domain
              → Split In Batches (loop domain)
                → Per ogni domain:
                  → AI Generation
                    → Clean & Format
                      → Save to Drive
                        → Loop al prossimo batch
          → Merge Summaries
            → Telegram Notification
```

---

## Limitazioni

- **Elaborazione sequenziale:** I vini vengono processati uno alla volta (`batchSize: 1`) - per elaborazione parallela modificare il parametro `batchSize` nel nodo `Split In Batches`
- **Controllo duplicati:** Basato sul nome file - se il formato del nome cambia, i duplicati potrebbero non essere rilevati
- **Notifiche:** Le notifiche Telegram vengono inviate solo al completamento - non ci sono notifiche intermedie per batch grandi
- **Retry:** Il workflow non gestisce retry automatici per chiamate API fallite
- **Template:** I template HTML sono hardcoded nel prompt dell'AI Agent - modifiche richiedono aggiornamento del nodo

---

## Troubleshooting

### Cartella padre non trovata

**Errore:** `Cartella padre "YOUR_PARENT_FOLDER_NAME" non trovata nel Drive`

**Soluzione:** Verifica che la cartella `YOUR_PARENT_FOLDER_NAME` esista nella root del Drive con le credenziali configurate.

### File JSON non valido

**Errore:** `Dati JSON non validi: formato non riconosciuto`

**Soluzione:** Verifica che il file JSON abbia il formato corretto (array diretto o oggetto con campo `data`) e che ogni vino abbia almeno `domain` e `nome_vino`.

### ID cartella non trovato

**Errore:** `ID cartella di output non trovato`

**Soluzione:** Verifica che le cartelle siano state create correttamente. Il workflow crea automaticamente le cartelle se non esistono.

### Nessun vino valido

**Errore:** `Nessun vino valido trovato dopo la validazione`

**Soluzione:** Verifica che almeno un vino nel JSON abbia i campi obbligatori `domain` e `nome_vino`.

### Flusso bloccato

**Sintomo:** Il workflow si ferma senza inviare il messaggio Telegram

**Soluzione:** Verifica che i nodi `Filter Existing Files` e `Filter Existing Domain Files` restituiscano sempre almeno un item (anche con `isEmpty: true`). Questo è stato fixato nella versione _v3.

---

## Changelog

### Versione _v3 (2026-01-13)

- ✅ Aggiunta generazione separata descrizioni domain (cantine)
- ✅ Struttura cartelle gerarchica (root → PRODOTTO → DOMAIN)
- ✅ Filtro duplicati migliorato (confronto chiave base)
- ✅ Fix flusso bloccato quando tutti i file esistono già
- ✅ Riepilogo unificato prodotti + domain nel messaggio Telegram
- ✅ Deduplicazione ricerca cantina per ottimizzazione chiamate API

### Versione _v2

- ✅ Deduplicazione ricerca cantina per `domain`
- ✅ Merge cantina research con vini in modalità Enrich Input 1
- ✅ Prompt ottimizzato per evitare ripetizione storia cantina

### Versione _v1

- ✅ Generazione descrizioni prodotti
- ✅ Ricerca Perplexity per ogni vino
- ✅ Template HTML strutturato
- ✅ Gestione file esistenti
- ✅ Notifiche Telegram

---

## Riferimenti

- `WORKFLOW_INDEX.md`: Indice strutturale dettagliato dei nodi con posizioni JSON
- `Lista_vini.json`: Esempio formato file di input
- Versioni precedenti: `_v1/`, `_v2/` per confronto funzionalità

