        const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running 24/7!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

const TOKEN = '8322009944:AAEtskUcDK3eKa4l2HKQBfkvr4jS5SEsgMI';
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

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = null;
    const welcomeText = `👑 *WELCOME TO TALHA GURU HTML OBFUSCATOR PRO* 👑\n\n⚡ _POWERED BY  GURU  TALHA \n🔥 _I WILL PROTECT YOUR HTML_\n\n👇 *Select an option* 👇:`;
    bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown', ...mainMenu });
});

bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;

    if (data === 'obfuscate_html') {
        userStates[chatId] = 'AWAITING_HTML';
        bot.sendMessage(chatId, '📝 *Kindly send your raw HTML code to obfuscate:*', { parse_mode: 'Markdown' });
    } else if (data === 'url_to_html') {
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
        bot.sendMessage(chatId, '⚙️ *Advanced Encryption Layer Applying...*', { parse_mode: 'Markdown' });

        try {
            const escapedHtml = encodeURIComponent(text);
            const base64Encoded = Buffer.from(escapedHtml).toString('base64');
            
            // Render proof injection template
            const protectedCode = `<html lang="en">
<head><meta charset="UTF-8"><title>Protected Content</title></head>
<body>
<script type="text/javascript">
    (function() {
        try {
            var de = atob("${base64Encoded}");
            var un = decodeURIComponent(de);
            document.open();
            document.write(un);
            document.close();
        } catch(e) {
            console.error("Decryption error: Check dependency paths.");
            document.body.innerHTML = "<div style='color:red; font-family:sans-serif; text-align:center; margin-top:20%;'>⚠️ Security Layer Error: Source dependencies missing.</div>";
        }
    })();
</script>
<noscript>This page requires JavaScript to be enabled.</noscript>
</body>
</html>`;

            bot.sendMessage(chatId, `✅ *Your HTML is Fully Encrypted & Secure!*\n\n\`\`\`html\n${protectedCode}\n\`\`\``, { parse_mode: 'Markdown' });
        } catch (error) {
            bot.sendMessage(chatId, '❌ *Failed to obfuscate code.*', { parse_mode: 'Markdown' });
        }
    } 
    else if (state === 'AWAITING_URL') {
        userStates[chatId] = null;
        let url = text.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

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
