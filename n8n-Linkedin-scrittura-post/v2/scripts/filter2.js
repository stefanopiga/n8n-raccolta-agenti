// Filter2: Filtra solo item con keep=true E confidence>=0.7
return $input.all().filter(item => {
    const keep = item.json.output?.keep === true;
    const confidence = Number(item.json.output?.confidence) || 0;
    return keep && confidence >= 0.7;
}).map(item => ({ json: item.json }));