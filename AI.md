# Pravidla pro AI a Projekt

Tento dokument slouží jako reference pro AI agenty pracující na projektu **Smazacky Surviv**. Dodržujte tato pravidla pro zachování konzistence a správné struktury kódu.

## 1. Použité Technologie (Tech Stack)
- **Engine**: Phaser 3 (v3.80+).
- **Jazyk**: TypeScript.
- **Build Nástroj**: Vite.
- **Fyzika**: Arcade Physics.

## 2. Adresářová Struktura
- **src/scenes/**: Logika scén (BootScene, GameScene, UIScene).
- **src/objects/**: Herní entity (Player, Enemy, Car, Weapon, Loot).
- **src/core/**: Hlavní logika (MapGenerator, Config, World).
- **src/managers/**: Systémy (InventoryManager).
- **public/assets/**: Statické assety (SVGs, PNGs).

## 3. Konvence Kódování
- **TypeScript**: Používejte explicitní typy, kde je to možné. Vyhněte se `any`, pokud to není nutné pro složité interakce Phaseru.
- **Třídy**: Používejte komponenty založené na třídách pro GameObjects (např. `class Player extends Phaser.Physics.Arcade.Sprite`).
- **Assety**: Vždy zkontrolujte, zda asset existuje v `BootScene` před jeho použitím. Pokud vytváříte nový, přidejte tam logiku načítání.
- **Měřítko**: Hra využívá velikost dlaždic (často 64px nebo škálované), ale fyzická těla jsou často kruhová nebo obdélníková.
- **Proměnné**: Používejte `CONFIG` v `src/config.ts` pro globální konstanty (Rychlost, Velikost mapy).

## 4. Pravidla Pracovního Postupu (Workflow)
- **Verifikace**: Po úpravě kódu VŽDY spusťte `npm run build`, abyste se ujistili, že nevznikly žádné chyby v TypeScriptu.
- **Linting**: Opravujte nepoužívané proměnné, pokud znepřehledňují kód, ale prioritou je funkčnost.
- **Správa Úkolů**: Aktualizujte `task.md` a `walkthrough.md` v adresáři brain při dokončení funkcí. Vždy se ujistěte že jsou v češtině.

## 5. Herní Design a Kontext
- **Žánr**: 2D Top-Down Survival / Battle Royale.
- **Styl**: Klon "Surviv.io".
- **Funkce**: 
    - Inventář se sloty pro batoh.
    - Řiditelná auta.
    - Interiéry budov (Mizení střechy).
    - Jednoduchá AI (Pronásledování).
