/**
 * ═══════════════════════════════════════════════════════════════════
 * SPOTIFY PLAYER - Ambient Music for Naroa's Portfolio
 * Floating mini-player with expand/collapse functionality
 * ═══════════════════════════════════════════════════════════════════
 */

(function initSpotifyPlayer() {
    'use strict';
    
    // Playlist configuration
    const PLAYLIST_ID = '6WHIabEaqEd6cFPad3gSrx';
    const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPlayer);
    } else {
        createPlayer();
    }
    
    function createPlayer() {
        // Check if already exists
        if (document.getElementById('spotify-player-container')) return;
        
        // Create container
        const container = document.createElement('div');
        container.id = 'spotify-player-container';
        container.className = 'spotify-player-container';
        container.innerHTML = `
            <button class="spotify-toggle" aria-label="Toggle music player" title="Música ambiente">
                <svg class="spotify-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span class="spotify-label">♫</span>
            </button>
            <div class="spotify-embed-wrapper">
                <iframe 
                    src="${EMBED_URL}"
                    width="300" 
                    height="380" 
                    frameborder="0" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    title="Playlist de Spotify de Naroa">
                </iframe>
            </div>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .spotify-player-container {
                position: fixed;
                bottom: 85px;
                left: 24px;
                z-index: 9989;
                font-family: var(--font-main, Inter, sans-serif);
            }
            
            .spotify-toggle {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(30, 215, 96, 0.95);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 20px rgba(30, 215, 96, 0.4);
            }
            
            .spotify-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(30, 215, 96, 0.5);
            }
            
            .spotify-icon {
                width: 24px;
                height: 24px;
                color: #000;
                transition: opacity 0.3s;
            }
            
            .spotify-label {
                display: none;
            }
            
            .spotify-player-container.expanded .spotify-toggle {
                background: rgba(0, 0, 0, 0.9);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .spotify-player-container.expanded .spotify-icon {
                color: #1DB954;
            }
            
            .spotify-embed-wrapper {
                position: absolute;
                bottom: 60px;
                left: 0;
                width: 300px;
                height: 380px;
                background: #121212;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                transform: translateY(20px) scale(0.95);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .spotify-player-container.expanded .spotify-embed-wrapper {
                transform: translateY(0) scale(1);
                opacity: 1;
                visibility: visible;
            }
            
            .spotify-embed-wrapper iframe {
                width: 100%;
                height: 100%;
                border-radius: 12px;
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .spotify-player-container {
                    bottom: 80px;
                    left: 10px;
                }
                
                .spotify-toggle {
                    width: 40px;
                    height: 40px;
                }
                
                .spotify-icon {
                    width: 20px;
                    height: 20px;
                }
                
                .spotify-embed-wrapper {
                    width: 280px;
                    height: 352px;
                    left: -10px;
                }
            }
            
            /* Animation for pulse effect */
            @keyframes spotify-pulse {
                0%, 100% { box-shadow: 0 4px 20px rgba(30, 215, 96, 0.4); }
                50% { box-shadow: 0 4px 30px rgba(30, 215, 96, 0.6); }
            }
            
            .spotify-toggle:not(:hover) {
                animation: spotify-pulse 3s infinite;
            }
            
            .spotify-player-container.expanded .spotify-toggle {
                animation: none;
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(container);
        
        // Toggle functionality
        const toggle = container.querySelector('.spotify-toggle');
        toggle.addEventListener('click', () => {
            container.classList.toggle('expanded');
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && container.classList.contains('expanded')) {
                container.classList.remove('expanded');
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && container.classList.contains('expanded')) {
                container.classList.remove('expanded');
            }
        });
        
        console.log('🎵 Spotify Player initialized');
    }
})();
