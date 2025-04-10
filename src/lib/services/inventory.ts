import {HydratedDocument} from 'mongoose';
import {BookInventory} from '@/lib/types/models/inventory';
import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';

class InventoryService {
  async getInventory(libraryId: string, bookId: string, idBook?: string): Promise<HydratedDocument<BookInventory>> {
    let inventory = await dbService.inventory.findOne({
      library: libraryId,
      idBook: idBook,
      book: bookId,
    });
    if (!inventory) {
      const book = await dbService.book.findOne({_id: bookId});
      if (!book) throw new ApiError(404, 'Sách không tồn tại');
      const library = await dbService.library.findOne({_id: libraryId});
      if (!library) throw new ApiError(404, 'Thư viện không tồn tại');
      inventory = await dbService.inventory.create({
        library: libraryId as any,
        idBook: idBook as any,
        book: bookId as any,
        quantity: 0,
      });
    }
    return inventory;
  }

  async getBookAvailability(bookId: string, quantity: number = 1) {
    const inventory = await dbService.inventory.find({
      book: bookId,
      quantity: {$gt: 0},
    });
    let stock = 0;
    for await (let i of inventory) {
      stock += i.quantity;
    }
    return stock >= quantity;
  }

  getBookStock(bookId: string) {
    return dbService.inventory.find({
      book: bookId,
      quantity: {$gt: 0},
    });
  }
}

export const inventoryService = new InventoryService();
