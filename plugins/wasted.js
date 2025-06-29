const { cmd } = require('../command');
const axios = require('axios');

const effects = {
  wasted: 'wasted',
  triggered: 'triggered',
  rip: 'rip',
  jail: 'jail',
  blur: 'blur'
};

for (const [cmdName, effectType] of Object.entries(effects)) {
  cmd({
    pattern: cmdName,
    desc: `Generate ${cmdName.toUpperCase()} effect from replied photo or profile picture`,
    category: 'fun',
    filename: __filename,
  }, async (conn, mek, m, { from, reply }) => {
    try {
      let imageBuffer;

      // 1. Get replied image or profile pic
      if (m.quoted && m.quoted.message?.imageMessage) {
        imageBuffer = await conn.downloadMediaMessage(m.quoted);
      } else {
        try {
          const imageUrl = await conn.profilePictureUrl(m.sender, 'image');
          const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(res.data, 'binary');
        } catch {
          return reply('❌ Pa jwenn foto reponn ni profil ou.');
        }
      }

      // 2. Convert to base64
      const base64Image = imageBuffer.toString('base64');

      // 3. Call nekobot API
      const { data } = await axios.get('https://nekobot.xyz/api/imagegen', {
        params: {
          type: effectType,
          image: `data:image/jpeg;base64,${base64Image}`
        }
      });

      if (!data.success) return reply(`❌ Pa ka kreye imaj ${cmdName.toUpperCase()}.`);

      // 4. Download effect image
      const effectImage = await axios.get(data.message, { responseType: 'arraybuffer' });
      const effectBuffer = Buffer.from(effectImage.data, 'binary');

      // 5. Send result
      await conn.sendMessage(from, { image: effectBuffer, caption: `*${cmdName.toUpperCase()} Effect!*` }, { quoted: mek });

    } catch (e) {
      console.error(`${cmdName} Error:`, e);
      reply(`❌ Erè pandan ap kreye imaj ${cmdName.toUpperCase()}.`);
    }
  });
}
