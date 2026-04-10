// Winner Graphic
window.PL21_Graphics_Winner = async function(state) {
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
    
    // 2. ICE GRID
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    for (let x = 0; x < width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // 3. CARBON BASE
    const carbonY = height * 0.75;
    for (let y = carbonY; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
            if ((x + y) % 8 === 0) {
                ctx.fillStyle = 'rgba(40,40,50,0.2)';
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
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, carbonY, width, height - carbonY);
    ctx.restore();
    
    // 4. TOP BAR
    const barGradient = ctx.createLinearGradient(0, 0, width, 0);
    barGradient.addColorStop(0, colors.secondary);
    barGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = barGradient;
    ctx.fillRect(0, 0, width, 6);
    
    // 5. BACKGROUND NUMBER
    ctx.font = '800 500px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    const numberText = '#' + driver.number;
    const metrics = ctx.measureText(numberText);
    ctx.fillText(numberText, width - metrics.width - 20, 350);
    
    // 6. DRIVER PHOTO
    if (driver.photo) {
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
            ctx.shadowBlur = 0;
        }
    }
    
    // 7. TEXT ELEMENTS
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(round.round, 40, 50);
    
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(round.gp.split(' ')[0].toUpperCase(), 40, 100);
    
    // 8. WINNER TEXT
    ctx.save();
    ctx.font = '800 160px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    ctx.fillText('WINNER', 40, height - 280);
    ctx.restore();
    
    // 9. GOLD LINE
    ctx.save();
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 12;
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(40, height - 150, 6, 60);
    ctx.restore();
    
    // 10. DRIVER NAME
    const nameSize = utils.getDynamicFontSize(driver.name.toUpperCase(), 600, 64, 30);
    ctx.font = `bold ${nameSize}px Inter, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(driver.name.toUpperCase(), 70, height - 110);
    
    // 11. TEAM NAME
    ctx.font = '500 28px Inter, sans-serif';
    ctx.fillStyle = colors.light + '80';
    ctx.fillText(teamForRound.toUpperCase(), 70, height - 50);
};