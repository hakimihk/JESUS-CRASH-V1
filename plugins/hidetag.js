// ✅ Re-coded & Powered by DAWENS TECH 🎭
const { cmd } = require('../command');

cmd({
  pattern: "hidetag",
  alias: ["tag", "h"],
  react: "🔊",
  desc: "Tag tout manm gwoup la avèk mesaj oswa medya (hidetag)",
  category: "group",
  use: ".hidetag Hello",
  filename: __filename
},
async (conn, mek, m, {
  from, q, isGroup, isOwner, isAdmins,
  participants, reply
}) => {
  try {
    const isUrl = (url) => /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
    if (!isGroup) return reply("❌ Sa sèlman mache nan gwoup.");
    if (!isAdmins && !isOwner) return reply("❌ Se sèlman admin ki ka itilize sa.");

    const mentionAll = { mentions: participants.map(u => u.id) };

    if (!q && !m.quoted) return reply("❌ Mete yon mesaj oswa reponn yon mesaj pou tag tout moun.");

    if (m.quoted) {
      const type = m.quoted.mtype || '';

      if (type === 'extendedTextMessage') {
        return await conn.sendMessage(from, {
          text: m.quoted.text || '❔ Pa jwenn kontni mesaj la.',
          ...mentionAll
        }, { quoted: mek });
      }

      if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)) {
        try {
          const buffer = await m.quoted.download?.();
          if (!buffer) return reply("❌ Pa ka telechaje medya a.");

          let content;
          switch (type) {
            case "imageMessage":
              content = { image: buffer, caption: m.quoted.text || "🖼️ Imaj", ...mentionAll };
              break;
            case "videoMessage":
              content = {
                video: buffer,
                caption: m.quoted.text || "🎥 Videyo",
                gifPlayback: m.quoted.message?.videoMessage?.gifPlayback || false,
                ...mentionAll
              };
              break;
            case "audioMessage":
              content = {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: m.quoted.message?.audioMessage?.ptt || false,
                ...mentionAll
              };
              break;
            case "stickerMessage":
              content = { sticker: buffer, ...mentionAll };
              break;
            case "documentMessage":
              content = {
                document: buffer,
                mimetype: m.quoted.message?.documentMessage?.mimetype || "application/octet-stream",
                fileName: m.quoted.message?.documentMessage?.fileName || "document",
                caption: m.quoted.text || "",
                ...mentionAll
              };
              break;
          }

          if (content) {
            return await conn.sendMessage(from, content, { quoted: mek });
          }
        } catch (err) {
          console.error("❌ Media Error:", err);
          return reply("❌ Pa ka voye medya a. M ap voye kòm tèks.");
        }
      }

      return await conn.sendMessage(from, {
        text: m.quoted.text || "📨 Mesaj",
        ...mentionAll
      }, { quoted: mek });
    }

    if (q) {
      return await conn.sendMessage(from, {
        text: q,
        ...mentionAll
      }, { quoted: mek });
    }

  } catch (e) {
    console.error("❌ Erè nan hidetag:", e);
    reply(`❌ *Erè rive !!*\n\n\`\`\`${e.message}\`\`\``);
  }
});
