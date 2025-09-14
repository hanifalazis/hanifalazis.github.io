# Portfolio Website — Muhammad Hanif Al-Azis

Website portofolio untuk Data Cleansing Engineer & Business Intelligence Specialist dengan dark mode, i18n (ID/EN), projects carousel, dan polish UX seperti Back‑to‑Top, smooth scroll, serta aura foto profil.

## 🤖 100% AI-Developed (GitHub Copilot Agent)

Proyek ini dikembangkan 100% oleh AI (GitHub Copilot Agent) tanpa coding manual. Seluruh struktur, HTML, CSS, dan JavaScript—termasuk fitur navigasi, i18n, dark mode, Back‑to‑Top, carousel projects, dan animasi—dibuat secara otomatis oleh agen AI.

## ✨ Fitur Utama

- Navigasi halus & URL bersih
	- Klik logo/“Home” pada root akan scroll halus ke atas tanpa menambah `#home` di URL.
	- Smooth scroll antar section dan highlight nav aktif saat scroll.
- Back‑to‑Top arrow (brand blue)
	- Muncul/hilang halus, hover/press feedback, glow lembut di dark mode, hormati prefers‑reduced‑motion.
- Tema gelap/terang dengan toggle
	- Mengikuti preferensi sistem; bisa override dan tersimpan di `localStorage`.
- i18n bilingual (ID/EN)
	- Menggunakan `data-i18n`, `data-i18n-title`, `data-i18n-aria`. Toggle bahasa memperbarui teks, title, dan aria-label.
- Projects carousel (auto‑slide + filter)
	- Memuat dari `/api/projects.json` bila tersedia; fallback ke data statis di `assets/js/projects.js`.
	- Filter kategori dengan label i18n; infinite carousel, swipe di mobile, auto‑slide pause saat interaksi.
- Animasi & visual polish
	- AOS untuk animasi on‑scroll; “aura memancar” looping pada foto profil; typing effect pada hero.
- Aksesibilitas
	- Skip link, ARIA, `focus-visible`, sembunyikan dari tab order saat tidak terlihat, dukungan reduced motion.

## 🧩 Teknologi

- HTML + CSS kustom (+ Tailwind via CDN, dengan safelist di `index.html`)
- JavaScript vanilla (tanpa bundler)
- AOS (Animate On Scroll) & Font Awesome
- Google Fonts (Poppins)
- Analytics: Google Analytics (gtag) + Cloudflare Web Analytics
- Struktur Jekyll (folder `_projects`, `_layouts`, `_data`) kompatibel GitHub Pages

## 📂 Struktur Penting

- `index.html` — Halaman utama, Tailwind CDN config + safelist, gaya Back‑to‑Top, dan inisiasi tema.
- `assets/js/script.js` — Navigasi, smooth scroll, Back‑to‑Top, AOS, i18n, tema, UX utils.
- `assets/js/projects.js` — Manajer Projects: load JSON/fallback, filter, carousel, auto‑slide.
- `assets/css/style.css` — Gaya global; animasi aura foto profil (`.home-img` dengan `@keyframes aura-ring`).
- `service/index.html` — Landing page layanan BI (proses, pricing, demo dashboard, dsb.).
- `_projects/` — Sumber konten project (untuk Jekyll); tidak otomatis dipakai di homepage kecuali dibuatkan JSON.

## 🛠️ Konfigurasi & Kustomisasi

- Warna brand: `index.html` → blok `tailwind.config` → `colors.primary` dan `primary.light`.
- Back‑to‑Top: `index.html` → style `#back-to-top` (warna, transisi, dark‑mode glow).
- Aura foto profil: `assets/css/style.css` → `.home-img` + `@keyframes aura-ring`/`aura-ring-light`.
- Terjemahan (i18n): `assets/js/script.js` → objek `translations` (kunci `id`/`en`). Gunakan `data-i18n`, `data-i18n-title`, `data-i18n-aria` pada elemen.

## 📦 Data Projects di Homepage

Homepage mencoba fetch `/api/projects.json`. Jika tidak ada, otomatis pakai fallback di `assets/js/projects.js`.

Opsi sumber data:
- Cepat (fallback): sunting array `this.projects` di `loadFallbackProjects()`.
- Dinamis (opsional): sediakan file statis `/api/projects.json` dengan struktur array proyek yang sama (judul, deskripsi, gambar, link, kategori, tanggal, dll). Jika memakai Jekyll, Anda bisa membuat template JSON dari `_projects/`.

## ▶️ Menjalankan Lokal

Tanpa build step — cukup buka `index.html` langsung. Disarankan VS Code + ekstensi Live Server untuk auto‑reload.

Opsional (Jekyll), untuk memanfaatkan `_projects` pada halaman lain:

```powershell
# Prasyarat: Ruby + Bundler
bundle install
bundle exec jekyll serve --livereload
# Akses di http://127.0.0.1:4000
```

## 🔎 Catatan & Known Issues

- Jika `/api/projects.json` tidak ditemukan, itu normal — fallback akan dipakai.
- Perubahan warna ikon Back‑to‑Top kadang tertahan cache; lakukan hard refresh bila perlu.
- Tailwind CDN dengan safelist: jika menambah utility class dinamis baru, tambahkan ke `safelist` di `index.html`.

## 📜 Lisensi

Konten dan kode sumber untuk keperluan portofolio pribadi. Silakan gunakan sebagai referensi; untuk penggunaan ulang penuh, mintalah izin terlebih dahulu.

— 100% dikembangkan oleh AI (GitHub Copilot Agent)
