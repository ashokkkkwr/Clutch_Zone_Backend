import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("withdrawRequest")
export class WithdrawRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "double precision", nullable: false })
  withdrawAmount: number;

  @Column({ type: "varchar", nullable: true })
  paymentMethod?: string;

  @Column({ type: "text", nullable: true })
  walletNumber?: string;

  @Column({ type: "varchar", nullable: true })
  accountHolderName?: string;

  @Column({ type: "varchar", nullable: true })
  accountNumber?: string;

  @Column({ type: "varchar", nullable: true })
  bankName?: string;

  @Column({
    type: "enum",
    enum: ["pending", "rejected", "processing", "canceled", "failed", "transferred"],
    default: "pending",
  })
  status: string;
}
