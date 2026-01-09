// Loop su tutti gli item in ingresso
return $input.all().map(item => {
    return {
        json: {
            // Mappatura diretta per uniformare i nomi dei campi
            title: item.json.title,
            link: item.json.link,
            // RSS spesso usa 'summary', 'description' o 'content:encoded'. 
            // Questa logica prende il primo disponibile.
            content: item.json.summary || item.json.description || item.json.content || "",
            pubDate: item.json.pubDate || item.json.isoDate,

            // I tuoi nuovi Tag Architetturali
            source_type: "research_paper",
            content_depth: "high"
        }
    }
});