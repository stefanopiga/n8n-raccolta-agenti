// 1. Estrae il testo generato da GPT-5.2
let rawHTML = $input.item.json.output[0].content[0].text;

// 2. Pulizia: Rimuove i tag strutturali pesanti mantenendo intatta la formattazione interna (em, strong, span)
let cleanHTML = rawHTML
    .replace(/<!DOCTYPE html>|<\/?html.*?>|<\/?head>|<\/?body>|<meta.*?>|<title>.*?<\/title>/gi, '')
    .trim();

// 3. Recupera i dati dal nodo Code iniziale per costruire il nome file dinamico
const vino = $node["Code in JavaScript"].json;
const anno = vino.anno ? `_${vino.anno}` : '';
const litri = vino.litraggio ? `_${vino.litraggio}` : '';

return {
    nome_file: `${vino.domain}_${vino.nome_vino}${anno}${litri}.md`,
    contenuto_md: cleanHTML, // Contiene ora la frase evocativa alla fine
    folder_id: "YOUR_GOOGLE_DRIVE_FOLDER_ID" // ID cartella di output su Google Drive
};