/**
 * Project Administration System
* @author JAPH
* @version 1.0.0
* @description Extends ProjectViewer with admin functionalities for managing projects
 */

class ProjectAdmin extends ProjectViewer {
    constructor() {
        super();
        this.setupAdminFeatures();
    }

    /**
     * Sets up admin-specific functionality
     */
    setupAdminFeatures() {
        this.setupAdminEventListeners();
        console.log('✅ Admin features initialized');
    }

    /**
     * Sets up admin-specific event listeners
     */
    setupAdminEventListeners() {
        // Admin panel toggle
        const adminToggle = document.getElementById('admin-toggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => {
                this.authenticate();
            });
        }

        // Close admin panel
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
     * Authenticates admin access
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
            adminPanel.classList.remove('hidden');
        }
    }

    /**
     * Hides the admin panel and resets form
     */
    hideAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        const projectForm = document.getElementById('project-form');

        if (adminPanel) adminPanel.classList.add('hidden');
        if (projectForm) projectForm.reset();
    }

    /**
     * Adds a new project to the system
     * @async
     */
    async addProject() {
        const formData = new FormData(document.getElementById('project-form'));

        try {
            // Upload project image
            const imageFile = formData.get('project_image');
            let imagePath = '';

            if (imageFile && imageFile.size > 0) {
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
                featured: formData.get('featured') === 'on',
                image: imagePath
            };

            // Validate required fields
            if (!project.title || !project.description || !project.technologies.length) {
                throw new Error('Title, description, and technologies are required');
            }

            // Save project to backend
            await this.saveProject(project);

            alert('✅ Project added successfully!');
            this.hideAdminPanel();
            this.loadProjects(); // Reload view

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

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

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
        if (!response.ok) {
            throw new Error('Failed to load existing projects');
        }

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
            throw new Error('Failed to save project to server');
        }

        console.log('✅ Project saved successfully');
    }

    /**
     * Override loadProjects to include admin-specific logic
     * @async
     */
    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            this.projects = data.projects;
            this.renderProjects(this.projects);
            this.updateFilterButtons();

            // Admin-specific logging
            console.log(`👨‍💼 Admin loaded ${this.projects.length} projects`);
        } catch (error) {
            console.error('Admin: Error loading projects:', error);
            alert('❌ Admin: Failed to load projects');
        }
    }
}

// Initialize admin panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if admin panel exists
    if (document.getElementById('admin-panel')) {
        new ProjectAdmin();
    }
});



