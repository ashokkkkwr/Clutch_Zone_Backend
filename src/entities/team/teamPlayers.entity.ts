import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Teams } from '../team/team.entity';
import { User } from '../user/user.entity';

@Entity('teamPlayers')
export class TeamPlayers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['player', 'leader'], default: 'player' })
  role: string;

  @ManyToOne(() => Teams, (team) => team.teamPlayers)
  team: Teams;

  @ManyToOne(() => User, (user) => user.teamPlayers)
  user: User;
}
