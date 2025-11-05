/**
 * Project Administration System
 * @class ProjectAdmin
 * @version 1.0.0
 * @author
 */
class ProjectAdmin {
    /**
     * Initialize the ProjectAdmin system.
     * Sets up event listeners and UI components
     */
    constructor() {
        this.init();
        this.setupExpandableCode();
        this.setupCodeModals();
    }

    /**
     * Initializes the admin panel
     * Sets up event listeners and loads existing projects
     */
    init() {
        this.setupEventListeners();
        this.loadProjects();
    }

    /** 
     * Sets up all event listeners for the admin interface
     * Includes admin toggle, form submission, and panel close handlers
    */
    setupEventListeners() {
        // Admin panel toggle
        const adminToggle = document.getElementById('admin-toggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => {
                this.authenticate();
            });
        }
        
        // Close admin panel on click
        const closeAdmin = document.querySelector('.close-admin');
        if (closeAdmin) {
            closeAdmin.addEventListener('click', () => {
                this.hideAdminPanel();
            });
        }
        
        // Project form submission
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProject();
            });
        }
    }
    
    /**
     * Authenticates admin access with password verification
     * @async
     */
    async authenticate() {
        const password = prompt('🔐 Admin Password:');
        
        if (!password) return; 
        
        try {
            const response = await fetch('/admin/check-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password })
            });
            
            const result = await response.json();
            
            if (result.authenticated) {
                this.showAdminPanel();
            } else {
                alert('❌ Invalid password');
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('❌ Authentication error');
        }
    }
    
    /**
     * Displays the admin panel
     */
    showAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
    }
    
    /**
     * hides the admin panel and resets the form
     */
    hideAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        const projectForm = document.getElementById('project-form');
        
        if (adminPanel) adminPanel.style.display = 'none';
        if (projectForm) projectForm.reset();
    }

    /**
     * Adds a new project to the system
     * Handles image upload and project data persistence
     * @async
     */
    async addProject() {
        const formData = new FormData(document.getElementById('project-form'));
        
        try {
            // Upload  project image
            const imageFile = formData.get('project_image');
            let imagePath = '';
            
            if (imageFile) {
                const uploadResult = await this.uploadImage(imageFile);
                if (uploadResult.success) {
                    imagePath = uploadResult.image_path;
                } else {
                    throw new Error('Failed to upload image');
                }
            }
            
            // Create project object
            const project = {
                id: Date.now(), 
                title: formData.get('title'),
                description: formData.get('description'),
                technologies: formData.get('technologies').split(',').map(t => t.trim()),
                code_snippet: formData.get('code_snippet'),
                demo_url: formData.get('demo_url'),
                github_url: formData.get('github_url'),
                category: formData.get('category'),
                featured: false,
                image: imagePath
            };
            
            // Save project to backend
            await this.saveProject(project);
            
            alert('✅ Project added successfully! ✅');
            this.hideAdminPanel();
            this.loadProjects(); 
            
        } catch (error) {
            console.error('Error adding project:', error);
            alert('❌ Error adding project: ' + error.message);
        }
    }
    
    /**
     * Uploads project image to server
     * @param {File} file - Image file to upload
     * @returns {Promise<Object>} - Upload result
     * @async
     */
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/admin/upload-image', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    }
    
    /**
     * Saves project data to backend
     * @param {Object} newProject - Project data to save
     * @async
     */
    async saveProject(newProject) {
        // Load existing projects
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        // Add new project
        data.projects.push(newProject);
        
        // Save to backend
        const saveResponse = await fetch('/admin/save-projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!saveResponse.ok) {
            throw new Error('Failed to save project');
        }
        
        console.log('✅ Project saved successfully ✅');
    }
    
    /**
     * Loads projects from backend and renders them
     * @async
     */
    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            this.renderProjects(data.projects);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    /**
     * Renders projects grid with all projects
     * @param {Array} projects - Array of project objects
     */
    renderProjects(projects) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) {
            console.error('Projects grid element not found');
            return;
        }
        
        // Clear grid
        grid.innerHTML = '';
        
        // Render each project
        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            grid.appendChild(projectCard);
        });
        
        console.log(`✅ Rendered ${projects.length} projects ✅`);
    }

    /**
     * Creates HTML card element for a project
     * @param {Object} project - Project data
     * @param {number} index - Index of the project in the list
     * @returns {HTMLElement} - Project card element
    */
    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const randomSize = ['short', 'medium', 'tall'][Math.floor(Math.random() * 3)];
        card.classList.add(randomSize);
        
        card.innerHTML = `
            <div class="project-card-inner">
                <div class="project-image ${randomSize}">
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
                    
                    <div class="project-main-content">
                        <div class="project-description-column">
                            <p class="project-description">${project.description}</p>
                        </div>
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
     * Escapes HTML special characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Sets up modal windows for expanded code viewing
     */
    setupCodeModals() {
        // Event delegation for expand code buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('expand-code-btn')) {
                const codeSnippet = e.target.closest('.code-snippet');
                const codeContent = codeSnippet?.querySelector('pre')?.textContent;
                
                if (codeContent) {
                    this.showExpandedCode(codeContent);
                }
            }
            
            // Close modal on click
            if (e.target.classList.contains('close-code-modal') || 
                e.target.classList.contains('code-modal')) {
                this.hideExpandedCode();
            }
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideExpandedCode();
            }
        });
    }

    /**
     * Displays expanded code in a modal overlay
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
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hides the expanded code modal
     */
    hideExpandedCode() {
        const modal = document.querySelector('.code-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    /**
     * Sets up expandable/collapsible code snippets
     */
    setupExpandableCode() {
        // Event delegation for code snippet clicks
        document.addEventListener('click', (e) => {
            const codeSnippet = e.target.closest('.code-snippet');
            const closeBtn = e.target.closest('.close-expand');
            const expandIndicator = e.target.closest('.expand-indicator');
            
            // Expand code on snippet or indicator click
            if ((codeSnippet && !codeSnippet.classList.contains('expanded') && !closeBtn) || 
                expandIndicator) {
                this.expandCode(codeSnippet);
            }
            
            // Close code on close button click
            if (closeBtn && closeBtn.closest('.code-snippet')) {
                this.collapseAllCode();
            }   
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.collapseAllCode();
            }
        });
    }

    /**
     * Expands a code snippet to full view
     * @param {HTMLElement} codeSnippet - Code snippet element to expand 
     */
    expandCode(codeSnippet) {
        // Close other snippets first
        this.collapseAllCode();
        
        // Apply expanded class - overlay handled automatically in CSS
        codeSnippet.classList.add('expanded');
        
        // Force reflow for animation
        void codeSnippet.offsetWidth;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Code snippet expanded with integrated overlay ✅');
    }

    collapseCode(codeSnippet) {
        if (codeSnippet) {
            codeSnippet.classList.remove('expanded');
        }
    }

    /**
     * Collapses all expanded code snippets
     * @param {HTMLElement} codeSnippet - Code snippet element to collapse
     */
    collapseAllCode() {
        // Collapse all snippets
        document.querySelectorAll('.code-snippet.expanded').forEach(snippet => {
            this.collapseCode(snippet);
        });
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('✅ All code snippets collapsed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectAdmin();
});