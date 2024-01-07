import { Agenda } from "agenda";
import { workerData, parentPort } from "node:worker_threads";
import mongoose, { mongo } from "mongoose";
import { User, UserSchema } from "src/user/entities/user.entity";
import { Twilio } from "twilio";

function chunkArray(array, chunkSize) {
  return Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)
  );
}

async function sendEmailToUsers() {
  try {
    const mongoURI = process.env.MONGO_URI
    let filteredDebts: String[] = [];

    const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, {
      autoRetry: true,
      maxRetries: 3
    });

    mongoose.connect(mongoURI)

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "Mongo connection error in worker for Daily SMS Scheduler: "));
    db.once("open", function () {
      console.log("Mongo connected successfuly in worker for Daily SMS Scheduler");
    });

    const debtModel = mongoose.model("Debt", UserSchema, "Debts")

    let debts = await debtModel.find({
      $or: [
        { status: "active" },
        { status: "overdue" }
      ]
    }).select("ssn")

    debts.forEach(debt => {
      if (filteredDebts.indexOf(debt.ssn) === -1) { filteredDebts.push(debt.ssn) }
    })

    const userModel = mongoose.model("User", UserSchema, "Users")


    let users = await userModel.find({
      ssn: filteredDebts
    })

    const chunks = chunkArray(users, 5);
    for (const chunk of chunks) {

      let promises = [];

      for (const atom of chunk) {
        promises.push(
          client.messages.create({
            body: "ATTENTION URGENT MESSAGE FROM G.O.D.\nTHERE IS A MATTER THAT REQUIRES YOUR IMMEDIATE ACTION.\nVISIT WWW.JESUS-TODAY.COM TO ADDRESS THIS MATTER.\nG.O.D THANKS YOU FOR YOUR PROMPT ACTION.",
            to: atom.phone,  // Text this number
            from: process.env.TWILIO_NUMBER // From a valid Twilio number
          })
        )
      }

      await Promise.all(promises)

      console.log("GOT RUN")

    }
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  try {
    const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

    agenda.define("send email to users daily", async (job) => {
      await sendEmailToUsers()
    });

    await agenda.start();

    await agenda.every("24 hours", "send email to users daily");

  } catch (error) {
    console.log(error);
  }
}

main()