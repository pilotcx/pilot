import {BorrowBookSchema} from '@/lib/validations/borrow';
import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {inventoryService} from '@/lib/services/inventory';
import {
  BorrowTicket,
  BorrowTicketRecordStatus,
  BorrowTicketStatus,
  BorrowType,
  PaymentStatus,
} from '@/lib/types/models/borrow';
import {User} from '@/lib/types/models/user';
import dayjs from 'dayjs';
import {Book} from '@/lib/types/models/book';
import {Library} from '@/lib/types/models/library';
import {PaginateOptions} from 'mongoose';

class BorrowService {
  getUserTickets(userId: string, pagination: PaginateOptions) {
    return dbService.borrowTicket.paginate({user: userId}, pagination);
  }

  getTicket(ticketId: string) {
    return dbService.borrowTicket.findById(ticketId);
  }

  getTicketRecords(ticketId: string) {
    return dbService.borrowTicketRecord.find({ticket: ticketId}).populate([{
      path: 'book',
      populate: {
        path: 'authors'
      },
    }, {
      path: 'library'
    }]);
  }

  async createBorrowTicket(userId: string, request: BorrowBookSchema) {
    const books = await dbService.book.find({
      _id: {$in: request.books.map((book) => book.bookId)},
    });
    if (books.length !== request.books.length)
      throw new ApiError(404, "Yêu cầu có sách không hợp lệ");

    // Prepare and validate stock changes in memory
    const stockUpdates: Array<{
      stockId: string;
      newQuantity: number;
    }> = [];
    const borrowRecords: Array<{
      book: Book;
      library: Library;
      quantity: number;
      ticket: BorrowTicket;
      status: BorrowTicketRecordStatus;
    }> = [];
    for (const book of books) {
      const requestedInfo = request.books.find((b) => b.bookId === book._id.toString());
      if (!requestedInfo) {
        throw new ApiError(400, `Không tìm thấy thông tin sách ${book.name} trong yêu cầu`);
      }
      // Check stock
      const stock = await inventoryService.getBookStock(book._id);
      const totalStock = stock.reduce((acc, cur) => acc + cur.quantity, 0);
      if (totalStock < requestedInfo.quantity) {
        throw new ApiError(400, `Sách ${book.name} không đủ số lượng trong kho`);
      }

      const sortedStock = stock.sort((a, b) => b.quantity - a.quantity);

      let wished = requestedInfo.quantity;
      for (const stockItem of sortedStock) {
        const usedQuantity = Math.min(stockItem.quantity, wished);
        stockUpdates.push({
          stockId: stockItem._id,
          newQuantity: stockItem.quantity - usedQuantity,
        });
        borrowRecords.push({
          book: stockItem.book as any,
          library: stockItem.library as any,
          quantity: usedQuantity,
          ticket: null, // Placeholder for the ticket ID, will be set later
          status: BorrowTicketRecordStatus.BORROWED,
        });
        wished -= usedQuantity;

        if (wished === 0) break;
      }
    }

    // Create the ticket
    const newTicket = await dbService.borrowTicket.create({
      status: BorrowTicketStatus.PENDING,
      user: userId as unknown as User,
      borrowDate: request.borrowDate
        ? new Date(request.borrowDate)
        : new Date(),
      expectedReturnDate: request.expectedReturnDate
        ? new Date(request.expectedReturnDate)
        : dayjs().add(35, "days").toDate(),
      borrowType: request.borrowType,
      deliveryMethod: request.deliveryMethod,
      paymentStatus:
        request.borrowType === BorrowType.OFFLINE
          ? PaymentStatus.PAID
          : PaymentStatus.UNPAID,
      note: request.note,
      recipientAddress: request.recipientAddress,
    });

    // Assign ticket ID to borrowRecords
    borrowRecords.forEach((record) => {
      record.ticket = newTicket._id;
    });

    // Save all borrow records
    await dbService.borrowTicketRecord.insertMany(borrowRecords);

    // Update stock in database
    for (const {stockId, newQuantity} of stockUpdates) {
      await dbService.inventory.update({_id: stockId}, {quantity: newQuantity});
    }
    return newTicket;
  }
}

export const borrowService = new BorrowService();
