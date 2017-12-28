import * as Phaser from "phaser-ce";

export namespace Images {
    export class ImagesField {
        static getName(): string { return 'field'; }

        static getJPEG(): string { return require('assets/images/field.jpeg'); }
    }
}

export class Loader {
    
    static loadAllAssets(game: Phaser.Game) {
        this.loadImages(game);
    }

    static loadImages(game: Phaser.Game) {
        for (let image in Images) {
            if (!game.cache.checkImageKey(Images[image].getName())) {
                for (let option of Object.getOwnPropertyNames(Images[image])) {
                    if (option !== 'getName' && option.includes('get')) {
                        game.load.image(Images[image].getName(), Images[image][option]());
                    }
                }
            }
        }
    }
}