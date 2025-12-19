window.renderChatScreen = function (user) {
    if (!user) return '<div>Erro: Usuário não encontrado</div>';

    const isPremium = window.app && window.app.state && window.app.state.isPremium;
    const blurredImageSrc = user.secretPhoto || user.image;

    // --- Received Photo (Secret) ---
    let receivedPhotoContent = '';
    if (isPremium) {
        // UNLOCKED: Click opens fullscreen
        receivedPhotoContent = `
             <div class="message received">
                <div class="message-content photo-message" onclick="window.app.openFullscreen('${blurredImageSrc}')">
                    <img src="${blurredImageSrc}" class="blurred-img" style="filter: none; opacity: 1;" />
                </div>
                <div class="message-time">Segredo Revelado</div>
            </div>
        `;
    } else {
        // LOCKED: Click triggers paywall
        receivedPhotoContent = `
            <div class="message received">
                <div class="message-content photo-message blur-container" onclick="window.app.triggerPaywall('photo_view')">
                    <div class="blurred-photo-overlay">
                        <i data-lucide="lock"></i>
                        <span>Foto Secreta</span>
                    </div>
                    <img src="${blurredImageSrc}" class="blurred-img" />
                </div>
            </div>
        `;
    }

    // --- Sent Photos (User) ---
    // If we have photos sent by the user in the session
    let sentPhotosHtml = '';
    if (window.app && window.app.state.userSentPhotos && window.app.state.userSentPhotos[user.id]) {
        sentPhotosHtml = window.app.state.userSentPhotos[user.id].map(src => `
            <div class="message sent">
                <div class="message-content photo-message" onclick="window.app.openFullscreen('${src}')">
                     <img src="${src}" class="blurred-img" style="filter: none; opacity: 1;" />
                     <div class="sent-photo-indicator"><i data-lucide="check" size="16"></i></div>
                </div>
                <div class="message-time">Enviado</div>
            </div>
        `).join('');
    }

    const userPendingActions = (window.app && window.app.state.pendingActions && window.app.state.pendingActions[user.id]) ? window.app.state.pendingActions[user.id] : [];

    return `
        <div class="chat-screen">
            <div class="chat-header">
                <button class="back-btn" onclick="window.app.navigate('matches')">
                    <i data-lucide="arrow-left"></i>
                </button>
                <div class="chat-user-info">
                    <div class="chat-avatar" style="background-image: url('${user.image}')"></div>
                    <h3>${user.name}</h3>
                </div>
                <button class="options-btn">
                    <i data-lucide="more-vertical"></i>
                </button>
            </div>
            
            <div class="chat-messages">
                <div class="message received">
                    <div class="message-content">
                        Gostei do seu perfil... 😉
                    </div>
                    <div class="message-time">Agora mesmo</div>
                </div>

                ${receivedPhotoContent}
                
                ${sentPhotosHtml}

                ${userPendingActions.map(action => `
                    <div class="message system-message" style="display: flex; justify-content: center; margin: 15px 0;">
                        <div class="message-content" style="background: white; color: #333; border: 1px solid #eee; border-radius: 20px; padding: 10px 20px; display: flex; align-items: center; gap: 10px; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <span>${action.text}</span>
                            <div class="spinner" style="width: 16px; height: 16px; border: 2px solid #ddd; border-top-color: #ff1b6b; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="chat-controls restricted-controls">
                ${isPremium ? '<p class="restriction-notice" style="color: #4bccaa;">Modo Premium Ativo</p>' : '<p class="restriction-notice">Conversa restrita para membros gratuitos.</p>'}
                <div class="action-grid" style="grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                    <button class="chat-action-btn photo-btn" onclick="window.app.triggerPaywall('photo_send')">
                        <i data-lucide="camera"></i>
                        <span style="font-size: 10px;">Foto</span>
                    </button>
                    <button class="chat-action-btn date-btn" onclick="window.app.triggerPaywall('date')">
                        <i data-lucide="calendar-heart"></i>
                        <span style="font-size: 10px;">Encontro</span>
                    </button>
                    <button class="chat-action-btn video-btn" onclick="window.app.triggerPaywall('video_call')">
                        <i data-lucide="video"></i>
                        <span style="font-size: 10px;">Vídeo</span>
                    </button>
                </div>
            </div>
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        </div>
    `;
}
