import { Entity, PrimaryGeneratedColumn,Column,ManyToOne } from "typeorm";
import {User} from '../user/user.entity';
import {Games} from '../game/game.entity';

@Entity('inGameId')
export class inGameId{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:false})
    playerId:string;

    @ManyToOne(() => User, (user) => user.inGameIds)
    user: User;
  
    @ManyToOne(() => Games, (game) => game.inGameIds)
    game: Games;
}