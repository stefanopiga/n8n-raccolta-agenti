// Merger v2: Unisce i CONTENUTI COMPLETI estratti da JINA
let mergedContext = "### FONTI SELEZIONATE DALL'EDITOR (Tu):\n\n";
let counter = 0;

// Raggruppa per notion_id (ogni articolo può avere più item se JINA ritorna array)
const articlesMap = new Map();

for (const item of $input.all()) {
    // Preserva dati originali da Prepare URLs (preservati da HTTP JINA)
    const notionId = item.json.notion_id || item.json.id || "unknown";
    const title = item.json.title || "Titolo mancante";
    const reason = item.json.reason || "Nessun motivo specificato";

    // Estrae contenuto da risposta JINA (struttura: data.content)
    const jinaContent = item.json.data?.content || item.json.content || "";
    const jinaUrl = item.json.data?.url || item.json.url || "";

    if (!articlesMap.has(notionId)) {
        articlesMap.set(notionId, {
            title: title,
            url: jinaUrl,
            reason: reason,
            content: jinaContent
        });
    } else {
        // Se già presente, aggiungi contenuto se più completo
        const existing = articlesMap.get(notionId);
        if (jinaContent.length > existing.content.length) {
            existing.content = jinaContent;
            existing.url = jinaUrl; // Aggiorna anche URL se più completo
        }
    }
}

// Costruisce il contesto unificato
for (const [notionId, article] of articlesMap.entries()) {
    counter++;
    mergedContext += `--- ARTICOLO ${counter} ---\n`;
    mergedContext += `🔹 TITOLO: ${article.title}\n`;
    mergedContext += `🔗 LINK: ${article.url}\n`;
    mergedContext += `🧠 PERCHÉ È RILEVANTE (AI Reason): ${article.reason}\n`;
    mergedContext += `\n📄 CONTENUTO COMPLETO:\n${article.content}\n`;
    mergedContext += `----------------------\n\n`;
}

// RESTITUISCE ARRAY (richiesto da n8n)
return [{
    json: {
        combined_context: mergedContext,
        source_count: counter,
        status: "Ready for Writing"
    }
}];