export const CONFIG = {
    TILE_SIZE: 100,
    MAP_WIDTH: 50,
    MAP_HEIGHT: 50,
    PLAYER_SPEED: 300,
    PLAYER_DRAG: 800, // Friction/Inertia
    DAY_DURATION: 60000, // 60s Day
    NIGHT_DURATION: 60000, // 60s Night

    // Zone Settings
    ZONE_DAMAGE_PER_SECOND: 5,
    ZONE_SHRINK_DURATION: 20000, // 20s shrinking
    ZONE_WAIT_DURATION: 10000, // 10s waiting

    COLORS: {
        GRASS: 0x1a2e1a, // Dark Green
        WATER: 0x1a2e1a, // Same as grass (water removed visually)
        ROAD: 0x1a2e1a, // Same as grass
        WALL: 0x0a140a, // Very dark green/black
        ROOF: 0x050a05,
        PLAYER: 0xf1c40f,
        UI_BACKGROUND: 0x000000,
        NIGHT_OVERLAY: 0x000011,
        ZONE_SAFE: 0xffffff,
        ZONE_DANGER: 0x00ff00 // Poison Green
    }
};
