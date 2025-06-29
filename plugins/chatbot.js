// commands/chatbot.js
const { getGptReply } = require('../data/ai');

module.exports = {
  name: 'chatbot',
  description: 'Smart AI chatbot',
  category: 'AI',
  commandType: 'auto',
  async execute(m, conn) {
    try {
      if (!m.text || m.fromMe || m.isGroup) return;

      // Ignore command-like messages
      if (m.text.startsWith('.')) return;

      const response = await getGptReply(m.text);
      if (!response) return;

      await conn.sendMessage(m.chat, {
        text: `🤖 *ChatBot*\n\n${response}\n\n_Powered by dawens-boy_`
      }, { quoted: m });

    } catch (err) {
      console.log('Chatbot Error:', err);
    }
  }
};
