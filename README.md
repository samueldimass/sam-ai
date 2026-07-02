# 🤖 Sam AI - WhatsApp Bot AI untuk Manajemen Grup

Bot WhatsApp AI yang canggih dengan fitur manajemen grup otomatis, download MP3/MP4 dari YouTube, dan integrasi OpenAI.

## ✨ Fitur Utama

### 🎯 Fitur Inti
- 🤖 **AI Chatbot** - Percakapan cerdas dengan OpenAI GPT
- 📥 **Download Media** - Download MP3/MP4 dari YouTube
- 🌐 **Translator** - Terjemahkan teks ke berbagai bahasa
- 📝 **Text Summarizer** - Buat ringkasan otomatis
- 🧮 **Calculator** - Kalkulator untuk operasi matematika
- 😂 **Jokes Generator** - Bercanda lucu otomatis
- ✨ **Quote Generator** - Quote inspiratif setiap hari
- 🕐 **Time & Date** - Tampilkan waktu saat ini
- 📊 **User Statistics** - Tracking aktivitas pengguna

### 👥 Manajemen Grup
- 🎯 **Auto Welcome** - Sambutan otomatis member baru
- 👋 **Auto Goodbye** - Ucapan goodbye saat member keluar
- 🚫 **Auto Moderation** - Filter spam dan bad words
- 📋 **Group Info** - Informasi detail grup
- 👥 **Member List** - Daftar semua member
- ⚠️ **Warning System** - Sistem warning untuk pelanggaran

## 📋 Persyaratan

- Node.js v14 atau lebih tinggi
- NPM atau Yarn
- OpenAI API Key (dapatkan di https://platform.openai.com/api-keys)
- WhatsApp (untuk scanning QR code)
- Koneksi internet yang stabil

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/samueldimass/sam-ai.git
cd sam-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit file `.env` dan tambahkan:
```env
OPENAI_API_KEY=sk-your-api-key-here
BOT_PREFIX=!
BOT_NAME=Sam AI
BOT_OWNER=Your Name
AUTO_WELCOME=true
AUTO_GOODBYE=true
FILTER_BAD_WORDS=true
```

### 4. Jalankan Bot
```bash
npm start
```

Bot akan menampilkan QR code. Scan dengan WhatsApp Anda untuk login.

## 📖 Panduan Penggunaan

### Perintah Dasar

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!hello` | Sapaan dari bot | `!hello` |
| `!help` | Tampilkan bantuan lengkap | `!help` |
| `!info` | Info bot dan status | `!info` |
| `!ping` | Cek latency bot | `!ping` |
| `!stats` | Statistik pengguna | `!stats` |

### Perintah AI

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!ai [pertanyaan]` | Tanya ke AI | `!ai apa itu machine learning?` |
| `!translate [teks]` | Terjemahkan ke Indonesia | `!translate hello world` |
| `!summary [teks]` | Buat ringkasan teks | `!summary ...teks panjang...` |
| `!joke` | Dapatkan bercanda lucu | `!joke` |
| `!quote` | Dapatkan quote inspiratif | `!quote` |

### Download Media

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!ytmp3 [URL]` | Download MP3 dari YouTube | `!ytmp3 https://youtube.com/watch?v=...` |
| `!ytmp4 [URL]` | Download MP4 dari YouTube | `!ytmp4 https://youtube.com/watch?v=...` |

### Utilitas

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!calc [operasi]` | Kalkulator | `!calc 10+5*2` |
| `!time` | Tampilkan waktu sekarang | `!time` |
| `!rules` | Tampilkan aturan grup | `!rules` |

### Manajemen Grup

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!groupinfo` | Info grup | `!groupinfo` |
| `!list` | Daftar member | `!list` |
| `!mention [@user]` | Mention member | `!mention @username` |

## 💻 Contoh Penggunaan

```
👤 User: !ai apa itu machine learning?
🤖 Bot: Machine Learning adalah cabang AI yang...

👤 User: !translate halo dunia
🤖 Bot: 🌐 Terjemahan: hello world → halo dunia

👤 User: !joke
🤖 Bot: 😂 Mengapa ayam menyeberang jalan? Karena...

👤 User: !ytmp3 https://youtube.com/watch?v=...
🤖 Bot: ⏳ Sedang mengunduh MP3...
🤖 Bot: ✅ Download Berhasil! 🎵 Lagu: ...

👤 User: !calc 10+5*2
🤖 Bot: 🧮 Kalkulator: 10+5*2 = 20
```

## ⚙️ Konfigurasi

Edit file `.env` untuk mengatur:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-3.5-turbo

# Bot Configuration
BOT_PREFIX=!
BOT_NAME=Sam AI
BOT_OWNER=Your Name

# Features
AUTO_WELCOME=true
AUTO_GOODBYE=true
FILTER_BAD_WORDS=true

# Server
PORT=3000
NODE_ENV=development
```

## 📁 Struktur Folder

```
sam-ai/
├── index.js                  # Main bot file
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .env                       # Environment variables (don't push!)
├── .gitignore                # Git ignore
├── README.md                 # Documentation
├── LICENSE                   # MIT License
├── CONTRIBUTING.md           # Contribution guide
├── session/                  # WhatsApp session (auto-generated)
├── commands/
│   ├── welcome.js           # Welcome messages
│   ├── moderation.js        # Moderation functions
│   └── ai-utils.js          # AI utility functions
└── logs/                     # Bot logs
```

## 🔐 Keamanan

⚠️ **PENTING:**
- ❌ Jangan commit file `.env` ke git
- ❌ Jangan share OpenAI API Key Anda
- ❌ Jangan publish session folder
- ✅ Gunakan `.env.example` sebagai template
- ✅ Simpan `.env` dengan aman di local machine
- ✅ Gunakan token dengan permissions terbatas

## 🐛 Troubleshooting

### Bot tidak merespons
```bash
1. Cek koneksi internet
2. Verifikasi OpenAI API Key di .env
3. Pastikan prefix benar (default: !)
4. Restart bot: npm start
```

### QR Code tidak muncul
```bash
1. Cek terminal untuk error messages
2. Pastikan Node.js v14+ terinstall
3. Delete folder session/ lalu restart
4. npm start
```

### Download MP3/MP4 gagal
```bash
1. Cek URL YouTube valid
2. Pastikan video tidak private/restricted
3. Cek koneksi internet
4. Coba URL berbeda
```

### Error OpenAI
```bash
1. Verifikasi API Key (jangan ada typo)
2. Cek quota dan billing OpenAI
3. Pastikan model gpt-3.5-turbo tersedia
4. Cek error message di console
```

## 🚀 Development

### Jalankan dengan Auto-Restart
```bash
npm run dev
```

### Menambah Command Baru

Edit file `index.js` di section `switch(command)`:

```javascript
case 'mycommand':
  await sock.sendMessage(message.key.remoteJid, {
    text: '✅ Ini adalah command baru saya!',
  });
  break;
```

### Debug Mode
```bash
NODE_ENV=development npm start
```

## 🌟 Tips & Trik

1. **Gunakan di Private Chat**: Bot bekerja di private chat dan grup
2. **Batch Commands**: Kombinasikan multiple commands
3. **Rate Limiting**: Hindari spam untuk menghindari throttling
4. **Session Persistence**: Session tersimpan otomatis di folder `session/`
5. **Custom Prefix**: Ubah prefix di `.env` sesuai keinginan

## 🤝 Kontribusi

Kontribusi sangat diterima! Langkah:

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add: Amazing Feature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📝 Lisensi

Project ini menggunakan lisensi **MIT**. Lihat file `LICENSE` untuk detail.

## 💬 Support & Feedback

Jika ada pertanyaan atau masalah:
- 🔗 GitHub Issues: [Create Issue](https://github.com/samueldimass/sam-ai/issues)
- 📧 Email: samuel.dimass@example.com
- 💬 WhatsApp: Chat langsung dengan bot!

## 📚 Resource Tambahan

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Node.js Docs](https://nodejs.org/en/docs/)
- [WhatsApp Web API](https://web.whatsapp.com)

## 🙏 Terima Kasih

Terima kasih kepada:
- **Baileys** - WhatsApp Web API
- **OpenAI** - GPT Language Model
- **Node.js** - JavaScript Runtime
- **Kontributor** - Semua yang membantu project ini

---

**Made with ❤️ by Samuel Dimass**

⭐ **Jika suka project ini, jangan lupa beri bintang!** ⭐
