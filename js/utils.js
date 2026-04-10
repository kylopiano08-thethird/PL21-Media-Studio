// Utility Functions Module
window.PL21_Utils = (function() {
    const canvas = document.getElementById('unified-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let imageCache = {};

    // Helper: load image with cache
    async function loadImage(url) {
        if (!url) return null;
        if (imageCache[url]) return imageCache[url];
        
        return new Promise((res) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                imageCache[url] = img;
                res(img);
            };
            img.onerror = () => {
                imageCache[url] = null;
                res(null);
            };
            img.src = url;
        });
    }

    // Helper: generate darker version of a color
    function darkenColor(hex, percent) {
        if (!hex || hex === '#000000') return '#333333';
        hex = hex.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        r = Math.max(0, Math.floor(r * (1 - percent)));
        g = Math.max(0, Math.floor(g * (1 - percent)));
        b = Math.max(0, Math.floor(b * (1 - percent)));
        
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Helper: generate lighter version of a color
    function lightenColor(hex, percent) {
        if (!hex || hex === '#000000') return '#666666';
        hex = hex.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        r = Math.min(255, Math.floor(r + (255 - r) * percent));
        g = Math.min(255, Math.floor(g + (255 - g) * percent));
        b = Math.min(255, Math.floor(b + (255 - b) * percent));
        
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Helper: get color palette
    function getColorPalette(teamColors) {
        return {
            primary: teamColors.primary,
            secondary: teamColors.secondary,
            light: lightenColor(teamColors.primary, 0.3),
            dark: darkenColor(teamColors.primary, 0.3)
        };
    }

    // Helper: dynamic font size
    function getDynamicFontSize(text, maxWidth, baseSize, minSize = 14) {
        let fontSize = baseSize;
        ctx.font = `bold ${fontSize}px Inter`;
        let metrics = ctx.measureText(text);
        while (metrics.width > maxWidth && fontSize > minSize) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Inter`;
            metrics = ctx.measureText(text);
        }
        return fontSize;
    }

    // Helper: dynamic font size for driver name
    function getDriverNameFontSize(name, maxWidth, panelX) {
        let fontSize = 64;
        ctx.font = `bold ${fontSize}px Inter`;
        let metrics = ctx.measureText(name);
        const nameEndX = 70 + metrics.width;
        
        while ((nameEndX > panelX - 20 || metrics.width > maxWidth) && fontSize > 30) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Inter`;
            metrics = ctx.measureText(name);
            const newNameEndX = 70 + metrics.width;
            if (newNameEndX <= panelX - 20 && metrics.width <= maxWidth) break;
        }
        
        return fontSize;
    }

    function getCtx() {
        return ctx;
    }

    function getCanvas() {
        return canvas;
    }

    return {
        loadImage,
        darkenColor,
        lightenColor,
        getColorPalette,
        getDynamicFontSize,
        getDriverNameFontSize,
        getCtx,
        getCanvas
    };
})();