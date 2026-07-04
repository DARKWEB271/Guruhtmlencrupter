const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express'); // Render ke liye Express server

// Express Setup (Render ko active rakhne ke liye)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running 24/7!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Aapki provided Bot Token
const TOKEN = '8322009944:AAEtskUcDK3eKa4l2HKQBfkvr4jS5SEsgMI';

// Aapke provided Admin Usernames
const ADMINS = ['itx_GuRu410', 'Itxtalha750']; 

const bot = new TelegramBot(TOKEN, { polling: true });
const userStates = {};

const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '🔐 Obfuscate HTML', callback_data: 'obfuscate_html' },
                { text: '🌐 URL to HTML', callback_data: 'url_to_html' }
            ],
            [
                { text: '👨‍💻 Admin 1', url: `https://t.me/${ADMINS[0]}` },
                { text: '👨‍💻 Admin 2', url: `https://t.me/${ADMINS[1]}` }
            ]
        ]
    }
};

const sendWelcomeMessage = (chatId) => {
    const welcomeText = 
`👑 *WELCOME TO HTML OBFUSCATOR PRO* 👑

⚡ _POWERED BY MULTI LAYERED ENCRYPTION_
🔥 _I WILL PROTECT YOUR HTML_

👇 *Select an option* 👇:`;
    bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown', ...mainMenu });
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = null;
    sendWelcomeMessage(chatId);
});

bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;

    if (data === 'obfuscate_html') {
        userStates[chatId] = 'AWAITING_HTML';
        bot.sendMessage(chatId, '📝 *Kindly send your raw HTML code to obfuscate:*', { parse_mode: 'Markdown' });
    } 
    else if (data === 'url_to_html') {
        userStates[chatId] = 'AWAITING_URL';
        bot.sendMessage(chatId, '🌐 *Kindly send the website URL to extract HTML:*', { parse_mode: 'Markdown' });
    }
    bot.answerCallbackQuery(callbackQuery.id);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/start')) return;
    const state = userStates[chatId];

    if (state === 'AWAITING_HTML') {
        userStates[chatId] = null;
        bot.sendMessage(chatId, '⚙️ *Obfuscating your HTML code...*', { parse_mode: 'Markdown' });

        try {
            const escapedHtml = encodeURIComponent(text);
            const base64Encoded = Buffer.from(escapedHtml).toString('base64');
            const protectedCode = `\n<script type="text/javascript">\n    document.write(decodeURIComponent(atob("${base64Encoded}")));\n</script>`;
            bot.sendMessage(chatId, `✅ *Your HTML is Secure!*\n\n\`\`\`html\n${protectedCode}\n\`\`\``, { parse_mode: 'Markdown' });
        } catch (error) {
            bot.sendMessage(chatId, '❌ *Failed to obfuscate code.*', { parse_mode: 'Markdown' });
        }
    } 
    else if (state === 'AWAITING_URL') {
        userStates[chatId] = null;
        let url = text.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        bot.sendMessage(chatId, `⏳ *Fetching source from:* ${url}...`);

        try {
            const response = await axios.get(url, { timeout: 10000 });
            const fetchedHtml = response.data;

            if (fetchedHtml.length > 3000) {
                const buffer = Buffer.from(fetchedHtml, 'utf-8');
                bot.sendDocument(chatId, buffer, {}, { filename: 'extracted.html', contentType: 'text/html' });
            } else {
                bot.sendMessage(chatId, `\`\`\`html\n${fetchedHtml}\n\`\`\``, { parse_mode: 'Markdown' });
            }
        } catch (error) {
            bot.sendMessage(chatId, '❌ *Error fetching URL.*');
        }
    }
});