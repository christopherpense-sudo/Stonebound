# Implementation Plan: Stonebound

## 1. Project Vision
**Stonebound** is an educational, retro-style adventure RPG focused on Earth Science (Geology). Players control **Mr. Pense**, navigating procedural caves and overworld islands to solve puzzles involving the Rock Cycle, Erosion, and the Law of Superposition.

## 2. Core Design Principles
*   **Aesthetic:** 128x128 pixel-art tiles rendered via HTML5 Canvas.
*   **Consistency:** All sprites must follow the procedural "bobbing" animation and specific hex-color palettes defined in the `Assets` engine.
*   **Accessibility:** Support for both Keyboard (WASD/Arrows) and Gamepad (Standard/Xbox API).
*   **Deployment:** Maintain an "All-in-One" HTML structure (`googlesites.html`) to ensure compatibility with Google Sites/IFrames.

## 3. Current Status (v2.33)
*   **Player:** Mr. Pense (Animated sprite with direction-specific rendering).
*   **NPCs:** Indiana Bones (Caves), Rocky (Interior), Magnus Obsidia (Volcano), Chip (Overworld), Mr. Arnold (Overworld)
*   **Systems:** 
    *   Procedural Cave Generation (10 depths).
    *   Seeded RNG for consistent world logic.
    *   Inventory Management (Hammer, Shovel, Prisms, Fossils).
    *   Educational Quest Logic (Crystal activation via science questions).
    *   Save/Load System (Base56 compressed strings).

## 4. Key Logic Constraints (The "Rules")
*   **Tile ID 24 (Dormant Crystal):** Must remain a **Red Crystal** visual.
*   **Tile ID 37 (Monster Statue):** A unique stone entity on the starter island that only awakens (eyes glow) once all 10 crystals are green.
*   **Collision Logic:** Walls, statues, and water must remain impassable unless specifically modified by a tool (e.g., Hammer smashing boulders).

## 5. Roadmap (Upcoming Priorities)
### Phase 1: Visual & Narrative Polish
*   [ ] Refine NPC dialogue trees for deeper educational context.
*   [ ] Enhance particle effects for "smashing" and "digging" actions.
*   [ ] Ensure the `Scroll of Wisdom` provides a readable lore summary.

### Phase 2: World Expansion
*   [ ] Add "Sediment" types that correspond to specific rock layers (Igneous, Sedimentary, Metamorphic).
*   [ ] Implement a "Geology Journal" UI to track found fossils and facts.

### Phase 3: Technical Hardening
*   [ ] Optimize Canvas redraw loops for higher frame stability on mobile devices.
*   [ ] Expand Gamepad auto-configuration for non-standard controllers.

## 6. Maintenance Protocol
Before any code change:
1.  Verify the **Tile ID map** to prevent asset overwriting.
2.  Ensure the **Mr. Pense rendering function** (`renderChar`) is not altered.
3.  Test **Save/Load compatibility** with current data structures.