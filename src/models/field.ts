import * as Phaser from "phaser-ce";

export default class Field{

    private fullWidth: number = 1260;
    private fullHeight: number = 2500;
    private endzoneDepth: number = 197;
    private fieldTopLeft: Phaser.Point = new Phaser.Point(95, 95);
    private fieldBottomRight: Phaser.Point = new Phaser.Point(1163, 2403);

    private fieldRect: Phaser.Rectangle;
    private targetEndzone: Phaser.Rectangle;
    private ownEndzone: Phaser.Rectangle;
    private team1Sideline: Phaser.Rectangle;
    private team2Sideline: Phaser.Rectangle;
    private fieldOfPlay: Phaser.Rectangle;
        
    public init() {

        const width = this.fieldBottomRight.x - this.fieldTopLeft.x;
        const height = this.fieldBottomRight.y - this.fieldTopLeft.y;

        this.fieldRect = new Phaser.Rectangle(this.fieldTopLeft.x, this.fieldTopLeft.y, width, height);
        this.targetEndzone = new Phaser.Rectangle(this.fieldTopLeft.x, this.fieldTopLeft.y, width, this.endzoneDepth);
        this.ownEndzone = new Phaser.Rectangle(this.fieldTopLeft.x, this.fieldBottomRight.y - this.endzoneDepth, width, this.endzoneDepth);
        
        this.fieldOfPlay = new Phaser.Rectangle(this.targetEndzone.bottomLeft.x, this.targetEndzone.bottomLeft.y, width, this.ownEndzone.topLeft.y - this.targetEndzone.bottomLeft.y);
    }

    public isOutOfBounds(point : Phaser.Point) {
        return !this.fieldRect.contains(point.x, point.y);
    }

    public inTargetEndzone(point: Phaser.Point) {
        return this.targetEndzone.contains(point.x, point.y);
    }

    public inOwnEndzone(point: Phaser.Point) {
        return this.ownEndzone.contains(point.x, point.y);
    }

    public translateToYards(y: number) {
        const currentY = (y - this.fieldOfPlay.y);

        return (currentY * 100) / this.fieldOfPlay.height;
    }

    public getDebugInfo(point: Phaser.Point) {
        return {
            inTargetEndzone: this.inTargetEndzone(point),
            isOutOfBounds: this.isOutOfBounds(point),
            inOwnEndzone: this.inOwnEndzone(point),
            yardline: Math.round(this.translateToYards(point.y)),
            point: `${point.x},${point.y}`
        };
    }

    public translateYardsToCoords(yards: number): Phaser.Point {
        let y = ((this.fieldOfPlay.height * yards) / 100) + this.fieldOfPlay.y;
        return new Phaser.Point(this.fieldOfPlay.centerX, y);
    }

    public getFieldTexture(game: Phaser.Game): Phaser.BitmapData {
        const data = game.add.bitmapData(this.fullWidth, this.fullHeight, "field", true);
        const ctx = data.ctx; // adds to the world stage
        // set fill to green
        ctx.fillStyle = "#69982F";
        
        // draw full field
        ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);

        // set lines
        ctx.font = '48px serif';
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#FFFFFF";

        // draw field
        this.drawRectFromRect(ctx, this.fieldRect);

        //draw line every yard
        for (let i = 0; i < 100; i++){
            let point = this.translateYardsToCoords(i);
            ctx.moveTo(this.fieldOfPlay.x, point.y);
            ctx.lineTo(this.fieldOfPlay.x + 60, point.y);
            ctx.moveTo(this.fieldOfPlay.right, point.y);
            ctx.lineTo(this.fieldOfPlay.right - 60, point.y);
        }

        // draw center hash marks
        for (let i = 0; i < 100; i++){
            let point = this.translateYardsToCoords(i);
            ctx.moveTo(this.fieldOfPlay.centerX - 120, point.y);
            ctx.lineTo(this.fieldOfPlay.centerX - 80, point.y);
            ctx.moveTo(this.fieldOfPlay.centerX + 120, point.y);
            ctx.lineTo(this.fieldOfPlay.centerX + 80, point.y);
        }

        //draw full yard line every 5
        for (let i = 0; i < 100; i += 5){
            let point = this.translateYardsToCoords(i);
            ctx.moveTo(this.fieldOfPlay.x, point.y);
            ctx.lineTo(this.fieldOfPlay.topRight.x, point.y);
        }

        //draw yard line text
        for (let i = 10; i < 100; i += 10){
            let point = this.translateYardsToCoords(i);
            this.drawYardNumbers(ctx, this.fieldOfPlay.left + 90, point.y, i, 90);
            this.drawYardNumbers(ctx, this.fieldOfPlay.right - 90, point.y, i, 270);
        }

        ctx.fill();

        ctx.fillStyle = "#4b6d22";
        //drawEndzones
        this.fillRectFromRect(ctx, this.targetEndzone);
        this.fillRectFromRect(ctx, this.ownEndzone);
        
        ctx.fill();
        ctx.stroke();
        return data;
    }

    private drawRectFromRect(ctx: CanvasRenderingContext2D, rect: Phaser.Rectangle) {
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    private fillRectFromRect(ctx: CanvasRenderingContext2D, rect: Phaser.Rectangle) {
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    private drawYardNumbers(ctx: CanvasRenderingContext2D, x: number, y: number, yard: number, degrees: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate( degrees * Math.PI / 180 );
        ctx.textAlign = "center";
        ctx.strokeText(yard.toString().split("").join(" "), 0,0);
        ctx.restore();
    }
}