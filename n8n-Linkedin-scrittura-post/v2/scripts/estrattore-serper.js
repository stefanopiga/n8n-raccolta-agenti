// Adatta l'output di SerpAPI allo standard del flusso
// SerpAPI usa 'news_results' invece di 'news'
const results = $input.first().json.news_results;

if (!results) {
    return []; // Gestione sicurezza se non ci sono news
}

return results.map(item => {
    return {
        json: {
            title: item.title,
            link: item.link,     // SerpAPI fornisce link puliti
            content: item.snippet,
            pubDate: item.date,
            source: item.source,
            source_type: "industry_news",
            content_depth: "low"
        }
    }
});