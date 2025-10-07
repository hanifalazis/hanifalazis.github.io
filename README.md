# Portfolio Website — Muhammad Hanif Al-Azis# Portfolio Website — Muhammad Hanif Al-Azis



Website portofolio modern untuk Data Cleansing Engineer & Business Intelligence Specialist dengan animasi tema interaktif, custom cursor trail, i18n (ID/EN), projects carousel, dan pengalaman pengguna yang smooth & accessible.Website portofolio modern untuk Data Cleansing Engineer & Business Intelligence Specialist dengan animasi tema interaktif, custom cursor trail, i18n (ID/EN), projects carousel, dan pengalaman pengguna yang smooth & accessible.


un
## 🤖 100% AI-Developed (GitHub Copilot Agent)## 🤖 100% AI-Developed (GitHub Copilot Agent)



Proyek ini dikembangkan 100% oleh AI (GitHub Copilot Agent) tanpa coding manual. Seluruh struktur, HTML, CSS, dan JavaScript—termasuk fitur navigasi, animasi tema siang-malam, cursor trail, i18n, dark mode, carousel projects, dan semua interaksi—dibuat secara otomatis oleh agen AI.Proyek ini dikembangkan 100% oleh AI (GitHub Copilot Agent) tanpa coding manual. Seluruh struktur, HTML, CSS, dan JavaScript—termasuk fitur navigasi, i18n, dark mode, Back‑to‑Top, carousel projects, dan animasi—dibuat secara otomatis oleh agen AI.



## ✨ Fitur Utama## ✨ Fitur Utama



### 🎨 **Animasi Tema Siang ↔ Malam**- Navigasi halus & URL bersih

- **Full-screen celestial transition** dengan animasi matahari dan bulan	- Klik logo/“Home” pada root akan scroll halus ke atas tanpa menambah `#home` di URL.

- Matahari keluar dari **kanan bawah**, bulan masuk dari **kiri bawah** (day→night)	- Smooth scroll antar section dan highlight nav aktif saat scroll.

- Reverse choreography untuk transisi night→day- Back‑to‑Top arrow (brand blue)

- **Animasi langit gradient** dengan 4-stop color transitions	- Muncul/hilang halus, hover/press feedback, glow lembut di dark mode, hormati prefers‑reduced‑motion.

- **Bintang** dengan efek twinkle/fade yang staggered- Tema gelap/terang dengan toggle

- Durasi smooth: 2s untuk matahari, 2.1s untuk bulan, 1.6s untuk langit	- Mengikuti preferensi sistem; bisa override dan tersimpan di `localStorage`.

- Menggunakan **CSS custom properties** (`@property`) untuk interpolasi mulus- i18n bilingual (ID/EN)

- Cubic-bezier easing untuk gerakan natural	- Menggunakan `data-i18n`, `data-i18n-title`, `data-i18n-aria`. Toggle bahasa memperbarui teks, title, dan aria-label.

- Crater details pada bulan untuk realism- Projects carousel (auto‑slide + filter)

	- Memuat dari `/api/projects.json` bila tersedia; fallback ke data statis di `assets/js/projects.js`.

### 🖱️ **Custom Cursor & Trail Effect**	- Filter kategori dengan label i18n; infinite carousel, swipe di mobile, auto‑slide pause saat interaksi.

- **Custom arrow pointer** dengan SVG (Tailwind-style)- Animasi & visual polish

- **Animated trail particles** yang spawn dari belakang cursor (bukan di ujung)	- AOS untuk animasi on‑scroll; “aura memancar” looping pada foto profil; typing effect pada hero.

- Otomatis berubah ke **text cursor** saat hover pada teks yang bisa diseleksi- Aksesibilitas

- Warna menyesuaikan tema (biru terang di dark, biru gelap di light)	- Skip link, ARIA, `focus-visible`, sembunyikan dari tab order saat tidak terlihat, dukungan reduced motion.

- Smooth **fade-out & scale-down** animation untuk trail particles (600ms)

- Throttled generation (30ms delay) untuk performa optimal## 🧩 Teknologi

- Otomatis disabled di perangkat touch dan saat `prefers-reduced-motion`

- Hover scale effect (1.02x) pada elemen interaktif- HTML + CSS kustom (+ Tailwind via CDN, dengan safelist di `index.html`)

- JavaScript vanilla (tanpa bundler)

### 🎯 **Navigasi & UX**- AOS (Animate On Scroll) & Font Awesome

- **Smooth scroll** antar section dengan highlight nav aktif berdasarkan posisi scroll- Google Fonts (Poppins)

- **Hamburger menu mobile** dengan posisi stabil—tidak bergeser saat header scrolled- Analytics: Google Analytics (gtag) + Cloudflare Web Analytics

- Fixed positioning dengan `!important` overrides untuk konsistensi- Struktur Jekyll (folder `_projects`, `_layouts`, `_data`) kompatibel GitHub Pages

- Klik logo/"Home" scroll halus ke atas tanpa menambah `#home` di URL

- **Back‑to‑Top button** dengan hover/press feedback dan glow effect di dark mode## 📂 Struktur Penting

- URL tetap bersih tanpa hash fragments yang tidak perlu

- Border-left indicator untuk nav item aktif tanpa layout shift- `index.html` — Halaman utama, Tailwind CDN config + safelist, gaya Back‑to‑Top, dan inisiasi tema.

- `assets/js/script.js` — Navigasi, smooth scroll, Back‑to‑Top, AOS, i18n, tema, UX utils.

### 🌓 **Dark/Light Theme Toggle**- `assets/js/projects.js` — Manajer Projects: load JSON/fallback, filter, carousel, auto‑slide.

- **Animasi celestial** saat toggle tema (matahari/bulan bergerak diagonal)- `assets/css/style.css` — Gaya global; animasi aura foto profil (`.home-img` dengan `@keyframes aura-ring`).

- Mengikuti preferensi sistem (`prefers-color-scheme`)- `service/index.html` — Landing page layanan BI (proses, pricing, demo dashboard, dsb.).

- Tersimpan di `localStorage` untuk persistensi antar sesi- `_projects/` — Sumber konten project (untuk Jekyll); tidak otomatis dipakai di homepage kecuali dibuatkan JSON.

- Transisi smooth dengan easing cubic-bezier

- Icon moon (🌙) di label toggle## 🛠️ Konfigurasi & Kustomisasi

- Gradien text dengan glow untuk section headings di dark mode

- Vivid colors untuk filter buttons dengan enhanced hover states- Warna brand: `index.html` → blok `tailwind.config` → `colors.primary` dan `primary.light`.

- Back‑to‑Top: `index.html` → style `#back-to-top` (warna, transisi, dark‑mode glow).

### 🌐 **i18n Bilingual (ID/EN)**- Aura foto profil: `assets/css/style.css` → `.home-img` + `@keyframes aura-ring`/`aura-ring-light`.

- Sistem i18n komprehensif dengan `data-i18n`, `data-i18n-title`, `data-i18n-aria`- Terjemahan (i18n): `assets/js/script.js` → objek `translations` (kunci `id`/`en`). Gunakan `data-i18n`, `data-i18n-title`, `data-i18n-aria` pada elemen.

- Toggle bahasa memperbarui teks, title, dan aria-label secara real-time

- **Dropdown dengan flag icons** untuk visual clarity## 📦 Data Projects di Homepage

- Smooth transitions untuk perubahan bahasa

- Support untuk atribut dinamis (placeholder, aria-label, dll)Homepage mencoba fetch `/api/projects.json`. Jika tidak ada, otomatis pakai fallback di `assets/js/projects.js`.



### 📂 **Projects Showcase**Opsi sumber data:

- **Auto-slide carousel** dengan infinite loop- Cepat (fallback): sunting array `this.projects` di `loadFallbackProjects()`.

- **Filter kategori** (All, Data Analysis, Dashboard, Automation, Other) dengan label i18n- Dinamis (opsional): sediakan file statis `/api/projects.json` dengan struktur array proyek yang sama (judul, deskripsi, gambar, link, kategori, tanggal, dll). Jika memakai Jekyll, Anda bisa membuat template JSON dari `_projects/`.

- Swipe support di mobile devices

- Auto-pause saat user interaksi (hover, touch, filter)## ▶️ Menjalankan Lokal

- Load dari `/api/projects.json` atau fallback ke data statis di `assets/js/projects.js`

- Hover effects dengan scale & shadow transitionsTanpa build step — cukup buka `index.html` langsung. Disarankan VS Code + ekstensi Live Server untuk auto‑reload.

- Responsive card layout dengan image aspect ratio

Opsional (Jekyll), untuk memanfaatkan `_projects` pada halaman lain:

### ✨ **Visual Polish & Animations**

- **AOS (Animate On Scroll)** untuk reveal animations dengan smart suppression saat nav click```powershell

- **"Aura memancar"** looping pada foto profil dengan keyframe animations# Prasyarat: Ruby + Bundler

- **Typing effect** pada hero sectionbundle install

- **Snow particle effect** pada skill chips saat hover (light/dark aware)bundle exec jekyll serve --livereload

- **Gradient text with glow** untuk section headings di dark mode# Akses di http://127.0.0.1:4000

- Enhanced filter buttons dengan vivid gradients dan box-shadows```

- Borderless section design untuk clean modern look

- Optimized scroll performance (removed heavy blur overlays)## 🔎 Catatan & Known Issues



### ♿ **Aksesibilitas**- Jika `/api/projects.json` tidak ditemukan, itu normal — fallback akan dipakai.

- Skip link untuk keyboard users- Perubahan warna ikon Back‑to‑Top kadang tertahan cache; lakukan hard refresh bila perlu.

- Proper ARIA labels, roles, dan states- Tailwind CDN dengan safelist: jika menambah utility class dinamis baru, tambahkan ke `safelist` di `index.html`.

- `focus-visible` styling untuk keyboard navigation

- Hidden dari tab order saat tidak terlihat## 📜 Lisensi

- Full support untuk `prefers-reduced-motion` (disables semua animations)

- Screen reader friendly dengan semantic HTMLKonten dan kode sumber untuk keperluan portofolio pribadi. Silakan gunakan sebagai referensi; untuk penggunaan ulang penuh, mintalah izin terlebih dahulu.

- Keyboard-accessible hamburger menu dengan Escape key support

- Touch-friendly targets (minimum 44x44px)— 100% dikembangkan oleh AI (GitHub Copilot Agent)


## 🧩 Teknologi

- **HTML5** + **CSS3** kustom dengan modern features:
  - CSS Custom Properties (`@property`) untuk smooth animations
  - CSS Grid & Flexbox untuk responsive layouts
  - CSS Transforms & Transitions
  - Media queries untuk responsive design
- **JavaScript Vanilla** (ES6+) tanpa dependencies berat:
  - Event delegation untuk performa
  - LocalStorage API untuk persistensi
  - Intersection Observer API untuk scroll effects
  - RequestAnimationFrame untuk smooth animations
- **AOS** (Animate On Scroll) library
- **Font Awesome** untuk icons
- **Google Fonts** (Poppins) untuk typography
- **SVG** untuk custom cursor dan graphics
- **Analytics**: Google Analytics (gtag) + Cloudflare Web Analytics
- Struktur **Jekyll-compatible** (folder `_projects`, `_layouts`, `_data`) untuk GitHub Pages

## 📂 Struktur File

```
├── index.html                 # Homepage dengan theme transition overlay
├── README.md                  # Dokumentasi ini
├── _config.yml               # Jekyll config
├── 404.html                  # Custom error page
├── CNAME                     # Custom domain config
├── robots.txt                # SEO crawlers
├── sitemap.xml              # SEO sitemap
├── site.webmanifest         # PWA manifest
│
├── _data/
│   └── site.json            # Site metadata
│
├── _layouts/
│   └── project.html         # Project detail layout
│
├── _projects/               # Project markdown files
│   ├── 2024-11-15-analisis-amazon-valentine-2024.md
│   ├── 2024-12-01-aplikasi-akuntansi-google-spreadsheet.md
│   └── 2025-09-13-sample-project.md
│
├── assets/
│   ├── css/
│   │   ├── style.css        # Main stylesheet dengan:
│   │   │                    # - Theme transition animations
│   │   │                    # - Custom cursor styles
│   │   │                    # - Responsive mobile nav
│   │   │                    # - Dark/light theme variables
│   │   │                    # - Skill chip animations
│   │   └── projects.css     # Projects page specific styles
│   │
│   ├── js/
│   │   ├── script.js        # Main JavaScript:
│   │   │                    # - Cursor trail initialization
│   │   │                    # - Theme transition orchestration
│   │   │                    # - Hamburger menu logic
│   │   │                    # - Smooth scroll & nav highlight
│   │   │                    # - i18n system
│   │   │                    # - AOS integration
│   │   └── projects.js      # Projects carousel & filter
│   │
│   ├── images/
│   │   ├── profile.jpg
│   │   └── projects/        # Project screenshots
│   │
│   ├── icons/               # SVG icons & favicons
│   │   ├── favicon.svg
│   │   ├── flag-en.svg
│   │   ├── flag-id.svg
│   │   └── [tool icons]
│   │
│   ├── files/
│   │   └── cv-muhammad-hanif-al-azis.pdf
│   │
│   └── i18n/
│       ├── en.json          # English translations
│       └── id.json          # Indonesian translations
│
└── service/
    ├── index.html           # Service landing page
    └── assets/              # Service-specific assets
```

## 🛠️ Konfigurasi & Kustomisasi

### Warna Brand
Edit CSS variables di `assets/css/style.css`:
```css
:root {
    --color-primary: #2a5da8;
    --color-primary-light: #3f78d1;
    /* ... */
}
```

### Animasi Tema
Kustomisasi di `assets/css/style.css`:
```css
/* Durasi animasi */
.theme-transition.is-active.to-dark .theme-transition__sun {
    animation: sun-set 2s cubic-bezier(.35, .01, .26, 1) forwards;
}

/* Path diagonal matahari/bulan */
@keyframes sun-set {
    0% { --orb-x: 0; --orb-y: 0; }
    100% { --orb-x: 52; --orb-y: 38; } /* Kanan bawah */
}
```

### Custom Cursor
Edit SVG cursor di `assets/css/style.css`:
```css
body {
    cursor: url("data:image/svg+xml,%3Csvg...") 0 0, auto;
}
```

### Cursor Trail
Sesuaikan di `assets/js/script.js`:
```javascript
const trailDelay = 30; // milliseconds between particles
const offsetDistance = 12; // pixels behind cursor
```

### Terjemahan (i18n)
Edit `assets/i18n/id.json` dan `assets/i18n/en.json`:
```json
{
    "nav": {
        "home": "Beranda",
        "about": "Tentang"
    }
}
```

Gunakan di HTML:
```html
<a data-i18n="nav.home">Home</a>
```

### Mobile Navigation
Posisi stabil dengan force-override di `assets/css/style.css`:
```css
@media (max-width: 1100px) {
    nav a {
        padding: 1rem 0 1rem 5% !important;
        margin-left: 0 !important;
    }
}
```

## 📦 Data Projects

### Opsi 1: Fallback Statis (Default)
Edit array di `assets/js/projects.js`:
```javascript
loadFallbackProjects() {
    this.projects = [
        {
            title: "Project Title",
            description: "Description",
            image: "assets/images/projects/image.png",
            link: "#",
            category: "data-analysis",
            date: "2024-01-01"
        }
    ];
}
```

### Opsi 2: Dynamic JSON
Buat file `/api/projects.json`:
```json
[
    {
        "title": "Project Title",
        "description": "Description",
        "image": "assets/images/projects/image.png",
        "link": "#",
        "category": "data-analysis",
        "date": "2024-01-01"
    }
]
```

## ▶️ Menjalankan Lokal

### Simple (No Build)
1. Buka `index.html` langsung di browser, atau
2. Gunakan VS Code + Live Server extension untuk auto-reload

### Jekyll (Opsional)
Untuk memanfaatkan `_projects` dan Jekyll features:

```powershell
# Install dependencies
bundle install

# Run development server
bundle exec jekyll serve --livereload

# Akses di http://127.0.0.1:4000
```

## 🚀 Deployment

### GitHub Pages (Recommended)
1. Push ke repository GitHub
2. Settings → Pages → Source: `main` branch
3. Custom domain di `CNAME` (opsional)

### Manual Deployment
Upload semua file ke web server. Pastikan:
- `index.html` di root
- Path assets relatif tetap valid
- MIME types configured (SVG, JSON, dll)

## 🎨 Best Practices yang Diterapkan

### Performance
- **Throttled trail generation** untuk menghindari DOM thrashing
- **Event delegation** untuk event listeners
- **Will-change** hints untuk animasi
- **RequestAnimationFrame** untuk smooth animations
- **Lazy loading** untuk images (via AOS)
- **Prefers-reduced-motion** respect

### Accessibility
- **Semantic HTML5** elements
- **ARIA labels** lengkap
- **Keyboard navigation** support
- **Focus indicators** visible
- **Color contrast** WCAG AA compliant
- **Screen reader** friendly

### Code Quality
- **Modular JavaScript** dengan IIFE patterns
- **CSS BEM-like** naming conventions
- **Responsive design** mobile-first
- **Progressive enhancement** approach
- **Cross-browser** compatibility

## 🔍 Troubleshooting

### Cursor tidak muncul
- Pastikan tidak di perangkat touch (`hover: hover` check)
- Check `prefers-reduced-motion` setting
- Hard refresh browser (Ctrl+Shift+R)

### Animasi tema tidak berjalan
- Periksa console untuk JavaScript errors
- Pastikan `.theme-transition` element ada di HTML
- Check `prefers-reduced-motion` setting

### Nav items bergerak di mobile
- Sudah fixed dengan `!important` overrides
- Clear browser cache jika masih terjadi

### Projects tidak load
- Normal jika `/api/projects.json` tidak ada
- Fallback otomatis ke data statis di `assets/js/projects.js`

## 📝 Known Issues & Limitations

- **SVG cursor**: Tidak support di beberapa browser lama (fallback ke default cursor)
- **Custom properties animation**: Perlu browser modern (Chrome 85+, Firefox 81+, Safari 14.1+)
- **Backdrop-filter**: Limited support di Firefox (fallback dengan solid background)
- **Trail particles**: Sedikit memory overhead jika cursor bergerak terus-menerus (auto cleanup setelah 600ms)

## 🔄 Update Log

### Latest Updates
- ✅ Added full-screen celestial theme transition with sun/moon diagonal paths
- ✅ Implemented custom arrow cursor with animated trail effect
- ✅ Enhanced dark mode with gradient text and vivid filter buttons
- ✅ Fixed mobile navigation stability (no shift when header scrolls)
- ✅ Optimized scroll performance (removed heavy blur effects)
- ✅ Added snow particle effect on skill chips
- ✅ Improved accessibility with better focus states and ARIA labels

## 📜 Lisensi

Konten dan kode sumber untuk keperluan portofolio pribadi. Silakan gunakan sebagai referensi; untuk penggunaan ulang penuh, hubungi owner terlebih dahulu.

---

**🤖 100% Dikembangkan oleh AI (GitHub Copilot Agent)**

Website ini adalah showcase kemampuan AI dalam web development—dari concept hingga implementation, tanpa coding manual sama sekali.
