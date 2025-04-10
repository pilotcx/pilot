import {dbService} from "@/lib/db/service";
import {ApiError} from "@/lib/types/errors/api.error";
import {BorrowFineStatus} from "@/lib/types/models/fine";
import dayjs from "dayjs";

export class FineService {
  async createFine(user: any, ticket: any, amount: number, note: string, paidAmount?: number) {
    if (paidAmount) {
      return await dbService.borrowFine.create({
        user: user,
        ticket: ticket,
        status: BorrowFineStatus.PAID,
        amount,
        note,
        paidAmount,
      })
    }

    return await dbService.borrowFine.create({
      user: user,
      ticket: ticket,
      status: BorrowFineStatus.UNPAID,
      amount,
      note,
    })
  }

  calculateFineAmount(overdueDays: number): number {
    if (overdueDays <= 15) {
      return overdueDays * 1000
    } else if (overdueDays > 15 && overdueDays <= 50) {
      return 15000
    } else if (overdueDays > 50 && overdueDays <= 100) {
      return 20000
    } else if (overdueDays > 100) {
      return 25000
    }
    return 0
  }

  async getBorrowTicket(ticketId: string) {
    const borrowTicket = await dbService.borrowTicket.findById(ticketId).populate('user')
    if (!borrowTicket) throw new ApiError(404, 'Không tìm thấy vé mượn')
    if (!borrowTicket.expectedReturnDate) {
      throw new ApiError(400, 'Ngày dự kiến trả lại là cần thiết để tính tiền phạt')
    }
    return borrowTicket
  }

  async processFine(user: string, ticket: string, note: string, customAmount?: number, paidAmount?: number) {
    const borrowTicket = await this.getBorrowTicket(ticket);

    const expectedReturnDate = dayjs(borrowTicket.expectedReturnDate)
    const now = dayjs()
    const overdueDays = now.diff(expectedReturnDate, 'day')

    const calculatedAmount = customAmount ?? this.calculateFineAmount(overdueDays)

    return this.createFine(user, ticket, calculatedAmount, note, paidAmount)
  }
}

export const fineService = new FineService()
