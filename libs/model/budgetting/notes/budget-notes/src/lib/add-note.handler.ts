import { FunctionHandler, getRepository } from '@iote/cqrs';
import { AddNoteToBudgetCommand } from './add-note.command';

export class AddNoteToBudgetHandler extends FunctionHandler<AddNoteToBudgetCommand, void> {
  public async execute(command: AddNoteToBudgetCommand) {
    if (!command.content?.trim()) {
      throw new Error('Note content cannot be empty');
    }

    const repo = getRepository<any>('budget-notes');
    await repo.create({
      budgetId: command.budgetId,
      content: command.content.trim(),
      authorId: command.authorId,
      createdOn: new Date()
    });
  }
}