import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Request, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateExpenseDto } from './dto/create-expense';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('skip', ParseIntPipe) skip: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.userService.findAll(skip, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('debtor/:ssn')
  findDebtorBySSN(@Param('ssn') ssn: string) {
    return this.userService.findOneByCriteria({ ssn }, []);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    //TODO: implement email and phone verification after update
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    if (req.user.role == "admin") {
      return this.userService.remove(id);
    }
  }

  @Patch('ban/:id')
  ban(@Param('id') id: string, @Request() req: any) {
    if (req.user.role == "admin") {
      return this.userService.ban(id);
    }
  }

  @Patch('unban/:id')
  unban(@Param('id') id: string, @Request() req: any) {
    if (req.user.role == "admin") {
      return this.userService.unban(id);
    }
  }


  @Get('my')
  getMyUsers(@Request() req: any) {
    if (req.user.role == "debtor") {
      // return this.userService.getMyDebtors(req.user.sub);
      return this.userService.getMyCredtiors(req.user.sub);
    }
    if (req.user.role == "creditor") {
      return this.userService.getMyDebtors(req.user.sub);
    }
  }

  @Post('expense')
  createExpense(@Body() createExpenseDto: CreateExpenseDto, @Param('userID') userID: string, @Request() req: any) {
    console.log("got in here", req.user.role);
    if (req.user.role == "debtor" || req.user.role == "admin") {
      return this.userService.createExpense(createExpenseDto, req.user.sub);
    }
  }

  @Patch('expense/:id')
  updateExpense(@Param('id') id: string, @Body() updateExpenseDto: CreateExpenseDto, @Request() req: any) {
    if (req.user.role == "debtor" || req.user.role == "admin") {
      return this.userService.updateExpense(req.user.sub, id, updateExpenseDto);
    }
  }

  @Delete('expense/:id')
  removeExpense(@Param('id') id: string, @Request() req: any) {
    if (req.user.role == "debtor") {
      return this.userService.removeExpense(req.user.sub, id);
    }
  }
}
