import * as Phaser from "phaser-ce";

export namespace Images {
    export class ImagesField {
        static getName(): string { return 'field'; }

        static getJPEG(): string { return require('assets/images/field.jpeg'); }
    }
}

export namespace Data {
    export class Teams{
        static key: string = "teams";
        static getPath(): string { return require('assets/data/teams.json'); }
    }

    export class Fields{
        static key: string = "fields";
        static getPath(): string { return require('assets/data/fields.json'); }
    }
}

export class Loader {
    
    static loadAllAssets(game: Phaser.Game) {
        this.loadImages(game);
        this.loadData(game);
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

    static loadData(game: Phaser.Game) {
        game.load.json(Data.Fields.key, Data.Fields.getPath());
        game.load.json(Data.Teams.key, Data.Teams.getPath());
    }
}