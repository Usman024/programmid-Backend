import { BadRequestException, ConflictException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format, differenceInYears, parseISO, compareAsc, compareDesc } from 'date-fns';
import { Model } from 'mongoose';
import { Role } from 'src/auth/role.enum';
import { UserService } from 'src/user/user.service';
import { CalculateDebtDto } from './dto/calculate-debt.dto';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DisputeDebtDto } from './dto/dispute-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { Debt, DebtDocument } from './entities/debt.entity';
import { Repayment } from './repayment.enum';
import { Worker } from "node:worker_threads"
import * as path from 'node:path';

@Injectable()
export class DebtService {

  constructor(
    @InjectModel(Debt.name) private readonly model: Model<DebtDocument>,
    private readonly userService: UserService
  ) { }

  create(createDebtDto: CreateDebtDto) {

    //TODO: REMOVE THE DEPENDENCY ON THE SECOND ID CAUSE FRONT END WILL FUCK UP

    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const today = new Date();
    // balance is total initial amount

    let optionsAvailable = [];

    const yearsPassed = differenceInYears(today, parseISO(createDebtDto.dateOfChargedOff as unknown as string));

    // Generating Payment Options based on how many years have passed since the account was originally created

    switch (yearsPassed) {
      case 0:
        optionsAvailable = [100]; break;
      case 1:
        optionsAvailable = [100, 75]; break;
      case 2:
        optionsAvailable = [100, 75, 50]; break;
      default:
        optionsAvailable = [100, 75, 50, 25];
    }

    return this.model.create({ ...createDebtDto, balance: createDebtDto.balance, optionsAvailable });
  }

  async createViaXLSX(
    data: any,
    userID: string
  ) {
    const buffer: Buffer = await data.toBuffer();

    const worker = new Worker(path.join(__dirname, "..", "utils", "bulkDebtConvertor.js"),
      {
        workerData: {
          buffer,
          userID
        }
      });

    worker.on("message", async (debts) => {
      try {
        await this.model.insertMany(debts);
      } catch (error) {
        console.log(error);

      }
    });

    return "Accounts added successfully";
  }

  calculate(calculateDebtDto: CalculateDebtDto) {

    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const today = new Date();
    // balance is total initial amount
    let payments: any[] = [];

    const remainingBalance: number = calculateDebtDto.balance * calculateDebtDto.repaymentOption / 100;

    let dueAmount: number = remainingBalance;

    const discountedAmount: number = calculateDebtDto.balance - remainingBalance;

    for (let index = 0; index < 11; index++) {

      if (calculateDebtDto.repaymentOption === Repayment.TWENTY_FIVE_PERCENT) {
        let firstPayment = dueAmount;
        payments.push({
          amount: parseFloat(firstPayment.toFixed(2)),
          date: add(today, {
            days: 5
          }).toISOString()
        });
        break;
      }

      if (index === 0) {
        let firstPayment = dueAmount * 25 / 100;
        payments.push({
          amount: firstPayment,
          date: today
        });

        dueAmount = remainingBalance - (remainingBalance * 25 / 100);
      }

      let temp = dueAmount / 11;
      payments.push({
        amount: parseFloat(temp.toFixed(2)),
        date: add(today, {
          months: index + 1
        }).toISOString()
      });
    }

    dueAmount = remainingBalance;

    let optionsAvailable = [];

    const yearsPassed = differenceInYears(today, parseISO(calculateDebtDto.dateOfChargedOff as unknown as string));

    // Generating Payment Options based on how many years have passed since the account was originally created

    switch (yearsPassed) {
      case 0:
        optionsAvailable = [100]; break;
      case 1:
        optionsAvailable = [100, 75]; break;
      case 2:
        optionsAvailable = [100, 75, 50]; break;
      default:
        optionsAvailable = [100, 75, 50, 25];
    }

    return {
      balance: calculateDebtDto.balance,
      repaymentOption: calculateDebtDto.repaymentOption,
      remainingBalance,
      discountedAmount,
      dueAmount,
      payments,
      optionsAvailable,
    };
  }

  findAll(skip: number, limit: number) {
    return this.model.find().skip(skip).limit(limit).select('creditor ssn name phone issuer dispute').populate('creditor');
  }

  findByCriteria(criteria: any) {
    return this.model.findOne(criteria).populate('creditor');
  }

  async findOne(id: string) {
    let isDelayed = false;
    let delayedIndex;
    let remainingPayments = 0;
    const debt: any = await this.model.findById(id).populate('creditor');

    // return debt;

    //TODO: UNCOMMENT THIS FOR OVERDUE
    /*
      checking if the debt went through updating period or not
      in other words, checking if the debt was updated or not for
      the dates/payments to be existing in it 
      or we return if the debt is already overdued
    */
    //@ts-ignore
    if (!debt.payments || !debt.payments.length > 0 || debt.status == "overdue") {
      return debt;
    }

    /*
      now checking if any of the debt had been delayed or not
      in case they were we store 
      1. the index on which it was delayed on
      2. if it was delayed or not
      3. the number of remaining payments that were delayed (including the delayed payment)
    */

    for (let i = 0; i < debt.payments.length; i++) {
      if ((compareAsc(new Date(), add(new Date(debt.payments[i].date), { days: 5 })) == 1
        &&
        debt.payments[i].status == "pending")
        &&
        !isDelayed
      ) {
        debt.payments[i].status = "overdue"
        delayedIndex = i;
        isDelayed = true;
      }

      // if ((compareAsc(new Date(), add(new Date(debt.payments[i].date), { days: 5 })) == 1
      //   &&
      //   debt.payments[i].status != "paid")
      // ) {
      //   debt.payments[i].status = "overdue"
      // }

      if (isDelayed) {
        remainingPayments++;
      }
    }

    /*
      now if the payment was delayed we will do the rest of the calculations
  
      1. we take the discounted amount and divide it by the number of remaining 
      payments after the delay (this includes the payment that was delayed as 
      well) so we have the division on which to distrube the discounted amount
      with the rest of the payments
  
      2. then we add the divisoned amount into the remaining payments
  
      3. we set the debt status as overdue, add the discounted amount into due amount
      and set the discounted amount as zero since there is no longer a discounts
    */

    if (isDelayed) {
      const discountedAmount = debt.discountedAmount
      for (let index = delayedIndex; index < debt.payments.length; index++) {
        let temp = discountedAmount / remainingPayments;
        debt.payments[index].amount += temp
      }

      debt.status = "overdue";
      debt.dueAmount = debt.dueAmount + debt.discountedAmount;
      debt.discountedAmount = 0;

      return debt.save();
    }

    return debt;
  }

  async findMyDebts(skip: number = 0, limit: number = 10, userid: string, role: string) {

    if (role === Role.DEBTOR) {
      const user = await this.userService.findOneByCriteria({ _id: userid }, ['+ssn']);

      const debts = await this.model.find({ ssn: user.ssn }).populate('creditor')

      // return debts;
      const newDebts = Promise.all(debts.map((debt: any) => {
        let isDelayed = false;
        let delayedIndex;
        let remainingPayments = 0;

        //@ts-ignore
        if (!debt.payments || !debt.payments.length > 0 || debt.status == "overdue") {
          return debt;
        }
        for (let i = 0; i < debt.payments.length; i++) {
          if ((compareAsc(new Date(), add(new Date(debt.payments[i].date), { days: 5 })) == 1
            &&
            debt.payments[i].status == "pending")
            &&
            !isDelayed
          ) {
            debt.payments[i].status = "overdue"
            delayedIndex = i;
            isDelayed = true;
          }

          // if ((compareAsc(new Date(), add(new Date(debt.payments[i].date), { days: 5 })) == 1
          //   &&
          //   debt.payments[i].status != "paid")
          // ) {
          //   debt.payments[i].status = "overdue"
          // }

          if (isDelayed) {
            remainingPayments++;
          }
        }

        if (isDelayed) {
          const discountedAmount = debt.discountedAmount
          for (let index = delayedIndex; index < debt.payments.length; index++) {
            let temp = discountedAmount / remainingPayments;
            debt.payments[index].amount += temp
          }

          debt.status = "overdue";
          debt.dueAmount = debt.dueAmount + debt.discountedAmount;
          debt.discountedAmount = 0;

          return debt.save();
        }

        return debt;
      }))

      return newDebts
    }

    const debts = await this.model.find({ creditor: userid }).populate('creditor')

    // return debts

    const newDebts = Promise.all(debts.map((debt: any) => {
      let isDelayed = false;
      let delayedIndex;
      let remainingPayments = 0;

      //@ts-ignore
      if (!debt.payments || !debt.payments.length > 0 || debt.status == "overdue") {
        return debt;
      }

      for (let i = 0; i < debt.payments.length; i++) {
        if ((compareAsc(new Date(), add(new Date(debt.payments[i].date), { days: 5 })) == 1
          &&
          debt.payments[i].status == "pending")
          &&
          !isDelayed
        ) {
          debt.payments[i].status = "overdue"
          delayedIndex = i;
          isDelayed = true;
        }

        // if ((compareAsc(new Date(), add(new Date(debt.payments[i].date), { days: 5 })) == 1
        //   &&
        //   debt.payments[i].status != "paid")
        // ) {
        //   debt.payments[i].status = "overdue"
        // }

        if (isDelayed) {
          remainingPayments++;
        }
      }

      if (isDelayed) {
        const discountedAmount = debt.discountedAmount
        for (let index = delayedIndex; index < debt.payments.length; index++) {
          let temp = discountedAmount / remainingPayments;
          debt.payments[index].amount += temp
        }

        debt.status = "overdue";
        debt.dueAmount = debt.dueAmount + debt.discountedAmount;
        debt.discountedAmount = 0;

        return debt.save();
      }

      return debt;
    }))

    return newDebts
  }

  async update(id: string, updateDebtDto: UpdateDebtDto, userID: string) {
    const debt = await this.model.findById(id);

    if (!debt.isEditable) { throw new ConflictException("Debt has already been edited before.") }

    if (!debt.optionsAvailable.includes(updateDebtDto.repaymentOption)) { throw new ConflictException("This payment option is invalid."); }

    if (updateDebtDto.paymentDates.length !== 12 && updateDebtDto.repaymentOption != Repayment.TWENTY_FIVE_PERCENT) { throw new BadRequestException("There must be 12 Payment dates") }

    if (debt.dispute) { throw new ForbiddenException("Disputed accounts cannot be updated") }

    const { balance, dateOfChargedOff } = debt;

    const calcs = this.calculate({ balance, dateOfChargedOff, repaymentOption: updateDebtDto.repaymentOption });

    calcs.payments.forEach((payment, index) => payment.date = updateDebtDto.paymentDates[index])

    const remainingBalance = parseFloat((balance * updateDebtDto.repaymentOption / 100).toFixed(2));

    let dueAmount = remainingBalance;

    const discountedAmount = balance - remainingBalance;

    return this.model.findByIdAndUpdate(id, {
      payments: calcs.payments,
      repaymentOption: calcs.repaymentOption,
      dueAmount,
      discountedAmount,
      remainingBalance,
      isEditable: false

    }, { new: true }).populate('creditor');
  }

  remove(id: string) {
    return this.model.findOneAndRemove({
      _id: id
    });
  }

  dispute(id: string, disputeDebtDto: DisputeDebtDto, role: string) {
    if (role == Role.DEBTOR && !disputeDebtDto.dispute) {
      throw new ForbiddenException("Debtor cannot undispute an account")
    }

    if (role === Role.CREDITOR && disputeDebtDto.dispute) {
      throw new ForbiddenException("Creditor cannot dispute an account")
    }

    return this.model.findByIdAndUpdate(id, disputeDebtDto, { new: true });
  }
}
