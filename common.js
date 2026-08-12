// common.js
window.currentUser = null;
window.currentProfile = null;

window.checkAuth = async function(requiredRoles, redirectIfFail = true) {
    try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
            if (redirectIfFail) window.location.href = 'login.html';
            return false;
        }
        window.currentUser = user;

        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileErr || !profile) {
            console.warn('No profile found, logging out.');
            await supabase.auth.signOut();
            if (redirectIfFail) window.location.href = 'login.html';
            return false;
        }

        window.currentProfile = profile;

        // Check role
        if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
            if (redirectIfFail) {
                alert('⛔ Access Denied. You do not have permission to view this page.');
                window.location.href = 'arb.html'; // safe fallback
            }
            return false;
        }
        return true;
    } catch (err) {
        console.error('Auth check error:', err);
        if (redirectIfFail) window.location.href = 'login.html';
        return false;
    }
};

window.logout = async function() {
    await supabase.auth.signOut();
    window.currentUser = null;
    window.currentProfile = null;
    window.location.href = 'login.html';
};

// UI helpers
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}
function showModal(id) {
    document.getElementById(id).classList.add('active');
}
function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}
function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}
window.hasRole = function(roles) {
    if (!window.currentProfile) return false;
    return roles.includes(window.currentProfile.role);
};
