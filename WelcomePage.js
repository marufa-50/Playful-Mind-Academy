const banner = document.getElementById('info-banner');
const messageEl = document.getElementById('info-message');
const dismissBtn = document.getElementById('info-dismiss');
 
const actionMessages = {
    register: 'Registration opens a guided onboarding with mentors and scholarships. Ready to begin?',
    signup: 'Create your learner profile to track milestones, badges, and live session invites.',
    signin: 'Sign in to continue where you left off and access your saved projects.',
    welcome: 'The welcome kit includes starter projects, community links, and your first event.',
};
 
function showMessage(kind) {
    const text = actionMessages[kind];
    if (!text) return;
 
    messageEl.textContent = text;
    banner.hidden = false;
    banner.dataset.state = 'visible';
}
 
function hideMessage() {
    banner.hidden = true;
    banner.dataset.state = 'hidden';
}
 
function handleActionClick(event) {
    const { action } = event.currentTarget.dataset;
    showMessage(action);
}
 
function wireActions() {
    const buttons = document.querySelectorAll('[data-action]');
    buttons.forEach(btn => btn.addEventListener('click', handleActionClick));
    if (dismissBtn) {
        dismissBtn.addEventListener('click', hideMessage);
    }
}
 
function enableKeyboardFocus() {
    document.body.addEventListener('keydown', event => {
        if (event.key === 'Escape' && banner.dataset.state === 'visible') {
            hideMessage();
        }
    });
}
 
wireActions();
enableKeyboardFocus();
 
 