const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: 'wanted',
  alias: ['wantedposter'],
  desc: "Generate a Wanted poster from replied image or profile picture",
  category: 'fun',
  filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
  try {
    let imageBuffer;

    // 1. Si gen foto reponn, itilize li
    if (m.quoted && m.quoted.message?.imageMessage) {
      imageBuffer = await conn.downloadMediaMessage(m.quoted);
    } else {
      // 2. Sinon, chèche profil pic moun lan
      try {
        const imageUrl = await conn.profilePictureUrl(m.sender, 'image');
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(response.data, 'binary');
      } catch {
        return reply('❌ Pa gen foto reponn e pa ka jwenn foto profil ou.');
      }
    }

    // 3. Voye foto bay API wanted (https://nekobot.xyz/api/imagegen?type=wanted&image=BASE64)
    const base64Image = imageBuffer.toString('base64');

    const { data } = await axios.get(`https://nekobot.xyz/api/imagegen`, {
      params: {
        type: 'wanted',
        image: `data:image/jpeg;base64,${base64Image}`
      }
    });

    if (!data.success) return reply('❌ Echèk pou kreye afich la.');

    // 4. Telechaje afich la
    const wantedRes = await axios.get(data.message, { responseType: 'arraybuffer' });
    const wantedImage = Buffer.from(wantedRes.data, 'binary');

    // 5. Voye li
    await conn.sendMessage(from, { image: wantedImage, caption: '*🪧 Afich WANTED ou!*' }, { quoted: mek });

  } catch (e) {
    console.error('Wanted Error:', e);
    reply('❌ Erè pandan afich la ap fèt.');
  }
});
