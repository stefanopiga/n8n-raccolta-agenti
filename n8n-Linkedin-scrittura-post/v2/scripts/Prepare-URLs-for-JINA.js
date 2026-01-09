// Prepare URLs for JINA extraction: Prepara array di URL per estrazione contenuti completi
// Notion Trigger restituisce campi con prefisso 'property_' (es: property_url, property_title)
return $input.all().map(item => {
    // Estrae URL (Notion usa 'property_url' o 'URL' come chiave)
    const url = item.json.property_url || item.json.URL || item.json.url || "";
    // Estrae Title (Notion usa 'property_title' o 'Title')
    const title = item.json.property_title || item.json.Title || "Titolo mancante";
    // Estrae AI Reason (Notion usa 'property_ai_reason' o 'AI Reason')
    const reason = item.json.property_ai_reason || item.json["AI Reason"] || "Nessun motivo specificato";
    // Estrae Notion ID (sempre presente)
    const notionId = item.json.id || "";

    return {
        json: {
            url: url,
            title: title,
            reason: reason,
            notion_id: notionId
        }
    };
});