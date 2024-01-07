import { getQuarter } from "date-fns";

export default function generateStats(debts: any) {
  return (debts as Array<any>).reduce(function(accumulator, currentObject: any) {
    if(!(currentObject.dueAmount == undefined)) {
      accumulator.totalPaid = accumulator.totalPaid + (currentObject.balance - currentObject.dueAmount)
      accumulator.totalDue = accumulator.totalDue + currentObject.dueAmount
    }

    if(Array.isArray(currentObject.payments) && currentObject.payments.length) {
      currentObject.payments.forEach(function(currentValue, index, arr) {
        if(getQuarter(new Date(currentValue.date)) == 1) {
          if(currentValue.status == "paid") accumulator.firstQuarter.paid = accumulator.firstQuarter.paid + currentValue.amount
          if(currentValue.status == "pending" || currentValue.status == "overdue") accumulator.firstQuarter.due = accumulator.firstQuarter.due + currentValue.amount
        } else if(getQuarter(new Date(currentValue.date)) == 2) {
          if(currentValue.status == "paid") accumulator.secondQuarter.paid = accumulator.secondQuarter.paid + currentValue.amount
          if(currentValue.status == "pending" || currentValue.status == "overdue") accumulator.secondQuarter.due = accumulator.secondQuarter.due + currentValue.amount
        } else if(getQuarter(new Date(currentValue.date)) == 3) {
          if(currentValue.status == "paid") accumulator.thirdQuarter.paid = accumulator.thirdQuarter.paid + currentValue.amount
          if(currentValue.status == "pending" || currentValue.status == "overdue") accumulator.thirdQuarter.due = accumulator.thirdQuarter.due + currentValue.amount
        } else if(getQuarter(new Date(currentValue.date)) == 4) {
          if(currentValue.status == "paid") accumulator.fourthQuarter.paid = accumulator.fourthQuarter.paid + currentValue.amount
          if(currentValue.status == "pending" || currentValue.status == "overdue") accumulator.fourthQuarter.due = accumulator.fourthQuarter.due + currentValue.amount
        }
      })
    }

    return accumulator
  }, {
    totalPaid: 0,
    totalDue: 0,
    firstQuarter: { paid: 0, due: 0 },
    secondQuarter: { paid: 0, due: 0 },
    thirdQuarter: { paid: 0, due: 0 },
    fourthQuarter: { paid: 0, due: 0 }
  })
}