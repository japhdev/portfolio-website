// Admin Panel System - VERSIÓN CORREGIDA
class ProjectAdmin {
    constructor() {
        this.init();
        this.setupExpandableCode();
        this.setupCodeModals();
    }
    
    init() {
        this.setupEventListeners();
        this.loadProjects();
    }
    
    setupEventListeners() {
        // Botón toggle admin
        const adminToggle = document.getElementById('admin-toggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => {
                this.authenticate();
            });
        }
        
        // Cerrar panel
        const closeAdmin = document.querySelector('.close-admin');
        if (closeAdmin) {
            closeAdmin.addEventListener('click', () => {
                this.hideAdminPanel();
            });
        }
        
        // Enviar formulario
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProject();
            });
        }
    }
    
    async authenticate() {
        const password = prompt('🔐 Admin Password:');
        
        if (!password) return; // Si canceló
        
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
    
    showAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
    }
    
    hideAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        const projectForm = document.getElementById('project-form');
        
        if (adminPanel) adminPanel.style.display = 'none';
        if (projectForm) projectForm.reset();
    }
    
    async addProject() {
        const formData = new FormData(document.getElementById('project-form'));
        
        try {
            // 1. Primero subir la imagen
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
            
            // 2. Crear objeto proyecto
            const project = {
                id: Date.now(), // ID único
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
            
            // 3. Guardar proyecto
            await this.saveProject(project);
            
            alert('✅ Project added successfully!');
            this.hideAdminPanel();
            this.loadProjects(); // Recargar la vista
            
        } catch (error) {
            console.error('Error adding project:', error);
            alert('❌ Error adding project: ' + error.message);
        }
    }
    
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/admin/upload-image', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    }
    
    async saveProject(newProject) {
        // 1. Cargar proyectos existentes
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        // 2. Agregar nuevo proyecto
        data.projects.push(newProject);
        
        // 3. Guardar en el backend
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
        
        console.log('✅ Project saved successfully');
    }
    
    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            this.renderProjects(data.projects);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    renderProjects(projects) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) {
            console.error('Projects grid element not found');
            return;
        }
        
        // Limpiar grid
        grid.innerHTML = '';
        
        // Renderizar cada proyecto
        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            grid.appendChild(projectCard);
        });
        
        console.log(`✅ Rendered ${projects.length} projects`);
    }

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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupCodeModals() {
        // Delegación de eventos para el botón expandir código
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('expand-code-btn')) {
                const codeSnippet = e.target.closest('.code-snippet');
                const codeContent = codeSnippet?.querySelector('pre')?.textContent;
                
                if (codeContent) {
                    this.showExpandedCode(codeContent);
                }
            }
            
            // Cerrar modal
            if (e.target.classList.contains('close-code-modal') || 
                e.target.classList.contains('code-modal')) {
                this.hideExpandedCode();
            }
        });
        
        // Tecla ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideExpandedCode();
            }
        });
    }

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

    hideExpandedCode() {
        const modal = document.querySelector('.code-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    setupExpandableCode() {
        // ELIMINAR la creación del overlay global - ya no se necesita
        // porque ahora el overlay está integrado en el CSS del código expandido

        // Delegación de eventos para manejar clicks en code snippets
        document.addEventListener('click', (e) => {
            const codeSnippet = e.target.closest('.code-snippet');
            const closeBtn = e.target.closest('.close-expand');
            const expandIndicator = e.target.closest('.expand-indicator');
            
            // Expandir código al hacer click en el snippet o en el indicador
            if ((codeSnippet && !codeSnippet.classList.contains('expanded') && !closeBtn) || 
                expandIndicator) {
                this.expandCode(codeSnippet);
            }
            
            // Cerrar código al hacer click en el botón de cerrar
            if (closeBtn && closeBtn.closest('.code-snippet')) {
                this.collapseAllCode();
            }
            
            // Cerrar código al hacer click en el overlay (pseudo-elemento ::before)
            // Esto se maneja automáticamente por el CSS ya que el overlay es parte del code-snippet
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.collapseAllCode();
            }
        });
    }

    expandCode(codeSnippet) {
        // Cerrar otros snippets primero
        this.collapseAllCode();
        
        // Aplicar clase expanded - el overlay se maneja automáticamente en CSS
        codeSnippet.classList.add('expanded');
        
        // Forzar reflow para asegurar la animación
        void codeSnippet.offsetWidth;
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Code snippet expanded with integrated overlay');
    }

    collapseCode(codeSnippet) {
        if (codeSnippet) {
            codeSnippet.classList.remove('expanded');
        }
    }

    collapseAllCode() {
        // Colapsar todos los snippets
        document.querySelectorAll('.code-snippet.expanded').forEach(snippet => {
            this.collapseCode(snippet);
        });
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        console.log('✅ All code snippets collapsed');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProjectAdmin();
});