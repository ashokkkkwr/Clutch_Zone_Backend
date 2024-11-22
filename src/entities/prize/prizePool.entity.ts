import { Entity,PrimaryGeneratedColumn,Column,ManyToOne } from "typeorm";
import {Tournament} from '../tournament/tournament.entity'
@Entity('prizePool')
export class PrizePool{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({nullable:false})
    prize:number

    @Column({nullable:false})
    placements:number;

    @ManyToOne(() => Tournament, (tournament) => tournament.prizePools)
  tournament: Tournament;

}