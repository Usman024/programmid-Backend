import { forwardRef, Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DebtSchema } from './entities/debt.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [DebtController],
  providers: [DebtService],
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: 'Debt', schema: DebtSchema, collection: 'Debts' },
    ]),
  ],
  exports: [DebtService]
})
export class DebtModule { }
