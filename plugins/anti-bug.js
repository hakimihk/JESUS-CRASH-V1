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
  description: "Detekte ak bloke bug/crash messages",
  type: "spam", // Pou tout mesaj
  async execute(conn, mek, m) {
    try {
      const sender = m.sender;
      const msg = m?.text || '';
      const chat = m.chat;

      // Deteksyon mesaj potansyèlman danjere
      const isBug =
        msg.length > 2000 || // twò long
        /[\u200E\u200F\u202E\u202D\u2060\u2061\u2062\u2063\u2064]/.test(msg); // karaktè crash

      if (isBug && !bannedUsers.includes(sender)) {
        bannedUsers.push(sender);
        saveBanlist();

        // Bloke user
        await conn.updateBlockStatus(sender, "block");

        // Notify sender
        await conn.sendMessage(chat, {
          text: `🚫 *@${sender.split("@")[0]}*, ou bloke otomatikman paske ou voye yon mesaj danjere.`,
          mentions: [sender],
        });

        // Notify owner
        await conn.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
          text: `🛡️ *ANTI-BUG ALERT*\n\n👤 *User:* @${sender.split("@")[0]}\n📩 *Reason:* Suspected bug/crash message.\n\n✅ Bloke & sove nan banlist.`,
          mentions: [sender],
        });
      }
    } catch (err) {
      console.error("Erreur nan anti-bug:", err);
    }
  }
};
