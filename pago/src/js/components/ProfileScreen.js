window.renderProfileScreen = function (isOnboarding = false) {
    // Load existing data
    const savedProfile = JSON.parse(localStorage.getItem('secret_profile_v2')) || {};
    const savedName = savedProfile.name || '';
    const savedPhoto = savedProfile.photo || null;

    const avatarStyle = savedPhoto ? `background-image: url('${savedPhoto}'); background-size: cover; border: 2px solid var(--primary);` : '';
    const iconStyle = savedPhoto ? 'display: none;' : '';

    // Bind setup
    setTimeout(() => {
        const input = document.getElementById('profile-name-input');
        const fileInput = document.getElementById('profile-photo-input');
        const saveBtn = document.getElementById('profile-save-btn');
        let currentPhoto = savedPhoto; // State for current component instance

        if (fileInput) {
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        const base64String = reader.result;
                        currentPhoto = base64String; // Update local state

                        // Update UI Visuals immediately
                        const avatarDiv = document.querySelector('.profile-avatar-upload');
                        if (avatarDiv) {
                            avatarDiv.style.backgroundImage = `url('${base64String}')`;
                            avatarDiv.style.backgroundSize = 'cover';
                            avatarDiv.style.border = '2px solid var(--primary)';
                            const icon = avatarDiv.querySelector('i');
                            if (icon) icon.style.display = 'none';
                        }
                    }
                    reader.readAsDataURL(file);
                }
            }
        }

        if (saveBtn) {
            saveBtn.onclick = () => {
                window.app.handleProfileSave(input.value, currentPhoto);
            };
        }
    }, 100);

    const buttonText = isOnboarding ? 'Entrar no Secret' : 'Salvar Alterações';
    const titleText = isOnboarding ? 'Bem-vindo' : 'Seu Perfil';
    const subTitle = isOnboarding ? '<p style="color: #888; margin-bottom: 20px; text-align: center;">Crie seu perfil anônimo para ver quem está perto de você.</p>' : '';

    return `
        <div class="profile-screen">
            <h2 style="color: white; margin-bottom: 5px;">${titleText}</h2>
            ${subTitle}

            <div class="profile-avatar-upload" style="${avatarStyle}" onclick="document.getElementById('profile-photo-input').click()">
                <i data-lucide="camera" size="32" style="${iconStyle}"></i>
                <input type="file" id="profile-photo-input" accept="image/*" style="display: none;">
            </div>
            
            <div class="profile-input-group">
                <label class="profile-label">Nome de perfil</label>
                <input type="text" id="profile-name-input" class="profile-input" placeholder="Digite seu apelido..." value="${savedName}" />
            </div>

            <div class="profile-disclaimer">
                <i data-lucide="alert-triangle" size="20"></i>
                <span>Não utilize seu nome verdadeiro, coloque um apelido. Por ex.: Ruivagostosa123.</span>
            </div>

            <button id="profile-save-btn" class="profile-save-btn">${buttonText}</button>
        </div>
    `;
}
