const fs = require('fs');
const path = require('path');
const banPath = path.join(__dirname, '../lib/banlist.json');
const config = require('../config');

// Kreye banlist si pa egziste
if (!fs.existsSync(banPath)) fs.writeFileSync(banPath, JSON.stringify([]));
let bannedUsers = JSON.parse(fs.readFileSync(banPath));

const saveBanlist = () => {
  fs.writeFileSync(banPath, JSON.stringify(bannedUsers, null, 2));
};

module.exports = {
  name: "anti-bug",
  description: "Detekte, efase ak bloke mesaj bug/crash",
  type: "spam", // Pou tout mesaj
  async execute(conn, mek, m) {
    try {
      const sender = m.sender;
      const msg = m?.text || '';
      const chat = m.chat;

      // Deteksyon mesaj potansyèlman danjere
      const isBug =
        msg.length > 2000 || // twò long
        /[\u200E\u200F\u202E\u202D\u2060\u2061\u2062\u2063\u2064]/.test(msg); // karaktè Unicode bug

      if (isBug && !bannedUsers.includes(sender)) {

        // 🧹 Efase mesaj lan anvan tout lòt aksyon
        await conn.sendMessage(chat, {
          delete: {
            remoteJid: chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant || sender
          }
        });

        // ➕ Mete sender lan nan banlist
        bannedUsers.push(sender);
        saveBanlist();

        // 🚫 Bloke moun lan
        await conn.updateBlockStatus(sender, "block");

        // ⚠️ Notify group oswa chat
        await conn.sendMessage(chat, {
          text: `🚫 *@${sender.split("@")[0]}*, ou te voye yon mesaj danjere e ou bloke otomatikman.`,
          mentions: [sender],
        });

        // 🔔 Notify OWNER
        await conn.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
          text: `🛡️ *ANTI-BUG ALERT*\n\n👤 *User:* @${sender.split("@")[0]}\n📩 *Reason:* Bug/crash message detected and deleted.\n\n✅ Bloke & sove nan banlist.`,
          mentions: [sender],
        });
      }
    } catch (err) {
      console.error("Erreur nan anti-bug:", err);
    }
  }
};
