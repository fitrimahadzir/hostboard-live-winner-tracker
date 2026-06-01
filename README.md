# 🎮 HostBoard - TikTok LIVE Tracker

**HostBoard** ialah sebuah sistem penjejakan langsung (*live tracking system*) berorientasikan peranti mudah alih (*mobile-first*) yang direka khas untuk *host streamer* (contohnya TikTok LIVE). Ia digunakan untuk menguruskan rekod kemenangan pemain, memantau pusingan, dan menyegerakkan carta pendahulu (*leaderboard*) secara langsung (Masa Nyata/Real-time) ke perisian siaran seperti OBS.

## ✨ Ciri-ciri Utama (Core Features)

- **🔐 Log Masuk Pintar (Authentication):** Sokongan log masuk E-mel/Kata Laluan serta **Google OAuth** melalui Supabase Auth.
- **📡 Suapan Aktiviti Masa Nyata (Real-time Activity Feed):** Merekod dan memaparkan sejarah log seperti penciptaan permainan baharu, kemas kini permarkahan dan kemenangan secara langsung dari *Supabase Realtime*.
- **🏆 Pengurusan Pusingan & Permainan:** Terdapat ruangan khas untuk mengurus profil, bilik pemain (*game lobbies*), dan ubah suai skor secara interaktif.
- **📱 UI Mobile-First:** Reka bentuk anatomi moden menggunakan *Tailwind CSS* dengan ruang navigasi bawah (*bottom bar*) untuk capaian antaramuka optimum.
- **🛡️ Pangkalan Data Selamat:** Integrasi backend *Supabase (PostgreSQL)* lengkap bersama *Row Level Security (RLS)* dan fungsi profil pemicu automatik (*auto triggers*).
- **🛠️ Mod Pembangunan Bersepadu (DEV Mode):** Termasuk struktur ujian yang membenarkan pemaju mengubah mod sistem tanpa mengakses Google OAuth dan pengkalan data sebenar apabila diuji secara offline/local.

## 🚀 Teknologi Yang Digunakan (Tech Stack)

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React.
- **Backend & Database:** Supabase (Auth, Postgres, Realtime channel).
- **Architecture:** Client-side SPA sedia disiarkan ke platform awan.

## 📦 Maklumat Pangkalan Data

- Menggunakan modul tambahan `pgcrypto` untuk pengurusan ID UUID selamat.
- Entiti utama: `profiles`, `games`, `players`, `activity_logs`.
