import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { TeamPlayers } from '../team/teamPlayers.entity';

@Entity('teams')
export class Teams {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  teamName: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ nullable: false })
  maxPlayers: number;

  @Column({ type: 'text', nullable: true })
  slug: string;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  tournamentsPlayed: number;

  @ManyToOne(() => User, (user) => user.teams)
  user: User;

  @OneToMany(() => TeamPlayers, (teamPlayer) => teamPlayer.team)
  teamPlayers: TeamPlayers[];
    registrations: any;
}
