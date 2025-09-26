// Project management for Decap CMS integration with Carousel
class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentSlide = 0;
        this.activeFilter = 'All';
        this.filteredProjects = [];
        this.autoSlideInterval = null;
        this.autoSlideDelay = 4000; // 4 seconds
        this.isUserInteracting = false;
        this.translateX = 0;
        this.cardWidth = 0;
        this.isTransitioning = false;
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.normalizeProjects();
        this.setupFilters();
        this.renderProjects();
        this.setupCarousel();
        this.startAutoSlide();
    }

    async loadProjects() {
        try {
            // Try to load from _projects folder (if using Jekyll/static generation)
            const response = await fetch('/api/projects.json');
            if (response.ok) {
                this.projects = await response.json();
            } else {
                // Fallback to manual project data
                this.loadFallbackProjects();
            }
        } catch (error) {
            console.log('Loading fallback projects...');
            this.loadFallbackProjects();
        }
    }

    loadFallbackProjects() {
        // Fallback projects data (current projects from your HTML)
        this.projects = [
            {
                id: 1,
                title: "Aplikasi Akuntansi berbasis Google Spreadsheet",
                description: "Aplikasi akuntansi lengkap dengan fitur jurnal kas, penjualan, pembelian, laporan aset, inventory, laba rugi, dan neraca menggunakan Google Spreadsheet.",
                image: "/assets/images/projects/accounting-app.png",
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
                image: "/assets/images/projects/amazon-analysis.png",
                tech_stack: ["Python", "Pandas", "Matplotlib", "Seaborn", "Jupyter Notebook"],
                link: "https://github.com/hanifalazis/Amazon-Valentine-Dashboard-2024",
                category: "Data Analysis", 
                date: "2024-11-15",
                featured: true,
                i18n_key: "portfolio.p2"
            },
            {
                id: 5,
                title: "Dashboard Analisis Tingkat Pengangguran di Indonesia",
                description: "Dashboard interaktif untuk analisis Tingkat Pengangguran Terbuka (TPT) di Indonesia, menampilkan tren waktu, perbandingan wilayah, dan demografi.",
                image: "/assets/images/projects/Analisis-TPT-Indonesia.jpg",
                tech_stack: ["Google Looker Studio"],
                link: "https://lookerstudio.google.com/s/g8O4PwuMQlw",
                category: "Dashboard",
                date: "2024-10-05",
                featured: true
            },
            {
                id: 3,
                title: "Dashboard Consumer Complaints CFPB",
                description: "Dashboard interaktif untuk visualisasi data keluhan konsumen CFPB menggunakan Decap CMS dan Google Looker Studio.",
                image: "/assets/images/projects/dashboard-cfpb.jpg",
                tech_stack: ["Google Looker Studio"],
                link: "https://lookerstudio.google.com/s/nRGtBzuZ5eo",
                category: "Dashboard",
                date: "2024-09-13",
                featured: true
            },
            {
                id: 4,
                title: "Demographics and Member Distribution Dashboard",
                description: "Dashboard interaktif untuk visualisasi demografi dan distribusi anggota menggunakan Google Looker Studio.",
                image: "/assets/images/projects/dashboard-member.jpg",
                tech_stack: ["Google Looker Studio"],
                link: "https://lookerstudio.google.com/s/nIGl8VBmpWs",
                category: "Dashboard",
                date: "2024-08-20",
                featured: true
            }
        ];
    }

    // Ensure each project has a stable category_key for i18n and filtering
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
        this.startAutoSlide();
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
        const totalSets = 3; // Show original + 2 duplicates for smooth infinite scroll
        for (let set = 0; set < totalSets; set++) {
            sortedProjects.forEach(project => {
                const projectElement = this.createCarouselCard(project);
                portfolioContainer.appendChild(projectElement);
            });
        }

        // Reset position and update dot indicators
    this.currentSlide = 0;
    // Position the carousel at the start of the middle set for seamless infinite effect
    const step = this.getStepPx();
    const basePosition = sortedProjects.length; // start of middle set
    this.translateX = step ? -(basePosition * step) : 0;
    portfolioContainer.style.transition = 'none';
    portfolioContainer.style.transform = `translateX(${this.translateX}px)`;
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

        cardDiv.innerHTML = `
            <div class="card-image">
                <img src="${imageUrl}" alt="${project.title}" loading="lazy" onerror="this.src='/img/main.jpg'">
                <div class="card-overlay">
                    <div class="card-category" data-i18n="portfolio.category.${project.category_key}">${project.category}</div>
                    ${project.link ? `<a href="${project.link}" class="card-link" target="_blank" rel="noopener noreferrer" aria-label="View ${project.title}"><i class="fa-solid fa-external-link"></i></a>` : ''}
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
        // Remove old arrow navigation buttons
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        if (prevBtn) prevBtn.remove();
        if (nextBtn) nextBtn.remove();

        // Touch/swipe support
        const carousel = document.querySelector('.portfolio-carousel');
        if (carousel) {
            let startX = 0;
            let isDragging = false;

            carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
            });

            carousel.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
            });

            carousel.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) {
                    this.handleUserInteraction();
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }

                isDragging = false;
            });

            // Pause auto-slide on hover
            carousel.addEventListener('mouseenter', () => {
                this.pauseAutoSlide();
            });

            carousel.addEventListener('mouseleave', () => {
                if (!this.isUserInteracting) {
                    this.startAutoSlide();
                }
            });
        }
    }

    nextSlide() {
        if (this.isTransitioning) return;
        
        const originalProjects = this.getCurrentProjects();
        this.currentSlide = (this.currentSlide + 1) % originalProjects.length;
        this.updateInfiniteCarousel();
    }

    prevSlide() {
        if (this.isTransitioning) return;
        
        const originalProjects = this.getCurrentProjects();
        this.currentSlide = this.currentSlide === 0 ? originalProjects.length - 1 : this.currentSlide - 1;
        this.updateInfiniteCarousel();
    }

    goToSlide(index) {
        if (this.isTransitioning) return;
        
        this.currentSlide = index;
        this.updateInfiniteCarousel();
    }

    updateInfiniteCarousel() {
        const carousel = document.querySelector('.portfolio-carousel');
        if (!carousel) return;

        this.isTransitioning = true;
        const originalProjects = this.getCurrentProjects();
        // Determine the exact step size based on actual rendered card width + CSS gap
        const step = this.getStepPx();
        if (!step) {
            this.isTransitioning = false;
            return;
        }

        // Calculate position: always target middle set (index originalProjects.length) + current slide
        const basePosition = originalProjects.length;
        const targetPosition = basePosition + this.currentSlide;
        this.translateX = -targetPosition * step;

        carousel.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        carousel.style.transform = `translateX(${this.translateX}px)`;

        // Update dot indicators
        this.updateDotIndicators();

        // End transition lock after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 400);
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

        navContainer.innerHTML = '';
        
        for (let i = 0; i < totalProjects; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => {
                this.handleUserInteraction();
                this.goToSlide(i);
            });
            navContainer.appendChild(dot);
        }
    }

    updateDotIndicators() {
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    // Auto-slide methods
    startAutoSlide() {
        this.pauseAutoSlide(); // Clear any existing interval
        this.autoSlideInterval = setInterval(() => {
            if (!this.isUserInteracting) {
                this.nextSlide();
            }
        }, this.autoSlideDelay);
    }

    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
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