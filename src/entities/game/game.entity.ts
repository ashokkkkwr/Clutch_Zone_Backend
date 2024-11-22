import { Entity,PrimaryGeneratedColumn,Column,OneToMany } from "typeorm";
import {Tournament} from '../tournament/tournament.entity';
@Entity('games')
export class Games{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:false})
    gameName:string;
    @Column({type:'text',nullable:true})
    gameCoverImage:string;

    @Column({type:'text',nullable:true})
    gameIcon:string

    @OneToMany(() => Tournament, (tournament) => tournament.games)
    tournaments: Tournament[];
    inGameIds: any;
}