// Project management for Decap CMS integration with Carousel
class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentSlide = 0;
        this.activeFilter = 'All';
        this.filteredProjects = [];
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.setupFilters();
        this.renderProjects();
        this.setupCarousel();
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
                image: "/assets/images/projects/accounting-app.jpg",
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
                image: "/assets/images/projects/amazon-analysis.jpg",
                tech_stack: ["Python", "Pandas", "Matplotlib", "Seaborn", "Jupyter Notebook"],
                link: "https://github.com/hanifalazis/Amazon-Valentine-Dashboard-2024",
                github: "https://github.com/hanifalazis/Amazon-Valentine-Dashboard-2024",
                category: "Data Analysis", 
                date: "2024-11-15",
                featured: true,
                i18n_key: "portfolio.p2"
            },
            {
                id: 3,
                title: "Portfolio Website dengan CMS Integration",
                description: "Website portfolio responsive dengan sistem manajemen konten menggunakan Decap CMS dan GitHub Pages untuk auto-deployment.",
                image: "/assets/images/projects/portfolio-cms.jpg",
                tech_stack: ["HTML", "CSS", "JavaScript", "Decap CMS", "GitHub Pages"],
                link: "https://hifaliz.com",
                github: "https://github.com/hanifalazis/hanifalazis.github.io",
                category: "Web Development",
                date: "2024-09-13",
                featured: true
            },
            {
                id: 4,
                title: "Data Visualization Dashboard",
                description: "Interactive dashboard untuk visualisasi data menggunakan D3.js dan Chart.js dengan fitur filtering dan real-time updates.",
                image: "/assets/images/projects/data-viz.jpg",
                tech_stack: ["D3.js", "Chart.js", "JavaScript", "CSS Grid"],
                link: "#",
                category: "Data Analysis",
                date: "2024-08-20",
                featured: true
            }
        ];
    }

    setupFilters() {
        // Get unique categories from projects
        const categories = ['All', ...new Set(this.projects.map(project => project.category))];
        const filterContainer = document.querySelector('.portfolio-filters');
        
        if (!filterContainer) return;

        filterContainer.innerHTML = '';
        
        categories.forEach(category => {
            const filterBtn = document.createElement('button');
            filterBtn.className = `filter-btn ${category === 'All' ? 'active' : ''}`;
            filterBtn.textContent = category;
            filterBtn.addEventListener('click', () => this.filterProjects(category));
            filterContainer.appendChild(filterBtn);
        });
    }

    filterProjects(category) {
        this.activeFilter = category;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === category) {
                btn.classList.add('active');
            }
        });

        // Filter projects
        this.filteredProjects = category === 'All' 
            ? this.projects.filter(project => project.featured)
            : this.projects.filter(project => project.featured && project.category === category);

        // Reset carousel position
        this.currentSlide = 0;
        this.renderProjects();
        this.updateCarousel();
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

        sortedProjects.forEach(project => {
            const projectElement = this.createCarouselCard(project);
            portfolioContainer.appendChild(projectElement);
        });

        // Update navigation visibility
        this.updateNavigationVisibility();
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
                    <div class="card-category">${project.category}</div>
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
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

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
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }

                isDragging = false;
            });
        }
    }

    nextSlide() {
        const totalProjects = this.getCurrentProjects().length;
        const cardsPerView = this.getCardsPerView();
        const maxSlide = Math.max(0, totalProjects - cardsPerView);

        if (this.currentSlide < maxSlide) {
            this.currentSlide++;
            this.updateCarousel();
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateCarousel();
        }
    }

    updateCarousel() {
        const carousel = document.querySelector('.portfolio-carousel');
        if (!carousel) return;

        const cardWidth = this.getCardWidth();
        const translateX = -this.currentSlide * cardWidth;
        
        carousel.style.transform = `translateX(${translateX}px)`;
        
        this.updateNavigationVisibility();
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

    updateNavigationVisibility() {
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        const totalProjects = this.getCurrentProjects().length;
        const cardsPerView = this.getCardsPerView();

        if (prevBtn) {
            prevBtn.style.display = this.currentSlide > 0 ? 'flex' : 'none';
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentSlide < Math.max(0, totalProjects - cardsPerView) ? 'flex' : 'none';
        }
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
        window.projectManager.updateCarousel();
    }
});