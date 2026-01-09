# N8N Agents Collection

Raccolta di workflow n8n per automazione e integrazione di processi tramite AI e servizi esterni.

## Panoramica

Questo repository contiene una collezione di agenti n8n progettati per automatizzare attività complesse che combinano:
- Elaborazione di contenuti tramite modelli AI (OpenAI, Google Gemini, Perplexity)
- Integrazione con servizi esterni (Notion, Google Drive, LinkedIn, RSS)
- Trasformazione e pulizia di dati
- Generazione di contenuti strutturati

Ogni agente è autonomo e include:
- File workflow JSON pronto all'importazione in n8n
- Documentazione dettagliata con istruzioni di configurazione
- Script di supporto quando necessario
- Esempi di utilizzo

## Struttura del Repository

Ogni agente è organizzato in una directory dedicata contenente:
- `README.md`: Documentazione completa del workflow
- File workflow JSON: File di importazione per n8n
- `scripts/`: Script JavaScript di supporto (quando necessario)
- `screenshot/`: Immagini di esempio del workflow (quando disponibili)


## Installazione

1. Clona il repository:
```bash
git clone <repository-url>
cd N8N
```

2. Scegli l'agente di interesse e segui le istruzioni nel rispettivo README.md

3. Importa il workflow JSON in n8n:
   - Apri n8n
   - Vai su "Workflows" → "Import from File"
   - Seleziona il file JSON del workflow

4. Configura le credenziali necessarie come indicato nella documentazione di ogni agente

## Utilizzo

Ogni workflow include documentazione specifica per:
- Configurazione iniziale
- Parametri personalizzabili
- Flussi di esecuzione
- Troubleshooting

Consulta il README.md nella directory dell'agente per istruzioni dettagliate.

## Contributi

Ogni agente è progettato per essere facilmente estendibile e personalizzabile. Modifiche e miglioramenti sono benvenuti.

## Licenza

[Specifica la licenza del progetto]

