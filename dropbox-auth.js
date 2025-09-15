// api/dropbox-auth.js
// Server backend untuk menukar token Dropbox
import fetch from 'node-fetch';

export default async function handler(request, response) {
  const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
  const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;
  const REDIRECT_URI = "https://revisinovelpremium.blogspot.com";
  
  const origin = request.headers.get('origin');
  
  // Perbaikan CORS: Izinkan koneksi dari localhost atau dari URL blogspot
  if (origin && (origin.startsWith('http://localhost') || origin === REDIRECT_URI)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    response.setHeader('Access-Control-Allow-Origin', REDIRECT_URI);
  }

  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'GET' && request.query.type === 'auth') {
    if (!DROPBOX_APP_KEY) {
      return response.status(500).json({ error: "Dropbox App Key is not configured." });
    }
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&response_type=code&redirect_uri=${REDIRECT_URI}`;
    return response.status(200).json({ authUrl });
  }

  if (request.method === 'GET' && request.query.code) {
    const code = request.query.code;
    
    try {
      const tokenUrl = 'https://api.dropboxapi.com/oauth2/token';
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code: code,
          grant_type: 'authorization_code',
          client_id: DROPBOX_APP_KEY,
          client_secret: DROPBOX_APP_SECRET,
          redirect_uri: REDIRECT_URI
        })
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      if (accessToken) {
        return response.redirect(`${REDIRECT_URI}#access_token=${accessToken}`);
      } else {
        throw new Error('No access token received.');
      }
      
    } catch (error) {
      console.error('Error during token exchange:', error);
      return response.status(500).json({ error: 'Failed to exchange token.' });
    }
  }

  return response.status(404).json({ message: 'Not Found' });
}
