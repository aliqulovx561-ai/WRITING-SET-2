const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    // Get environment variables from Vercel
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Missing environment variables: BOT_TOKEN or CHAT_ID');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error - please check environment variables'
      });
    }

    console.log('Sending message to Telegram...');

    // Send to Telegram
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    console.log('✅ Message sent to Telegram successfully');
    
    res.status(200).json({
      success: true,
      message: 'Test submitted successfully and sent to examiner',
      telegramMessageId: response.data.result.message_id
    });

  } catch (error) {
    console.error('❌ Telegram API Error:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send to Telegram',
      error: error.response?.data?.description || error.message
    });
  }
};
