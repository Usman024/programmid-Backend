import { Processor, Define, Every, Schedule } from "@agent-ly/nestjs-agenda";
import { Job } from "agenda";
import { EmailService } from "src/email/email.service";

interface IReminder {
  email: string;
  date: string;
}

@Processor()
export class PaymentProcessor {
  constructor(
    private readonly emailService: EmailService,
  ) { }

  @Define('sendReminderEmail')
  sendReminderEmail(job: Job<IReminder>) {
    const { email, date } = job.attrs.data;
    console.log("email is sending to:", email, "date:", date);
    this.emailService.sendReminderEmail(email, date)
  }
}