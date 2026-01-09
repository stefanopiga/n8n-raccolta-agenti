// Normalizza URL per deduplicazione robusta preservando pairedItem
const url = $json.link;
const item = $input.item;

try {
    const urlObj = new URL(url);
    // Rimuove query params, normalizza trailing slash
    const normalized = urlObj.origin + urlObj.pathname.replace(/\/$/, '');

    // Preserva tutti i metadati dell'item originale incluso pairedItem
    return {
        json: {
            ...$json,
            link: normalized,
            original_link: url
        },
        pairedItem: item.pairedItem
    };
} catch (e) {
    // Se URL non valido, ritorna originale preservando metadati
    return {
        json: $json,
        pairedItem: item.pairedItem
    };
}