import * as Assets from '../assets';

export default class Preloader extends Phaser.State {
    private preloadBarSprite: Phaser.Sprite = null;
    private preloadFrameSprite: Phaser.Sprite = null;

    public preload(): void {
        // display loading bar or text
        Assets.Loader.loadAllAssets(this.game);
        this.startGame();
    }

    private startGame(): void {
        this.game.camera.onFadeComplete.addOnce(this.loadGame, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadGame(): void {
        this.game.state.start('game');
    }
}
