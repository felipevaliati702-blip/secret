// Card Stack Component
window.renderCardStack = function () {
    // Check if app state exists
    if (!window.app || !window.app.state) return '';

    // Filter out potential matches that are ALREADY in the match list
    const existingMatchIds = window.app.state.matches.map(m => m.id);

    // In Free version, we might want to still show user 1-5 even if they will be delayed matches?
    // User wants "5 primeiras vão dar 'match'... com delay".
    // If we show them in stack, and user swipes right, it triggers delayed match.
    // If they swipe left, no match.
    // So we should NOT filter them out unless they are already in the 'matches' list (which happens after delay or pre-fill).

    // Use profiles from state (loaded from DB) or fallback
    const sourceProfiles = window.app.state.profiles || window.users || [];
    let user = sourceProfiles[window.app.state.currentUserIndex];

    // If current user is already matched (e.g. in Paid version where 1-5 are pre-matched), skip them
    while (user && existingMatchIds.includes(user.id)) {
        window.app.state.currentUserIndex++;
        user = sourceProfiles[window.app.state.currentUserIndex];
    }

    if (!user) {
        if (window.app.state.isPaidVersion) {
            return `
                <div class="card-stack-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                     <i data-lucide="frown" size="48" style="margin-bottom: 10px;"></i>
                     <p>Não há mais perfis por perto.</p>
                     ${window.renderNav ? '' : ''} 
                </div>
             `;
        } else {
            return `
                <div class="card-stack-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); text-align: center; padding: 20px;">
                     <i data-lucide="clock" size="48" style="margin-bottom: 10px; color: var(--primary-color);"></i>
                     <h2 style="color: var(--text-primary); margin-bottom: 10px;">Acabaram as rolagens gratuitas de hoje</h2>
                     <p style="margin-bottom: 20px;">Adquira o plano Premium para continuar vendo perfis e dando matches ilimitados.</p>
                     <button class="primary-btn" onclick="window.app.state.showModal = true; window.app.render();" 
                        style="width: 100%; max-width: 300px; background: linear-gradient(90deg, #ff1b6b 0%, #ff9233 100%); border-radius: 50px; padding: 16px 24px; font-weight: 800; font-size: 16px; border: none; box-shadow: 0 10px 25px rgba(255, 46, 99, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                        QUERO CONTINUAR VENDO
                     </button>
                     ${window.renderNav ? '' : ''} 
                </div>
             `;
        }
    }

    return `
        <div class="card-stack-container">
            ${window.renderCard(user)}
            <div class="action-buttons">
                <button class="action-btn btn-reject" onclick="window.app.handleSwipe('left')">
                    <i data-lucide="x" size="32"></i>
                </button>
                <button class="action-btn btn-super">
                    <i data-lucide="star" size="24" fill="currentColor"></i>
                </button>
                <button class="action-btn btn-like" onclick="window.app.handleSwipe('right')">
                    <i data-lucide="heart" size="32" fill="currentColor"></i>
                </button>
            </div>
        </div>
    `;
}

window.renderCard = function (user) {
    if (!user) return '';
    return `
        <div id="current-card" class="profile-card" style="background-image: url('${user.image}')">
            <div class="card-overlay">
                <div class="card-name">
                    ${user.name}, ${user.age} 
                    <i data-lucide="badge-check" size="24" class="verified-badge" fill="#3b82f6" color="white"></i>
                </div>
                <div class="card-info">
                    <i data-lucide="map-pin" size="16"></i> ${user.distance} de distância
                </div>
                <div class="card-bio">${user.bio}</div>
            </div>
        </div>
    `;
}

window.getNextUser = function () {
    window.app.state.currentUserIndex++;
    return window.renderCardStack();
}

window.getCurrentUser = function () {
    const sourceProfiles = window.app.state.profiles || window.users || [];
    return sourceProfiles[window.app.state.currentUserIndex];
}
