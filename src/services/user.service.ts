import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities';
import * as bcrypt from 'bcrypt';

export class UserService {
  @InjectRepository(User)
  repo!: Repository<User>;

  async findById(id: string) {
    return this.repo.findOne({ id });
  }

  async findByLogin(login: string) {
    return this.repo.findOne({ email: login });
  }

  async create(user: Omit<User, 'id'>) {
    return this.repo.save(
      this.repo.create({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }),
      { reload: true },
    );
  }
}
