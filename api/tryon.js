// POST /api/tryon - 接收两张图的 base64，创建 Replicate 预测
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personBase64, clothBase64 } = req.body;

    if (!personBase64 || !clothBase64) {
      return res.status(400).json({ error: '缺少人物照或衣服照' });
    }

    // 去掉 data:image/...;base64, 前缀（如果有的话）
    const strip = (s) => s.includes(',') ? s.split(',')[1] : s;
    const personData = strip(personBase64);
    const clothData = strip(clothBase64);

    // 调用 Replicate IDM-VTON
    const prediction = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'cuuupid/idm-vton',
        input: {
          human_image: `data:image/jpeg;base64,${personData}`,
          garment_image: `data:image/jpeg;base64,${clothData}`
        }
      })
    }).then(r => r.json());

    if (prediction.error) {
      return res.status(500).json({ error: prediction.error });
    }

    return res.status(200).json({ task_id: prediction.id });
  } catch (err) {
    console.error('tryon error:', err);
    return res.status(500).json({ error: '创建预测失败' });
  }
}
