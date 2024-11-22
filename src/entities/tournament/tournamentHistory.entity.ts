import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Tournament } from "./tournament.entity";
import { User } from "../user/user.entity";

@Entity("tournamentHistory")
export class TournamentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.history, { nullable: true })
  tournament?: Tournament;

  @ManyToOne(() => User, (user) => user.tournamentHistory, { nullable: true })
  user?: User;
}
