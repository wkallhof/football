import * as Phaser from "phaser-ce";

export class CameraUtil {

    private game: Phaser.Game;
    private yOffset: number = -150;
    private target: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    public zoom(zoomLevel: number) {
        //console.log(this.game.world.scale);
        //this.game.world.scale.set(zoomLevel);
        this.game.add.tween(this.game.camera.scale).to( { x: zoomLevel, y:zoomLevel }, 2000, "Linear", true);
    }

    public follow(sprite: Phaser.Sprite) {
        //this.target = sprite;
        //this.game.camera.target = sprite;
        this.game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    }

    public update() {
        //console.log(`${this.target.world.x}, ${this.target.world.y}`);
        //this.game.camera.focusOnXY(this.target.position.x, this.target.position.y + this.yOffset);
    }
}