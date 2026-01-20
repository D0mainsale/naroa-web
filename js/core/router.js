// === HASH ROUTER ===
class Router {
    constructor() {
        this.routes = new Map();
        this.params = {};
        window.addEventListener('hashchange', () => this.handle());
        window.addEventListener('load', () => this.handle());
    }
    
    register(path, handler) {
        this.routes.set(path, handler);
        return this;
    }
    
    navigate(path) {
        window.location.hash = path;
    }
    
    handle() {
        const hash = window.location.hash.slice(1) || '/';
        document.querySelectorAll('[data-view]').forEach(v => v.classList.add('hidden'));
        
        for (const [route, handler] of this.routes) {
            const match = this.matchRoute(route, hash);
            if (match) {
                this.params = match.params;
                setTimeout(() => handler(match.params), 50);
                return;
            }
        }
        
        const home = this.routes.get('/');
        if (home) home({});
    }
    
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        
        if (patternParts.length === 0 && pathParts.length === 0) return { params: {} };
        if (patternParts.length !== pathParts.length) return null;
        
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return { params };
    }
}

const router = new Router();
