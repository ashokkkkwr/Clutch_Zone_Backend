import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tournament } from '../tournament/tournament.entity';

@Entity('timeSlots')
export class TimeSlots {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  startTime: string;

  @Column({ nullable: false })
  endTime: string;

  @Column({ nullable: false })
  maxNoOfParticipants: number;

  @Column({ nullable: true })
  startTimeNumber: string;

  @Column({ nullable: true })
  endTimeNumber: string;

  @ManyToOne(() => Tournament, (tournament) => tournament.timeSlots)
  tournament: Tournament;
    registrations: any;
}
