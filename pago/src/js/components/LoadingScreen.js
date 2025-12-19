window.renderLoadingScreen = function () {
    // Generate some stars dynamically for the effect
    const stars = Array(20).fill(0).map(() => {
        const style = `
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        return `<div class="star" style="${style}"></div>`;
    }).join('');

    return `
        <div class="loading-screen" id="loading-screen">
            <div class="starfield">
                ${stars}
            </div>
            
            <div class="loading-content">
                <img src="https://i.imgur.com/7e6uiB6.png" alt="Secret Logo" class="loading-logo intro-logo">
                
                <h1 class="loading-headline">
                    SECRET: Converse e troque fotos picantes <span class="highlight">SEM enrolação</span>.
                </h1>

                <div class="spinner"></div>
            </div>
        </div>
    `;
}
