import { Controller, Get, Post, Body, Patch, Param, Request, ParseIntPipe, Query, Req, Delete, UploadedFile } from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { DisputeDebtDto } from './dto/dispute-debt.dto';
import { CalculateDebtDto } from './dto/calculate-debt.dto';
import { Debt } from './entities/debt.entity';
import { add, isWithinInterval } from 'date-fns';

@ApiTags('Debts')
@Controller('debts')
export class DebtController {
  constructor(
    private readonly debtService: DebtService,
  ) { }

  @Post()
  create(@Body() createDebtDto: CreateDebtDto, @Req() req) {
    createDebtDto.creditor = req.user.sub;

    if (req.user.role == "creditor" || req.user.role == "admin") {
      return this.debtService.create(createDebtDto);
    }
  }

  @Get()
  findAll(
    @Query('skip', ParseIntPipe) skip: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Req() req
  ) {
    if (req.user.role == "admin") {
      return this.debtService.findAll(skip, limit);
    }
  }

  @Post("/xlsx")
  async createViaXLSX(
    @Req() req,
    @UploadedFile() file
  ) {
    const data = await req.file();

    if (req.user.role == "creditor" || req.user.role == "admin") {
      return this.debtService.createViaXLSX(data, req.user.sub);
    }
  }

  @Post('calculate')
  calculate(@Body() calculateDebtDto: CalculateDebtDto) {
    return this.debtService.calculate(calculateDebtDto);
  }

  @Get('/my')
  findMyDebts(
    @Query('skip', ParseIntPipe) skip: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('userRole') userRole: string,
    @Query('userId') userId: string,
    @Req() req: any
  ) {
    const { sub, role } = req.user;

    if (role == "admin") {
      return this.debtService.findMyDebts(skip, limit, userId, userRole);
    }

    return this.debtService.findMyDebts(skip, limit, sub, role);
  }

  @Get("/stats")
  async stats(
    @Query('skip', ParseIntPipe) skip: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Req() req: any
  ) {
    let q1 = 0, q2 = 0, q3 = 0, q4 = 0, total = 0
    const { sub, role } = req.user;

    // console.log(sub);

    const debts: Debt[] = await this.debtService.findMyDebts(skip, limit, sub, role);

    // console.log(debts);

    const currentYearStart = new Date(`${new Date().getUTCFullYear()}-01-01T00:00:00.000Z`)

    console.log("first interval", currentYearStart, add(currentYearStart, { months: 2 }));
    console.log("second interval", add(currentYearStart, { months: 2 }), add(currentYearStart, { months: 5 }));
    console.log("third interval", add(currentYearStart, { months: 5 }), add(currentYearStart, { months: 8 }));
    console.log("fo interval", add(currentYearStart, { months: 9 }), add(currentYearStart, { months: 12 }));

    debts.forEach(debt => {
      debt.payments.forEach(payment => {
        if ((payment as any).status == "paid") total += (payment as any).amount
        if ((payment as any).status == "paid" && isWithinInterval(new Date((payment as any).date), { start: currentYearStart, end: add(currentYearStart, { months: 2 }) })) q1 += (payment as any).amount
        else if ((payment as any).status == "paid" && isWithinInterval(new Date((payment as any).date), { start: add(currentYearStart, { months: 2 }), end: add(currentYearStart, { months: 5 }) })) q2 += (payment as any).amount
        else if ((payment as any).status == "paid" && isWithinInterval(new Date((payment as any).date), { start: add(currentYearStart, { months: 5 }), end: add(currentYearStart, { months: 8 }) })) q3 += (payment as any).amount
        else if ((payment as any).status == "paid" && isWithinInterval(new Date((payment as any).date), { start: add(currentYearStart, { months: 8 }), end: add(currentYearStart, { months: 12 }) })) q4 += (payment as any).amount
      });
    });

    console.log("q1", q1, "q2", q2, "q3", q3, "q4", q4);

    // q1 = debts.reduce((prev, curr) => {
    //   // console.log("prev", curr)
    //   return prev + curr.payments.reduce((p, c) => {
    //     if ((c as any).status == "paid") {
    //       return p + (c as any).amount
    //     }
    //     return p + 0
    //   }, 0)


    // }, 0)

    return {
      funds: {
        q1: parseFloat(q1.toFixed(2)),
        q2: parseFloat(q2.toFixed(2)),
        q3: parseFloat(q3.toFixed(2)),
        q4: parseFloat(q4.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      }
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtDto: UpdateDebtDto, @Req() req: any) {
    if (req.user.role == "debtor") {
      return this.debtService.update(id, updateDebtDto, req.user.sub);
    }
  }

  @Post('dispute/:id')
  dispute(
    @Body() disputeDebtDto: DisputeDebtDto,
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.debtService.dispute(id, disputeDebtDto, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    //req.user.role == "creditor"
    if (req.user.role == "admin") {
      return this.debtService.remove(id);
    }
  }
}
