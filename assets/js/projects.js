/**
 * ProjectManager Class
 * Manages portfolio projects with filtering, infinite carousel, and drag/swipe functionality
 * Integrates with internationalization system and supports both CMS and fallback data sources
 */
class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentSlide = 0;
        this.activeFilter = 'All';
        this.filteredProjects = [];
        this.autoSlideInterval = null;
        this.autoSlideDelay = 4000;
        this.isUserInteracting = false;
        this.translateX = 0;
        this.cardWidth = 0;
        this.isTransitioning = false;
        this.init();
    }

    /**
     * Initializes the project manager
     * Loads projects, sets up filters and carousel, starts auto-slide animation
     */
    async init() {
        await this.loadProjects();
        this.normalizeProjects();
        this.setupFilters();
        this.renderProjects();
        this.setupCarousel();
        
        setTimeout(() => {
            this.startAutoSlide();
        }, 100);
        
        window.addEventListener('i18n:changed', (e) => {
            const dict = e && e.detail ? e.detail.dict : null;
            this.updateI18nLabels(dict);
        });
    }

    /**
     * Attempts to load projects from API endpoint
     * Falls back to hardcoded project data if API is unavailable
     */
    async loadProjects() {
        try {
            const response = await fetch('/api/projects.json');
            if (response.ok) {
                this.projects = await response.json();
            } else {
                this.loadFallbackProjects();
            }
        } catch (error) {
            console.log('Loading fallback projects...');
            this.loadFallbackProjects();
        }
    }

    updateI18nLabels(dict) {
        const d = dict || (window.__i18n && window.__i18n.currentDict) || null;
        // Update dot aria labels
        const dotPrefix = d && d['carousel.goToSlidePrefix'] ? d['carousel.goToSlidePrefix'] : 'Go to slide';
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
            dot.setAttribute('aria-label', `${dotPrefix} ${idx + 1}`);
        });
        // Update card-link aria labels
        const viewPrefix = d && d['portfolio.viewPrefix'] ? d['portfolio.viewPrefix'] : 'View';
        document.querySelectorAll('.carousel-card .card-link').forEach(a => {
            const title = a.closest('.carousel-card')?.querySelector('.card-title')?.textContent?.trim() || '';
            a.setAttribute('aria-label', `${viewPrefix} ${title}`);
        });
    }

    loadFallbackProjects() {
        // Fallback projects data (current projects from your HTML)
        this.projects = [
            {
                id: 1,
                title: "Aplikasi Akuntansi berbasis Google Spreadsheet",
                description: "Aplikasi akuntansi lengkap dengan fitur jurnal kas, penjualan, pembelian, laporan aset, inventory, laba rugi, dan neraca menggunakan Google Spreadsheet.",
                image: "/assets/images/projects/accounting-app.webp",
                tech_stack: ["Google Spreadsheet", "INDEX MATCH", "SUMIFS", "QUERY", "UNIQUE", "FILTER", "CHOOSECOLUMN"],
                link: "https://docs.google.com/spreadsheets/d/19gcBJWEpWHnxFLaINBM3fFnQVFF4HSfbXfmzvMIjUEw/edit?usp=sharing",
                category: "Data Analysis",
                date: "2024-12-01",
                featured: true,
                i18n_key: "portfolio.p1"
            },
            {
                id: 2,
                title: "Analisis Data Python – Amazon Best Sellers (Valentine 2024)",
                description: "Analisis tren produk terlaris Amazon untuk Valentine 2024 menggunakan Python dengan visualisasi data yang komprehensif menggunakan Pandas dan Matplotlib.",
                image: "/assets/images/projects/amazon-analysis.webp",
                tech_stack: ["Python", "Pandas", "Matplotlib", "Seaborn", "Jupyter Notebook"],
                link: "https://github.com/hanifalazis/Amazon-Valentine-Dashboard-2024",
                category: "Data Analysis", 
                date: "2024-11-15",
                featured: true,
                i18n_key: "portfolio.p2"
            },
            {
                id: 6,
                title: "Dashboard Penjualan Properti",
                description: "Dashboard ini untuk memantau status akad, pemberkasan, booking dan unit yang masih open. Melihat siapa marketing yang paling berkontribusi dan persentase unit yang terjual.",
                image: "/assets/images/projects/Dashboard_Penjualan_Properti.webp",
                tech_stack: ["Google Looker Studio"],
                link: "https://lookerstudio.google.com/s/vbuT0_BB6l0",
                category: "Dashboard",
                date: "2024-10-15",
                featured: true,
                i18n_key: "portfolio.p6"
            },
            {
                id: 5,
                title: "Dashboard Analisis Tingkat Pengangguran di Indonesia",
                description: "Dashboard interaktif untuk analisis Tingkat Pengangguran Terbuka (TPT) di Indonesia, menampilkan tren waktu, perbandingan wilayah, dan demografi.",
                image: "/assets/images/projects/Analisis-TPT-Indonesia.webp",
                tech_stack: ["Google Looker Studio"],
                link: "https://lookerstudio.google.com/s/g8O4PwuMQlw",
                category: "Dashboard",
                date: "2024-10-05",
                featured: true,
                i18n_key: "portfolio.p5"
            },
            {
                id: 3,
                title: "Dashboard Consumer Complaints CFPB",
                description: "Dashboard interaktif untuk visualisasi data keluhan konsumen CFPB menggunakan Decap CMS dan Google Looker Studio.",
                image: "/assets/images/projects/dashboard-cfpb.webp",
                tech_stack: ["Google Looker Studio"],
                link: "https://lookerstudio.google.com/s/nRGtBzuZ5eo",
                category: "Dashboard",
                date: "2024-09-13",
                featured: true,
                i18n_key: "portfolio.p3"
            },
            {
                id: 4,
                title: "Demographics and Member Distribution Dashboard",
                description: "Dashboard interaktif untuk visualisasi demografi dan distribusi anggota menggunakan Google Looker Studio.",
                image: "/assets/images/projects/dashboard-member.webp",
                tech_stack: ["Google Looker Studio"],
                link: "https://lookerstudio.google.com/s/nIGl8VBmpWs",
                category: "Dashboard",
                date: "2024-08-20",
                featured: true,
                i18n_key: "portfolio.p4"
            }
        ];
    }

    /**
     * Normalizes project data by mapping category strings to standardized i18n keys
     * Ensures consistent category naming across different language versions
     */
    normalizeProjects() {
        const mapCategoryToKey = (cat) => {
            if (!cat) return 'other';
            const c = String(cat).toLowerCase();
            if (c.includes('data') && c.includes('analysis')) return 'dataAnalysis';
            if (c.includes('dashboard')) return 'dashboard';
            // Indonesian fallbacks
            if (c.includes('analisis')) return 'dataAnalysis';
            return c
                .replace(/[^a-z0-9]+/g, ' ') // keep alnum and spaces
                .trim()
                .split(' ')
                .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
                .join('') || 'other';
        };

        this.projects = (this.projects || []).map(p => ({
            ...p,
            category_key: p.category_key || mapCategoryToKey(p.category),
        }));
    }

    getCurrentLang() {
        try {
            const saved = localStorage.getItem('lang');
            if (saved) return saved;
        } catch {}
        return ((navigator.language || 'id').toLowerCase().startsWith('en') ? 'en' : 'id');
    }

    setupFilters() {
        // Get unique category keys from projects
        const catKeys = ['all', ...new Set(this.projects.map(project => project.category_key))];
        const filterContainer = document.querySelector('.portfolio-filters');
        
        if (!filterContainer) return;

        filterContainer.innerHTML = '';

        catKeys.forEach(key => {
            const filterBtn = document.createElement('button');
            filterBtn.className = `filter-btn ${key === 'all' ? 'active' : ''}`;
            filterBtn.dataset.categoryKey = key;
            // Use i18n key for label
            if (key === 'all') {
                filterBtn.setAttribute('data-i18n', 'portfolio.filter.all');
                filterBtn.textContent = 'All';
            } else {
                filterBtn.setAttribute('data-i18n', `portfolio.category.${key}`);
                filterBtn.textContent = key;
            }
            filterBtn.addEventListener('click', () => this.filterProjects(key));
            filterContainer.appendChild(filterBtn);
        });

        // Apply current language to newly created nodes
        if (window.applyLanguage) {
            window.applyLanguage(this.getCurrentLang());
        }
    }

    filterProjects(categoryKey) {
        this.activeFilter = categoryKey;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.categoryKey === categoryKey) {
                btn.classList.add('active');
            }
        });

        // Filter projects
        this.filteredProjects = categoryKey === 'all' 
            ? this.projects.filter(project => project.featured)
            : this.projects.filter(project => project.featured && project.category_key === categoryKey);

        // Reset carousel position
        this.currentSlide = 0;
        this.renderProjects();
        
        // Restart auto-slide for new filtered content
        this.isUserInteracting = false;
        setTimeout(() => {
            this.startAutoSlide();
        }, 100);
    }

    renderProjects() {
        const portfolioContainer = document.querySelector('.portfolio-carousel');
        if (!portfolioContainer) return;

        // Use filtered projects or all featured projects
        const projectsToShow = this.filteredProjects.length > 0 
            ? this.filteredProjects 
            : this.projects.filter(project => project.featured);

        // Sort projects by date (newest first)
        const sortedProjects = projectsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Clear existing content
        portfolioContainer.innerHTML = '';

        // Create infinite carousel by duplicating cards
        // Duplicate enough times so the animation can loop seamlessly
        const duplicateCount = 10; // Enough duplicates for smooth infinite scroll
        for (let i = 0; i < duplicateCount; i++) {
            sortedProjects.forEach(project => {
                const projectElement = this.createCarouselCard(project);
                portfolioContainer.appendChild(projectElement);
            });
        }

        // Reset position and update dot indicators
    this.currentSlide = 0;
    // For smooth auto-scroll, remove any manual transform/transition to let CSS animation work
    portfolioContainer.style.transition = '';
    portfolioContainer.style.transform = '';
        this.renderDotIndicators(sortedProjects.length);

        // Apply current language to newly created nodes
        if (window.applyLanguage) {
            window.applyLanguage(this.getCurrentLang());
        }
    }

    createCarouselCard(project) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'carousel-card';

        // Fallback image if project image not available
        const imageUrl = project.image || '/assets/images/projects/default-project.jpg';

        const dict = (window.__i18n && window.__i18n.currentDict) ? window.__i18n.currentDict : null;
        const viewPrefix = dict && dict['portfolio.viewPrefix'] ? dict['portfolio.viewPrefix'] : 'View';

        cardDiv.innerHTML = `
            <div class="card-image">
                <img src="${imageUrl}" alt="${project.title}" loading="lazy" onerror="this.src='/img/main.jpg'">
                <div class="card-overlay">
                    <div class="overlay-top">
                        <div class="card-category" data-i18n="portfolio.category.${project.category_key}">${project.category}</div>
                        ${project.link ? `<a href="${project.link}" class="card-link" target="_blank" rel="noopener noreferrer" aria-label="${viewPrefix} ${project.title}"><i class="fa-solid fa-external-link"></i></a>` : ''}
                    </div>
                    <div class="overlay-bottom">
                        <h3 class="overlay-title" ${project.i18n_key ? `data-i18n="${project.i18n_key}.title"` : ''}>${project.title}</h3>
                        <p class="overlay-description" ${project.i18n_key ? `data-i18n="${project.i18n_key}.d1"` : ''}>${project.description}</p>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title" ${project.i18n_key ? `data-i18n="${project.i18n_key}.title"` : ''}>${project.title}</h3>
                <p class="card-description" ${project.i18n_key ? `data-i18n="${project.i18n_key}.d1"` : ''}>${project.description}</p>
            </div>
        `;

        return cardDiv;
    }

    setupCarousel() {
        const carousel = document.querySelector('.portfolio-carousel');
        if (!carousel) return;

        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;

        // Get current transform value
        const getTransformValue = () => {
            const style = window.getComputedStyle(carousel);
            const matrix = new DOMMatrix(style.transform);
            return matrix.m41; // translateX value
        };

        // Mouse/Touch event handlers
        const touchStart = (e) => {
            // Get position FIRST before any other operations
            prevTranslate = getTransformValue();
            
            isDragging = true;
            startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            currentTranslate = prevTranslate; // Initialize currentTranslate
            
            carousel.classList.add('dragging');
            this.pauseAutoSlide();
            this.isUserInteracting = true;
            animationID = requestAnimationFrame(animation);
        };

        const touchMove = (e) => {
            if (!isDragging) return;
            
            const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            const diff = currentPosition - startPos;
            currentTranslate = prevTranslate + diff;
        };

        const touchEnd = () => {
            if (!isDragging) return;
            
            isDragging = false;
            cancelAnimationFrame(animationID);
            
            carousel.classList.remove('dragging');
            
            // Keep the current position (already set by animation loop)
            // No need to set again unless there was actual movement
            const finalPosition = currentTranslate || prevTranslate;
            carousel.style.transform = `translateX(${finalPosition}px)`;
            
            // Resume auto-slide after delay
            setTimeout(() => {
                this.isUserInteracting = false;
                this.startAutoSlide();
            }, 2000);
        };

        const animation = () => {
            if (isDragging) {
                carousel.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        };

        // Mouse events
        carousel.addEventListener('mousedown', touchStart);
        carousel.addEventListener('mousemove', touchMove);
        carousel.addEventListener('mouseup', touchEnd);
        carousel.addEventListener('mouseleave', () => {
            if (isDragging) touchEnd();
        });

        // Touch events
        carousel.addEventListener('touchstart', touchStart, { passive: true });
        carousel.addEventListener('touchmove', touchMove, { passive: true });
        carousel.addEventListener('touchend', touchEnd);

        // Pause auto-slide on hover
        carousel.addEventListener('mouseenter', () => {
            this.isUserInteracting = true;
            this.pauseAutoSlide();
        });

        carousel.addEventListener('mouseleave', () => {
            if (!isDragging) {
                this.isUserInteracting = false;
                setTimeout(() => {
                    if (!this.isUserInteracting) {
                        this.startAutoSlide();
                    }
                }, 1000);
            }
        });

        // Tap-to-toggle only on touch/coarse pointers (mobile/tablet). Desktop uses hover only.
        const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        if (isCoarsePointer) {
            carousel.addEventListener('click', (e) => {
                // Ignore if drag happened, or clicking a link/button
                if (isDragging) return;
                if (e.target.closest('a, button')) return;
                const card = e.target.closest('.carousel-card');
                if (!card) return;

                const wasActive = card.classList.contains('active');
                // Close others
                document.querySelectorAll('.carousel-card.active').forEach(c => c.classList.remove('active'));
                if (!wasActive) {
                    card.classList.add('active');
                    this.handleUserInteraction(); // pause auto-slide while reading
                } else {
                    // resume auto-slide shortly after closing
                    setTimeout(() => {
                        this.isUserInteracting = false;
                        this.startAutoSlide();
                    }, 1500);
                }
            });
        }

        // If mouse leaves the page (desktop), revert to initial state (no active cards)
        window.addEventListener('mouseout', (e) => {
            // When leaving window, relatedTarget is null
            if (!e.relatedTarget) {
                document.querySelectorAll('.carousel-card.active').forEach(c => c.classList.remove('active'));
            }
        });

        // Prevent context menu on long press
        carousel.addEventListener('contextmenu', (e) => {
            if (isDragging) e.preventDefault();
        });

        // Prevent default drag behavior on images
        carousel.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
    }

    nextSlide() {
        // Smooth scroll tidak menggunakan slide manual
        // User interaction akan pause animation saja
    }

    prevSlide() {
        // Smooth scroll tidak menggunakan slide manual
        // User interaction akan pause animation saja
    }

    goToSlide(index) {
        // Smooth scroll tidak menggunakan slide manual
        // User interaction akan pause animation saja
    }

    updateInfiniteCarousel() {
        // Tidak digunakan untuk smooth scroll
        // CSS animation menangani pergerakan
    }

    getCurrentProjects() {
        return this.filteredProjects.length > 0 
            ? this.filteredProjects 
            : this.projects.filter(project => project.featured);
    }

    getCardsPerView() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    }

    getCardWidth() {
        const containerWidth = document.querySelector('.portfolio-container')?.offsetWidth || window.innerWidth;
        const cardsPerView = this.getCardsPerView();
        const gap = 20; // Gap between cards
        return (containerWidth - (gap * (cardsPerView - 1))) / cardsPerView;
    }

    // Measure the exact step size between cards (card width + actual gap in pixels)
    getStepPx() {
        const carousel = document.querySelector('.portfolio-carousel');
        if (!carousel) return 0;
        const cards = carousel.querySelectorAll('.carousel-card');
        if (cards.length >= 2) {
            // offsetLeft difference accounts for card width + gap precisely
            const step = cards[1].offsetLeft - cards[0].offsetLeft;
            return Math.max(0, Math.round(step));
        } else if (cards.length === 1) {
            const cs = getComputedStyle(carousel);
            const gapPx = parseFloat(cs.columnGap || cs.gap || '0') || 0;
            return Math.round(cards[0].offsetWidth + gapPx);
        }
        return 0;
    }

    renderDotIndicators(totalProjects) {
        const navContainer = document.querySelector('.carousel-nav');
        if (!navContainer) return;
        
        // Hide dot indicators for smooth continuous scroll
        navContainer.innerHTML = '';
        navContainer.style.display = 'none';
    }

    updateDotIndicators() {
        // Tidak digunakan untuk smooth continuous scroll
    }

    // Auto-slide methods - Smooth continuous scrolling with requestAnimationFrame
    startAutoSlide() {
        // Stop any existing animation first
        this.pauseAutoSlide();
        
        const carousel = document.querySelector('.portfolio-carousel');
        if (!carousel) return;
        
        // Remove CSS animation class, we'll use JS animation
        carousel.classList.remove('auto-scrolling');
        
        const speed = 0.5; // pixels per frame (adjust for speed)
        
        const animate = () => {
            // Check if we should stop
            if (this.isUserInteracting || !carousel || !this.autoSlideInterval) {
                return;
            }
            
            // Get current position
            const style = window.getComputedStyle(carousel);
            const matrix = new DOMMatrix(style.transform);
            let currentX = matrix.m41;
            
            // Move left
            currentX -= speed;
            
            // Calculate reset point (50% of total width for seamless loop)
            const totalWidth = carousel.scrollWidth;
            const halfWidth = totalWidth / 2;
            
            // Reset to 0 when we reach halfway point
            if (Math.abs(currentX) >= halfWidth) {
                currentX = 0;
            }
            
            carousel.style.transform = `translateX(${currentX}px)`;
            
            // Continue animation and store the ID
            this.autoSlideInterval = requestAnimationFrame(animate);
        };
        
        // Start the animation
        this.autoSlideInterval = requestAnimationFrame(animate);
    }

    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            cancelAnimationFrame(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
        
        const carousel = document.querySelector('.portfolio-carousel');
        if (carousel) {
            carousel.classList.remove('auto-scrolling');
            // Position is already frozen, no need to modify transform
        }
    }

    handleUserInteraction() {
        this.isUserInteracting = true;
        this.pauseAutoSlide();
        
        // Resume auto-slide after 10 seconds of no interaction
        setTimeout(() => {
            this.isUserInteracting = false;
            this.startAutoSlide();
        }, 10000);
    }

    // Method to add new project (called by CMS)
    addProject(projectData) {
        this.projects.push(projectData);
        this.renderProjects();
    }

    // Method to update project (called by CMS)
    updateProject(projectId, projectData) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...projectData };
            this.renderProjects();
        }
    }
}

// Initialize project manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.projectManager = new ProjectManager();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.projectManager) {
        window.projectManager.updateInfiniteCarousel();
    }
});

// Handle page visibility (pause auto-slide when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (window.projectManager) {
        if (document.hidden) {
            window.projectManager.pauseAutoSlide();
        } else if (!window.projectManager.isUserInteracting) {
            window.projectManager.startAutoSlide();
        }
    }
});