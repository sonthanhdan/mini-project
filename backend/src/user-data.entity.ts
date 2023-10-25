import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
}
