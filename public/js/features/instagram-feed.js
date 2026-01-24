// === INSTAGRAM FEED WIDGET ===
// Loads curated posts from JSON and renders a beautiful grid

class InstagramFeed {
    constructor() {
        this.containerId = 'instagram-feed-container';
        this.dataUrl = '/data/instagram-feed.json';
        this.data = null;
        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataUrl);
            this.data = await response.json();
            this.render();
        } catch (error) {
            console.warn('Instagram feed load failed:', error);
        }
    }

    render() {
        // Find or create container in the About section (or wherever specified)
        // Ideally, we append this to the About view or a dedicated section
        let container = document.getElementById(this.containerId);
        
        if (!container) {
            // Find about view to append to
            const aboutView = document.querySelector('.about-content');
            if (aboutView) {
                container = document.createElement('div');
                container.id = this.containerId;
                container.className = 'instagram-feed';
                
                // Insert before the contact section or at the end
                const contactSection = aboutView.querySelector('.about-contact');
                if (contactSection) {
                    aboutView.insertBefore(container, contactSection);
                } else {
                    aboutView.appendChild(container);
                }
            } else {
                return; // Can't find place to render
            }
        }

        if (!this.data || !this.data.posts) return;

        const profile = this.data.profile;
        
        container.innerHTML = `
            <div class="insta-header">
                <div class="insta-profile">
                    <a href="${profile.url}" target="_blank" rel="noopener">
                        <span class="insta-icon">📸</span>
                        <span class="insta-username">@${profile.username}</span>
                    </a>
                    <span class="insta-followers">${profile.followers} seguidores</span>
                </div>
                <a href="${profile.url}" target="_blank" class="insta-follow-btn">Seguir</a>
            </div>
            
            <div class="insta-grid">
                ${this.data.posts.map(post => `
                    <a href="${post.url}" target="_blank" class="insta-post" rel="noopener">
                        <div class="insta-image-wrapper">
                            <img src="${post.image}" alt="${post.caption}" loading="lazy" onerror="this.src='/images/placeholder.jpg'">
                            <div class="insta-overlay">
                                <span class="insta-likes">♥ ${post.likes}</span>
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only init if we are on the page (router handles visibility, but script loads once)
    window.instagramFeed = new InstagramFeed();
});
