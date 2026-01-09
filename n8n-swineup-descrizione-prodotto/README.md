# N8N Agent - Swineup

Workflow n8n per la generazione automatica di descrizioni tecniche ed emozionali di vini utilizzando AI.

## Descrizione

Il workflow automatizza la creazione di descrizioni professionali per vini, combinando:
- Ricerche approfondite tramite Perplexity AI
- Generazione di contenuti strutturati tramite OpenAI GPT-5.2
- Gestione file su Google Drive

## Funzionalità

- Lettura automatica di una lista vini da Google Drive (file JSON)
- Ricerca approfondita per ogni vino su:
  - Storia della cantina e filosofia produttiva
  - Caratteristiche tecniche (vitigni, affinamento, dosaggio, solfiti)
  - Note degustative (colore, bouquet, palato)
  - Abbinamenti gastronomici
  - Occasioni sociali ideali
- Generazione di descrizioni HTML strutturate seguendo un template predefinito
- Salvataggio automatico dei file generati su Google Drive in cartelle organizzate per data

## Struttura del Workflow

1. **Manual Trigger**: Avvio manuale del workflow
2. **Workflow Configuration**: Impostazione parametri (nomi fogli, cartelle, modello AI)
3. **Create Output Folder**: Creazione cartella di output su Google Drive con timestamp
4. **Download file**: Download del file JSON con la lista vini da Google Drive
5. **Extract from File**: Estrazione dati dal file JSON
6. **Code in JavaScript**: Conversione array vini in items separati
7. **Prepare Perplexity Request**: Preparazione query di ricerca per ogni vino
8. **Call Perplexity API**: Chiamata API Perplexity per ricerca approfondita
9. **Message a model**: Generazione descrizione HTML tramite GPT-5.2
10. **Code in JavaScript1**: Pulizia e formattazione HTML generato
11. **Create file from text**: Salvataggio file markdown su Google Drive

## Configurazione

### Credenziali Richieste

**Nota**: Il file JSON fornito ha i dati sensibili rimossi per sicurezza. Prima di utilizzare il workflow, configura:

- **Google Drive OAuth2 API**: Accesso a Google Drive per lettura/scrittura file
  - Configura le credenziali in n8n e inserisci l'ID credenziale nei nodi Google Drive
- **Perplexity API**: Chiave API per ricerche approfondite
  - Configura le credenziali in n8n e inserisci l'ID credenziale nel nodo HTTP Request
- **OpenAI API**: Chiave API per generazione contenuti
  - Configura le credenziali in n8n e inserisci l'ID credenziale nel nodo OpenAI

**Configurazione aggiuntiva richiesta**:
- File ID Google Drive per il file `Lista_vini.json` (nodo "Download file")
- Folder ID Google Drive per la cartella di output (nodo "Create file from text" e codice JavaScript)

### Parametri Configurabili

- `inputSheetName`: Nome del foglio con i prodotti da definire (default: "Prodotti da definire")
- `templateSheetName`: Nome del foglio template (default: "template_descrizione")
- `outputFolderName`: Nome cartella output (default: formato timestamp `Wine_Descriptions_YYYY-MM-DD_HHmmss`)
- `perplexityModel`: Modello Perplexity da utilizzare (default: "sonar-pro")

### File di Input

Il workflow si aspetta un file JSON su Google Drive con la seguente struttura:

```json
{
  "data": [
    {
      "domain": "Nome Cantina",
      "nome_vino": "Nome Vino",
      "anno": "2020",
      "litraggio": "750ml"
    }
  ]
}
```

## Template di Output

Le descrizioni generate seguono una struttura HTML predefinita:

1. **Titolo**: Nome Cantina - Nome Vino Anno
2. **Introduzione**: Descrizione vitigno, lieu-dit e filosofia produttiva
3. **Tecnica**: Dettagli fermentazione, legno, lieviti, solfiti
4. **Esame Organolettico**: Vista, Bouquet, Palato, Equilibrio
5. **Sintesi**: Identità territoriale ed eleganza
6. **IDEALE PER**: 5 occasioni sociali
7. **ABBINAMENTI GASTRONOMICI**: 5 abbinamenti precisi
8. **Frase evocativa**: Chiusura poetica in corsivo

## Installazione

1. Importa il file `N8N-agent-Swineup.json` in n8n
2. Configura le credenziali richieste:
   - Google Drive OAuth2
   - Perplexity API
   - OpenAI API
3. Verifica che il file JSON con la lista vini sia accessibile su Google Drive
4. Esegui il workflow tramite il trigger manuale

## Utilizzo

1. Clicca sul nodo "Manual Trigger" per avviare il workflow
2. Il workflow processerà automaticamente tutti i vini presenti nel file JSON
3. I file generati verranno salvati nella cartella Google Drive creata automaticamente

## Note Tecniche

- Il workflow utilizza il modello GPT-5.2 di OpenAI per la generazione dei contenuti
- La temperatura è impostata a 0.2 per garantire coerenza e precisione
- Perplexity API è configurato con `return_citations: true` per tracciabilità delle fonti
- I file generati sono in formato Markdown (.md) con struttura HTML incorporata

