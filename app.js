class HybridPresentation {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 8;
        this.currentMode = 'hybrid';
        this.isNavOpen = false;
        
        this.initializeElements();
        this.loadUserPreferences();
        this.bindEvents();
        this.updateUI();
        this.startProgressTracking();
    }
    
    initializeElements() {
        // Main elements
        this.mainContainer = document.getElementById('main-container');
        this.presentationPanel = document.getElementById('presentation-panel');
        this.contentPanel = document.getElementById('content-panel');
        
        // Controls
        this.themeToggle = document.getElementById('theme-toggle');
        this.presentationModeBtn = document.getElementById('presentation-mode');
        this.documentationModeBtn = document.getElementById('documentation-mode');
        this.hybridModeBtn = document.getElementById('hybrid-mode');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.navToggle = document.getElementById('nav-toggle');
        
        // Navigation
        this.navList = document.querySelector('.nav-list');
        this.navLinks = document.querySelectorAll('.nav-list a');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        
        // Sections
        this.slides = document.querySelectorAll('.slide');
        this.contentSections = document.querySelectorAll('.content-section');
    }
    
    loadUserPreferences() {
        // Load theme preference
        const savedTheme = localStorage.getItem('presentation-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            this.updateThemeIcon(savedTheme);
        }
        
        // Load last viewed section
        const savedSection = localStorage.getItem('presentation-section');
        if (savedSection && savedSection >= 1 && savedSection <= this.totalSections) {
            this.currentSection = parseInt(savedSection);
        }
        
        // Load mode preference
        const savedMode = localStorage.getItem('presentation-mode');
        if (savedMode && ['presentation', 'documentation', 'hybrid'].includes(savedMode)) {
            this.currentMode = savedMode;
        }
    }
    
    bindEvents() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Mode buttons
        this.presentationModeBtn.addEventListener('click', () => this.setMode('presentation'));
        this.documentationModeBtn.addEventListener('click', () => this.setMode('documentation'));
        this.hybridModeBtn.addEventListener('click', () => this.setMode('hybrid'));
        
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.navigateToSection(this.currentSection - 1));
        this.nextBtn.addEventListener('click', () => this.navigateToSection(this.currentSection + 1));
        
        // Navigation menu
        this.navToggle.addEventListener('click', () => this.toggleNav());
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = parseInt(link.dataset.section);
                this.navigateToSection(section);
                this.closeNav();
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Scroll synchronization
        this.presentationPanel.addEventListener('scroll', () => this.handleScroll());
        this.contentPanel.addEventListener('scroll', () => this.handleScroll());
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Click outside nav to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-nav') && this.isNavOpen) {
                this.closeNav();
            }
        });
        
        // Prevent default scroll behavior for smooth navigation
        document.addEventListener('wheel', (e) => {
            if (e.target.closest('.presentation-panel') || e.target.closest('.content-panel')) {
                return; // Allow normal scrolling within panels
            }
            
            if (Math.abs(e.deltaY) > 50) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    this.navigateToSection(this.currentSection + 1);
                } else {
                    this.navigateToSection(this.currentSection - 1);
                }
            }
        }, { passive: false });
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        this.updateThemeIcon(newTheme);
        localStorage.setItem('presentation-theme', newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    setMode(mode) {
        this.currentMode = mode;
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-mode`).classList.add('active');
        
        // Update container class
        this.mainContainer.className = `main-container ${mode}-mode`;
        
        localStorage.setItem('presentation-mode', mode);
        
        // Trigger resize event to update layout
        window.dispatchEvent(new Event('resize'));
    }
    
    navigateToSection(sectionNumber) {
        if (sectionNumber < 1 || sectionNumber > this.totalSections) return;
        
        this.currentSection = sectionNumber;
        this.updateUI();
        this.updateProgress();
        this.updateNavigation();
        
        localStorage.setItem('presentation-section', this.currentSection);
        
        // Smooth transition effect
        this.addTransitionEffect();
    }
    
    updateUI() {
        // Update slides
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index + 1 === this.currentSection);
        });
        
        // Update content sections
        this.contentSections.forEach((section, index) => {
            section.classList.toggle('active', index + 1 === this.currentSection);
        });
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentSection === 1;
        this.nextBtn.disabled = this.currentSection === this.totalSections;
        
        // Update navigation links
        this.navLinks.forEach(link => {
            link.classList.toggle('active', parseInt(link.dataset.section) === this.currentSection);
        });
        
        // Set mode
        this.setMode(this.currentMode);
    }
    
    updateProgress() {
        const progress = (this.currentSection / this.totalSections) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${Math.round(progress)}%`;
    }
    
    updateNavigation() {
        // Highlight current section in navigation
        this.navLinks.forEach(link => {
            link.classList.toggle('active', parseInt(link.dataset.section) === this.currentSection);
        });
    }
    
    addTransitionEffect() {
        this.mainContainer.style.opacity = '0.8';
        setTimeout(() => {
            this.mainContainer.style.opacity = '1';
        }, 150);
    }
    
    toggleNav() {
        this.isNavOpen = !this.isNavOpen;
        this.navList.classList.toggle('show', this.isNavOpen);
        this.navToggle.textContent = this.isNavOpen ? '✕' : '☰';
    }
    
    closeNav() {
        this.isNavOpen = false;
        this.navList.classList.remove('show');
        this.navToggle.textContent = '☰';
    }
    
    handleKeyboard(e) {
        // Prevent navigation when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.navigateToSection(this.currentSection + 1);
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.navigateToSection(this.currentSection - 1);
                break;
            case 'Home':
                e.preventDefault();
                this.navigateToSection(1);
                break;
            case 'End':
                e.preventDefault();
                this.navigateToSection(this.totalSections);
                break;
            case 'Escape':
                this.closeNav();
                break;
            case 'p':
            case 'P':
                if (e.ctrlKey || e.metaKey) return; // Allow Ctrl+P for printing
                this.setMode('presentation');
                break;
            case 'd':
            case 'D':
                this.setMode('documentation');
                break;
            case 'h':
            case 'H':
                this.setMode('hybrid');
                break;
            case 't':
            case 'T':
                this.toggleTheme();
                break;
        }
    }
    
    handleScroll() {
        // Sync scroll positions between panels when in hybrid mode
        if (this.currentMode !== 'hybrid') return;
        
        // This could be enhanced to sync scroll positions
        // For now, we'll just ensure the correct sections are visible
        this.updateUI();
    }
    
    handleResize() {
        // Handle responsive layout changes
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile && this.currentMode === 'hybrid') {
            // On mobile, hybrid mode shows stacked layout
            this.mainContainer.style.gridTemplateRows = '60% 40%';
        }
        
        // Update navigation visibility
        if (!isMobile && this.isNavOpen) {
            this.closeNav();
        }
    }
    
    startProgressTracking() {
        // Track time spent on each section for analytics
        this.sectionStartTime = Date.now();
        this.sectionTimes = {};
        
        // Update progress every second
        setInterval(() => {
            const currentTime = Date.now();
            const timeSpent = currentTime - this.sectionStartTime;
            
            if (!this.sectionTimes[this.currentSection]) {
                this.sectionTimes[this.currentSection] = 0;
            }
            this.sectionTimes[this.currentSection] += 1000;
            
            this.sectionStartTime = currentTime;
        }, 1000);
    }
    
    // Public methods for external interaction
    goToSection(sectionNumber) {
        this.navigateToSection(sectionNumber);
    }
    
    getCurrentSection() {
        return this.currentSection;
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
    
    getTotalSections() {
        return this.totalSections;
    }
    
    getSectionTimes() {
        return this.sectionTimes;
    }
    
    // Method to export presentation data
    exportData() {
        return {
            currentSection: this.currentSection,
            currentMode: this.currentMode,
            sectionTimes: this.sectionTimes,
            totalSections: this.totalSections,
            timestamp: new Date().toISOString()
        };
    }
    
    // Method to generate presentation summary
    generateSummary() {
        const summary = {
            projectTitle: "Enhancing Content Discovery Through A/B Testing and Deep Linking",
            student: "Gaurav Sindhu (LCS2021008)",
            institution: "Indian Institute of Information Technology, Lucknow",
            supervisor: "Dr. Saurabh Shukla",
            keyAchievements: [
                "97.3% reduction in DynamoDB read costs",
                "ML-based rail ranking implementation",
                "Deferred deep link resolution system",
                "4 major A/B experiments conducted",
                "Scalable microservices architecture"
            ],
            technicalStack: [
                "Go (Golang)",
                "Amazon DynamoDB",
                "Redis",
                "Google Ads API",
                "AppsFlyer",
                "gRPC",
                "Grafana"
            ],
            businessImpact: [
                "Significant cost reduction in database operations",
                "Improved content discovery effectiveness",
                "Enhanced user engagement",
                "Robust experimentation platform",
                "Addressed attribution gaps"
            ]
        };
        return summary;
    }
}

// Utility functions for enhanced interactivity
class PresentationUtils {
    static smoothScrollTo(element, duration = 500) {
        const start = element.scrollTop;
        const end = 0;
        const change = end - start;
        const startTime = performance.now();
        
        function animateScroll(currentTime) {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeInOutQuad = progress < 0.5 
                ? 2 * progress * progress 
                : -1 + (4 - 2 * progress) * progress;
            
            element.scrollTop = start + change * easeInOutQuad;
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        }
        
        requestAnimationFrame(animateScroll);
    }
    
    static createElement(tag, className, textContent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Enhanced features for presentation mode
class PresentationEnhancements {
    constructor(presentation) {
        this.presentation = presentation;
        this.initializeEnhancements();
    }
    
    initializeEnhancements() {
        this.addKeyboardShortcutsInfo();
        this.addFullscreenSupport();
        this.addPresentationTimer();
        this.addSlideNotes();
    }
    
    addKeyboardShortcutsInfo() {
        const shortcuts = [
            { key: '→/Space', action: 'Next section' },
            { key: '←', action: 'Previous section' },
            { key: 'P', action: 'Presentation mode' },
            { key: 'D', action: 'Documentation mode' },
            { key: 'H', action: 'Hybrid mode' },
            { key: 'T', action: 'Toggle theme' },
            { key: 'Esc', action: 'Close navigation' }
        ];
        
        // Add shortcuts info to help section (could be implemented)
        console.log('Keyboard shortcuts available:', shortcuts);
    }
    
    addFullscreenSupport() {
        // Add fullscreen capability
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11' || (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    addPresentationTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            // Could display timer somewhere in the UI
        }, 1000);
    }
    
    addSlideNotes() {
        // Could add speaker notes functionality
        // For now, just log that this feature is available
        console.log('Slide notes feature available for future implementation');
    }
}

// Animation and visual effects
class PresentationAnimations {
    constructor() {
        this.initializeAnimations();
    }
    
    initializeAnimations() {
        this.observeElements();
        this.addHoverEffects();
    }
    
    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        // Observe all animated elements
        document.querySelectorAll('.metric, .arch-component, .experiment-card, .result-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    addHoverEffects() {
        // Add subtle hover animations to interactive elements
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                animation: slideInUp 0.6s ease-out forwards;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create main presentation instance
    window.presentation = new HybridPresentation();
    
    // Add enhancements
    window.presentationEnhancements = new PresentationEnhancements(window.presentation);
    window.presentationAnimations = new PresentationAnimations();
    
    // Add global utilities
    window.PresentationUtils = PresentationUtils;
    
    // Expose some useful functions globally for debugging/external use
    window.goToSection = (section) => window.presentation.goToSection(section);
    window.setMode = (mode) => window.presentation.setMode(mode);
    window.exportData = () => window.presentation.exportData();
    window.generateSummary = () => window.presentation.generateSummary();
    
    // Add loading completion indicator
    document.body.classList.add('loaded');
    
    console.log('🎉 Hybrid Presentation Application Loaded Successfully!');
    console.log('Available keyboard shortcuts: →/← (navigate), P/D/H (modes), T (theme), Esc (close nav)');
    console.log('Use window.presentation to access the main application instance');
});