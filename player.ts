/**
 * Stonebound Player Renderer
 * Handles the procedural drawing of Mr. Pense.
 */

export const renderMrPense = (dir: string, frame: number, isMoving: boolean, wearingHat: boolean = false) => {
    return (ctx: CanvasRenderingContext2D) => {
        const bob = (frame % 2 === 0 && isMoving) ? 4 : 0;
        const walkOffset = (frame === 1) ? -8 : (frame === 3 ? 8 : 0);
        const p = 4; // Pixel multiplier (assuming 32x32 logic scaled to 128x128)
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); 
        ctx.ellipse(16 * p, 28.5 * p, 5 * p, 2 * p, 0, 0, Math.PI * 2); 
        ctx.fill();

        // Legs/Shoes
        ctx.fillStyle = '#111'; 
        const isSide = dir === 'left' || dir === 'right';
        const lx = isSide ? (14.5 * p) : (12 * p + walkOffset);
        const rx = isSide ? (14.5 * p) : (16 * p - walkOffset);
        
        if (isSide) {
            ctx.fillRect(lx - 2 * p, 26 * p - bob + (walkOffset / 2), 3 * p, 3 * p);
            ctx.fillRect(rx + 2 * p, 26 * p - bob - (walkOffset / 2), 3 * p, 3 * p);
            ctx.fillStyle = '#263238'; // Pants
            ctx.fillRect(lx - 2 * p, 21 * p - bob + (walkOffset / 2), 3 * p, 5 * p);
            ctx.fillRect(rx + 2 * p, 21 * p - bob - (walkOffset / 2), 3 * p, 5 * p);
        } else {
            ctx.fillRect(lx, 26 * p - bob, 3 * p, 3 * p);
            ctx.fillRect(rx, 26 * p - bob, 3 * p, 3 * p);
            ctx.fillStyle = '#263238'; // Pants
            ctx.fillRect(lx, 21 * p - bob, 3 * p, 5 * p);
            ctx.fillRect(rx, 21 * p - bob, 3 * p, 5 * p);
        }

        // Coat Body
        const coatY = 13 * p - bob, coatH = 10 * p;
        ctx.fillStyle = '#eeeeee'; 
        if (isSide) {
            ctx.beginPath(); 
            ctx.moveTo(14 * p, coatY + p); 
            ctx.quadraticCurveTo(16 * p, coatY - 0.5 * p, 18 * p, coatY + p); 
            ctx.lineTo(19 * p, coatY + coatH); 
            ctx.lineTo(13 * p, coatY + coatH); 
            ctx.closePath(); 
            ctx.fill();
        } else {
            ctx.beginPath(); 
            ctx.moveTo(11 * p, coatY + 1.5 * p); 
            ctx.quadraticCurveTo(11 * p, coatY, 13 * p, coatY); 
            ctx.lineTo(19 * p, coatY); 
            ctx.quadraticCurveTo(21 * p, coatY, 21 * p, coatY + 1.5 * p); 
            ctx.lineTo(22.5 * p, coatY + coatH); 
            ctx.lineTo(9.5 * p, coatY + coatH); 
            ctx.closePath(); 
            ctx.fill();
        }

        // Coat Shadows/Details
        ctx.fillStyle = '#cfd8dc'; 
        if (isSide) ctx.fillRect(13 * p, coatY + coatH - p, 6 * p, p); 
        else ctx.fillRect(9.5 * p, coatY + coatH - p, 13 * p, p);

        // Direction Specific Accessories
        if (dir === 'down') {
            ctx.fillStyle = '#e65100'; // Orange Shirt Accent
            ctx.beginPath(); ctx.moveTo(14.5 * p, coatY); ctx.lineTo(17.5 * p, coatY); ctx.lineTo(16 * p, coatY + 6 * p); ctx.fill();
            ctx.fillStyle = '#ff9800'; 
            ctx.beginPath(); ctx.moveTo(15 * p, coatY); ctx.lineTo(17 * p, coatY); ctx.lineTo(16 * p, coatY + 4 * p); ctx.fill();
        } else if (dir === 'up') {
            ctx.fillStyle = '#cfd8dc'; 
            ctx.fillRect(15.5 * p, coatY + p, p, 7 * p); // Backpack Strap maybe?
            ctx.fillStyle = '#b0bec5'; 
            ctx.fillRect(11.5 * p, coatY + 5.5 * p, 9 * p, 1 * p);
        }

        // Arms
        ctx.fillStyle = '#ffffff'; 
        const armWidth = 2.2 * p, lArmOff = walkOffset / 2, rArmOff = -walkOffset / 2;
        if (dir === 'down' || dir === 'up') {
            ctx.save(); 
            ctx.translate(11 * p, coatY + 1.5 * p); 
            ctx.rotate(0.1 * (lArmOff / 4)); 
            ctx.fillRect(-armWidth, 0, armWidth, 6.5 * p); 
            ctx.fillStyle = '#ffdbac'; // Skin
            ctx.fillRect(-armWidth + 0.1 * p, 6.5 * p, 2 * p, 2 * p); 
            ctx.restore();
            
            ctx.fillStyle = '#ffffff'; 
            ctx.save(); 
            ctx.translate(21 * p, coatY + 1.5 * p); 
            ctx.rotate(-0.1 * (rArmOff / 4)); 
            ctx.fillRect(0, 0, armWidth, 6.5 * p); 
            ctx.fillStyle = '#ffdbac'; 
            ctx.fillRect(0.1 * p, 6.5 * p, 2 * p, 2 * p); 
            ctx.restore();
        } else {
            const isR = dir === 'right'; 
            ctx.save(); 
            ctx.translate(16 * p, coatY + 1.5 * p); 
            ctx.rotate(isR ? (0.2 * (lArmOff / 4)) : (-0.2 * (lArmOff / 4))); 
            ctx.fillRect(-armWidth / 2, 0, armWidth, 7 * p); 
            ctx.fillStyle = '#ffdbac'; 
            ctx.fillRect(-armWidth / 2 + 0.1 * p, 7 * p, 2 * p, 2 * p); 
            ctx.restore();
        }

        // Head
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath(); 
        ctx.ellipse(16 * p, 8 * p - bob, isSide ? 3 * p : 3.5 * p, 4.5 * p, 0, 0, Math.PI * 2); 
        ctx.fill();

        // Eyes / Glasses
        if (dir === 'down') {
            ctx.fillStyle = '#008080'; // Glass Rims
            ctx.fillRect(13.25 * p, 7.5 * p - bob, 2.5 * p, 2 * p); 
            ctx.fillRect(15.75 * p, 8 * p - bob, 0.5 * p, 0.5 * p); 
            ctx.fillRect(16.25 * p, 7.5 * p - bob, 2.5 * p, 2 * p);
            ctx.fillStyle = '#00f2f2'; // Teal Shine
            ctx.fillRect(13.75 * p, 8 * p - bob, 0.75 * p, 0.75 * p); 
            ctx.fillRect(16.75 * p, 8 * p - bob, 0.75 * p, 0.75 * p);
        } else if (isSide) {
            const isL = dir === 'left'; 
            ctx.fillStyle = '#008080'; 
            ctx.fillRect(isL ? 13 * p : 16.5 * p, 7.5 * p - bob, 2.5 * p, 2 * p); 
            ctx.fillStyle = '#00f2f2'; 
            ctx.fillRect(isL ? 13.25 * p : 18.25 * p, 8 * p - bob, 0.5 * p, 0.5 * p);
        }

        // Hair / Hat
        if (wearingHat) {
            const hatBob = bob;
            const cX = 16 * p;
            const headY = 8 * p - hatBob;
            const isSide = dir === 'left' || dir === 'right';
            
            // Show sideburns/hair on sides under the hat
            ctx.fillStyle = '#3e2723';
            if (dir === 'down') {
                ctx.fillRect(12.5 * p, 6.5 * p - bob, 0.8 * p, 1.8 * p);
                ctx.fillRect(18.7 * p, 6.5 * p - bob, 0.8 * p, 1.8 * p);
            } else if (isSide) {
                const isL = dir === 'left';
                if (isL) ctx.fillRect(15.5 * p, 8.5 * p - bob, 1.5 * p, 0.5 * p);
                else ctx.fillRect(15 * p, 8.5 * p - bob, 1.5 * p, 0.5 * p);
            }

            // 1. Brim
            ctx.fillStyle = '#3e2723'; // Dark brown for bottom/edge
            if (isSide) {
                const bx = cX - 7 * p;
                ctx.fillRect(bx, headY - 1.2 * p, 14 * p, 2 * p);
                ctx.fillStyle = '#5d4037'; // Top surface
                ctx.fillRect(bx, headY - 1.2 * p, 14 * p, 0.8 * p);
            } else {
                const bx = cX - 6 * p;
                ctx.fillRect(bx, headY - 1.2 * p, 12 * p, 2 * p);
                ctx.fillStyle = '#5d4037'; // Top surface
                ctx.fillRect(bx, headY - 1.2 * p, 12 * p, 0.8 * p);
            }
            
            // 2. Crown
            ctx.fillStyle = '#6d4c41'; 
            if (isSide) {
                ctx.fillRect(cX - 4 * p, headY - 5.2 * p, 8 * p, 4.5 * p);
            } else {
                ctx.fillRect(cX - 3.5 * p, headY - 5.2 * p, 7 * p, 4.5 * p);
            }
            
            // 3. Band
            ctx.fillStyle = '#212121'; 
            if (isSide) {
                ctx.fillRect(cX - 4 * p, headY - 2.2 * p, 8 * p, 1.2 * p);
            } else {
                ctx.fillRect(cX - 3.5 * p, headY - 2.2 * p, 7 * p, 1.2 * p);
            }
            
            // 4. Detail: Crown Top shape
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(cX - 2 * p, headY - 5.2 * p, 4 * p, 0.6 * p);
        } else {
            ctx.fillStyle = '#3e2723';
            if (dir === 'down') {
                ctx.beginPath(); ctx.arc(16 * p, 6.5 * p - bob, 3.8 * p, Math.PI, 0); ctx.fill(); 
                ctx.fillRect(12.5 * p, 6.5 * p - bob, 0.75 * p, 1.5 * p); 
                ctx.fillRect(18.75 * p, 6.5 * p - bob, 0.75 * p, 1.5 * p);
            } else if (dir === 'up') {
                ctx.beginPath(); ctx.arc(16 * p, 6.5 * p - bob, 3.8 * p, Math.PI, 0); ctx.fill(); 
                ctx.fillRect(12.5 * p, 6.5 * p - bob, 7 * p, 2.5 * p); 
                ctx.fillStyle = '#2d1b15'; 
                ctx.fillRect(12.5 * p, 8.5 * p - bob, 7 * p, 0.5 * p);
            } else if (isSide) {
                const isL = dir === 'left'; 
                ctx.beginPath(); ctx.arc(16 * p, 6.5 * p - bob, 3.3 * p, Math.PI, 0); ctx.fill(); 
                if (isL) ctx.fillRect(15 * p, 6.5 * p - bob, 4 * p, 2.8 * p); 
                else ctx.fillRect(13 * p, 6.5 * p - bob, 4 * p, 2.8 * p);
                ctx.fillStyle = '#2d1b15'; 
                if (isL) ctx.fillRect(17.5 * p, 8.8 * p - bob, 1.5 * p, 0.5 * p); 
                else ctx.fillRect(13 * p, 8.8 * p - bob, 1.5 * p, 0.5 * p); 
                ctx.fillStyle = '#f1c27d'; 
                ctx.fillRect(14 * p, 9.3 * p - bob, 4 * p, 0.7 * p);
            }
        }
    };
};