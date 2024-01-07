import * as XLSX from "xlsx"
import { workerData, parentPort } from "node:worker_threads";
import { differenceInYears, parseISO } from "date-fns";

function renameKey(obj, oldKey, newKey) {
  obj[newKey] = obj[oldKey];
  delete obj[oldKey];
}

try {
  const workbook = XLSX.read(workerData.buffer);

  let worksheets: any = {};
  for (const sheetName of workbook.SheetNames) {
    worksheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }

  let debts = worksheets.Sheet1;

  debts.forEach((obj) => {
    obj["creditor"] = workerData.userID;
    obj["dateOfLastPayment"] = obj['CHARGEOFF DATE'];
    obj["originalInterestRate"] = obj['CHARGEOFF BALANCE'];
    obj["name"] = obj['FIRST NAME'] + " " + obj["LAST NAME"];

    renameKey(obj, "LENDER", "issuer");
    renameKey(obj, "LENDER ACCOUNT NUMBER", "issuerAccountID");
    renameKey(obj, "OPEN DATE", "dateOfOrigination");
    renameKey(obj, "CHARGEOFF DATE", "dateOfChargedOff");
    renameKey(obj, "CASH LOAN AMOUNT", "principal");
    renameKey(obj, "CHARGEOFF BALANCE", "currentInterestDue");
    renameKey(obj, "CURRENT BALANCE", "balance");
    renameKey(obj, "SSN", "ssn");
    renameKey(obj, "EMAIL", "email");
    renameKey(obj, "CELL PHONE", "phone");

    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const today = new Date();
    // balance is total initial amount

    let optionsAvailable = [];

    const yearsPassed = differenceInYears(today, parseISO(obj.dateOfChargedOff as unknown as string));

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

    obj["optionsAvailable"] = optionsAvailable

  });

  parentPort.postMessage(debts)

} catch (error) {
  console.log(error);
}
