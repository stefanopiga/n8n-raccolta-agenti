# N8N Workflow - Generazione Descrizioni Vini Swineup v4

Workflow automatizzato per la generazione di descrizioni tecniche ed emozionali di vini e produttori, con supporto multilingua (ITA/ENG) e integrazione di API di ricerca avanzate.

## Panoramica

Il workflow genera automaticamente descrizioni HTML strutturate per:
- **Prodotti**: Descrizioni dettagliate di singoli vini
- **Domain**: Descrizioni dei produttori/cantine

Ogni descrizione viene generata in italiano e tradotta automaticamente in inglese, salvata in cartelle separate su Google Drive.

## Caratteristiche Principali

### 🌍 Supporto Multilingua
- Generazione automatica di versioni ITA e ENG
- Traduzione automatica tramite Google Translate
- Struttura cartelle separata per lingua

### 🔍 Ricerca Avanzata
- **Perplexity AI**: Ricerca primaria per informazioni su vini e cantine
- **Tavily API**: Fallback automatico in caso di errori Perplexity
- Deduplicazione intelligente per ottimizzare le chiamate API

### 📁 Gestione Cartelle Automatica
- Creazione automatica della struttura cartelle se non esiste
- Organizzazione gerarchica:
  ```
  descrizioni_2026/
  ├── ITA/
  │   ├── descrizioni-PRODOTTO/
  │   └── descrizioni-DOMAIN/
  └── ENG/
      ├── descrizioni-PRODOTTO/
      └── descrizioni-DOMAIN/
  ```

### 🚫 Prevenzione Duplicati
- Controllo automatico dei file esistenti
- Filtraggio intelligente basato su chiave prodotto (domain + nome_vino)
- Gestione corretta dei casi in cui tutti i file esistono già

### 📊 Notifiche Telegram
- Riepilogo completo dell'esecuzione
- Elenco file creati e file già esistenti
- Notifica anche quando nessun nuovo file viene generato

## Struttura del Workflow

### 1. Configurazione Iniziale
- **Manual Trigger**: Avvio manuale del workflow
- **Workflow Configuration**: Impostazione variabili globali

### 2. Setup Struttura Drive
- Ricerca e creazione cartella root (`descrizioni_2026`)
- Creazione sottocartelle ITA e ENG
- Creazione sottocartelle PRODOTTO e DOMAIN per ogni lingua

### 3. Download e Parsing Dati
- Download file `Lista_vini.json` da Google Drive
- Estrazione e validazione prodotti
- Preparazione dati per elaborazione

### 4. Filtro Prodotti Esistenti
- Recupero file `.md` esistenti dalla cartella PRODOTTO
- Confronto basato su chiave prodotto (domain + nome_vino)
- Filtraggio prodotti già processati

### 5. Ricerca Informazioni Cantina
- Deduplicazione domain unici
- Ricerca informazioni cantina tramite Perplexity
- Fallback automatico su Tavily in caso di errore
- Merge risultati con dati prodotti

### 6. Generazione Descrizioni Prodotti
- Loop sequenziale per ogni prodotto
- Ricerca informazioni vino (Perplexity/Tavily)
- Generazione HTML tramite AI Agent (GPT-5-mini)
- Pulizia e formattazione testo
- Salvataggio file `.md` in cartella ITA
- Traduzione automatica e salvataggio in cartella ENG

### 7. Generazione Descrizioni Domain
- Filtro domain già processati
- Loop sequenziale per ogni domain
- Generazione descrizione cantina tramite AI Agent
- Salvataggio file `DOMINIO.md` in cartella ITA
- Traduzione automatica e salvataggio in cartella ENG

### 8. Riepilogo e Notifica
- Aggregazione risultati prodotti e domain
- Composizione messaggio Telegram
- Invio notifica finale

## Configurazione

**⚠️ IMPORTANTE**: Prima di utilizzare questo workflow, è necessario configurare tutti i placeholder con i propri valori:

1. **API Key Tavily**: Sostituire `YOUR_TAVILY_API_KEY_HERE` nel file JSON (nodi "Call Tavily API")
2. **Credenziali n8n**: Configurare le credenziali in n8n e sostituire gli ID placeholder nel file JSON:
   - `YOUR_GOOGLE_DRIVE_CREDENTIAL_ID`
   - `YOUR_PERPLEXITY_CREDENTIAL_ID`
   - `YOUR_OPENAI_CREDENTIAL_ID`
   - `YOUR_TELEGRAM_CREDENTIAL_ID`
   - `YOUR_GOOGLE_TRANSLATE_CREDENTIAL_ID`
3. **File ID Google Drive**: Sostituire `YOUR_GOOGLE_DRIVE_FILE_ID` con l'ID del file `Lista_vini.json`
4. **Nome cartella**: Sostituire `YOUR_PARENT_FOLDER_NAME` con il nome della cartella root su Google Drive

### Variabili Workflow

Configurare nel nodo **Workflow Configuration**:

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `templateSheetName` | `template_descrizione_PRODOTTO` | Nome template prodotti |
| `templateDomainName` | `template_descrizione_DOMAIN` | Nome template domain |
| `parentFolderName` | `YOUR_PARENT_FOLDER_NAME` | Cartella root Drive |
| `outputFolderName` | `descrizioni_2026` | Cartella output principale |
| `domainDescriptionsFolderName` | `descrizioni-DOMAIN` | Nome cartella domain |
| `ProductDescriptionsFolderName` | `descrizioni-PRODOTTO` | Nome cartella prodotti |
| `perplexityModel` | `sonar-pro` | Modello Perplexity |
| `inputFileId` | `YOUR_GOOGLE_DRIVE_FILE_ID` | ID file Lista_vini.json |
| `itaFolderName` | `ITA` | Nome cartella italiano |
| `engFolderName` | `ENG` | Nome cartella inglese |

### Credenziali Richieste

| Servizio | Tipo | Utilizzo |
|----------|------|----------|
| Google Drive | OAuth2 | Lettura/scrittura file e cartelle |
| Perplexity AI | API Key | Ricerca informazioni vini e cantine |
| Tavily | API Key | Fallback ricerca (configurare nel workflow) |
| OpenAI | API Key | Generazione descrizioni tramite GPT-5-mini |
| Google Translate | OAuth2 | Traduzione automatica ITA→ENG |
| Telegram | Bot Token | Invio notifiche |

### Formato File Input

Il file `Lista_vini.json` deve contenere un array di oggetti con la seguente struttura:

```json
[
  {
    "domain": "nome-cantina",
    "nome_vino": "nome-vino",
    "anno": "2020",
    "litraggio": "0.75",
    "categoria": "Rosso"
  }
]
```

**Campi obbligatori**: `domain`, `nome_vino`

## Struttura Output

### File Prodotti
- **Formato nome**: `{domain}_{nome_vino}_{anno}_{litraggio}.md`
- **Esempio**: `cantina-rossi_barbera_2020_0.75.md`
- **Contenuto**: HTML strutturato con descrizione tecnica ed emozionale

### File Domain
- **Formato nome**: `{domain}.md`
- **Esempio**: `cantina-rossi.md`
- **Contenuto**: HTML strutturato con descrizione della cantina

## Gestione Errori

### Fallback API
Il workflow implementa un sistema di fallback robusto:
1. Tentativo ricerca con Perplexity
2. Verifica status risposta (errori 401/402)
3. Fallback automatico su Tavily se Perplexity fallisce
4. Normalizzazione risposta Tavily per compatibilità

### Gestione File Esistenti
- Quando tutti i file esistono già, il workflow:
  - Non si blocca
  - Continua fino alla notifica Telegram
  - Mostra elenco completo file esistenti

### Validazione Dati
- Controllo campi obbligatori per ogni prodotto
- Validazione struttura JSON input
- Gestione errori con messaggi descrittivi

## Limitazioni e Note

1. **API Tavily**: La chiave API deve essere configurata nel workflow. Sostituire `YOUR_TAVILY_API_KEY_HERE` con la propria chiave API. Per produzione, considerare l'uso di credenziali n8n.

2. **Rate Limiting**: 
   - Perplexity: Gestire limiti API secondo piano sottoscritto
   - OpenAI: Monitorare utilizzo token GPT-5-mini
   - Google Translate: Rispettare quota giornaliera

3. **Dimensione Batch**: Il workflow processa 1 prodotto/domain alla volta per garantire stabilità.

4. **Traduzione**: Google Translate può non preservare perfettamente la formattazione HTML complessa.

## Troubleshooting

### Workflow si blocca
- Verificare che tutte le cartelle necessarie esistano o possano essere create
- Controllare credenziali Google Drive
- Verificare formato file `Lista_vini.json`

### Errori Perplexity
- Verificare credenziali API
- Controllare quota disponibile
- Il workflow usa automaticamente Tavily come fallback

### File non creati
- Verificare permessi Google Drive
- Controllare che i prodotti abbiano `domain` e `nome_vino` validi
- Verificare che le cartelle di destinazione esistano

### Traduzione non funziona
- Verificare credenziali Google Translate
- Controllare quota API Translate
- Verificare formato HTML generato

## Changelog v4

### Nuove Funzionalità
- ✅ Supporto multilingua ITA/ENG
- ✅ Traduzione automatica con Google Translate
- ✅ Fallback API Tavily per Perplexity
- ✅ Struttura cartelle multilingua
- ✅ Gestione migliorata errori API

### Miglioramenti
- ✅ Gestione corretta casi "tutti file esistenti"
- ✅ Normalizzazione risposte API fallback
- ✅ Validazione dati migliorata
- ✅ Messaggi Telegram più informativi

## Supporto

Per problemi o domande:
1. Verificare log esecuzione workflow in n8n
2. Controllare messaggi Telegram per dettagli errori
3. Verificare configurazione credenziali e variabili

