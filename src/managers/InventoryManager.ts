import { Weapon } from "../objects/Weapon";

export class InventoryManager {
    public primaryWeapon: Weapon | null = null;
    public secondaryWeapon: Weapon | null = null;
    public backpack: { type: string, amount: number, icon: string }[] = [];
    private maxBackpackSlots: number = 5;
    private activeSlot: 'primary' | 'secondary' = 'primary';

    constructor() { }

    equipWeapon(weapon: Weapon) {
        if (!this.primaryWeapon) {
            this.primaryWeapon = weapon;
            console.log(`Equipped ${weapon.stats.name} to PRIMARY`);
        } else if (!this.secondaryWeapon) {
            this.secondaryWeapon = weapon;
            console.log(`Equipped ${weapon.stats.name} to SECONDARY`);
        } else {
            console.log('Inventory full. Dropping weapon not implemented yet.');
            // TODO: Drop current and replace
        }
    }

    getActiveWeapon(): Weapon | null {
        return this.activeSlot === 'primary' ? this.primaryWeapon : this.secondaryWeapon;
    }

    switchSlot(slot: 'primary' | 'secondary') {
        this.activeSlot = slot;
        console.log(`Switched to ${slot.toUpperCase()} slot`);
    }

    addAmmo(type: string, amount: number) {
        // Simple logic: add to first weapon that uses this ammo
        if (this.primaryWeapon && this.primaryWeapon.stats.ammoType === type) {
            this.primaryWeapon.totalAmmo = Math.min(this.primaryWeapon.totalAmmo + amount, this.primaryWeapon.stats.maxAmmo);
        } else if (this.secondaryWeapon && this.secondaryWeapon.stats.ammoType === type) {
            this.secondaryWeapon.totalAmmo = Math.min(this.secondaryWeapon.totalAmmo + amount, this.secondaryWeapon.stats.maxAmmo);
        } else {
            // Store ammo even if no weapon? For surviv.io style, yes. 
            // But for now, just drop/ignore if no weapon? 
            // Let's ignore for simplicity or print msg.
            console.log(`No weapon for ${type}, ammo discarded.`);
        }
    }

    addItem(type: string, amount: number) {
        // Check if stackable item exists
        const existing = this.backpack.find(i => i.type === type);
        if (existing) {
            existing.amount += amount;
            console.log(`Added ${amount} to ${type} stack in backpack`);
        } else {
            if (this.backpack.length < this.maxBackpackSlots) {
                // Infer icon from type? Or pass it.
                // type corresponds to loot texture usually.
                this.backpack.push({ type, amount, icon: `loot-${type}` }); // Simple mapping assumption
                console.log(`Added ${type} to backpack`);
            } else {
                console.log('Backpack Full');
            }
        }
    }
}
