// Admin Panel System - VERSIÓN CORREGIDA
class ProjectAdmin {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadProjects();
    }
    
    setupEventListeners() {
        // Botón toggle admin
        document.getElementById('admin-toggle').addEventListener('click', () => {
            this.authenticate();
        });
        
        // Cerrar panel
        document.querySelector('.close-admin').addEventListener('click', () => {
            this.hideAdminPanel();
        });
        
        // Enviar formulario
        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProject();
        });
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
        document.getElementById('admin-panel').style.display = 'block';
    }
    
    hideAdminPanel() {
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('project-form').reset();
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
    
    card.innerHTML = `
        <div class="project-card-inner">
            <div class="project-image">
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
                
                ${project.code_snippet ? `
                <div class="code-snippet">
                    <pre><code>${this.escapeHtml(project.code_snippet)}</code></pre>
                </div>
                ` : ''}
                
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
    `;
    
    return card;
}

escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProjectAdmin();
});