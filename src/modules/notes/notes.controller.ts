import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthUserId } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import ParseBookPipe from 'src/pipes/ParseBookPipe';
import ParseUserPipe from 'src/pipes/ParseUserPipe';
import { Book } from '../books/book.entity';
import { User } from '../users/user.entity';
import SaveNoteDto from './dtos/SaveNoteDto';
import { NotesService } from './notes.service';

@Controller('users/:userId/books/:bookId/notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  /*
    TODO: getNotes with limit and pages range
  */

  @Get(':page')
  async getNote(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
    @Param('page', ParseIntPipe) page: number,
  ) {
    if (authUserId != user.id) throw new UnauthorizedException();
    if (book.ownerId != user.id)
      throw new UnauthorizedException(
        "bookId don't belong to authenticated user",
      );
    const note = await (await book.notes).find((note) => note.page === page);
    return note;
  }

  @Get()
  async getNotes(
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
  ) {
    if (authUserId != user.id) throw new UnauthorizedException();
    if (book.ownerId != user.id)
      throw new UnauthorizedException(
        "bookId don't belong to authenticated user",
      );
    const notes = await book.notes;
    return notes;
  }

  /*
    TODO: getNote by id and get Note by page number
    TODO: getNotesRange
  */

  @Post(':page')
  @UseGuards(AuthGuard)
  async updateNotes(
    @Body() note: SaveNoteDto,
    @AuthUserId() authUserId: string,
    @Param('userId', ParseUserPipe) user: User,
    @Param('bookId', ParseBookPipe) book: Book,
    @Param('page', ParseIntPipe) page: number,
  ) {
    if (authUserId !== user.id) throw new UnauthorizedException();
    if (authUserId != book.ownerId)
      throw new UnauthorizedException(
        "bookId don't belong to authenticated user",
      );
    return this.notesService.saveNote(note.content, page, book);
  }
}
