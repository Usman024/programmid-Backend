import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from 'src/chat/entities/chat.entity';
import { Debt, DebtDocument } from 'src/debt/entities/debt.entity';
import { Message, MessageDocument } from 'src/message/entities/message.entity';
import { CreateExpenseDto } from './dto/create-expense';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
    @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
  ) { }

  create(createUserDto: CreateUserDto) {
    return this.model.create(createUserDto);
  }

  findAll(skip: number, limit: number) {
    return this.model.find().skip(skip).limit(limit);
  }

  findOne(id: string) {
    return this.model.findById(id).select('+expenses');
  }

  findOneByCriteria(criteria: any, select: string[]) {
    return this.model.findOne(criteria).select(select);
  }

  update(id: string, updateUserDto: any) {
    return this.model.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  ban(id: string) {
    return this.model.findByIdAndUpdate(id, {
      banned: true
    }, { new: true });
  }

  unban(id: string) {
    return this.model.findByIdAndUpdate(id, {
      banned: false
    }, { new: true });
  }

  async findOneAndUpdateByCriteria(criteria: any, update: any) {
    try {
      const user = await this.model.findOneAndUpdate(criteria, update, { new: true });
      return [user, null]
    } catch (error) {
      return [null, error]
    }
  }

  async remove(id: string) {
    const deletedUser = await this.model.findOneAndDelete({
      _id: id,
      role: "creditor"
    });

    if (deletedUser) {
      await this.debtModel.deleteMany({
        creditor: id
      })

      await this.chatModel.deleteMany({
        participants: {
          $in: [id],
        }
      })

      await this.messageModel.deleteMany({
        $or: [
          { to: id },
          { from: id }
        ]
      })

      return deletedUser

    } else {
      throw new ForbiddenException("Cannot delete this account")
    }
  }

  createExpense(createExpenseDto: CreateExpenseDto, userID: string) {
    return this.model.findByIdAndUpdate(userID, { $push: { expenses: createExpenseDto } }, { new: true }).select("expenses");
  }

  getExpense(userID: string) {
    return this.model.findById(userID).select("expenses");
  }

  updateExpense(userID: string, expenseID: string, updateExpenseDto: CreateExpenseDto) {
    return this.model.findByIdAndUpdate(userID, {
      $set: {
        'expenses.$[elem].title': updateExpenseDto.title,
        'expenses.$[elem].monthly': updateExpenseDto.monthly,
        'expenses.$[elem].yearly': updateExpenseDto.yearly,
      },
    }, {
      arrayFilters: [{ 'elem._id': expenseID }],
      new: true,
    }).select("expenses");
  }

  removeExpense(userID: string, expenseID: string) {
    return this.model.findByIdAndUpdate(userID, {
      $pull: {
        'expenses': { _id: expenseID },
      },
    }, {
      new: true,
    }).select("expenses");
  }

  getMyDebtors(userID: string) {
    return this.model.find({
      role: 'debtor',
      creditors: {
        $in: [userID],
      }
    });
  }

  getMyCredtiors(userID: string) {
    return this.model.find({
      role: 'creditor',
      debtors: {
        $in: [userID],
      }
    });
  }
}
