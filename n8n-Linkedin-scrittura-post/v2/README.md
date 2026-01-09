# n8n LinkedIn Post Generator

Workflow n8n automatizzato per la generazione di post LinkedIn tecnici basati su contenuti da fonti multiple (ArXiv, SerpAPI, Serper). Il sistema implementa un pipeline completo di classificazione, estrazione, scrittura e revisione AI-driven per produrre contenuti LinkedIn allineati a uno stile editoriale specifico.

## Panoramica

Il workflow processa automaticamente articoli tecnici da diverse fonti, li classifica secondo criteri architetturali, estrae il contenuto completo e genera post LinkedIn strutturati seguendo un manuale di stile predefinito. Il sistema include classificazione AI, deduplicazione, estrazione contenuti, scrittura multi-agente e revisione automatica.

## Architettura del Workflow

Il workflow è organizzato in tre flussi principali:

### 1. Flusso di Raccolta Contenuti

**Trigger disponibili:**
- **RSS Feed Trigger (ArXiv CS.AI)**: Monitora il feed RSS di ArXiv per Computer Science - Artificial Intelligence
- **Schedule Trigger (SerpAPI)**: Esegue ricerche giornaliere su SerpAPI alle 5:40
- **Schedule Trigger (Serper)**: Esegue ricerche giornaliere su Serper alle 5:20

**Processo:**
1. Estrazione dati da feed RSS o API di ricerca
2. Normalizzazione URL per deduplicazione
3. Verifica esistenza in database Notion
4. Classificazione AI con filtro confidence >= 0.7
5. Estrazione contenuto completo tramite JINA API
6. Salvataggio in Notion con metadata

### 2. Flusso di Generazione Post

**Trigger:**
- **Schedule Trigger2**: Esegue alle 7:30 per processare articoli selezionati

**Processo:**
1. Recupero articoli con status "Selected" e checkbox "Post Generated" non selezionata
2. Preparazione URL per estrazione JINA
3. Estrazione contenuti multipli
4. Merge contesti con Style Guide injection
5. Scrittura post tramite AI Agent WRITER
6. Revisione tramite AI Agent REVIEWER
7. Humanization tramite AI Agent HUMANIZER
8. Formattazione finale
9. Salvataggio su Notion e Google Drive
10. Notifica Telegram

### 3. Componenti AI Agents

**AI Agent CLASSIFIER:**
- Filtra contenuti secondo criteri architetturali
- Mantiene solo contenuti "Production-Ready"
- Output: `{keep: boolean, reason: string, confidence: number}`

**AI Agent WRITER:**
- Genera post LinkedIn seguendo template predefiniti (A/B/C)
- Applica Style Guide obbligatoria
- Output strutturato JSON con Hook, Corpo, Closing, Hashtag

**AI Agent REVIEWER:**
- Fact-checking contro fonti originali
- Validazione stile secondo Style Guide
- Rimozione deviazioni stilistiche
- Controllo lunghezza (max 2000 caratteri)

**AI Agent HUMANIZER:**
- Applica layer di accessibilità per pubblico non tecnico
- Mantiene autorevolezza tecnica
- Aggiunge bridge narrativi dove necessario

## Prerequisiti

### Servizi Richiesti

- **n8n** (self-hosted o cloud)
- **Notion** (2 database configurati)
- **OpenAI API** (per modelli GPT)
- **JINA API** (per estrazione contenuti)
- **SerpAPI** o **Serper.dev** (per ricerca news)
- **Google Drive** (per archiviazione post)
- **Telegram** (per notifiche)

### Credenziali da Configurare

1. Notion API (2 database)
2. OpenAI API
3. Telegram Bot API
4. Google Drive OAuth2
5. SerpAPI API Key (opzionale, fallback a Serper)
6. Serper.dev API Key

## Configurazione

### 1. Import del Workflow

Importa il file `workflow/Linkedin-Post_v3.json` in n8n.

### 2. Configurazione Credenziali

Configura le seguenti credenziali in n8n:

- **Notion API**: Crea credenziale con token API di Notion
- **OpenAI API**: Aggiungi chiave API OpenAI
- **Telegram Bot**: Crea bot Telegram e aggiungi token
- **Google Drive**: Configura OAuth2 per Google Drive
- **SerpAPI**: Aggiungi API key (opzionale)

### 3. Configurazione Database Notion

**Database 1 - Editoriale:**
Crea un database Notion con le seguenti proprietà:
- `Title` (title)
- `URL` (url)
- `Status` (select): InBox, Selected, Discarded
- `AI Reason` (rich_text)
- `Confidence` (number)
- `Post Generated` (checkbox)

**Database 2 - Post Generati:**
Crea un secondo database con:
- `Titolo Post` (title)
- `Post Finale` (rich_text)
- `Fonti URL` (rich_text)
- `Status` (select): Ready to Publish, Published

### 4. Sostituzione Placeholder

Nel workflow JSON, sostituisci tutti i placeholder `YOUR_*` con i valori reali:

- `YOUR_NOTION_DATABASE_ID_1`: ID del database editoriale
- `YOUR_NOTION_DATABASE_ID_2`: ID del database post generati
- `YOUR_TELEGRAM_CHAT_ID`: Chat ID Telegram per notifiche
- `YOUR_WEBHOOK_ID`: Webhook ID Telegram (se necessario)
- `YOUR_SERPER_API_KEY`: API key Serper.dev
- `YOUR_GOOGLE_DRIVE_FOLDER_ID`: ID cartella Google Drive
- `YOUR_NOTION_CREDENTIAL_ID`: ID credenziale Notion
- `YOUR_TELEGRAM_CREDENTIAL_ID`: ID credenziale Telegram
- `YOUR_OPENAI_CREDENTIAL_ID`: ID credenziale OpenAI
- `YOUR_SERPAPI_CREDENTIAL_ID`: ID credenziale SerpAPI (opzionale)
- `YOUR_GOOGLE_DRIVE_CREDENTIAL_ID`: ID credenziale Google Drive

### 5. Configurazione Modelli OpenAI

Verifica che i nodi AI Agent utilizzino i modelli corretti:
- **CLASSIFIER**: `gpt-5-mini` o equivalente
- **WRITER/REVIEWER/HUMANIZER**: `gpt-5.2` o equivalente

### 6. Configurazione Schedule Triggers

Modifica gli orari dei trigger secondo necessità:
- SerpAPI: 5:40 (riga 506-507)
- Serper: 5:20 (riga 455-456)
- Generazione Post: 7:30 (riga 743-744)
- RSS Feed: 5:00 (riga 66)

## Struttura del Progetto

```
.
├── README.md
├── workflow/
│   ├── Linkedin-Post_v3.json          # Workflow principale
│   └── output/                         # Output di debug/test
│       ├── arxiv/
│       ├── SerpAPI/
│       ├── SERPER/
│       └── wf-scrittura-post/
├── scripts/                            # Script JavaScript riutilizzabili
│   ├── Code-Formatter.js
│   ├── Code-Merger-v2.js
│   ├── crea-oggetto-arxiv.js
│   ├── estrattore-serpapi.js
│   ├── estrattore-serper.js
│   ├── filter2.js
│   ├── normalizeURL.js
│   └── Prepare-URLs-for-JINA.js
├── post-linkedin/                      # Post generati e documentazione stile
│   ├── Gold-Standard-Style-Manual-Stefano-Borgato.md
│   └── ANALISI-STILISTICA-STEFANO-BORGATO.md
├── sviluppo/                          # Documentazione tecnica
│   ├── ANALISI_TECNICA_WORKFLOW.md
│   ├── ARCHITETTURA_POST_GENERATION.md
│   ├── GUIDA_FIX_PREPARE_URLS_JINA.md
│   ├── MODIFICHE_APPLICATE.md
│   ├── MODIFICHE_WORKFLOW_JSON.md
│   ├── RACCOMANDAZIONI_RIEPILOGO.md
│   └── TEST_DATI_NOTION.md
└── screenshot/                        # Screenshot workflow
    └── screenshot-overview.PNG
```

## Componenti Principali

### Nodi di Elaborazione

**Normalize URL:**
Normalizza URL rimuovendo query parameters e trailing slash per deduplicazione robusta.

**Notion Search:**
Verifica esistenza articolo nel database per evitare duplicati.

**Filter1:**
Filtra solo articoli nuovi (non presenti in database).

**Filter2:**
Filtra articoli con `keep=true` e `confidence>=0.7`.

**HTTP JINA / HTTP JINA Loop:**
Estrazione contenuto completo da URL tramite JINA API.

**Code Merger v2:**
Merge contesti multipli in formato strutturato per AI Writer.

**STYLE CONTEXT INJECTOR:**
Inietta Style Guide nel contesto per AI Agents.

**Code Formatter:**
Formatta output JSON degli AI Agents in testo LinkedIn pronto.

### Nodi di Output

**Save to Notion:**
Salva articoli classificati nel database editoriale.

**Save to Notion1:**
Salva post generati nel database post.

**Create file su drive:**
Archivia post completo su Google Drive.

**Send a text message / Send a text message1:**
Invia notifiche Telegram con link Notion.

## Style Guide

Il workflow implementa un manuale di stile specifico definito nel nodo "STYLE CONTEXT INJECTOR". Caratteristiche principali:

- **Mantra**: "L'AI non ha bisogno di prompt migliori. Ha bisogno di Architettura."
- **Pattern Hook**: Manifesto, Dilemma, Numero, Metafora
- **Ritmo**: Alternanza frasi brevi/lunghe
- **Vocabolario**: Termini tecnici in inglese obbligatorio
- **Template**: A (Tool/Stack), B (Paper/Studio), C (Meccanismo tecnico)
- **Emoji funzionali**: Solo emoji con scopo specifico
- **Chiusura**: Domanda tecnica per Architect/Lead

Vedi `post-linkedin/Gold-Standard-Style-Manual-Stefano-Borgato.md` per dettagli completi.

## Utilizzo

### Workflow Automatico

Una volta configurato, il workflow opera automaticamente:

1. **Raccolta**: I trigger schedulati raccolgono nuovi contenuti
2. **Classificazione**: Gli articoli vengono classificati e filtrati
3. **Selezione Manuale**: Seleziona articoli con status "Selected" in Notion
4. **Generazione**: Il workflow schedulato alle 7:30 genera i post
5. **Revisione**: I post vengono salvati in Notion e Google Drive
6. **Notifica**: Ricevi notifica Telegram con link al post

### Workflow Manuale

Puoi eseguire manualmente qualsiasi nodo del workflow per test o debug.

### Monitoraggio

Controlla i log di n8n e le notifiche Telegram per monitorare l'esecuzione. I post generati sono disponibili in:
- Notion (database "Post Generati")
- Google Drive (cartella configurata)
- File locali in `post-linkedin/`

## Troubleshooting

### Errori Comuni

**Credenziali non valide:**
Verifica che tutte le credenziali siano configurate correttamente in n8n.

**Database Notion non trovato:**
Controlla che gli ID database siano corretti e che le credenziali Notion abbiano accesso.

**JINA API error:**
Verifica che gli URL siano validi e accessibili pubblicamente.

**AI Agent error:**
Controlla che i modelli OpenAI siano disponibili e che le API key siano valide.

**Telegram notifica non inviata:**
Verifica chat ID e webhook ID Telegram.

### Debug

I file in `workflow/output/` contengono esempi di output per ogni nodo, utili per debug.

## Personalizzazione

### Modifica Style Guide

Modifica il codice JavaScript nel nodo "STYLE CONTEXT INJECTOR" per adattare lo stile.

### Modifica Template Post

Modifica i prompt degli AI Agent WRITER per cambiare struttura e formato dei post.

### Aggiunta Fonti

Aggiungi nuovi trigger (RSS, API, webhook) e connettili al flusso "Edit Fields".

### Modifica Filtri Classificazione

Modifica il prompt dell'AI Agent CLASSIFIER per cambiare criteri di selezione.

## Note Tecniche

- Il workflow utilizza n8n expressions (`={{ }}`) per data transformation
- I nodi Code utilizzano JavaScript ES6+
- Gli AI Agents utilizzano Structured Output Parser per output JSON validato
- La deduplicazione si basa su normalizzazione URL
- Il workflow supporta esecuzione parallela di più item
- I nodi Aggregate combinano output multipli prima del merge

## Licenza

Questo progetto è fornito come esempio educativo. Adatta secondo le tue necessità.

## Contributi

Per miglioramenti o segnalazione bug, apri una issue o una pull request.

