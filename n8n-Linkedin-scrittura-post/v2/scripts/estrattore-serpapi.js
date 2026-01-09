// Adatta l'output di SerpAPI allo standard del flusso
// SerpAPI usa 'news_results' invece di 'news'
const news = $input.first().json.news_results;

if (!news) {
    return [];
}

return news.map(item => {
    return {
        json: {
            title: item.title,
            link: item.link,     // Link pulito diretto!
            content: item.snippet,
            pubDate: item.date,
            source: item.source,
            source_type: "industry_news",
            content_depth: "low"
        }
    }
});