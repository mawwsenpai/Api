// api/dropbox-auth.js
// Ini adalah server backend sederhana yang akan kamu deploy ke Vercel

export default async function handler(request, response) {
  // Ini adalah rahasia aplikasi Dropbox-mu. JANGAN PERNAH MENAMPILKAN INI DI KODE FRONTEND!
  const DROPBOX_APP_KEY = "u3whypoz2wx3vzx"; 
  const DROPBOX_APP_SECRET = "nnzr81d621f383f";
  const REDIRECT_URI = "https://revisinovelpremium.blogspot.com"; // Harus sama dengan yang kamu daftarkan

  // Mengecek apakah ada permintaan untuk otentikasi
  if (request.method === 'GET' && request.query.type === 'auth') {
    // 1. Buat URL otentikasi Dropbox
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&response_type=code&redirect_uri=${REDIRECT_URI}`;
    
    // 2. Kirim URL ini kembali ke aplikasi Android-mu
    return response.status(200).json({ authUrl });
  }

  // Jika token otentikasi datang dari Dropbox
  if (request.method === 'GET' && request.query.code) {
    const code = request.query.code;
    
    // 3. (BAGIAN KRITIS): Tukar kode otentikasi dengan token akses
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
      
      // 4. Setelah berhasil, arahkan kembali ke website-mu dengan tokennya
      const accessToken = tokenData.access_token;
      if (accessToken) {
        return response.redirect(`${REDIRECT_URI}#access_token=${accessToken}`);
      }
      
    } catch (error) {
      console.error('Error during token exchange:', error);
      return response.status(500).json({ error: 'Gagal menukar token.' });
    }
  }

  // Default response untuk permintaan lain
  return response.status(404).json({ message: 'Not Found' });
}
