import * as Assets from '../assets';

export default class Title extends Phaser.State {
    private backgroundTemplateSprite: Phaser.Sprite = null;

    public create(): void {
        this.backgroundTemplateSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Images.ImagesField.getName());
        this.backgroundTemplateSprite.anchor.setTo(0.5);

        this.game.camera.flash(0x000000, 1000);
    }
}
