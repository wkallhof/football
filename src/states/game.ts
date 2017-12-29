import * as Assets from '../assets';
import { CameraUtil } from "../utilities/CameraUtil";
import Team from "../models/Team";
import {Player} from "../models/player";
import { PlayerPosition } from "../models/PlayerPosition";
import Field from "../models/field";
import MatchState from "../models/matchState";
import { createDecipher } from 'crypto';
import { States, StateManager } from "../utilities/stateManager";
import { Play, PlayRoute } from '../models/play';
import DumbMind from "../ai/dumbMind";
import WrMind from "../ai/wrMind";

/*
* Creates a Demo down for development
*/
export default class Game extends Phaser.State {

    create(): void {
        let demoTeam1 = this.createDemoTeam("Team 1", 0x0066ff);
        let demoTeam2 = this.createDemoTeam("Team 2", 0x999966);
        let demoField = new Field();

        let matchState = new MatchState();
        matchState.offenseTeam = demoTeam1;
        matchState.defenseTeam = demoTeam2;
        matchState.currentDown = 1;
        matchState.field = demoField;
        matchState.fieldPosition = 20;
        matchState.quarter = 1;
        matchState.quarterTime = 60;
        matchState.offensePlay = this.createDemoOffensePlay();
        matchState.defensePlay = this.createDemoDefensePlay();

        StateManager.start(States.DOWN, this.game, matchState);
    }

    createDemoOffensePlay() {
        let play = new Play();

        //center
        play.addPlayRoute(new PlayRoute(PlayerPosition.OL, [new Phaser.Point(0, 30)]));

        //left OL
        play.addPlayRoute(new PlayRoute(PlayerPosition.OL, [new Phaser.Point(-30, 30), new Phaser.Point(-30, 40)]));
        play.addPlayRoute(new PlayRoute(PlayerPosition.OL, [new Phaser.Point(-60, 30), new Phaser.Point(-60, 60)]));

        //right OL
        play.addPlayRoute(new PlayRoute(PlayerPosition.OL, [new Phaser.Point( 30, 30), new Phaser.Point(30, 40)]));
        play.addPlayRoute(new PlayRoute(PlayerPosition.OL, [new Phaser.Point(60, 30), new Phaser.Point(60, 60)]));
        
        //TE
        play.addPlayRoute(new PlayRoute(PlayerPosition.TE, [new Phaser.Point(100, 30), new Phaser.Point(100, -100)]))

        //QB
        play.addPlayRoute(new PlayRoute(PlayerPosition.QB,
            [new Phaser.Point(0, 60),
            new Phaser.Point(0,120)]
        ));

        //RB ->
        play.addPlayRoute(new PlayRoute(PlayerPosition.RB, [
            new Phaser.Point(20, 100),
            new Phaser.Point(130, 100),
            new Phaser.Point(150, -220)
        ]));

        //<-
        play.addPlayRoute(new PlayRoute(PlayerPosition.RB, [
            new Phaser.Point(0, 130),
            new Phaser.Point(-100, 90),
            new Phaser.Point(-100, -100)
        ]));

        //WR - L
        play.addPlayRoute(new PlayRoute(PlayerPosition.WR, [
            new Phaser.Point(-250, 30),
            new Phaser.Point(-250, -100),
            new Phaser.Point(400, -200)
        ]));

        //WR - R
        play.addPlayRoute(new PlayRoute(PlayerPosition.WR, [
            new Phaser.Point(250, 30),
            new Phaser.Point(250, -70),
            new Phaser.Point(-400, -200)
        ]));

        return play;
    }

    createDemoDefensePlay() {
        let play = new Play();
        play.addPlayRoute(new PlayRoute(PlayerPosition.DL, [new Phaser.Point(-30, -30), new Phaser.Point(0, 120)]));
        play.addPlayRoute(new PlayRoute(PlayerPosition.OL, [new Phaser.Point(-60, -30), new Phaser.Point(0, 120)]));
        play.addPlayRoute(new PlayRoute(PlayerPosition.DL, [new Phaser.Point(30, -30), new Phaser.Point(0, 120)]));
        play.addPlayRoute(new PlayRoute(PlayerPosition.OL, [new Phaser.Point(60, -30), new Phaser.Point(0, 120)]));
        return play;
    }

    /*
    * Creates a Demo team for development
    */
    createDemoTeam(name: string, color: number): Team {
        let team = new Team(name, color);

        this.createDemoPlayers(2, 4, "QB", PlayerPosition.QB, team);
        this.createDemoPlayers(4, 20, "RB", PlayerPosition.RB, team);
        this.createDemoPlayers(6, 30, "WR", PlayerPosition.WR, team);
        this.createDemoPlayers(3, 40, "TE", PlayerPosition.TE, team);
        this.createDemoPlayers(9, 10, "OL", PlayerPosition.OL, team);
        this.createDemoPlayers(9, 20, "DL", PlayerPosition.DL, team);
        this.createDemoPlayers(7, 30, "LB", PlayerPosition.LB, team);
        this.createDemoPlayers(10, 40, "DB", PlayerPosition.DB, team);

        return team;
    }

    /*
    * Creates a Demo player for development
    */
    createDemoPlayers(players: number, jerseyStart: number, nameStart: string, position: PlayerPosition, team: Team) {
        for (let i = 0; i < players; i++){
            let mind = position == PlayerPosition.WR ? new WrMind() : new DumbMind();
            let player = new Player(`${nameStart} ${i+1}`, i + jerseyStart, position, mind);
            team.addPlayer(player);
        }
    }
}
