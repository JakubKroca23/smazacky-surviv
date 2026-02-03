export const CONFIG = {
    TILE_SIZE: 100,
    MAP_WIDTH: 50,
    MAP_HEIGHT: 50,
    PLAYER_SPEED: 350,
    PLAYER_DRAG: 800, // Friction/Inertia
    DAY_DURATION: 60000, // 60s Day
    NIGHT_DURATION: 60000, // 60s Night

    // Zone Settings
    ZONE_DAMAGE_PER_SECOND: 5,
    ZONE_SHRINK_DURATION: 20000, // 20s shrinking
    ZONE_WAIT_DURATION: 10000, // 10s waiting

    COLORS: {
        BACKGROUND: 0x0a0a0a,
        GRASS: 0x0d120d, // Dark tech ground base
        WATER: 0x001a1a, // Dark cyan water
        ROAD: 0x111111,
        WALL: 0x1a1a1a,
        ROOF: 0x050505,
        PLAYER: 0x00fbff, // Neon Cyan
        UI_NEON_GREEN: 0x00ff00,
        UI_NEON_PURPLE: 0xff00ff,
        UI_BACKGROUND: 0x000000,
        NIGHT_OVERLAY: 0x050505,
        ZONE_SAFE: 0xffffff,
        ZONE_DANGER: 0x00ff00
    },

    LIGHTING: {
        AMBIENT: 0x111111,
        PLAYER_FLASHLIGHT: {
            COLOR: 0xffffff,
            INTENSITY: 1.5,
            RADIUS: 600
        },
        NEON_INTENSITY: 2.0
    }
};
