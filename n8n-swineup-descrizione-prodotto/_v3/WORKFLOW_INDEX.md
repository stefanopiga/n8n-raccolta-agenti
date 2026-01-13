# N8N-agent-Swineup_v3 - Indice Strutturale

## Dati Workflow
- **ID**: ePpPeuaYQViKV4PE
- **File**: N8N-agent-Swineup_v3.json
- **Linee totali**: 2078

---

## Mappa Nodi per Funzione

### 1. TRIGGER & CONFIGURAZIONE (linee 3-75)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Manual Trigger | manualTrigger | linee 4-13 | Avvio workflow |
| Workflow Configuration | set | linee 14-75 | Variabili globali: templateSheetName, parentFolderName, outputFolderName, inputFileId, ecc. |

### 2. GESTIONE CARTELLE DRIVE (linee 76-256)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Find Parent Folder | httpRequest | linee 76-111 | Cerca cartella root (YOUR_PARENT_FOLDER_NAME) |
| Extract Parent Folder ID | code | linee 112-121 | Estrae ID cartella padre |
| Check Output Folder Exists | httpRequest | linee 122-153 | Verifica esistenza descrizioni_2026 |
| IF Folder Exists | if | linee 154-183 | Branch condizionale |
| Use Existing Folder | set | linee 184-203 | Usa cartella esistente |
| Create Output Folder | googleDrive | linee 204-231 | Crea cartella se mancante |
| Store Folder ID | set | linee 232-252 | Memorizza outputFolderId |

### 3. SOTTOCARTELLE PRODOTTO (linee 727-856)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Check Product Folder Exists | httpRequest | linee 727-758 | Verifica descrizioni-PRODOTTO |
| IF Product Folder Exists | if | linee 759-788 | Branch condizionale |
| Use Existing Product Folder | set | linee 789-808 | Usa cartella esistente |
| Create Product Folder | googleDrive | linee 809-836 | Crea se mancante |
| Store Product Folder ID | set | linee 837-856 | Memorizza productFolderId |

### 4. SOTTOCARTELLE DOMAIN (linee 857-986)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Check Domain Folder Exists | httpRequest | linee 857-888 | Verifica descrizioni-DOMAIN |
| IF Domain Folder Exists | if | linee 889-918 | Branch condizionale |
| Use Existing Domain Folder | set | linee 919-938 | Usa cartella esistente |
| Create Domain Folder | googleDrive | linee 939-966 | Crea se mancante |
| Store Domain Folder ID | set | linee 967-986 | Memorizza domainFolderId |

### 5. DOWNLOAD & PARSING LISTA VINI (linee 348-466)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Extract File ID | set | linee 348-373 | Prepara ID file Lista_vini.json |
| Download file | googleDrive | linee 374-395 | Scarica JSON da Drive |
| Extract from File | extractFromFile | linee 396-406 | Parsing JSON |
| Estrae primo prodotto | code | linee 457-466 | **Critico**: Estrae vini, passa outputFolderId e productFolderId |

### 6. FILTRO PRODOTTI ESISTENTI (linee 467-545) ⚠️ PROBLEMA QUI
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Get Existing Files | httpRequest | linee 467-498 | Recupera file .md esistenti da descrizioni-PRODOTTO |
| Merge Files Data | merge | linee 509-516 | Combina vini + file esistenti |
| **Filter Existing Files** | **code** | **linee 499-508** | **⚠️ LOGICA CONFRONTO NOMI - PROBLEMA** |
| Check Empty Array | if | linee 517-545 | Verifica se ci sono vini da processare |

### 7. RICERCA CANTINA (DOMAIN DEDUP) (linee 631-726)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Remove Duplicates Domains | removeDuplicates | linee 631-644 | Deduplica per campo domain |
| Prepare Perplexity Cantina Request | set | linee 645-670 | Prepara query ricerca cantina |
| Call Perplexity API (Cantina) | httpRequest | linee 671-700 | Chiama Perplexity per info cantina |
| Extract Cantina Research | code | linee 701-711 | Estrae risposta Perplexity |
| **Merge Cantina Research** | **merge** | **linee 712-726** | **✅ CORRETTO: enrichInput2** |

**Merge Cantina Research - Configurazione**:
- Input 0: cantina_research (domain unici)
- Input 1: prodotti filtrati (tutti i vini)
- joinMode: `enrichInput2` (arricchisce prodotti con cantina_research)

### 8. GENERAZIONE PRODOTTI (linee 253-437, 559-630)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Merge Cantina Research | merge | linee 712-726 | Combina vini + ricerca cantina |
| Split In Batches | splitInBatches | linee 559-565 | Processa 1 vino alla volta |
| Prepare Perplexity Request | set | linee 253-307 | Prepara query ricerca vino |
| Call Perplexity API | httpRequest | linee 308-337 | Ricerca info vino |
| Combine Data | code | linee 338-347 | Combina dati Perplexity + vino |
| AI Agent | agent | linee 586-597 | Genera descrizione HTML |
| OpenAI Chat Model | lmChatOpenAi | linee 609-630 | Modello GPT-5-mini |
| Combine AI Output | code | linee 598-607 | Combina output AI + dati vino |
| Pulizia+Formattazione Testo | code | linee 576-585 | Pulisce HTML, genera nome file |
| Create file from text | googleDrive | linee 407-437 | Salva .md su Drive |
| Prepare Final Message | code | linee 566-575 | Messaggio riepilogo prodotti |

### 9. GENERAZIONE DOMAIN (linee 987-1159)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Get Existing Domain Files | httpRequest | linee 987-1018 | Recupera file domain esistenti |
| Merge Domain Files Data | merge | linee 1019-1026 | Combina domain + file esistenti |
| Filter Existing Domain Files | code | linee 1027-1036 | Filtra domain già generati |
| Check Empty Array (Domain) | if | linee 1037-1066 | Verifica se ci sono domain da processare |
| Split In Batches (Domain) | splitInBatches | linee 1067-1076 | Processa 1 domain alla volta |
| AI Agent (Domain) | agent | linee 1077-1088 | Genera descrizione domain |
| Combine Domain AI Output | code | linee 1089-1098 | Combina output AI |
| Pulizia+Formattazione Testo (Domain) | code | linee 1099-1108 | Pulisce HTML domain |
| Create file from text (Domain) | googleDrive | linee 1109-1139 | Salva domain .md |
| Prepare Final Message (Domain) | code | linee 1140-1149 | Messaggio riepilogo domain |

### 10. RIEPILOGO & TELEGRAM (linee 1160-1189)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Set Product Summary | code | linee 1160-1169 | Normalizza output prodotti |
| Set Domain Summary | code | linee 1170-1179 | Normalizza output domain |
| Merge Summaries | merge | linee 1288-1300 | Combina prodotti + domain |
| Compose Telegram Message | code | linee 1180-1189 | Compone messaggio finale |
| messaggio Telegram WF completo | telegram | linee 438-456 | Invia notifica Telegram |

---

## ✅ PROBLEMI RISOLTI

### 1. Nodo: Filter Existing Files - Confronto chiavi base

**Problema originale**:
Il confronto includeva annata e litraggio nel nome file, causando duplicati.

**Soluzione applicata**:
Confronto basato su **chiave base** (domain + nome_vino), ignorando varianti di annata/litraggio.

---

### 2. Nodo: Filter Existing Files / Filter Existing Domain Files - Flusso bloccato

**Problema originale** (FIX 2026-01-13):
Quando tutti i file esistevano già, i nodi restituivano `return []` (array vuoto).
In n8n, questo significa "nessun output", quindi il flusso si **bloccava** e il messaggio Telegram non veniva mai inviato.

**Soluzione applicata**:
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

**Nodi Check Empty Array aggiornati**:
Ora verificano `!$input.all()[0].json.isEmpty` invece di `$input.all().length > 0`.

**Nodi Prepare Empty Message aggiornati**:
Ora usano i file esistenti passati direttamente dall'input, con fallback su Get Existing Files.

**Risultato**: Anche quando tutti i file esistono già, il workflow:
1. Continua fino al messaggio Telegram
2. Mostra l'elenco completo dei file già presenti nelle cartelle

---

## CONNECTIONS (linee 1350-2063)
Mappa delle connessioni tra nodi per tracciare il flusso.

---

## VARIABILI CONFIGURAZIONE (linee 16-65)
| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| templateSheetName | template_descrizione_PRODOTTO | Template prodotti |
| templateDomainName | template_descrizione_DOMAIN | Template domain |
| parentFolderName | YOUR_PARENT_FOLDER_NAME | Cartella root Drive |
| outputFolderName | descrizioni_2026 | Cartella output |
| domainDescriptionsFolderName | descrizioni-DOMAIN | Sottocartella domain |
| ProductDescriptionsFolderName | descrizioni-PRODOTTO | Sottocartella prodotti |
| perplexityModel | sonar-pro | Modello Perplexity |
| inputFileId | YOUR_GOOGLE_DRIVE_FILE_ID | ID file Lista_vini.json |

---

## CREDENTIALS UTILIZZATE
| Servizio | ID | Nome |
|----------|-----|------|
| Google Drive | YOUR_GOOGLE_DRIVE_CREDENTIAL_ID | Google Drive account |
| Perplexity | YOUR_PERPLEXITY_CREDENTIAL_ID | Perplexity account 2 |
| OpenAI | YOUR_OPENAI_CREDENTIAL_ID | OpenAi account |
| Telegram | YOUR_TELEGRAM_CREDENTIAL_ID | Telegram account |

