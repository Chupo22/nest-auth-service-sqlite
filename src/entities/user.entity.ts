import { Entity, Column } from 'typeorm';

@Entity()
export class User {
  @Column({
    type: 'uuid',
    generated: 'uuid',
    primary: true,
  })
  id!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  firstName!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  lastName!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  patronymic!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  password!: string;
}
