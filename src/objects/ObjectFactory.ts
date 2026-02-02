import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';
import { Building } from './Building';
import { Car } from './Car';
import { TrashCan } from './TrashCan';
import { Toilet } from './Toilet';

export class ObjectFactory {
    private scene: MainScene;
    private buildings: Phaser.Physics.Arcade.StaticGroup;
    private cars: Phaser.Physics.Arcade.Group;
    private trashCans: Phaser.Physics.Arcade.Group;
    private toilets: Phaser.Physics.Arcade.Group;

    constructor(scene: MainScene) {
        this.scene = scene;

        // Initialize Groups
        this.buildings = this.scene.physics.add.staticGroup();
        this.cars = this.scene.physics.add.group({ immovable: true });
        this.trashCans = this.scene.physics.add.group({ immovable: true });
        this.toilets = this.scene.physics.add.group({ immovable: true });
    }

    createBuilding(x: number, y: number, width: number, height: number) {
        return new Building(this.scene, x, y, width, height, this.buildings);
    }

    createCar(x: number, y: number) {
        const car = new Car(this.scene, x, y);
        this.cars.add(car);
        car.setDepth(y);
        return car;
    }

    createTrashCan(x: number, y: number) {
        const trash = new TrashCan(this.scene, x, y);
        this.trashCans.add(trash);
        trash.setDepth(y);
        return trash;
    }

    createToilet(x: number, y: number) {
        const toilet = new Toilet(this.scene, x, y);
        this.toilets.add(toilet);
        toilet.setDepth(y);
        return toilet;
    }

    // Getters for groups (for collisions in Scene)
    getBuildingsGroup() { return this.buildings; }
    getCarsGroup() { return this.cars; }
    getTrashCansGroup() { return this.trashCans; }
    getToiletsGroup() { return this.toilets; }
}
