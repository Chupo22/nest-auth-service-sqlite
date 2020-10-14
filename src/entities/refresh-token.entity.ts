import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  @Column('uuid', {
    primary: true,
    generated: 'uuid',
  })
  id!: string;

  @Column('uuid', {
    nullable: false,
  })
  userId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column('uuid', {
    nullable: false,
    unique: true,
  })
  refreshToken!: string;
}
