import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Debt, DebtDocument } from 'src/debt/entities/debt.entity';
import { Model } from "mongoose";
import { getQuarter } from 'date-fns'
import { User, UserDocument } from "../user/entities/user.entity";
import generateStats from "../utils/generate-stats";

@Injectable()
export class StatsService {

  constructor(
    @InjectModel(Debt.name) private readonly debtModel: Model<DebtDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async findOne(id: string, role: string) {
    let debts: any;
    if (role == "creditor") {
      debts = await this.debtModel.find({
        creditor: id
      })

      return  generateStats(debts)
    } else {
      const { ssn } = await this.userModel.findById(id).select("ssn")

      debts = await this.debtModel.find({
        ssn: ssn
      })

      return generateStats(debts)
    }

  }
}
