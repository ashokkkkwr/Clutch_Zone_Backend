import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("topUp")
export class TopUp {
  @PrimaryColumn()
  id: string;

  @Column({ type: "double precision", nullable: false })
  balance: number;

  @Column({ type: "varchar", nullable: true })
  paymentMethod?: string;

  @Column({ type: "varchar", nullable: true })
  status?: string;

  @Column({ type: "varchar", nullable: true })
  transaction_id?: string;

  @Column({ type: "int", nullable: true })
  fee?: number;

  @Column({ type: "boolean", nullable: true })
  refunded?: boolean;
}
