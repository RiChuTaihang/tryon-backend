// GET /api/tryon/result?id=xxx - 轮询 Replicate 预测结果
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '缺少 prediction id' });
  }

  try {
    const pred = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    if (pred.status === 'succeeded') {
      return res.status(200).json({ status: 'done', result_url: pred.output });
    }
    if (pred.status === 'failed') {
      return res.status(200).json({ status: 'failed', error: pred.error || '生成失败' });
    }
    return res.status(200).json({ status: pred.status });
  } catch (err) {
    console.error('result error:', err);
    return res.status(500).json({ error: '查询失败' });
  }
}
