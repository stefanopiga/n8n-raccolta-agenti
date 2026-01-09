// Code Formatter v9 - OTTIMIZZATO PER GOOGLE DRIVE
let rawContent = $input.item.json.output || $input.item.json.text || "";

if (!rawContent) return [{ json: { title: "Errore", status: "error" } }];

let cleanString = rawContent.replace(/```json|```/g, "").trim();

try {
    const parsedData = JSON.parse(cleanString);
    let finalPost = "";

    if (typeof parsedData.linkedin_post === 'object') {
        const p = parsedData.linkedin_post;
        let corpoString = Array.isArray(p.Corpo) ? p.Corpo.join("\n\n") : (p.Corpo || "");
        finalPost = `${p.Hook || ""}\n\n${corpoString}\n\n${p.Closing || ""}\n\n${p.Hashtag || ""}`;
    } else {
        finalPost = parsedData.linkedin_post || cleanString;
    }

    // Pulizia e formattazione
    finalPost = finalPost.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n{3,}/g, "\n\n").trim();

    return [{
        json: {
            title: parsedData.title || "Post Tecnico",
            post_preview: finalPost.substring(0, 1900) + "...",
            post_full: finalPost, // TESTO INTEGRALE PER GOOGLE DRIVE
            status: "success"
        }
    }];
} catch (e) {
    return [{ json: { title: "⚠️ ERRORE JSON", post_full: rawContent, status: "error" } }];
}