import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { parseQuiz } from '../../models/quiz';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.quizzes.create(parseQuiz(body));
  }

  @Get()
  findAll() {
    return this.quizzes.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzes.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    this.quizzes.remove(id);
  }
}
