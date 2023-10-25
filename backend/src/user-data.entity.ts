import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index('user_index_UNIQUE', ['postId', 'email', 'name'], { unique: true })
export class UserData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  body: string;

  @CreateDateColumn({
    nullable: true,
  })
  public createdAt: Date;
}
