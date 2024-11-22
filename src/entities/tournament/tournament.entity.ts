import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PrizePool } from "../prize/prizePool.entity";
import { TimeSlots } from "../timeSlot/timeSlot.entity";
import { TournamentHistory } from "../tournament/tournamentHistory.entity";
import { TournamentRegistration } from "../tournament/tournamentRegistration.entity";

@Entity("tournament")
export class Tournament {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @OneToMany(() => PrizePool, (prizePool) => prizePool.tournament)
  prizePools: PrizePool[];

  @OneToMany(() => TimeSlots, (timeSlot) => timeSlot.tournament)
  timeSlots: TimeSlots[];

  @OneToMany(() => TournamentHistory, (history) => history.tournament)
  history: TournamentHistory[];

  @OneToMany(() => TournamentRegistration, (registration) => registration.tournament)
  registrations: TournamentRegistration[];
}
