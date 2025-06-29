const fs = require('fs');
const path = require('path');
const config = require('../config');

const banPath = path.join(__dirname, '../lib/banlist.json');

if (!fs.existsSync(banPath)) {
  fs.writeFileSync(banPath, JSON.stringify([]));
}

let bannedUsers = JSON.parse(fs.readFileSync(banPath));

const saveBanlist = () => {
  fs.writeFileSync(banPath, JSON.stringify(bannedUsers, null, 2));
};

// 🧠 Tracking rapid message sending
const messageCounts = {}; // { sender: { count, lastTime } }
const SPAM_THRESHOLD = 3;
const TIME_WINDOW = 5000; // 5 seconds

module.exports = {
  name: "anti-bug",
  description: "Detekte, efase, epi bloke mesaj ki ka fè bot la fè erè oswa spam.",
  type: "all",

  async execute(conn, mek, m) {
    try {
      const sender = m.sender;
      const chat = m.chat;
      const msg = m?.text || "";

      // ⏱️ Mesaj rapid deteksyon
      const now = Date.now();
      if (!messageCounts[sender]) {
        messageCounts[sender] = { count: 1, lastTime: now };
      } else {
        const elapsed = now - messageCounts[sender].lastTime;
        if (elapsed <= TIME_WINDOW) {
          messageCounts[sender].count += 1;
        } else {
          messageCounts[sender].count = 1; // reset si twò lontan
        }
        messageCounts[sender].lastTime = now;
      }

      // Si yo voye 3 mesaj rapid → konsidere kòm spam
      if (messageCounts[sender].count >= SPAM_THRESHOLD && !bannedUsers.includes(sender)) {
        bannedUsers.push(sender);
        saveBanlist();

        await conn.updateBlockStatus(sender, "block");

        await conn.sendMessage(chat, {
          text: `🚫 *@${sender.split("@")[0]}*, ou te voye mesaj twò rapid. Ou bloke otomatikman kòm spam.`,
          mentions: [sender],
        });

        await conn.sendMessage(`${config.OWNER_NUMBER}@s.whatsapp.net`, {
          text: `⚠️ *ANTI-SPAM ALERT*\n\n👤 *User:* @${sender.split("@")[0]}\n📩 *Reason:* 3 mesaj rapid.\n\n✅ Bloke & ajoute nan banlist.`,
          mentions: [sender],
        });

        return; // Sispann nenpòt lòt aksyon
      }

      // 🧪 Deteksyon mesaj danjere (bug/crash)
      const isBug =
        msg.length > 2000 || 
        /[\u200E\u200F\u202E\u202D\u2060-\u2064]/.test(msg);

      if (isBug && !bannedUsers.includes(sender)) {
        // 🧹 Efase mesaj lan
        await conn.sendMessage(chat, {
          delete: {
            remoteJid: chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant || sender,
          },
        });

        bannedUsers.push(sender);
        saveBanlist();

        await conn.updateBlockStatus(sender, "block");

        await conn.sendMessage(chat, {
          text: `🚫 *@${sender.split("@")[0]}*, ou te voye yon mesaj danjere e ou bloke otomatikman.`,
          mentions: [sender],
        });

        await conn.sendMessage(`${config.OWNER_NUMBER}@s.whatsapp.net`, {
          text: `🛡️ *ANTI-BUG ALERT*\n\n👤 *User:* @${sender.split("@")[0]}\n📩 *Reason:* Mesaj danjere detekte.\n\n✅ Bloke & ajoute nan banlist.`,
          mentions: [sender],
        });
      }
    } catch (err) {
      console.error("🛑 Erè nan anti-bug:", err);
    }
  },
};
