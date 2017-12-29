import Team from "./team";
import Field from "./field";
import { Play } from "./play";

export default class MatchState{
    public defenseTeam: Team;
    public offenseTeam: Team;
    public field: Field;
    public currentDown: number;
    public quarter: number;
    public quarterTime: number;
    public fieldPosition: number;
    public homeTeamScore: number;
    public awayTeamScore: number;
    public defensePlay: Play;
    public offensePlay: Play;

    public turnover() {
        
    }
}