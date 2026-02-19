/**
 * Stonebound Cheat Engine
 * Add new cheats here to avoid cluttering App.tsx
 */

export const applyCheat = (code: string, gameData: any): boolean => {
    const cleanCode = code.toUpperCase().trim();
    
    // Cheat: "GREEN GEMS!"
    // Purpose: Immediately activates all 10 crystals across all cave levels.
    if (cleanCode === "GREEN GEMS!") {
        const { caveLevels } = gameData;
        let count = 0;
        
        caveLevels.forEach((level: number[][]) => {
            for (let r = 0; r < level.length; r++) {
                for (let c = 0; c < level[r].length; c++) {
                    // 22: Normal Crystal, 24: Dormant Crystal (Red)
                    if (level[r][c] === 22 || level[r][c] === 24) {
                        level[r][c] = 23; // 23: Activated Crystal (Green)
                        count++;
                    }
                }
            }
        });
        
        alert(`CHEAT ACTIVATED: ${count} CRYSTALS ENERGIZED!`);
        return true;
    }
    
    // Add more cheats here in the future
    /*
    if (cleanCode === "ANOTHER CHEAT") {
        // logic
        return true;
    }
    */
    
    return false;
};