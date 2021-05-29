import { Entity, Column } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity()
export class User extends CoreEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}

type UserRole = 'CLIENT' | 'OWNER' | 'DELIVERY';
