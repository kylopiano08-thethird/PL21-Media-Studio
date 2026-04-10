// Driver of the Day Graphic
window.PL21_Graphics_DOTD = async function(state) {
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
    
    // ===== BACKGROUND LAYER =====
    // 1. Main gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.4, colors.light);
    gradient.addColorStop(0.8, colors.dark);
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 2. Hex pattern
    ctx.strokeStyle = colors.secondary + '30';
    ctx.lineWidth = 1;
    const hexSize = 35;
    const hexHeight = hexSize * Math.sqrt(3);
    for (let row = -2; row < height / hexHeight + 2; row++) {
        for (let col = -2; col < width / (hexSize * 1.5) + 2; col++) {
            const x = col * hexSize * 1.5;
            const y = row * hexHeight + (col % 2) * hexHeight / 2;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const hx = x + hexSize * Math.cos(angle);
                const hy = y + hexSize * Math.sin(angle);
                i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    // 3. Depth overlay
    const depthGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    depthGradient.addColorStop(0, 'rgba(0,0,0,0)');
    depthGradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    depthGradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = depthGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 4. Glow spots
    ctx.save();
    ctx.filter = 'blur(60px)';
    ctx.globalAlpha = 0.15;
    
    ctx.fillStyle = colors.primary;
    ctx.beginPath(); ctx.arc(150, 250, 250, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = colors.light;
    ctx.beginPath(); ctx.arc(650, 800, 300, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = colors.secondary;
    ctx.beginPath(); ctx.arc(400, 500, 280, 0, Math.PI * 2); ctx.fill();
    
    ctx.restore();
    
    // 5. Top bar
    const barGradient = ctx.createLinearGradient(0, 0, width, 0);
    barGradient.addColorStop(0, colors.secondary);
    barGradient.addColorStop(0.5, colors.primary);
    barGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = barGradient;
    ctx.fillRect(0, 0, width, 8);
    
    // ===== MIDDLE LAYER =====
    // 6. Background number
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 30;
    ctx.font = '800 500px Inter, sans-serif';
    ctx.fillStyle = colors.secondary + '18';
    const numberText = '#' + driver.number;
    const numberWidth = ctx.measureText(numberText).width;
    ctx.fillText(numberText, width - numberWidth - 40, 400);
    ctx.shadowBlur = 0;
    
    // 7. Driver photo
    if (driver.photo) {
        const img = await utils.loadImage(driver.photo);
        if (img) {
            const driverSizeFactor = state.driverSize / 100;
            
            const targetHeight = 500 * driverSizeFactor;
            const targetWidth = 400 * driverSizeFactor;
            
            const aspectRatio = img.width / img.height;
            
            let drawWidth, drawHeight;
            
            drawHeight = targetHeight;
            drawWidth = drawHeight * aspectRatio;
            
            if (drawWidth > targetWidth) {
                drawWidth = targetWidth;
                drawHeight = drawWidth / aspectRatio;
            }
            
            const photoX = (width - drawWidth) / 2 - 30;
            const photoY = (height - drawHeight) / 2 + 20;
            
            ctx.shadowColor = colors.secondary;
            ctx.shadowBlur = 40;
            ctx.drawImage(img, photoX, photoY, drawWidth, drawHeight);
            ctx.shadowBlur = 0;
        }
    }
    
    // 8. Diagonal corners
    // Top left
    ctx.fillStyle = colors.dark + 'EE';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(500, 0);
    ctx.lineTo(0, 380);
    ctx.closePath();
    ctx.fill();
    
    // Top edge line
    ctx.strokeStyle = colors.secondary + '90';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(500, 0);
    ctx.lineTo(0, 380);
    ctx.stroke();
    
    // Bottom right
    ctx.fillStyle = utils.darkenColor(colors.secondary, 0.3);
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(180, height);
    ctx.lineTo(width, 450);
    ctx.closePath();
    ctx.fill();
    
    // Bottom edge line
    ctx.strokeStyle = colors.secondary + '90';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, height);
    ctx.lineTo(width, 450);
    ctx.stroke();
    
    // ===== TOP LAYER - TEXT =====
    // Round info
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    ctx.fillText(round.round, 40, 60);
    
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    
    const gpParts = round.gp.split(' ');
    if (gpParts.length > 2) {
        ctx.fillText(gpParts[0].toUpperCase(), 40, 115);
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.fillStyle = colors.light;
        ctx.fillText(gpParts.slice(1).join(' ').toUpperCase(), 40, 155);
    } else {
        ctx.fillText(round.gp.toUpperCase(), 40, 115);
    }
    
    // DOTD text
    ctx.save();
    ctx.shadowColor = colors.dark;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.font = '800 55px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    ctx.fillText('DRIVER OF', 40, 560);
    
    ctx.font = '800 75px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    ctx.fillText('THE DAY', 40, 635);
    ctx.restore();
    
    // Stats
    const rightAlignX = 750;
    
    // Fan vote label
    ctx.font = 'bold 22px Inter, sans-serif';
    const fanVoteLabel = 'FAN VOTE';
    const fanVoteLabelWidth = ctx.measureText(fanVoteLabel).width;
    ctx.fillStyle = colors.secondary;
    ctx.fillText(fanVoteLabel, rightAlignX - fanVoteLabelWidth, 660);
    
    // Vote percentage
    ctx.save();
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 12;
    ctx.font = '700 55px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    const percentWidth = ctx.measureText(state.votePercent).width;
    ctx.fillText(state.votePercent, rightAlignX - percentWidth, 730);
    ctx.restore();
    
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillStyle = colors.light;
    const countWidth = ctx.measureText(state.voteCount).width;
    ctx.fillText(state.voteCount, rightAlignX - countWidth, 765);
    
    // Position change label
    ctx.font = 'bold 22px Inter, sans-serif';
    const posLabel = 'POSITION CHANGE';
    const posLabelWidth = ctx.measureText(posLabel).width;
    ctx.fillStyle = colors.secondary;
    ctx.fillText(posLabel, rightAlignX - posLabelWidth, 820);
    
    // Position change with arrow
    ctx.font = '700 50px Inter, sans-serif';
    const p10Width = ctx.measureText(state.startPos).width;
    const p3Width = ctx.measureText(state.finishPos).width;
    
    const arrowLength = 35;
    const gapBeforeArrow = 12;
    const gapAfterArrow = 18;
    const totalUnitWidth = p10Width + gapBeforeArrow + arrowLength + gapAfterArrow + p3Width;
    
    const unitStartX = rightAlignX - totalUnitWidth;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.startPos, unitStartX, 895);
    
    const arrowStartX = unitStartX + p10Width + gapBeforeArrow;
    const arrowEndX = arrowStartX + arrowLength;
    
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(arrowStartX, 875);
    ctx.lineTo(arrowEndX, 875);
    ctx.stroke();
    
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(arrowEndX, 870);
    ctx.lineTo(arrowEndX + 8, 875);
    ctx.lineTo(arrowEndX, 880);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = colors.secondary;
    ctx.fillText(state.finishPos, arrowEndX + gapAfterArrow, 895);
    
    // Driver name
    const maxNameWidth = rightAlignX - 350;
    const nameSize = utils.getDynamicFontSize(driver.name, maxNameWidth, 54, 24);
    ctx.font = `bold ${nameSize}px Inter, sans-serif`;
    const nameWidth = ctx.measureText(driver.name).width;
    const driverNameX = rightAlignX - nameWidth;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(driver.name, driverNameX, 980);
    
    // Team name
    ctx.font = '500 30px Inter, sans-serif';
    const teamWidth = ctx.measureText(teamForRound).width;
    const teamNameX = rightAlignX - teamWidth;
    ctx.fillStyle = colors.light;
    ctx.fillText(teamForRound, teamNameX, 1025);
    
    // Yellow line
    const lineX = driverNameX - 20;
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(lineX, 920, 6, 95);
};