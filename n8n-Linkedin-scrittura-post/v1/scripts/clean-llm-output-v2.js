// clean-llm-output-v6-SPACER-ENFORCER.js
let rawContent = $input.item.json.output || $input.item.json.text || "";
let jinaMetadata = $node["HTTP JINA"].json.data || {};

if (!rawContent) return { title: "Errore", post_body: "Dati mancanti", status: "error" };

// 1. Pulizia preliminare JSON
let cleanString = rawContent.replace(/```json|```/g, "").trim();

try {
    const parsedData = JSON.parse(cleanString);
    let finalPost = "";

    if (typeof parsedData.linkedin_post === 'object') {
        const p = parsedData.linkedin_post;

        // Recupero campi grezzi
        let hook = p.Hook || "";
        let corpoRaw = p.Corpo;
        let closing = p.Closing || "";
        let hashtags = p.Hashtag || "";

        // 2. Logica di estrazione del corpo (Array o Stringa)
        let corpoString = "";
        if (Array.isArray(corpoRaw)) {
            corpoString = corpoRaw.join("\n\n");
        } else {
            corpoString = corpoRaw || "";
        }

        // 3. Assemblaggio preliminare
        // Uniamo tutto con un separatore provvisorio
        finalPost = `${hook}\n\n${corpoString}\n\n${closing}\n\n${hashtags}`;

    } else {
        finalPost = parsedData.linkedin_post || cleanString;
    }

    // ============================================================
    // 4. THE SPACER ENFORCER (Fix per Notion Visual Breathing)
    // Questa sezione forza la spaziatura indipendentemente dal JSON
    // ============================================================

    // A. Rimuove Markdown residuo (* o **)
    finalPost = finalPost.replace(/\*\*/g, "").replace(/\*/g, "");

    // B. Normalizza gli a capo multipli in eccesso (evita buchi enormi)
    finalPost = finalPost.replace(/\n{3,}/g, "\n\n");

    // C. FORZA SPAZIO PRIMA DELLE LAMPADINE (💡)
    // Cerca qualsiasi combinazione di newline prima di una lampadina e la forza a essere \n\n
    finalPost = finalPost.replace(/(\n\s*)+💡/g, "\n\n💡");

    // D. FORZA SPAZIO PRIMA DELLA DOMANDA FINALE
    // Cerca la domanda (spesso inizia con "Domanda" o "?")
    finalPost = finalPost.replace(/(\n\s*)+(Domanda|Closing|Voi cosa ne pensate)/g, "\n\n$2");

    // E. FORZA SPAZIO PRIMA DEGLI HASHTAG
    finalPost = finalPost.replace(/(\n\s*)+#/g, "\n\n#");

    // 5. Protezione lunghezza Notion
    if (finalPost.length > 2000) {
        finalPost = finalPost.substring(0, 1997) + "...";
    }

    return {
        title: parsedData.title || "Post Tecnico",
        post_body: finalPost,
        image_url: jinaMetadata.image || "",
        status: "success"
    };

} catch (e) {
    return {
        title: "⚠️ REVISIONE RICHIESTA",
        post_body: rawContent.substring(0, 1997),
        status: "manual_check",
        debug: e.message
    };
}