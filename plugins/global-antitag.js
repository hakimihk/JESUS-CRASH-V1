// global-antitag.js
module.exports = async (conn, m) => {
  try {
    const isGroup = m.key.remoteJid.endsWith('@g.us');
    if (!isGroup || m.key.fromMe) return;

    // Lis nimewo yo ou PA vle yo tag
    const protectedUsers = [
      "13058962443@s.whatsapp.net",
      "50942241547@s.whatsapp.net"
    ];

    const sender = m.key.participant || m.key.remoteJid;
    const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

    // Si youn nan nimewo sa yo mansyone
    const isProtectedTagged = mention.some(user => protectedUsers.includes(user));

    if (isProtectedTagged) {
      await conn.sendMessage(m.chat, {
        text: `🚫 *Pa tag mwen!*`,
        mentions: [sender]
      }, { quoted: m });

      await conn.sendMessage(m.chat, { delete: m.key });
    }

  } catch (err) {
    console.error("[AntiTag Error]", err);
  }
};
