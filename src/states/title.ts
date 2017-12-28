import * as Phaser from 'phaser-ce';

export default class Title extends Phaser.State {

    private cursors: Phaser.CursorKeys;
    private menuItemYTitleOffest = 100;
    private menuItemYOffset = 30;
    private stateMenu = [
        {
            display: "Play",
            state: "game"
        },
        {
            display: "Settings",
            state: "settings"
        }
    ];

    private currentMenuIndex: number = 0;
    private lastMenuIndex: number = 0;

    public create(): void {
        // display title text
        this.setupAndStartTitle();
        this.cursors = this.game.input.keyboard.createCursorKeys();
    }

    public update(): void{
        this.managePlayerInput();
        this.renderMenu();
    }

    private renderMenu() {
        for (let i = 0; i < this.stateMenu.length; i++){
            let menuItem = this.stateMenu[i];
            let y = this.game.world.centerY + this.menuItemYTitleOffest + (i * this.menuItemYOffset);
            this.createMenuItem(this.game.world.centerX, y, menuItem.display, this.currentMenuIndex == i);
        }
    }

    private setupAndStartTitle() {
        var style = { font: "60px Arial", fill: "#ffffff", align: "center" };
        var text = this.game.add.text(this.game.width, this.game.world.centerY-100, "Football", style);
        text.anchor.set(0.5);
        this.game.add.tween(text).to({ x: this.game.world.centerX }, 2000, Phaser.Easing.Cubic.Out, true);
    }
    
    private loadGame(): void {
        this.game.state.start('game');
    }

    private buttonClick(): void{
        console.log("click");
    }

    private createMenuItem(x: number, y: number, text: string, selected: boolean) {
        let fill = selected ? "#ffffff" : "#555555";
        var style = { font: "30px Arial", fill: fill, align: "center" };
        var menuItem = this.game.add.text(x, y, text, style);
        menuItem.anchor.set(0.5);
    }

    managePlayerInput() {

        const enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        if (enterKey.justDown) {
            let menuItem = this.stateMenu[this.currentMenuIndex];
            this.game.state.start(menuItem.state);
        }

        if (this.cursors.up.justDown)
        {
            this.currentMenuIndex--;
            if (this.currentMenuIndex < 0) {
                this.currentMenuIndex = this.stateMenu.length - 1;
            }
        }

        else if (this.cursors.down.justDown)
        {
            this.currentMenuIndex++;
            if (this.currentMenuIndex == this.stateMenu.length) {
                this.currentMenuIndex = 0;
            }
        }
    }
}
