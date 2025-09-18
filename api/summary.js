export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch("http://43.217.240.242/v1/workflows/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer app-7fqSMLFApYE7LycJLXTnNySy"
      },
      body: JSON.stringify({
        "inputs": {
          "workflow_id": "5NOuouhmVAR6ohir"
        },
        "user": "1"
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to load summary' });
  }
}