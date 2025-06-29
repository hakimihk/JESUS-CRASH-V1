const { cmd } = require('../command');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'play',
  desc: 'Search and send audio from YouTube',
  category: 'fun',
  filename: __filename,
}, async (conn, mek, m, { text, from, reply }) => {
  try {
    if (!text) return reply('❌ Tanpri bay yon mo kle pou chèche mizik la. Egzanp: .play cars outside');

    // 1. Rechèch sou YouTube
    const r = await yts(text);
    const video = r.videos.length > 0 ? r.videos[0] : null;

    if (!video) return reply('❌ Pa jwenn anyen sou YouTube ak tèm sa.');

    const url = video.url;

    // 2. Telechaje odyo (mp3) ak ytdl-core
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
    const tempFile = path.join(__dirname, 'temp_audio.mp3');
    const writeStream = fs.createWriteStream(tempFile);

    stream.pipe(writeStream);

    writeStream.on('finish', async () => {
      // 3. Voye odyo a nan WhatsApp
      await conn.sendMessage(from, { audio: fs.readFileSync(tempFile), mimetype: 'audio/mpeg' }, { quoted: mek });

      // 4. Efase fichye tanporè
      fs.unlinkSync(tempFile);
    });

    writeStream.on('error', err => {
      console.error('Error writing audio file:', err);
      reply('❌ Erè pandan telechajman odyo a.');
    });

  } catch (e) {
    console.error('Play Command Error:', e);
    reply('❌ Erè pandan chèche oswa voye odyo a.');
  }
});
