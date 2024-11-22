import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Tournament } from "../tournament/tournament.entity";
import { TimeSlots } from "../timeSlot/timeSlot.entity";
import { User } from "../user/user.entity";
import { Teams } from "../team/team.entity";

@Entity("tournamentRegistration")
export class TournamentRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.registrations, { onDelete: "CASCADE" })
  tournament: Tournament;

  @ManyToOne(() => TimeSlots, (timeSlot) => timeSlot.registrations, { onDelete: "CASCADE" })
  timeSlot: TimeSlots;

  @ManyToOne(() => User, (user) => user.registrations)
  user: User;

  @ManyToOne(() => Teams, (team) => team.registrations)
  team: Teams;
}
