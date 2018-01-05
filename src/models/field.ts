import * as Phaser from "phaser-ce";
import { DrawUtil, DrawStyle } from "../utilities/drawUtil";
import Noise from "../utilities/noise";

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
        
        const drawUtil = new DrawUtil(game);
        const drawing = drawUtil.startNewBitmap(this.fullWidth, this.fullHeight, "field");

        const baseFieldStyle = new DrawStyle("#69982F");
        const lineStyle = new DrawStyle(null, "#FFFFFF", 4);
        const textStyle = new DrawStyle("#FFFFFF", null, null, "48px serif");
        const endZoneStyle = new DrawStyle("#4B6D22", "#FFFFFF", 4);
        const triangleStyle = new DrawStyle("#FFFFFF");
        
        // draw full field
        drawing.drawRect(new Phaser.Rectangle(0, 0, this.fullWidth, this.fullHeight), baseFieldStyle);

        // draw field
        drawing.drawRect(this.fieldRect, lineStyle);

        //draw line every yard
        for (let i = 0; i < 100; i++){
            let point = this.translateYardsToCoords(i);

            // left
            drawing.drawLine(this.fieldOfPlay.x, point.y, this.fieldOfPlay.x + 60, point.y, lineStyle);

            //right
            drawing.drawLine(this.fieldOfPlay.right, point.y, this.fieldOfPlay.right - 60, point.y, lineStyle);
        }

        // draw center hash marks
        for (let i = 0; i < 100; i++){
            let point = this.translateYardsToCoords(i);

            // left
            drawing.drawLine(this.fieldOfPlay.centerX - 120, point.y, this.fieldOfPlay.centerX - 80, point.y, lineStyle);

            //right
            drawing.drawLine(this.fieldOfPlay.centerX + 120, point.y, this.fieldOfPlay.centerX + 80, point.y, lineStyle);
        }

        //draw full yard line every 5
        for (let i = 0; i < 100; i += 5){
            let point = this.translateYardsToCoords(i);
            drawing.drawLine(this.fieldOfPlay.x, point.y, this.fieldOfPlay.topRight.x, point.y, lineStyle);
        }

        //draw yard line text and arrows
        for (let i = 10; i < 100; i += 10){
            let point = this.translateYardsToCoords(i);
            let displayNumber = i > 50 ? 100 - i : i;
            let yardText = displayNumber.toString().split("").join(" ");
            drawing.drawText(this.fieldOfPlay.left + 90, point.y, yardText, textStyle, 90);
            drawing.drawText(this.fieldOfPlay.right - 90, point.y, yardText, textStyle, 270);
            
            // draw direction arrows
            if (i < 50) {
                let leftStart = new Phaser.Point(this.fieldOfPlay.left + 100, point.y - 35);
                let rightStart = new Phaser.Point(this.fieldOfPlay.right - 100, point.y - 35);
                drawing.drawTriangle(leftStart.x, leftStart.y, leftStart.x + 10, leftStart.y, leftStart.x + 5, leftStart.y - 10, triangleStyle);
                drawing.drawTriangle(rightStart.x, rightStart.y, rightStart.x - 10, rightStart.y, rightStart.x - 5, rightStart.y - 10, triangleStyle);
            }
            else if (i > 50) {
                let leftStart = new Phaser.Point(this.fieldOfPlay.left + 100, point.y + 35);
                let rightStart = new Phaser.Point(this.fieldOfPlay.right - 100, point.y + 35);
                drawing.drawTriangle(leftStart.x, leftStart.y, leftStart.x + 10, leftStart.y, leftStart.x + 5, leftStart.y + 10, triangleStyle);
                drawing.drawTriangle(rightStart.x, rightStart.y, rightStart.x - 10, rightStart.y, rightStart.x - 5, rightStart.y + 10, triangleStyle);
            }
        }

        drawing.drawRect(this.targetEndzone, endZoneStyle);
        drawing.drawRect(this.ownEndzone, endZoneStyle);

        return drawing.data;
    }
}