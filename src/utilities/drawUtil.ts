import * as Phaser from "phaser-ce";

export class DrawUtil {

    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    startNewBitmap(width: number, height: number, key: string) {
       return new BitDrawing(this.game.add.bitmapData(width, height, "field", true));
    }
}

export class BitDrawing{
    data: Phaser.BitmapData;
    ctx: CanvasRenderingContext2D;

    constructor(data: Phaser.BitmapData) {
        this.data = data;
        this.ctx = data.ctx;
    }

    public drawPointLine(start: Phaser.Point, end: Phaser.Point, style : DrawStyle): void{
        if (!style) throw ("Style required");
        
        if (style.hasLine()) {
            this.ctx.strokeStyle = style.lineColor;
            this.ctx.lineWidth = style.lineWidth;
        }
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
    }

    public drawLine(startX: number, startY: number, endX: number, endY: number, style: DrawStyle): void{
        return this.drawPointLine(new Phaser.Point(startX, startY), new Phaser.Point(endX, endY), style);
    }

    public drawRect(rect: Phaser.Rectangle, style: DrawStyle): void {
        if (!style) throw ("Style required");

        if (style.hasFill()) {
            this.ctx.fillStyle = style.fillColor;
            this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            this.ctx.fill();
        }

        if (style.hasLine()) {
            this.ctx.strokeStyle = style.lineColor;
            this.ctx.lineWidth = style.lineWidth;
            this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            this.ctx.stroke();
        }
    }

    public drawText(x: number, y: number, text: string, style : DrawStyle, rotationDegrees : number = 0): void{
        if (!style) throw ("Style required");

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotationDegrees * Math.PI / 180 );
        this.ctx.textAlign = "center";
        this.ctx.font = style.fontStyle;
        
        if (style.hasFill()) {
            this.ctx.fillStyle = style.fillColor;
            this.ctx.fillText(text, 0,0);
            this.ctx.fill();
        }

        if (style.hasLine()) {
            this.ctx.strokeStyle = style.lineColor;
            this.ctx.lineWidth = style.lineWidth;
            this.ctx.strokeText(text, 0,0);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    public drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, style: DrawStyle) {
        if (!style) throw ("Style required");
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);

        if (style.hasFill()) {
            this.ctx.fillStyle = style.fillColor;
            this.ctx.fill();
        }

        if (style.hasLine()) {
            this.ctx.strokeStyle = style.lineColor;
            this.ctx.lineWidth = style.lineWidth;
            this.ctx.closePath();
            this.ctx.stroke;
        }
    }

    public setPixelAlpha(x: number, y: number, alpha: number) {
        let rgba = this.data.getPixel(x, y);
        if (!rgba) return;
        rgba.a = alpha;
        this.data.setPixel32(x, y, rgba.r, rgba.g, rgba.b, rgba.a);
    }
}

export class DrawStyle {

    constructor(public fillColor?: string, public lineColor?: string, public lineWidth?: number, public fontStyle?: string) { }

    public hasFill(): boolean { return this.fillColor != null; }
    public hasLine(): boolean { return this.lineColor != null; }
}