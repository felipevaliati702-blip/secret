// Imports removed, relying on globals

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.state = {
            currentScreen: 'loading',
            matches: [],
            profiles: [], // New: Store DB profiles here
            chatUser: null,
            showModal: false,
            swipesSinceLastMatch: 0,
            nextMatchThreshold: this.getRandomMatchThreshold(),
            isPremium: false,
            userSentPhotos: {}, // Changed to Object: { userId: [photos] }
            pendingActions: {}, // Changed to Object: { userId: [actions] }
            isOnboarding: false,
            currentUserIndex: 0,
            isPaidVersion: false
        };

        // CHECK VERSION (Free vs Paid)
        this.state.isPaidVersion = window.location.href.includes('/pago/');
        console.log('App Mode:', this.state.isPaidVersion ? 'PAID' : 'FREE');

        this.checkPremiumStatus();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    checkPremiumStatus() {
        try {
            // Priority 1: Paid Version URL guarantees Premium
            if (this.state.isPaidVersion) {
                this.state.isPremium = true;
                console.log('Premium Mode: ACTIVE (Paid Version)');
                return;
            }

            // Priority 2: Admin Cheat Code
            const savedProfile = JSON.parse(localStorage.getItem('secret_profile_v2')) || {};
            if ((savedProfile.name && savedProfile.name === 'AdminSecret')) {
                this.state.isPremium = true;
                console.log('Premium Mode: ACTIVE (Admin)');
            } else {
                this.state.isPremium = false;
            }
        } catch (e) {
            console.error('Error checking premium status', e);
        }
    }

    getRandomMatchThreshold() {
        return Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    }

    async init() {
        this.render();
        this.createGlobalElements();

        // 1. Fetch Profiles from Supabase (Unique logic)
        await this.loadProfilesFromDB();

        // 2. Preload images of fetched profiles
        this.preloadImages();

        setTimeout(() => {
            const savedProfile = JSON.parse(localStorage.getItem('secret_profile_v2'));
            if (!savedProfile || !savedProfile.name) {
                this.state.isOnboarding = true;
                this.state.currentScreen = 'profile';
            } else {
                this.state.isOnboarding = false;
                this.state.currentScreen = 'home';
            }
            this.checkPremiumStatus(); // Re-check just in case
            this.render();
        }, 1000); // reduced delay as we await DB
    }

    async loadProfilesFromDB() {
        if (!supabase) {
            console.error("Supabase not configured. Using fallback.");
            // Fallback to window.users if Supabase fails or not set up
            if (window.users) {
                this.state.profiles = window.users;
                // Instant match first 5 logic for fallback
                const initialMatches = window.users.slice(0, 5);
                this.state.matches = [...initialMatches];
                this.state.currentUserIndex = 5;
            }
            return;
        }

        try {
            // 1. Get IDs of profiles user has already seen (interacted with)
            const { data: interactions, error: errInt } = await supabase
                .from('user_interactions')
                .select('profile_id')
                .eq('user_id', USER_ID);

            const seenIds = interactions ? interactions.map(i => i.profile_id) : [];

            // 2. Fetch profiles NOT seen
            let query = supabase.from('profiles').select('*');

            if (seenIds.length > 0) {
                // Not in seenIds
                // Note: simple .not('id', 'in', '('+seenIds.join(',')+')') syntax
                query = query.not('id', 'in', `(${seenIds.join(',')})`);
            }

            const { data: profiles, error: errProf } = await query.limit(20);

            if (profiles && profiles.length > 0) {
                // Normalize keys to match legacy app structure
                this.state.profiles = profiles.map(p => ({
                    ...p,
                    image: p.image_url,
                    secretPhoto: p.secret_photo_url
                }));

                this.state.currentUserIndex = 0; // Reset index for these new profiles

                // For Paid Version, we might want to carry over Matches from DB too? 
                // For now, let's keep matches local or fetch them. 
                // Simpler: Just load profiles to swipe. 
                // Matches should be loaded from DB too if we want full persistence.
                await this.loadMatchesFromDB();

            } else {
                console.log("No more profiles!");
                this.state.profiles = [];
            }

        } catch (e) {
            console.error("DB Error", e);
        }
    }

    async loadMatchesFromDB() {
        // Load existing matches (interactions = 'match' or 'like'?)
        // Assuming 'match' action. 
        // For this app, maybe we just treat 'like' as potential match.
        // Let's just keep local matches for now to reduce complexity, 
        // OR fetch profiles where interaction = 'like' and add to State.matches.

        // Simpler implementation for now: 
        // The profiles loaded are NEW ones. Matches currently in array are valid.
        // We really should save matches to DB.
    }

    createGlobalElements() {
        // Prevent duplicate global elements if init runs twice
        if (document.getElementById('chat-file-input')) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'chat-file-input';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = (e) => this.handleFileSelect(e);
        document.body.appendChild(fileInput);

        const fullscreenModal = document.createElement('div');
        fullscreenModal.id = 'fullscreen-modal';
        fullscreenModal.className = 'fullscreen-modal';
        fullscreenModal.onclick = (e) => {
            if (e.target === fullscreenModal) this.closeFullscreen();
        };
        fullscreenModal.innerHTML = `
            <button class="close-fullscreen" onclick="window.app.closeFullscreen()">
                 <i data-lucide="x" size="32"></i>
            </button>
            <img id="fullscreen-img" class="fullscreen-img" src="" />
        `;
        document.body.appendChild(fullscreenModal);
    }

    preloadImages() {
        if (!this.state.profiles || this.state.profiles.length === 0) return;

        const usersToPreload = this.state.profiles.slice(0, 10);
        usersToPreload.forEach(user => {
            if (user.image) new Image().src = user.image;
            if (user.secretPhoto) new Image().src = user.secretPhoto;
        });
        console.log('Preloading images for DB profiles...');
    }

    render() {
        let html = '';
        switch (this.state.currentScreen) {
            case 'loading': html = window.renderLoadingScreen(); break;
            case 'home': html = window.renderCardStack(); break;
            case 'matches': html = window.renderMatchList(this.state.matches); break;
            case 'chat': html = window.renderChatScreen(this.state.chatUser); break;
            case 'profile': html = window.renderProfileScreen(this.state.isOnboarding); break;
        }

        this.appElement.innerHTML = html;

        if (this.state.currentScreen !== 'loading' && this.state.currentScreen !== 'chat' && !this.state.isOnboarding) {
            this.renderNav();
        }

        if (this.state.showModal) {
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = window.renderSubscriptionModal();
            this.appElement.appendChild(modalDiv);

            // Initialize Modal Logic (Countdowns, etc)
            if (window.initSubscriptionModalLogic) {
                setTimeout(() => window.initSubscriptionModalLogic(), 0);
            }
        }

        this.attachIcons();
        if (this.state.currentScreen === 'chat') {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    renderNav() {
        // Remove existing nav to prevent duplicates
        const existingNav = document.querySelector('.bottom-nav');
        if (existingNav) existingNav.remove();

        const nav = document.createElement('div');
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <div class="nav-item ${this.state.currentScreen === 'home' ? 'active' : ''}" onclick="window.app.navigate('home')">
                <i data-lucide="flame" size="28"></i>
            </div>
            <div class="nav-item ${this.state.currentScreen === 'matches' ? 'active' : ''}" onclick="window.app.navigate('matches')">
                <i data-lucide="message-circle" size="28"></i>
                ${this.state.matches.length > 0 ? `<div class="nav-badge">${this.state.matches.length}</div>` : ''}
            </div>
            <div class="nav-item ${this.state.currentScreen === 'profile' ? 'active' : ''}" onclick="window.app.navigate('profile')">
                <i data-lucide="user" size="28"></i>
            </div>
        `;
        this.appElement.appendChild(nav);
    }

    updateNav() {
        // Helper to update nav without full re-render if possible, or just call renderNav
        this.renderNav();
        this.attachIcons();
    }

    attachIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    navigate(screen) {
        this.state.currentScreen = screen;
        if (screen === 'home' || screen === 'profile') {
            this.checkPremiumStatus();
        }
        this.render();
    }

    openChat(userId) {
        const user = this.state.matches.find(u => u.id === userId);
        if (user) {
            this.state.chatUser = user;
            this.navigate('chat');
        }
    }

    triggerPaywall(feature) {
        if (this.state.isPremium) {
            if (feature === 'photo_send') {
                document.getElementById('chat-file-input').click();
            } else if (feature === 'date' || feature === 'video_call') {
                const userId = this.state.chatUser.id;

                // Initialize user pending actions if not exists
                if (!this.state.pendingActions[userId]) {
                    this.state.pendingActions[userId] = [];
                }

                const actionType = feature === 'date' ? 'Encontro' : 'Vídeo Chamada';
                const actionMsg = feature === 'date' ? 'o seu convite' : 'a vídeo chamada';

                // Add to user specific pending actions
                this.state.pendingActions[userId].push({
                    type: feature,
                    text: `Esperando ${this.state.chatUser.name} aceitar ${actionMsg}...`,
                    timestamp: Date.now()
                });

                this.render();
                this.scrollToBottom();
            } else {
                console.log('Premium photo view');
            }
            return;
        }
        this.state.showModal = true;
        this.render();
    }

    closeModal() {
        this.state.showModal = false;
        this.render();
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && this.state.chatUser) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgSrc = e.target.result;
                const userId = this.state.chatUser.id;

                if (!this.state.userSentPhotos[userId]) {
                    this.state.userSentPhotos[userId] = [];
                }

                this.state.userSentPhotos[userId].push(imgSrc);
                this.render();
                setTimeout(() => this.scrollToBottom(), 100);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    }

    openFullscreen(src) {
        // Only allow fullscreen if premium check passes (double check)
        if (!this.state.isPremium) {
            this.triggerPaywall('photo_view');
            return;
        }

        const modal = document.getElementById('fullscreen-modal');
        const img = document.getElementById('fullscreen-img');
        if (modal && img) {
            img.src = src;
            modal.classList.add('active');
        }
    }

    closeFullscreen() {
        const modal = document.getElementById('fullscreen-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                const img = document.getElementById('fullscreen-img');
                if (img) img.src = '';
            }, 300);
        }
    }

    handleSwipe(direction) {
        const card = document.getElementById('current-card');
        const swipedUser = window.getCurrentUser();
        if (!card || !swipedUser) return;

        if (direction === 'left') {
            card.classList.add('swipe-left');
            this.recordInteraction(swipedUser.id, 'reject');
        } else {
            card.classList.add('swipe-right');
            this.recordInteraction(swipedUser.id, 'like');

            if (this.state.isPaidVersion) {
                this.processLikeLogic();
            } else {
                // Free Version Logic
                if (swipedUser.id <= 5) {
                    this.triggerDelayedMatch(swipedUser);
                } else {
                    // No match logic for users > 5 in free version
                    // this.processLikeLogic(); 
                }
            }
        }

        setTimeout(() => {
            this.appElement.innerHTML = window.getNextUser();
            if (this.state.currentScreen !== 'chat' && !this.state.isOnboarding) this.renderNav();
            this.attachIcons();
        }, 300);
    }

    triggerDelayedMatch(user) {
        const delay = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
        console.log(`Matching with ${user.name} in ${delay / 1000}s`);

        setTimeout(() => {
            if (!this.state.matches.find(u => u.id === user.id)) {
                this.state.matches.push(user);
                this.showNotification(`Novo Match: ${user.name} curtiu você!`, 'heart');

                // IMPORTANT: Update UI based on screen
                if (this.state.currentScreen === 'matches') {
                    // Full re-render to show new match in grid
                    this.render();
                } else if (this.state.currentScreen !== 'loading' && this.state.currentScreen !== 'chat' && !this.state.isOnboarding) {
                    // Just update nav badge
                    this.updateNav();
                }
            }
        }, delay);
    }

    processLikeLogic() {
        this.state.swipesSinceLastMatch++;
        if (this.state.swipesSinceLastMatch >= this.state.nextMatchThreshold) {
            this.handleMatch();
            this.state.swipesSinceLastMatch = 0;
            this.state.nextMatchThreshold = this.getRandomMatchThreshold();
        }
    }

    handleMatch() {
        const matchedUser = window.getCurrentUser();
        if (matchedUser && matchedUser.id > 5) {
            if (!this.state.matches.find(u => u.id === matchedUser.id)) {
                this.state.matches.push(matchedUser);
                this.showNotification(`Novo Match: ${matchedUser.name}!`, 'heart');

                // Same update logic as delayed match
                if (this.state.currentScreen === 'matches') {
                    this.render();
                } else if (this.state.currentScreen !== 'loading' && this.state.currentScreen !== 'chat') {
                    this.updateNav();
                }
            }
        }
    }

    showNotification(message, icon = 'check-circle') {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `<i data-lucide="${icon}"></i> ${message}`;
        document.body.appendChild(toast);

        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    async recordInteraction(profileId, action) {
        if (!supabase) return;
        try {
            await supabase.from('user_interactions').insert({
                user_id: USER_ID,
                profile_id: profileId,
                action: action
            });
        } catch (e) { console.error(e); }
    }

    handleProfileSave(name, photoBase64) {
        if (!name) {
            this.showNotification('Por favor, escolha um nome.', 'alert-circle');
            return;
        }

        const profile = { name: name, photo: photoBase64 };
        localStorage.setItem('secret_profile_v2', JSON.stringify(profile));

        this.checkPremiumStatus();

        if (this.state.isOnboarding) {
            this.state.isOnboarding = false;
            this.showNotification('Bem-vindo ao Secret!');
            this.navigate('home');
        } else {
            this.showNotification('Perfil salvo com sucesso!');
            this.render();
        }
    }
}

window.app = new App();
