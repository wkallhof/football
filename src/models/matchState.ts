import Team from "./team";
import Field from "./field";
import { Play } from "./play";

export default class MatchState{
    public homeTeam: Team;
    public awayTeam: Team;
    public field: Field;
    public currentDown: number;
    public quarter: number;
    public quarterTime: number;
    public homeTeamBall: boolean;
    public fieldPosition: number;
    public homeTeamScore: number;
    public awayTeamScore: number;
    public homePlay: Play;
    public awayPlay: Play;
}