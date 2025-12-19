// Subscription Modal Component
window.renderSubscriptionModal = function () {
    return `
        <div class="modal-overlay" id="sub-modal">
            <div class="modal-content" style="background: #1a1a1a; padding: 25px; border-radius: 20px; text-align: center; color: white; max-width: 90%; width: 400px; position: relative; border: 1px solid #333;">
                <button class="close-modal" onclick="window.app.closeModal()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #666; cursor: pointer;">
                    <i data-lucide="x"></i>
                </button>
                
                <div class="premium-icon" style="margin-bottom: 15px; display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 27, 107, 0.1); border-radius: 50%; color: #ff1b6b;">
                    <i data-lucide="lock" size="32"></i>
                </div>
                
                <h2 style="color: #ff1b6b; font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.5px;">SEU TESTE GRÁTIS ACABOU</h2>
                
                <p style="font-size: 15px; line-height: 1.5; color: #e0e0e0; margin-bottom: 15px;">
                    Para trocar fotos, marcar encontros e fazer vídeo chamadas, você precisa adquirir a versão premium.
                </p>
                
                <p style="font-size: 13px; line-height: 1.4; color: #999; margin-bottom: 20px; font-style: italic;">
                    É necessário cobrar esse valor para manter nosso sistema de criptografia funcionando para proteger as pessoas que utilizam o aplicativo a não terem fotos vazadas.
                </p>

                <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 10px; margin-bottom: 20px; border: 1px dashed #444;">
                    <p style="font-size: 12px; color: #aaa; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">SEU PRÓXIMO TESTE GRÁTIS É EM</p>
                    <div id="countdown-24h" style="font-size: 24px; font-weight: 700; font-family: monospace; color: white;">23:59:59</div>
                </div>
                
                <div class="plans-container" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <div class="plan-option" onclick="window.selectPlan(this, 'monthly')" style="flex: 1; background: #2a2a2a; padding: 10px; border-radius: 10px; border: 1px solid #444; cursor: pointer; transition: all 0.2s;">
                        <div style="font-size: 14px; color: #ccc;">Mensal</div>
                        <div style="font-size: 18px; font-weight: bold;">R$ 9,90/mês</div>
                    </div>
                    <div class="plan-option active" onclick="window.selectPlan(this, 'annual')" style="flex: 1; background: rgba(255, 27, 107, 0.1); padding: 10px; border-radius: 10px; border: 2px solid #ff1b6b; cursor: pointer; transition: all 0.2s; position: relative;">
                        <div style="font-size: 14px; color: #ccc;">Anual</div>
                        <div style="font-size: 18px; font-weight: bold; color: #ff1b6b;">R$ 47,90/ano</div>
                        <span style="position: absolute; top: -10px; right: -5px; background: #4caf50; color: white; font-size: 10px; padding: 2px 6px; border-radius: 10px; font-weight: bold;">ECONOMIZE R$ 70,90</span>
                    </div>
                </div>

                <ul class="features" style="text-align: left; list-style: none; padding: 0; margin-bottom: 25px; color: #ccc; font-size: 14px;">
                    <li style="margin-bottom: 8px; display: flex; align-items: center;"><i data-lucide="check" size="16" style="margin-right: 8px; color: #ff1b6b;"></i> Fotos Ilimitadas</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center;"><i data-lucide="check" size="16" style="margin-right: 8px; color: #ff1b6b;"></i> Marcar Encontros</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center;"><i data-lucide="check" size="16" style="margin-right: 8px; color: #ff1b6b;"></i> Vídeo chamadas/Sexo virtual</li>
                    <li style="margin-bottom: 8px; display: flex; align-items: center;"><i data-lucide="check" size="16" style="margin-right: 8px; color: #ff1b6b;"></i> Ver quem te curtiu</li>
                </ul>

                <button class="subscribe-btn" onclick="alert('Redirecionando para pagamento...')" 
                    style="width: 100%; max-width: 300px; background: linear-gradient(90deg, #ff1b6b 0%, #ff9233 100%); border-radius: 50px; padding: 16px 24px; font-weight: 800; font-size: 16px; border: none; box-shadow: 0 10px 25px rgba(255, 46, 99, 0.4); text-transform: uppercase; letter-spacing: 1px; color: white; cursor: pointer; margin-bottom: 10px;">
                    Começar Teste Grátis
                </button>
                
                <div class="scarcity-text" style="font-size: 12px; color: #888;">Oferta expira em <span id="countdown-10m">10:00</span></div>
            </div>
        </div>
    `;
}

window.initSubscriptionModalLogic = function () {
    // Plan Selection Logic
    window.selectPlan = function (el, type) {
        document.querySelectorAll('.plan-option').forEach(p => {
            p.style.borderColor = '#444';
            p.style.background = '#2a2a2a';
            p.classList.remove('active');
            // Reset text color for non-active
            const priceEl = p.querySelector('div:nth-child(2)');
            if (priceEl) priceEl.style.color = 'white';
        });

        el.classList.add('active');
        el.style.borderColor = '#ff1b6b';
        el.style.borderWidth = '2px';
        el.style.background = 'rgba(255, 27, 107, 0.1)';
        const priceEl = el.querySelector('div:nth-child(2)');
        if (priceEl) priceEl.style.color = '#ff1b6b';
    }

    // Initialize Lucide icons
    if (window.lucide) window.lucide.createIcons();

    // Helper to get or set end time
    const getTimerEndTime = (key, durationSeconds) => {
        const now = Date.now();
        const stored = localStorage.getItem(key);

        if (stored) {
            const endTime = parseInt(stored);
            return endTime;
        }

        // Set new time
        const newEndTime = now + (durationSeconds * 1000);
        localStorage.setItem(key, newEndTime);
        return newEndTime;
    };

    // 24h Countdown
    const countdown24hEl = document.getElementById('countdown-24h');
    if (countdown24hEl) {
        const endTime = getTimerEndTime('secret_timer_24h_v2', 24 * 60 * 60);

        const update24h = () => {
            const now = Date.now();
            let totalSeconds = Math.floor((endTime - now) / 1000);

            if (totalSeconds < 0) totalSeconds = 0;

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            countdown24hEl.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };
        update24h(); // Immediate update
        setInterval(update24h, 1000);
    }

    // 10m Countdown
    const countdown10mEl = document.getElementById('countdown-10m');
    if (countdown10mEl) {
        const endTime = getTimerEndTime('secret_timer_10m_v2', 600);

        const update10m = () => {
            const now = Date.now();
            let totalSeconds = Math.floor((endTime - now) / 1000);

            if (totalSeconds < 0) totalSeconds = 0;

            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            countdown10mEl.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };
        update10m(); // Immediate update
        setInterval(update10m, 1000);
    }
}
