import https from 'https';

async function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const html = await fetchUrl('https://resibo.pl/kategoria/16/produkty-resibo');
  const matches = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
  
  const products = matches
    .filter(m => m[1].includes('/produkt/'))
    .map(m => ({ url: m[1], name: m[2].trim() }))
    .filter(p => p.name.length > 5);
    
  // Deduplicate
  const uniqueProducts = [];
  const seen = new Set();
  for (const p of products) {
    if (!seen.has(p.url)) {
      seen.add(p.url);
      uniqueProducts.push(p);
    }
  }
  
  console.log(`Found ${uniqueProducts.length} products`);
  for (const p of uniqueProducts.slice(0, 20)) {
    console.log(`${p.name} -> ${p.url}`);
  }
}
run();
