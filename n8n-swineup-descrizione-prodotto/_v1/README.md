# N8N Agent - Swineup

Workflow n8n per la generazione automatica di descrizioni tecniche ed emozionali di vini utilizzando AI.

## Descrizione

Il workflow automatizza la creazione di descrizioni professionali per vini, combinando:
- Ricerche approfondite tramite Perplexity AI
- Generazione di contenuti strutturati tramite OpenAI GPT-5-mini
- Gestione file su Google Drive
- Elaborazione sequenziale di vini con controllo duplicati

## Funzionalità

- Lettura automatica di una lista vini da Google Drive (file JSON identificato tramite file ID)
- Ricerca approfondita per ogni vino su:
  - Storia della cantina e filosofia produttiva
  - Caratteristiche tecniche (vitigni, affinamento, dosaggio, solfiti)
  - Note degustative (colore, bouquet, palato)
  - Abbinamenti gastronomici (5 abbinamenti precisi)
  - Occasioni sociali ideali (5 occasioni)
- Generazione di descrizioni HTML strutturate seguendo un template predefinito
- Salvataggio automatico dei file generati su Google Drive in cartelle organizzate
- Controllo automatico dei file esistenti per evitare duplicati
- Notifiche Telegram al completamento

## Struttura del Workflow

### Fase 1: Setup e Configurazione

1. **Manual Trigger**: Avvio manuale del workflow
2. **Workflow Configuration**: Impostazione parametri configurabili:
   - `templateSheetName`: Nome del foglio template (default: "template_descrizione")
   - `parentFolderName`: Nome della cartella padre su Google Drive (default: "YOUR_PARENT_FOLDER_NAME")
   - `outputFolderName`: Nome cartella output (default: "Descrizioni_2026")
   - `perplexityModel`: Modello Perplexity da utilizzare (default: "sonar-pro")
   - `inputFileId`: ID del file Google Drive contenente la lista vini (default: "YOUR_GOOGLE_DRIVE_FILE_ID")
3. **Find Parent Folder**: Ricerca della cartella padre su Google Drive tramite nome nella root
4. **Extract Parent Folder ID**: Estrazione ID cartella padre dalla risposta API con validazione
5. **Check Output Folder Exists**: Verifica esistenza cartella di output nella cartella padre
6. **IF Folder Exists**: Condizione per gestire cartella esistente vs nuova
   - **Use Existing Folder**: Utilizza cartella esistente (ramo TRUE) - estrae ID dalla risposta
   - **Create Output Folder**: Crea nuova cartella (ramo FALSE) - crea cartella con nome configurato
7. **Store Folder ID**: Memorizza l'ID della cartella di output per uso successivo

### Fase 2: Caricamento e Preparazione Dati

8. **Extract File ID**: Estrazione ID file dalla configurazione (inputFileId)
9. **Download file**: Download del file JSON da Google Drive tramite file ID
10. **Extract from File**: Estrazione e parsing dati dal file JSON
11. **Estrae primo prodotto**: 
    - Validazione e parsing dei dati (supporta array diretto o oggetto con campo "data")
    - Validazione campi obbligatori (domain, nome_vino)
    - Conversione array vini in items separati (uno per ogni vino)
    - Aggiunta dell'ID cartella di output a ogni vino
12. **Get Existing Files**: Recupero lista file markdown già presenti nella cartella di output (eseguito in parallelo)
13. **Merge Files Data**: Merge dei dati vini con i file esistenti
14. **Filter Existing Files**: 
    - Filtraggio vini escludendo quelli con file già generati
    - Genera nome file atteso per ogni vino: `{domain}_{nome_vino}_{anno}_{litraggio}.md`
    - Confronta con i nomi file esistenti (case-insensitive)
    - Restituisce solo i vini da processare
15. **Check Empty Array**: Verifica se ci sono vini da processare
    - **TRUE**: Procede con l'elaborazione → Split In Batches
    - **FALSE**: Tutti i vini già processati → Prepare Empty Message

### Fase 3: Elaborazione Batch

16. **Split In Batches**: Divisione degli items in batch per elaborazione sequenziale
    - `batchSize`: 1 (un vino per batch)
    - Output "done": quando tutti i batch sono completati → Prepare Final Message
    - Output "data": per ogni batch → Prepare Perplexity Request

### Fase 4: Generazione Descrizioni (per ogni vino)

17. **Prepare Perplexity Request**: Preparazione query di ricerca per ogni vino
    - Estrae: cantina (domain), nome_vino, annata, categoria (litraggio)
    - Genera query di ricerca strutturata con 5 punti specifici
18. **Call Perplexity API**: Chiamata API Perplexity per ricerca approfondita
    - Endpoint: `https://api.perplexity.ai/chat/completions`
    - Model: configurabile (default: "sonar-pro")
    - Temperature: 0.2
    - Return citations: true
19. **Combine Data**: Combinazione dati Perplexity con dati del vino
    - Mantiene struttura risposta Perplexity
    - Aggiunge oggetto `vino` con: domain, nome_vino, anno, litraggio, outputFolderId
20. **AI Agent**: Generazione descrizione HTML tramite OpenAI seguendo template strutturato
    - Model: OpenAI GPT-5-mini
    - Prompt strutturato con template HTML rigido
    - Input: dati vino + ricerca Perplexity
21. **OpenAI Chat Model**: Modello AI utilizzato da AI Agent (gpt-5-mini)
22. **Combine AI Output**: Combinazione output AI con dati del vino
    - Recupera dati vino dal nodo Combine Data
    - Mantiene output AI e aggiunge dati vino
23. **Pulizia+Formattazione Testo**: 
    - Estrae testo HTML dall'output AI (gestisce diverse strutture)
    - Rimuove tag strutturali pesanti (DOCTYPE, html, head, body, meta, title)
    - Genera nome file: `{domain}_{nome_vino}_{anno}_{litraggio}.md`
    - Prepara dati per il salvataggio: nome_file, contenuto_md, folder_id
24. **Create file from text**: Salvataggio file markdown su Google Drive
    - Nome file: generato dal nodo precedente
    - Contenuto: HTML pulito
    - Cartella: ID dalla configurazione
    - Loop: torna a Split In Batches per processare il prossimo batch

### Fase 5: Completamento

25. **Prepare Final Message**: Preparazione messaggio finale con riepilogo file creati
    - Recupera tutti i vini processati dal nodo Filter Existing Files
    - Genera lista nomi file creati
    - Formatta messaggio con emoji e struttura leggibile
26. **Prepare Empty Message**: Preparazione messaggio quando tutti i vini sono già processati
    - Messaggio informativo senza lista file
27. **messaggio Telegram WF completo**: Invio notifica Telegram con riepilogo finale
    - Chat ID: YOUR_TELEGRAM_CHAT_ID
    - Messaggio: riepilogo file creati o messaggio vuoto

## Configurazione

### Credenziali Richieste

Il workflow richiede le seguenti credenziali configurate in n8n:

- **Google Drive OAuth2 API**: Accesso a Google Drive per lettura/scrittura file
  - Credential ID utilizzato: "YOUR_GOOGLE_DRIVE_CREDENTIAL_ID"
  - Permessi richiesti: lettura e scrittura file/cartelle
- **Perplexity API**: Chiave API per ricerche approfondite
  - Credential ID utilizzato: "YOUR_PERPLEXITY_CREDENTIAL_ID"
  - Endpoint: `https://api.perplexity.ai/chat/completions`
- **OpenAI API**: Chiave API per generazione contenuti
  - Credential ID utilizzato: "YOUR_OPENAI_CREDENTIAL_ID"
  - Model utilizzato: gpt-5-mini
- **Telegram API**: Token bot Telegram per notifiche
  - Credential ID utilizzato: "YOUR_TELEGRAM_CREDENTIAL_ID"
  - Chat ID: YOUR_TELEGRAM_CHAT_ID

### Parametri Configurabili

Tutti i parametri sono configurabili nel nodo "Workflow Configuration":

- `templateSheetName`: Nome del foglio template (default: "template_descrizione")
- `parentFolderName`: Nome della cartella padre su Google Drive (default: "YOUR_PARENT_FOLDER_NAME")
  - La cartella deve esistere nella root del Drive
- `outputFolderName`: Nome cartella output (default: "Descrizioni_2026")
  - Viene creata nella cartella padre se non esiste
- `perplexityModel`: Modello Perplexity da utilizzare (default: "sonar-pro")
- `inputFileId`: ID del file Google Drive contenente la lista vini (default: "YOUR_GOOGLE_DRIVE_FILE_ID")
  - Il file deve essere accessibile con le credenziali Google Drive configurate

### File di Input

Il workflow si aspetta un file JSON su Google Drive identificato tramite `inputFileId`.

**Formato supportato - Array diretto:**
```json
[
  {
    "domain": "Chateau-La-Gontelle",
    "nome_vino": "Cotes-de-Bordeaux",
    "anno": "2021",
    "litraggio": "0.75L"
  }
]
```

**Formato supportato - Oggetto con campo data:**
```json
{
  "data": [
    {
      "domain": "Chateau-La-Gontelle",
      "nome_vino": "Cotes-de-Bordeaux",
      "anno": "2021",
      "litraggio": "0.75L"
    }
  ]
}
```

**Campi obbligatori per ogni vino:**
- `domain`: Nome della cantina (obbligatorio)
- `nome_vino`: Nome del vino (obbligatorio)

**Campi opzionali:**
- `anno`: Anno di produzione (stringa, es. "2021")
- `litraggio`: Formato della bottiglia (stringa, es. "0.75L", "1.5L")

**Formato nome file generato:**
I file vengono salvati con il formato: `{domain}_{nome_vino}_{anno}_{litraggio}.md`
- Se `anno` è vuoto o assente, viene omesso dal nome file
- Se `litraggio` è vuoto o assente, viene omesso dal nome file
- Esempio: `chateau-la-gontelle_cotes-de-bordeaux_2021_0.75l.md`
- Il nome viene convertito in lowercase per il confronto con i file esistenti

## Template di Output

Le descrizioni generate seguono una struttura HTML predefinita definita nel prompt dell'AI Agent:

1. **Titolo**: `<h2>[Nome Cantina] - [Nome Vino] [Anno]</h2>`

2. **Introduzione**: `<p><strong>[Nome Vino]</strong> nasce da... [Descrizione vitigno, lieu-dit e filosofia produttiva]</p>`

3. **Tecnica**: `<p>[Dettagli fermentazione, uso del legno, permanenza sui lieviti e gestione dei solfiti]</p>`

4. **Esame Organolettico**: 4 paragrafi `<p>` distinti che iniziano con:
   - (Vista)
   - (Bouquet)
   - (Palato)
   - (Equilibrio e Potenziale di invecchiamento)

5. **Sintesi**: `<p>[Paragrafo che riassume l'identità territoriale e l'eleganza del prodotto]</p>`

6. **IDEALE PER**: `<h3>🎁 IDEALE PER:</h3>` seguito da 5 punti elenco nel formato:
   ```html
   <p>✨ <span style="color: inherit; font-size: 1rem;">[Testo breve e accattivante]</span></p>
   ```

7. **ABBINAMENTI GASTRONOMICI**: `<h3>🎁 ABBINAMENTI GASTRONOMICI:</h3>` seguito da 5 punti elenco nello stesso formato

8. **Frase evocativa**: `<p><em>[Frase poetica e magnetica personalizzata per il vino, senza virgolette, in corsivo]</em></p>`
   - Deve essere l'ULTIMO paragrafo del documento
   - Posizionato dopo l'ultimo punto elenco degli abbinamenti
   - Paragrafo unico, senza virgolette, interamente in corsivo

**Note sul template:**
- Il template è definito nel nodo "AI Agent" tramite prompt strutturato
- I dati di input provengono da Perplexity API (ricerca tecnica) e dai dati del vino (domain, nome_vino, anno, litraggio)
- Il template richiede rigorosamente l'ordine specificato sopra
- La frase evocativa finale è obbligatoria e deve essere in corsivo senza virgolette
- Non vengono aggiunti tag `<html>` o `<body>` - solo contenuto HTML interno

## Installazione

1. Importa il file `N8N-agent-Swineup.json` in n8n
2. Configura le credenziali richieste:
   - Google Drive OAuth2 API (ID: "YOUR_GOOGLE_DRIVE_CREDENTIAL_ID")
   - Perplexity API (ID: "YOUR_PERPLEXITY_CREDENTIAL_ID")
   - OpenAI API (ID: "YOUR_OPENAI_CREDENTIAL_ID")
   - Telegram API (ID: "YOUR_TELEGRAM_CREDENTIAL_ID", opzionale per notifiche)
3. Verifica che il file JSON con la lista vini sia accessibile su Google Drive e aggiorna `inputFileId` se necessario
4. Verifica che la cartella padre (`parentFolderName`) esista nella root del Drive
5. Configura i parametri nel nodo "Workflow Configuration" se necessario
6. Esegui il workflow tramite il trigger manuale

## Utilizzo

1. Clicca sul nodo "Manual Trigger" per avviare il workflow
2. Il workflow processerà automaticamente **tutti i vini** presenti nel file JSON
3. I vini vengono processati sequenzialmente in batch di 1 (configurabile nel nodo Split In Batches)
4. I file generati verranno salvati nella cartella Google Drive specificata (`outputFolderName`)
5. I vini con file già esistenti vengono automaticamente saltati
6. Al termine dell'elaborazione, riceverai una notifica Telegram con il riepilogo dei file creati
7. Se tutti i vini hanno già i file generati, riceverai un messaggio informativo

## Note Tecniche

- Il workflow utilizza **OpenAI GPT-5-mini** per la generazione dei contenuti
- Perplexity API è configurato con `return_citations: true` per tracciabilità delle fonti
- I file generati sono in formato Markdown (.md) con struttura HTML incorporata
- **Elaborazione sequenziale**: Il workflow processa un vino alla volta (batchSize: 1)
- **Gestione duplicati**: Il workflow controlla automaticamente i file esistenti confrontando i nomi file
- **Gestione errori**: Il workflow valida i dati di input e ignora i vini con campi obbligatori mancanti
- **Notifiche**: Il messaggio Telegram viene inviato solo al termine dell'elaborazione di tutti i vini, con un riepilogo completo
- **Pulizia HTML**: Il workflow rimuove tag strutturali pesanti (DOCTYPE, html, head, body) mantenendo la formattazione interna

## Architettura del Flusso

Il workflow utilizza un pattern di elaborazione batch con loop:

```
Manual Trigger
  → Workflow Configuration
    → Setup Cartelle (Find/Create)
      → Store Folder ID
        → Download File JSON (parallelo con Get Existing Files)
          → Parse e Validazione
            → Merge con File Esistenti
              → Filter Duplicati
                → Check Empty Array
                  → Split In Batches (loop)
                    → Per ogni vino:
                      → Perplexity Research
                        → AI Generation
                          → Clean & Format
                            → Save to Drive
                              → Loop al prossimo batch
                  → Prepare Final Message
                    → Telegram Notification
```

## Gestione Errori

Il workflow include validazioni in diversi punti:

- **Extract Parent Folder ID**: Verifica esistenza cartella padre, genera errore se non trovata
- **Estrae primo prodotto**: Valida formato JSON e campi obbligatori, ignora vini non validi
- **Filter Existing Files**: Gestisce array vuoto restituendo array vuoto (gestito da Check Empty Array)
- **Pulizia+Formattazione Testo**: Gestisce diverse strutture di output AI con fallback
- **Combine AI Output**: Recupera dati vino con fallback se non presenti nell'item corrente

## Limitazioni

- Il workflow processa i vini sequenzialmente (batchSize: 1) - per elaborazione parallela modificare il parametro `batchSize` nel nodo Split In Batches
- Il controllo duplicati si basa sul nome file - se il formato del nome cambia, i duplicati potrebbero non essere rilevati
- Le notifiche Telegram vengono inviate solo al completamento - non ci sono notifiche intermedie per batch grandi
- Il workflow non gestisce retry automatici per chiamate API fallite
