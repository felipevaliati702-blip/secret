window.renderMatchList = function (matches) {
    if (!matches || matches.length === 0) {
        return `
            <div class="match-list-container empty">
                <i data-lucide="heart-off" size="48" color="#333"></i>
                <p>Sem matches ainda.</p>
                <p style="font-size: 0.8rem; opacity: 0.6;">Continue deslizando!</p>
            </div>
        `;
    }

    const matchesHtml = matches.map(user => `
        <div class="match-item" onclick="window.app.openChat(${user.id})">
            <div class="match-avatar" style="background-image: url('${user.image}')"></div>
            <div class="match-name">${user.name}</div>
            <div class="match-new-badge">Nova</div>
        </div>
    `).join('');

    return `
        <div class="match-list-container">
            <h2 class="match-header">Seus Matches</h2>
            <div class="match-grid">
                ${matchesHtml}
            </div>
        </div>
    `;
}
