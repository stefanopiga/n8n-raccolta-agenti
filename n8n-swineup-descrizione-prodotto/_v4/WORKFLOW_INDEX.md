# N8N-agent-Swineup_v4 - Indice Strutturale

## Dati Workflow
- **ID**: pzfpHQ9LMAqVWwlo
- **File**: N8N-agent-Swineup_v4.json
- **Linee totali**: 3905
- **Versione**: 4.0

---

## Mappa Nodi per Funzione

### 1. TRIGGER & CONFIGURAZIONE (linee 3-93)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Manual Trigger | manualTrigger | linee 4-16 | Avvio workflow |
| Workflow Configuration | set | linee 17-93 | Variabili globali: templateSheetName, templateDomainName, parentFolderName, outputFolderName, inputFileId, itaFolderName, engFolderName, ecc. |

### 2. GESTIONE CARTELLE DRIVE ROOT (linee 94-284)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Find Parent Folder | httpRequest | linee 94-132 | Cerca cartella root (parentFolderName) |
| Extract Parent Folder ID | code | linee 133-145 | Estrae ID cartella padre |
| Check Output Folder Exists | httpRequest | linee 146-180 | Verifica esistenza descrizioni_2026 |
| IF Folder Exists | if | linee 181-207 | Branch condizionale |
| Use Existing Folder | set | linee 208-230 | Usa cartella esistente |
| Create Output Folder | googleDrive | linee 231-255 | Crea cartella se mancante |
| Store Folder ID | set | linee 256-284 | Memorizza outputFolderId |

### 3. GESTIONE CARTELLE ITA/ENG (linee 1660-1940)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Check ITA Folder Exists | httpRequest | linee 1660-1694 | Verifica esistenza cartella ITA |
| IF ITA Folder Exists | if | linee 1695-1825 | Branch condizionale |
| Use Existing ITA Folder | set | linee 1826-1848 | Usa cartella ITA esistente |
| Create ITA Folder | googleDrive | linee 1849-1873 | Crea cartella ITA se mancante |
| Store ITA Folder ID | set | linee 1874-1796 | Memorizza itaFolderId |
| Check ENG Folder Exists | httpRequest | linee 1825-1859 | Verifica esistenza cartella ENG |
| IF ENG Folder Exists | if | linee 1860-1890 | Branch condizionale |
| Use Existing ENG Folder | set | linee 1891-1913 | Usa cartella ENG esistente |
| Create ENG Folder | googleDrive | linee 1914-1938 | Crea cartella ENG se mancante |
| Store ENG Folder ID | set | linee 1939-1940 | Memorizza engFolderId |

### 4. SOTTOCARTELLE PRODOTTO ITA (linee 846-990)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Check Product Folder Exists | httpRequest | linee 846-880 | Verifica descrizioni-PRODOTTO in ITA |
| IF Product Folder Exists | if | linee 881-913 | Branch condizionale |
| Use Existing Product Folder | set | linee 914-936 | Usa cartella esistente |
| Create Product Folder | googleDrive | linee 937-967 | Crea se mancante |
| Store Product Folder ID | set | linee 968-990 | Memorizza productFolderId |

### 5. SOTTOCARTELLE DOMAIN ITA (linee 991-1135)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Check Domain Folder Exists | httpRequest | linee 991-1025 | Verifica descrizioni-DOMAIN in ITA |
| IF Domain Folder Exists | if | linee 1026-1058 | Branch condizionale |
| Use Existing Domain Folder | set | linee 1059-1081 | Usa cartella esistente |
| Create Domain Folder | googleDrive | linee 1082-1112 | Crea se mancante |
| Store Domain Folder ID | set | linee 1113-1135 | Memorizza domainFolderId |

### 6. SOTTOCARTELLE PRODOTTO ENG (linee 1969-2092)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Check ENG Product Folder Exists | httpRequest | linee 1969-2015 | Verifica descrizioni-PRODOTTO in ENG |
| IF ENG Product Folder Exists | if | linee 2007-2015 | Branch condizionale |
| Use Existing ENG Product Folder | set | linee 2016-2038 | Usa cartella esistente |
| Create ENG Product Folder | googleDrive | linee 2039-2069 | Crea se mancante |
| Store ENG Product Folder ID | set | linee 2070-2092 | Memorizza engProductFolderId |

### 7. SOTTOCARTELLE DOMAIN ENG (linee 2113-2237)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Check ENG Domain Folder Exists | httpRequest | linee 2113-2127 | Verifica descrizioni-DOMAIN in ENG |
| IF ENG Domain Folder Exists | if | linee 2128-2160 | Branch condizionale |
| Use Existing ENG Domain Folder | set | linee 2161-2183 | Usa cartella esistente |
| Create ENG Domain Folder | googleDrive | linee 2184-2214 | Crea se mancante |
| Store ENG Domain Folder ID | set | linee 2215-2237 | Memorizza engDomainFolderId |

### 8. DOWNLOAD & PARSING LISTA VINI (linee 418-533)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Extract File ID | set | linee 418-443 | Prepara ID file Lista_vini.json |
| Download file | googleDrive | linee 443-463 | Scarica JSON da Drive |
| Extract from File | extractFromFile | linee 463-469 | Parsing JSON |
| Estrae primo prodotto | code | linee 521-533 | Estrae vini, passa outputFolderId |

### 9. FILTRO PRODOTTI ESISTENTI (linee 534-625)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Get Existing Files | httpRequest | linee 534-568 | Recupera file .md esistenti da descrizioni-PRODOTTO |
| Merge Files Data | merge | linee 582-592 | Combina vini + file esistenti |
| Filter Existing Files | code | linee 569-581 | Filtra prodotti già esistenti (chiave: domain + nome_vino) |
| Check Empty Array | if | linee 593-625 | Verifica se ci sono vini da processare |

### 10. RICERCA CANTINA (DOMAIN DEDUP) (linee 734-845)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Remove Duplicates Domains | removeDuplicates | linee 734-750 | Deduplica per campo domain |
| Prepare Perplexity Cantina Request | set | linee 751-779 | Prepara query ricerca cantina |
| Call Perplexity API (Cantina) | httpRequest | linee 780-813 | Chiama Perplexity per info cantina |
| Check Perplexity Cantina Status | if | linee 2547-2555 | Verifica status risposta Perplexity |
| Call Tavily API (Cantina Fallback) | httpRequest | linee 2599-2641 | Fallback Tavily se Perplexity fallisce |
| Normalize Tavily Cantina Response | code | linee 2642-2667 | Normalizza risposta Tavily |
| Merge Cantina Results | merge | linee 2679-2689 | Combina risultati Perplexity/Tavily |
| Extract Cantina Research | code | linee 814-827 | Estrae risposta ricerca cantina |
| Merge Cantina Research | merge | linee 828-845 | Arricchisce prodotti con cantina_research (enrichInput2) |

**Merge Cantina Research - Configurazione**:
- Input 0: cantina_research (domain unici)
- Input 1: prodotti filtrati (tutti i vini)
- joinMode: `enrichInput2` (arricchisce prodotti con cantina_research)

### 11. GENERAZIONE PRODOTTI (linee 285-417, 626-733)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Merge Cantina Research | merge | linee 828-845 | Combina vini + ricerca cantina |
| Split In Batches | splitInBatches | linee 626-651 | Processa 1 vino alla volta |
| Prepare Perplexity Request | set | linee 285-343 | Prepara query ricerca vino |
| Call Perplexity API | httpRequest | linee 370-395 | Ricerca info vino |
| Check Perplexity Status | if | linee 2514-2523 | Verifica status risposta Perplexity |
| Call Tavily API (Product Fallback) | httpRequest | linee 2556-2598 | Fallback Tavily se Perplexity fallisce |
| Normalize Tavily Product Response | code | linee 2643-2654 | Normalizza risposta Tavily |
| Merge Product Results | merge | linee 2668-2678 | Combina risultati Perplexity/Tavily |
| Combine Data | code | linee 395-403 | Combina dati ricerca + vino |
| AI Agent | agent | linee 678-694 | Genera descrizione HTML |
| OpenAI Chat Model | lmChatOpenAi | linee 708-733 | Modello GPT-5-mini |
| Combine AI Output | code | linee 695-707 | Combina output AI + dati vino |
| Pulizia+Formattazione Testo | code | linee 665-677 | Pulisce HTML, genera nome file |
| Create file from text | googleDrive | linee 484-512 | Salva .md su Drive (ITA) |
| Translate Product Description to English | googleTranslate | linee 2238-2257 | Traduzione automatica ITA→ENG |
| Prepare English Product File | code | linee 2258-2270 | Prepara file tradotto |
| Create English Product File | googleDrive | linee 2271-2299 | Salva .md su Drive (ENG) |
| Prepare Final Message | code | linee 652-664 | Messaggio riepilogo prodotti |

### 12. GENERAZIONE DOMAIN (linee 1136-1343)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Get Existing Domain Files | httpRequest | linee 1136-1170 | Recupera file domain esistenti |
| Merge Domain Files Data | merge | linee 1171-1181 | Combina domain + file esistenti |
| Filter Existing Domain Files | code | linee 1182-1194 | Filtra domain già generati |
| Check Empty Array (Domain) | if | linee 1195-1227 | Verifica se ci sono domain da processare |
| Split In Batches (Domain) | splitInBatches | linee 1228-1240 | Processa 1 domain alla volta |
| AI Agent (Domain) | agent | linee 1241-1257 | Genera descrizione domain |
| Combine Domain AI Output | code | linee 1258-1270 | Combina output AI |
| Pulizia+Formattazione Testo (Domain) | code | linee 1271-1283 | Pulisce HTML domain |
| Create file from text (Domain) | googleDrive | linee 1284-1317 | Salva domain .md (ITA) |
| Translate Domain Description to English | googleTranslate | linee 2303-2322 | Traduzione automatica ITA→ENG |
| Prepare English Domain File | code | linee 2323-2335 | Prepara file tradotto |
| Create English Domain File | googleDrive | linee 2336-2369 | Salva domain .md (ENG) |
| Prepare Final Message (Domain) | code | linee 1318-1330 | Messaggio riepilogo domain |
| Prepare Empty Message (Domain) | code | linee 1331-1343 | Messaggio quando tutti domain esistono |

### 13. RIEPILOGO & TELEGRAM (linee 1344-1382)
| Nodo | Tipo | Posizione JSON | Funzione |
|------|------|----------------|----------|
| Set Product Summary | code | linee 1344-1356 | Normalizza output prodotti |
| Set Domain Summary | code | linee 1357-1369 | Normalizza output domain |
| Merge Summaries | merge | linee 1370-1492 | Combina prodotti + domain |
| Compose Telegram Message | code | linee 1370-1382 | Compone messaggio finale |
| messaggio Telegram WF completo | telegram | linee 500-520 | Invia notifica Telegram |

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

### 3. Fallback API Tavily

**Implementazione**:
- Check status Perplexity dopo ogni chiamata
- Se errore (401/402) o fallimento, attivazione automatica Tavily
- Normalizzazione risposta Tavily per compatibilità con flusso esistente
- Merge risultati per garantire continuità workflow

**Nodi coinvolti**:
- Check Perplexity Status / Check Perplexity Cantina Status
- Call Tavily API (Product Fallback) / Call Tavily API (Cantina Fallback)
- Normalize Tavily Product Response / Normalize Tavily Cantina Response
- Merge Product Results / Merge Cantina Results

---

### 4. Supporto Multilingua

**Implementazione**:
- Creazione automatica cartelle ITA e ENG
- Traduzione automatica con Google Translate
- Salvataggio file separati per lingua
- Struttura cartelle gerarchica mantenuta per entrambe le lingue

**Nodi traduzione**:
- Translate Product Description to English
- Translate Domain Description to English
- Prepare English Product File / Prepare English Domain File
- Create English Product File / Create English Domain File

---

## CONNECTIONS (linee 2754-3891)
Mappa delle connessioni tra nodi per tracciare il flusso completo.

**Flusso principale**:
1. Manual Trigger → Workflow Configuration
2. Workflow Configuration → Find Parent Folder
3. Find Parent Folder → Extract Parent Folder ID
4. Extract Parent Folder ID → Check Output Folder Exists
5. Check Output Folder Exists → IF Folder Exists
6. IF Folder Exists → Use Existing Folder / Create Output Folder
7. Store Folder ID → Check ITA Folder Exists / Check ENG Folder Exists
8. (Setup cartelle ITA/ENG e sottocartelle)
9. Estrae primo prodotto → Merge Files Data / Remove Duplicates Domains
10. Merge Files Data → Filter Existing Files
11. Filter Existing Files → Check Empty Array
12. Remove Duplicates Domains → Prepare Perplexity Cantina Request
13. (Ricerca cantina con fallback Tavily)
14. Merge Cantina Research → Split In Batches
15. Split In Batches → Prepare Perplexity Request
16. (Ricerca prodotto con fallback Tavily)
17. AI Agent → Combine AI Output
18. Combine AI Output → Pulizia+Formattazione Testo
19. Pulizia+Formattazione Testo → Create file from text
20. Create file from text → Translate Product Description to English
21. Translate Product Description to English → Create English Product File
22. (Generazione domain parallela)
23. Merge Summaries → Compose Telegram Message
24. Compose Telegram Message → messaggio Telegram WF completo

---

## VARIABILI CONFIGURAZIONE (linee 18-81)
| Variabile | Valore Default | Descrizione |
|-----------|---------------|-------------|
| templateSheetName | template_descrizione_PRODOTTO | Template prodotti |
| templateDomainName | template_descrizione_DOMAIN | Template domain |
| parentFolderName | YOUR_PARENT_FOLDER_NAME | Cartella root Drive |
| outputFolderName | descrizioni_2026 | Cartella output |
| domainDescriptionsFolderName | descrizioni-DOMAIN | Sottocartella domain |
| ProductDescriptionsFolderName | descrizioni-PRODOTTO | Sottocartella prodotti |
| perplexityModel | sonar-pro | Modello Perplexity |
| inputFileId | YOUR_GOOGLE_DRIVE_FILE_ID | ID file Lista_vini.json |
| itaFolderName | ITA | Nome cartella italiano |
| engFolderName | ENG | Nome cartella inglese |

---

## CREDENTIALS UTILIZZATE
| Servizio | ID | Nome |
|----------|-----|------|
| Google Drive | YOUR_GOOGLE_DRIVE_CREDENTIAL_ID | Google Drive account |
| Perplexity | YOUR_PERPLEXITY_CREDENTIAL_ID | Perplexity account |
| OpenAI | YOUR_OPENAI_CREDENTIAL_ID | OpenAi account |
| Telegram | YOUR_TELEGRAM_CREDENTIAL_ID | Telegram account |
| Google Translate | YOUR_GOOGLE_TRANSLATE_CREDENTIAL_ID | Google Translate account |

**NOTA**: Tutti gli ID credenziali devono essere configurati in n8n prima dell'utilizzo del workflow.

---

## NOVITÀ VERSIONE 4

### Supporto Multilingua
- Generazione automatica versioni ITA e ENG
- Traduzione automatica con Google Translate
- Struttura cartelle separata per lingua

### Fallback API Tavily
- Fallback automatico quando Perplexity fallisce
- Normalizzazione risposte per compatibilità
- Gestione errori migliorata

### Struttura Cartelle Migliorata
- Organizzazione gerarchica ITA/ENG
- Creazione automatica tutte le sottocartelle
- Gestione robusta cartelle esistenti

### Gestione Errori Avanzata
- Check status API dopo ogni chiamata
- Fallback automatico senza interruzione workflow
- Messaggi errore più informativi
