const vini = $json.data;

// Restituisci ogni vino come item separato
return vini.map(vino => ({ json: vino }));