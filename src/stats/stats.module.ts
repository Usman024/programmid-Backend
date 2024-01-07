import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { DebtModule } from "../debt/debt.module";
import { MongooseModule } from "@nestjs/mongoose";
import { DebtSchema } from "../debt/entities/debt.entity";
import { UserSchema } from "../user/entities/user.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Debt', schema: DebtSchema, collection: 'Debts' },
      { name: 'User', schema: UserSchema, collection: 'Users' },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService]
})
export class StatsModule {}
