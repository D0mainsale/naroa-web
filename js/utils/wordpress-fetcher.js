/**
 * WordPress Fetcher for Naroa's Blog - "Diario"
 * Dynamically retrieves the latest 3 posts from naroagutierrez.wordpress.com
 */

document.addEventListener('DOMContentLoaded', () => {
    const blogContainer = document.getElementById('blog-posts-container');
    if (!blogContainer) return;

    // Show loading state or keep existing static posts as fallback
    const fetchLatestPosts = async () => {
        try {
            const response = await fetch('https://public-api.wordpress.com/rest/v1.1/sites/naroagutierrez.wordpress.com/posts?number=3');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.posts && data.posts.length > 0) {
                renderPosts(data.posts);
            }
        } catch (error) {
            console.error('Error fetching WordPress posts:', error);
            // Fallback: the static posts already in HTML will remain visible
        }
    };

    const renderPosts = (posts) => {
        // Clear container but keep the static structure as a template idea? 
        // No, let's replace them with the fresh ones.
        blogContainer.innerHTML = '';

        posts.forEach(post => {
            const date = new Date(post.date);
            const day = date.getDate().toString().padStart(2, '0');
            const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
            const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

            const article = document.createElement('article');
            article.className = 'blog-card reveal-container';
            
            // Extract excerpt without HTML tags
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = post.excerpt;
            const plainExcerpt = tempDiv.textContent || tempDiv.innerText || "";

            article.innerHTML = `
                <div class="blog-date">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${monthYear}</span>
                </div>
                <div class="blog-content">
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${plainExcerpt.substring(0, 150)}...</p>
                    <div class="blog-meta">
                        ${post.categories ? Object.keys(post.categories).map(cat => `<span class="blog-tag">${cat}</span>`).join('') : ''}
                    </div>
                    <a href="${post.URL}" target="_blank" rel="noopener" class="blog-link" data-en="Read more →" data-es="Leer más →">Leer más →</a>
                </div>
            `;
            blogContainer.appendChild(article);
        });

        // Re-initialize intersection observer for new elements if it's external, 
        // or trigger a custom event.
        window.dispatchEvent(new CustomEvent('blogPostsLoaded'));
    };

    fetchLatestPosts();
});
