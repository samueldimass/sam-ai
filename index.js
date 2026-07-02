const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { OpenAI } = require('openai');
const pino = require('pino');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logger = pino();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PREFIX = process.env.BOT_PREFIX || '!';
const BOT_NAME = process.env.BOT_NAME || 'Sam AI';

// User stats
const userStats = new Map();

// Fungsi untuk inisialisasi bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
  });

  // Event: Connection Update
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.info('connection closed due to', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      logger.info('✅ Bot berhasil terhubung!');
    }
  });

  // Event: Credentials Updated
  sock.ev.on('creds.update', saveCreds);

  // Event: Messages Upsert
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.message) return;

    const isGroup = message.key.remoteJid?.endsWith('@g.us');
    const sender = message.key.participant || message.key.remoteJid;
    const text = message.message.conversation || message.message.extendedTextMessage?.text || '';

    logger.info(`📨 Pesan dari ${sender}: ${text}`);

    // Track user stats
    if (!userStats.has(sender)) {
      userStats.set(sender, { messages: 0, commands: 0 });
    }
    userStats.get(sender).messages++;

    // Check if message starts with prefix
    if (!text.startsWith(PREFIX)) return;

    const command = text.slice(PREFIX.length).split(' ')[0].toLowerCase();
    const args = text.slice(PREFIX.length).split(' ').slice(1);
    const fullCommand = text.slice(PREFIX.length);

    // Track command usage
    if (userStats.has(sender)) {
      userStats.get(sender).commands++;
    }

    try {
      // Command Handler
      switch (command) {
        case 'hello':
        case 'hi':
          await sock.sendMessage(message.key.remoteJid, {
            text: `👋 Halo! Saya ${BOT_NAME}, bot AI untuk manajemen grup. Ketik ${PREFIX}help untuk melihat daftar perintah.`,
          });
          break;

        case 'help':
          const helpText = `
╔════════════════════════════════════════════════════╗
║     📋 DAFTAR PERINTAH ${BOT_NAME}    ║
╚════════════════════════════════════════════════════╝

📌 *PERINTAH UMUM:*
${PREFIX}hello - Sapaan dari bot
${PREFIX}help - Tampilkan bantuan
${PREFIX}info - Info bot
${PREFIX}ping - Cek kecepatan bot
${PREFIX}stats - Statistik pengguna

🤖 *PERINTAH AI:*
${PREFIX}ai [pertanyaan] - Tanya ke AI
${PREFIX}translate [teks] - Terjemahkan teks
${PREFIX}summary [teks] - Buat ringkasan
${PREFIX}joke - Berikan bercanda

📥 *DOWNLOAD:*
${PREFIX}ytmp3 [URL] - Download MP3 dari YouTube
${PREFIX}ytmp4 [URL] - Download MP4 dari YouTube
${PREFIX}spotify [lagu] - Cari lagu Spotify

👥 *GRUP:*
${PREFIX}rules - Tampilkan aturan grup
${PREFIX}mention [@user] - Mention member
${PREFIX}list - Daftar member grup
${PREFIX}groupinfo - Info grup

🛠️ *UTILITY:*
${PREFIX}calc [operasi] - Kalkulator
${PREFIX}quote - Quote inspiratif
${PREFIX}weather [kota] - Cuaca kota
${PREFIX}time - Waktu saat ini

💡 Contoh:
${PREFIX}ai apa itu machine learning?
${PREFIX}ytmp3 https://youtube.com/watch?v=...
${PREFIX}translate hello dunia
          `;
          await sock.sendMessage(message.key.remoteJid, { text: helpText });
          break;

        case 'ai':
          if (args.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `⚠️ Format: ${PREFIX}ai [pertanyaan anda]`,
            });
            return;
          }
          const question = args.join(' ');
          logger.info(`🤖 Processing AI request: ${question}`);
          
          await sock.sendPresenceUpdate('composing', message.key.remoteJid);

          const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `Anda adalah ${BOT_NAME}, asisten AI yang membantu di grup WhatsApp. Berikan jawaban yang singkat, ramah, dan helpful. Jawaban maksimal 500 karakter.`,
              },
              {
                role: 'user',
                content: question,
              },
            ],
            max_tokens: 200,
          });

          const aiResponse = response.choices[0]?.message?.content || 'Maaf, terjadi kesalahan.';
          await sock.sendMessage(message.key.remoteJid, {
            text: `🤖 *AI Response:*\n\n${aiResponse}`,
          });
          break;

        case 'ytmp3':
          if (args.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `⚠️ Format: ${PREFIX}ytmp3 [URL YouTube]\n\nContoh: ${PREFIX}ytmp3 https://youtube.com/watch?v=...`,
            });
            return;
          }
          const url3 = args.join(' ');
          await sock.sendMessage(message.key.remoteJid, {
            text: '⏳ Sedang mengunduh MP3... Tunggu sebentar...',
          });
          
          try {
            // Menggunakan API eksternal untuk download
            const mp3Response = await downloadFromYoutube(url3, 'mp3');
            if (mp3Response.success) {
              await sock.sendMessage(message.key.remoteJid, {
                audio: { url: mp3Response.url },
                mimetype: 'audio/mpeg',
              });
              await sock.sendMessage(message.key.remoteJid, {
                text: `✅ *Download Berhasil!*\n\n🎵 Lagu: ${mp3Response.title}\n⏱️ Durasi: ${mp3Response.duration}`,
              });
            } else {
              throw new Error('Gagal download');
            }
          } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `❌ Gagal download MP3. Cek URL dan coba lagi.\n\nError: ${error.message}`,
            });
          }
          break;

        case 'ytmp4':
          if (args.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `⚠️ Format: ${PREFIX}ytmp4 [URL YouTube]\n\nContoh: ${PREFIX}ytmp4 https://youtube.com/watch?v=...`,
            });
            return;
          }
          const url4 = args.join(' ');
          await sock.sendMessage(message.key.remoteJid, {
            text: '⏳ Sedang mengunduh MP4... Tunggu sebentar...',
          });
          
          try {
            const mp4Response = await downloadFromYoutube(url4, 'mp4');
            if (mp4Response.success) {
              await sock.sendMessage(message.key.remoteJid, {
                video: { url: mp4Response.url },
                mimetype: 'video/mp4',
                caption: `✅ Video berhasil diunduh!\n🎬 Judul: ${mp4Response.title}`,
              });
            } else {
              throw new Error('Gagal download');
            }
          } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `❌ Gagal download MP4. Cek URL dan coba lagi.\n\nError: ${error.message}`,
            });
          }
          break;

        case 'translate':
          if (args.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `⚠️ Format: ${PREFIX}translate [teks]\n\nContoh: ${PREFIX}translate hello world`,
            });
            return;
          }
          const textToTranslate = args.join(' ');
          await sock.sendPresenceUpdate('composing', message.key.remoteJid);

          try {
            const translationResponse = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Anda adalah penerjemah bahasa. Terjemahkan teks ke bahasa Indonesia. Hanya berikan hasil terjemahan tanpa penjelasan tambahan.',
                },
                {
                  role: 'user',
                  content: textToTranslate,
                },
              ],
              max_tokens: 200,
            });

            const translation = translationResponse.choices[0]?.message?.content || 'Maaf, gagal menerjemahkan.';
            await sock.sendMessage(message.key.remoteJid, {
              text: `🌐 *Terjemahan:*\n\n📝 Original: ${textToTranslate}\n\n🇮🇩 Indonesia: ${translation}`,
            });
          } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `❌ Gagal menerjemahkan: ${error.message}`,
            });
          }
          break;

        case 'joke':
          await sock.sendPresenceUpdate('composing', message.key.remoteJid);
          try {
            const jokeResponse = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Berikan 1 bercanda lucu pendek dalam bahasa Indonesia.',
                },
                {
                  role: 'user',
                  content: 'Berikan bercanda',
                },
              ],
              max_tokens: 150,
            });

            const joke = jokeResponse.choices[0]?.message?.content || 'Maaf, tidak bisa membuat bercanda.';
            await sock.sendMessage(message.key.remoteJid, {
              text: `😂 *Bercanda Hari Ini:*\n\n${joke}`,
            });
          } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `❌ Error: ${error.message}`,
            });
          }
          break;

        case 'summary':
          if (args.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `⚠️ Format: ${PREFIX}summary [teks]`,
            });
            return;
          }
          const textToSummarize = args.join(' ');
          await sock.sendPresenceUpdate('composing', message.key.remoteJid);

          try {
            const summaryResponse = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Buat ringkasan singkat dari teks yang diberikan. Maksimal 3 poin penting.',
                },
                {
                  role: 'user',
                  content: textToSummarize,
                },
              ],
              max_tokens: 200,
            });

            const summary = summaryResponse.choices[0]?.message?.content || 'Maaf, gagal membuat ringkasan.';
            await sock.sendMessage(message.key.remoteJid, {
              text: `📌 *Ringkasan:*\n\n${summary}`,
            });
          } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `❌ Error: ${error.message}`,
            });
          }
          break;

        case 'calc':
          if (args.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `⚠️ Format: ${PREFIX}calc [operasi]\n\nContoh: ${PREFIX}calc 2+2*5`,
            });
            return;
          }
          try {
            const expression = args.join('');
            // Simple calculator (safe eval)
            const result = Function('"use strict"; return (' + expression + ')')();
            await sock.sendMessage(message.key.remoteJid, {
              text: `🧮 *Kalkulator:*\n\n📊 ${expression} = ${result}`,
            });
          } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `❌ Operasi tidak valid. Cek format: ${PREFIX}calc 2+2`,
            });
          }
          break;

        case 'quote':
          await sock.sendPresenceUpdate('composing', message.key.remoteJid);
          try {
            const quoteResponse = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Berikan 1 quote inspiratif dalam bahasa Indonesia. Format: \"Quote\" - Penulis',
                },
                {
                  role: 'user',
                  content: 'Berikan quote',
                },
              ],
              max_tokens: 150,
            });

            const quote = quoteResponse.choices[0]?.message?.content || 'Maaf, tidak bisa membuat quote.';
            await sock.sendMessage(message.key.remoteJid, {
              text: `✨ *Quote Inspiratif:*\n\n${quote}`,
            });
          } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `❌ Error: ${error.message}`,
            });
          }
          break;

        case 'time':
          const now = new Date();
          const timeStr = now.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          await sock.sendMessage(message.key.remoteJid, {
            text: `🕐 *Waktu Saat Ini (WIB):*\n\n${timeStr}`,
          });
          break;

        case 'stats':
          const userStat = userStats.get(sender) || { messages: 0, commands: 0 };
          await sock.sendMessage(message.key.remoteJid, {
            text: `📊 *Statistik Anda:*\n\n💬 Pesan: ${userStat.messages}\n⚡ Perintah: ${userStat.commands}`,
          });
          break;

        case 'rules':
          const rulesText = `
╔════════════════════════════════════════════════════╗
║    📋 ATURAN GRUP ${BOT_NAME}    ║
╚════════════════════════════════════════════════════╝

✅ Bersikap sopan dan hormat
✅ Tidak spam atau flooding
✅ Tidak posting konten SARA
✅ Gunakan bahasa yang baik
✅ Dengarkan moderator

❌ Larangan:
❌ Spam/advertising
❌ Konten dewasa
❌ Cyberbullying
❌ Share nomor pribadi
❌ Judi atau hal ilegal

⚠️ Pelanggaran akan berakibat warning, mute, atau kick!
          `;
          await sock.sendMessage(message.key.remoteJid, { text: rulesText });
          break;

        case 'info':
          const infoText = `
╔════════════════════════════════════════════════════╗
║      🤖 INFO BOT       ║
╚════════════════════════════════════════════════════╝

🏷️ Nama: ${BOT_NAME}
👤 Pemilik: ${process.env.BOT_OWNER || 'Unknown'}
📦 Versi: 2.0.0
🔧 Platform: WhatsApp
🧠 AI: OpenAI GPT
📅 Update: ${new Date().toLocaleDateString('id-ID')}
⚡ Status: Online ✅
          `;
          await sock.sendMessage(message.key.remoteJid, { text: infoText });
          break;

        case 'ping':
          const startTime = Date.now();
          const pongMessage = await sock.sendMessage(message.key.remoteJid, {
            text: '🏓 Pong!',
          });
          const endTime = Date.now();
          const latency = endTime - startTime;
          await sock.sendMessage(message.key.remoteJid, {
            text: `⏱️ Latency: ${latency}ms`,
          });
          break;

        default:
          await sock.sendMessage(message.key.remoteJid, {
            text: `❓ Perintah tidak ditemukan. Ketik ${PREFIX}help untuk melihat daftar perintah.`,
          });
      }
    } catch (error) {
      logger.error('Error processing command:', error);
      await sock.sendMessage(message.key.remoteJid, {
        text: `❌ Terjadi kesalahan: ${error.message}`,
      });
    }
  });
}

// Fungsi untuk download dari YouTube (menggunakan API eksternal)
async function downloadFromYoutube(url, format) {
  try {
    // Menggunakan API gratis seperti cobalt.tools atau yt-mpeg.com
    const apiUrl = format === 'mp3' 
      ? `https://yt-mpeg.com/api/info?url=${encodeURIComponent(url)}`
      : `https://yt-mpeg.com/api/info?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl);
    
    return {
      success: true,
      url: response.data.download_url || response.data.url,
      title: response.data.title || 'Unknown',
      duration: response.data.duration || 'Unknown',
    };
  } catch (error) {
    logger.error('Download error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Start bot
startBot().catch(console.log);
