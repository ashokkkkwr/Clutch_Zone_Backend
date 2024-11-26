import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { TeamPlayers } from "../team/teamPlayers.entity";
import { TournamentHistory } from "../tournament/tournamentHistory.entity";
import { TournamentRegistration } from "../tournament/tournamentRegistration.entity";
import { Role } from '../../constant/enum';
@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  username: string;

  @Column({ type: "varchar", nullable: true })
  email?: string;
  @Column({ type: "varchar", nullable: true })
  password?: string;

  @OneToMany(() => TeamPlayers, (teamPlayer) => teamPlayer.user)
  teamPlayers: TeamPlayers[];

  @OneToMany(() => TournamentHistory, (history) => history.user)
  tournamentHistory: TournamentHistory[];

  @OneToMany(() => TournamentRegistration, (registration) => registration.user)
  registrations: TournamentRegistration[];
    inGameIds: any;
    sentNotifications: any;
    receivedNotifications: any;
    teams: any;

    @Column({default:0})
  tournmentPlayed:Number

  @Column({ nullable: true })
  token: string;


  @Column({ type: 'varchar', nullable: true })
  otp: string | null;
  

  @Column({
    type: 'enum',
    enum: Role,
    nullable: true,
  })
  role: Role;
  
  @Column({ name:'active_status', default:false})
  active_status:boolean
 
  @Column({ name: 'otp_expiration', type: 'timestamp', nullable: true })
  otpExpiration: Date |null;

  @Column({name:'isVerified',default:false})
  isVerified:boolean
}
