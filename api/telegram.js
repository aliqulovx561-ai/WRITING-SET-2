export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error - BOT_TOKEN or CHAT_ID not set'
      });
    }

    console.log('Sending message to Telegram...');

    // Send to Telegram using fetch
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const result = await telegramResponse.json();

    if (result.ok) {
      console.log('✅ Telegram message sent successfully');
      res.status(200).json({
        success: true,
        message: 'Test submitted successfully and sent to examiner',
        telegramMessageId: result.result.message_id
      });
    } else {
      console.error('❌ Telegram API error:', result.description);
      throw new Error(result.description || 'Telegram API error');
    }

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send to Telegram',
      error: error.message
    });
  }
}
