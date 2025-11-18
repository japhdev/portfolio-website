/**
 * Project Viewer - Public Interface
 * @author JAPH
 * @version 1.0.0 
 * @description Handles project display, filtering, search and code expansion for public users
 */
class ProjectViewer {
    constructor() {
        this.projects = [];
        this.currentFilter = 'all';
        this.init();
    }

    /**
     * Initializes the project viewer
     */
    init() {
        this.setupEventListeners();
        this.loadProjects();
        this.setupExpandableCode();
        this.setupCodeModals();
        this.setupSearch();
    }

    /**
     * Sets up all event listeners for public interface
     */
    setupEventListeners() {
        // Filter buttons
        this.setupFilterListeners();

        // Search functionality
        this.setupSearch();
    }

    /**
     * Sets up filter button listeners
     */
    setupFilterListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.filterProjects(filter);
            });
        });
    }

    /**
     * Sets up real-time search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            this.searchHandler = (e) => {
                this.searchProjects(e.target.value);
            };
            searchInput.addEventListener('input', this.searchHandler);
            console.log('✅ Search functionality initialized');
        }
    }

    /**
     * Loads projects from backend
     * @async
     */
    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            this.projects = data.projects;
            this.renderProjects(this.projects);
            this.updateFilterButtons();
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    /**
     * Renders projects grid
     * @param {Array} projects - Array of project objects
     */
    renderProjects(projects) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) {
            console.error('Projects grid element not found');
            return;
        }

        grid.innerHTML = '';

        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            grid.appendChild(projectCard);
        });

        console.log(`✅ Rendered ${projects.length} projects`);
    }

    /**
     * Creates HTML card element for a project
     * @param {Object} project - Project data
     * @param {number} index - Index in the list
     * @returns {HTMLElement} - Project card element
     */
    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.setAttribute('data-category', project.category);
        card.setAttribute('data-technologies', project.technologies.join(','));


        const fixedSize = 'medium';
        card.classList.add(fixedSize);

        card.innerHTML = `
            <div class="project-card-inner">
                <div class="project-image ${fixedSize}">
                    <img src="/static/${project.image}" alt="${project.title}" loading="lazy">
                    <div class="project-overlay">
                        <div class="project-actions">
                            ${project.demo_url ? `<a href="${project.demo_url}" target="_blank" class="project-btn demo-btn">👀 Demo</a>` : ''}
                            ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="project-btn code-btn">💻 Code</a>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-main-content">
                        
                            
                        
                        ${project.code_snippet ? `
                        <div class="project-code-column">
                            <div class="code-snippet">
                                <button class="close-expand" title="Close expanded code">×</button>
                                <span class="expand-indicator">Click to expand</span>
                                <pre><code>${this.escapeHtml(project.code_snippet)}</code></pre>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="project-footer">
                        <div class="project-technologies">
                            ${project.technologies.map(tech =>
            `<span class="tech-tag">${tech.trim()}</span>`
        ).join('')}
                        </div>
                        
                        <div class="project-category">
                            <span class="category-badge">${project.category}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Filters projects by category/technology
     * @param {string} filter - Filter criteria
     */
    filterProjects(filter) {
        this.currentFilter = filter;

        this.updateFilterButtons();

        let filteredProjects = this.projects;

        if (filter !== 'all') {
            if (filter === 'featured') {
                filteredProjects = this.projects.filter(project => project.featured);
            } else {
                filteredProjects = this.projects.filter(project =>
                    project.category === filter ||
                    project.technologies.includes(filter)
                );
            }
        }

        this.animateFilterTransition(filteredProjects);
    }

    /**
     * Animates filter transitions
     * @param {Array} filteredProjects - Filtered projects to display
     */
    animateFilterTransition(filteredProjects) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        grid.style.opacity = '0';
        grid.style.transform = 'translateY(20px)';

        setTimeout(() => {
            this.renderProjects(filteredProjects);

            setTimeout(() => {
                grid.style.opacity = '1';
                grid.style.transform = 'translateY(0)';
                grid.style.transition = 'all 0.4s ease';
            }, 50);
        }, 300);
    }

    /**
     * Updates active state of filter buttons
     */
    updateFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            const filter = btn.getAttribute('data-filter');
            if (filter === this.currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Searches projects by term
     * @param {string} searchTerm - Search term
     */
    searchProjects(searchTerm) {
        console.log('🔍 Searching for:', searchTerm);

        if (!searchTerm.trim()) {
            this.renderProjects(this.projects);
            return;
        }

        const filteredProjects = this.projects.filter(project => {
            const searchLower = searchTerm.toLowerCase();
            return (
                project.title.toLowerCase().includes(searchLower) ||
                project.description.toLowerCase().includes(searchLower) ||
                project.technologies.some(tech =>
                    tech.toLowerCase().includes(searchLower)
                ) ||
                project.category.toLowerCase().includes(searchLower)
            );
        });

        console.log(`📊 Found ${filteredProjects.length} projects`);
        this.renderProjects(filteredProjects);
    }

    /**
     * Sets up modal windows for expanded code viewing
     */
    setupCodeModals() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('expand-code-btn')) {
                const codeSnippet = e.target.closest('.code-snippet');
                const codeContent = codeSnippet?.querySelector('pre')?.textContent;

                if (codeContent) {
                    this.showExpandedCode(codeContent);
                }
            }

            if (e.target.classList.contains('close-code-modal') ||
                e.target.classList.contains('code-modal')) {
                this.hideExpandedCode();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideExpandedCode();
            }
        });
    }

    /**
     * Shows expanded code in modal
     * @param {string} codeContent - Code content to display
     */
    showExpandedCode(codeContent) {
        const modal = document.createElement('div');
        modal.className = 'code-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="code-modal-content">
                <button class="close-code-modal">&times;</button>
                <pre><code>${this.escapeHtml(codeContent)}</code></pre>
            </div>
        `;

        document.body.appendChild(modal);
        
    }

    /**
     * Hides expanded code modal
     */
    hideExpandedCode() {
        const modal = document.querySelector('.code-modal');
        if (modal) {
            modal.remove();
            
        }
    }

    /**
     * Sets up expandable code snippets
     */
    setupExpandableCode() {
        document.addEventListener('click', (e) => {
            const codeSnippet = e.target.closest('.code-snippet');
            const closeBtn = e.target.closest('.close-expand');
            const expandIndicator = e.target.closest('.expand-indicator');

            
            const expandedSnippet = document.querySelector('.code-snippet.expanded');
            if (expandedSnippet && !codeSnippet && !closeBtn && !expandIndicator) {
                this.collapseAllCode();
                return;
            }

            if ((codeSnippet && !codeSnippet.classList.contains('expanded') && !closeBtn) ||
                expandIndicator) {
                this.expandCode(codeSnippet);
            }

            if (closeBtn && closeBtn.closest('.code-snippet')) {
                this.collapseAllCode();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.collapseAllCode();
            }
        });
    }


    /**
     * Expands a code snippet
     * @param {HTMLElement} codeSnippet - Code snippet to expand
     */
    expandCode(codeSnippet) {
        this.collapseAllCode();

        codeSnippet.classList.add('expanded');
        void codeSnippet.offsetWidth;
    
        

        console.log('✅ Code snippet expanded with integrated overlay');
    }

    /**
     * Collapses a code snippet
     * @param {HTMLElement} codeSnippet - Code snippet to collapse
     */
    collapseCode(codeSnippet) {
        if (codeSnippet) {
            codeSnippet.classList.remove('expanded');
        }
    }

    /**
     * Collapses all expanded code snippets
     */
    collapseAllCode() {
        document.querySelectorAll('.code-snippet.expanded').forEach(snippet => {
            this.collapseCode(snippet);
        });

    

        console.log('✅ All code snippets collapsed');
    }

    /**
     * Escapes HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize public project viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're not in admin context
    if (!document.getElementById('admin-panel')) {
        new ProjectViewer();
    }
});