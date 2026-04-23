export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, apiKey } = req.body;
  if (!query || !apiKey) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const response = await fetch('https://api.supermemory.ai/v3/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        q: query,
        limit: 6,
        containerTags: ['pcv-001-configuracion']
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || data.error || 'Error de Supermemory' });
    }

    const results = (data.results || []).map(r => ({
      title: r.title || '',
      content: (r.chunks || []).map(c => c.content || '').filter(Boolean).join('\n\n')
    })).filter(r => r.content);

    return res.status(200).json({ results });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
