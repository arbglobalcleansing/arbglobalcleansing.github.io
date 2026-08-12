// nav.js – Dynamic Navigation from system_navigation table

const SUPABASE_URL = 'https://xnwttnpfzcjbszwxsgox.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEh0y_OAF7nVwLBuTTB74w_gPX0XomI';
const supabaseNav = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Default nav items (fallback if table fails)
const DEFAULT_NAV = [
    { label: 'Dashboard', url: '/dashboard.html', icon: '📊' },
    { label: 'ARBO Management', url: '/arbo.html', icon: '🏢' },
    { label: 'ARB Management', url: '/arb.html', icon: '👤' },
    { label: 'Validators', url: '/validators.html', icon: '✅' },
    { label: 'Reports', url: '/reports.html', icon: '📈' }
];

// Load navigation from database
async function loadNavigation() {
    try {
        const { data, error } = await supabaseNav
            .from('system_navigation')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
            console.warn('Using default navigation (table empty or error)');
            return DEFAULT_NAV;
        }
        return data;
    } catch (err) {
        console.warn('Navigation error:', err);
        return DEFAULT_NAV;
    }
}

// Render navigation into a container
async function renderNavigation(containerId, activePage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = await loadNavigation();
    const currentPath = window.location.pathname;

    let html = '';
    items.forEach(item => {
        const isActive = activePage === item.url || currentPath.includes(item.url.replace('/', ''));
        const activeClass = isActive ? 'active' : '';
        html += `<a href="${item.url}" class="${activeClass}">${item.icon || ''} ${item.label}</a>`;
    });

    container.innerHTML = html;

    // Add click handlers for SPA-style navigation
    container.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('href');
            window.location.href = url;
        });
    });
}

// Get current user info for the navbar
async function getUserInfo() {
    try {
        const { data: { user }, error } = await supabaseNav.auth.getUser();
        if (error || !user) return null;
        const { data: profile } = await supabaseNav
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();
        return profile || null;
    } catch {
        return null;
    }
}
