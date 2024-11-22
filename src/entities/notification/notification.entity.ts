import { Entity,PrimaryGeneratedColumn,Column,ManyToOne } from "typeorm";
import {User } from '../user/user.entity';
@Entity('notification')
export class Notification{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:false})
    message:string;

    @Column({nullable:true})
    users:string;

    @Column({type:'text',nullable:true})
    links:string;
    @Column({default:false})
    isRead:boolean;

    @ManyToOne(() => User, (user) => user.sentNotifications)
    sender: User;
  
    @ManyToOne(() => User, (user) => user.receivedNotifications)
    receiver: User;

}