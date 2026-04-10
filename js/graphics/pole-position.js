// Pole Position Graphic
window.PL21_Graphics_Pole = async function(state) {
    const utils = window.PL21_Utils;
    const ctx = utils.getCtx();
    const canvas = utils.getCanvas();
    const width = canvas.width, height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const driver = window.PL21_DATA?.drivers.find(d => d.name === state.selectedDriver);
    const round = window.PL21_DATA?.raceRounds[state.selectedRound];
    if (!driver || !round) {
        ctx.fillStyle = '#fff';
        ctx.font = '24px Inter';
        ctx.fillText('Select driver and round', 200, 500);
        return;
    }
    
    const roundNum = parseInt(round.round.replace(/\D/g, '')) || 1;
    const teamForRound = window.PL21_DATA.getDriverTeamForRound(driver, roundNum);
    const teamColors = window.PL21_DATA.getTeamColors(teamForRound);
    const colors = utils.getColorPalette(teamColors);
    
    // 1. BACKGROUND GRADIENT
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.3, colors.primary);
    gradient.addColorStop(0.6, colors.light);
    gradient.addColorStop(1, colors.dark);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 2. VERTICAL VARIATION
    const gradient2 = ctx.createLinearGradient(0, 0, 0, height);
    gradient2.addColorStop(0, 'rgba(0,0,0,0)');
    gradient2.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, width, height);
    
    // 3. CARBON BASE
    const carbonY = height * 0.75;
    
    for (let y = carbonY; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
            if ((x + y) % 8 === 0) {
                ctx.fillStyle = `rgba(40,40,50,0.2)`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, carbonY);
    ctx.lineTo(width, carbonY - 30);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.clip();
    
    ctx.fillStyle = colors.dark + '30';
    ctx.fillRect(0, carbonY, width, height - carbonY);
    ctx.restore();
    
    // 4. TOP BAR
    const barGradient = ctx.createLinearGradient(0, 0, width, 0);
    barGradient.addColorStop(0, colors.secondary);
    barGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = barGradient;
    ctx.fillRect(0, 0, width, 6);
    
    // 5. GLOW SPOTS
    ctx.save();
    ctx.filter = 'blur(40px)';
    ctx.globalAlpha = 0.1;
    
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.arc(200, 300, 150, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.arc(600, 500, 200, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = colors.light;
    ctx.beginPath();
    ctx.arc(400, 800, 180, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // 6. SPEED LINES
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 20; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = startY + (Math.random() - 0.5) * 400;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    ctx.restore();
    
    // 7. DRIVER PHOTO
    if (driver.photo) {
        try {
            const img = await utils.loadImage(driver.photo);
            if (img) {
                const driverSizeFactor = state.driverSize / 100;
                const targetWidth = width * 0.5 * driverSizeFactor;
                const aspectRatio = img.width / img.height;
                const drawWidth = targetWidth;
                const drawHeight = drawWidth / aspectRatio;
                
                const photoX = (width - drawWidth) / 2;
                const photoY = (height - drawHeight) / 2 - 20;
                
                ctx.shadowColor = colors.secondary;
                ctx.shadowBlur = 25;
                ctx.drawImage(img, photoX, photoY, drawWidth, drawHeight);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }
        } catch (e) {}
    }
    
    // 8. TEXT ELEMENTS
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    ctx.fillText(`${round.round}`, 40, 50);
    
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    
    const gpParts = round.gp.split(' ');
    if (gpParts.length > 2) {
        ctx.fillText(gpParts[0].toUpperCase(), 40, 100);
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.fillStyle = colors.light;
        ctx.fillText(gpParts.slice(1).join(' ').toUpperCase(), 40, 140);
    } else {
        ctx.fillText(round.gp.toUpperCase(), 40, 100);
    }
    
    // 9. BACKGROUND NUMBER
    ctx.font = '800 500px Inter, sans-serif';
    ctx.fillStyle = colors.secondary + '20';
    const numberText = `#${driver.number}`;
    const numberMetrics = ctx.measureText(numberText);
    ctx.fillText(numberText, width - numberMetrics.width - 20, 350);
    
    // 10. POLE TEXT
    ctx.save();
    ctx.font = '800 160px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    ctx.fillText('POLE', 40, height - 280);
    ctx.restore();
    
    // 11. BOTTOM RIGHT PANEL
    const panelX = 500;
    const panelY = 800;
    const panelWidth = 300;
    const panelHeight = 267;
    
    ctx.fillStyle = colors.dark + '99';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel grid
    ctx.strokeStyle = colors.secondary + '20';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < panelWidth; i += 30) {
        ctx.beginPath();
        ctx.moveTo(panelX + i, panelY);
        ctx.lineTo(panelX + i, panelY + panelHeight);
        ctx.stroke();
    }
    for (let i = 0; i < panelHeight; i += 30) {
        ctx.beginPath();
        ctx.moveTo(panelX, panelY + i);
        ctx.lineTo(panelX + panelWidth, panelY + i);
        ctx.stroke();
    }
    
    // Panel text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const panelCenterX = panelX + panelWidth/2;
    const panelCenterY = panelY + panelHeight/2;
    
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = colors.light;
    ctx.fillText('QUALIFYING TIME', panelCenterX, panelCenterY - 25);
    
    // Time
    ctx.save();
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 12;
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    ctx.fillText(state.qualifyingTime, panelCenterX, panelCenterY + 15);
    ctx.restore();
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    
    // 12. DRIVER NAME
    const maxNameWidth = panelX - 90;
    const driverNameUpper = driver.name.toUpperCase();
    const nameFontSize = utils.getDriverNameFontSize(driverNameUpper, maxNameWidth, panelX);
    
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(40, height - 150, 6, 60);
    
    ctx.font = `bold ${nameFontSize}px Inter, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(driverNameUpper, 70, height - 110);
    
    ctx.font = '500 28px Inter, sans-serif';
    ctx.fillStyle = colors.light + '80';
    ctx.fillText(teamForRound.toUpperCase(), 70, height - 50);
};