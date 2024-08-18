import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prismaDb } from "../../../config/database/PrismaORMDBConfig";
import { CartEntity } from "../../../entity/cart/CartEntity";
import { CartItemStockUpdate } from "./CartItemStockUpdate";
import { BadRequestError } from "../../../Exceptions/http/BadRequestError";
import { InternalServerError } from "../../../Exceptions/http/InternalServerError";
import { ERRORCODE } from "../../../utils";
import { PAYMENT_STATUS } from "@prisma/client";

export class CartItemStockUpdatePrismaImpl extends CartItemStockUpdate {
  async updateCartOrderStatusAndItemStock(
    cart: CartEntity,
    isValid: boolean
  ): Promise<void> {
    try {
      await prismaDb.db?.$transaction([
        prismaDb.db.cart.update({
          where: { id: cart.id },
          data: {
            status: isValid ? PAYMENT_STATUS.UNPAID : PAYMENT_STATUS.INPROCESS,
            orderStatusUpdated: Math.floor(new Date().getTime() / 1000),
          },
        }),
        prismaDb.db.item.update({
          where: { id: cart.itemId },
          data: {
            stock: {
              increment: isValid ? -1 * cart.quantity! : cart.quantity,
            },
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestError(ERRORCODE.BAD_REQUEST_ERROR, error.message);
      } else if (error instanceof Error) {
        throw new InternalServerError(error.message);
      }
    }
  }

  async addCartAndUpdateItemStock(cart: CartEntity): Promise<void> {
    try {
      await prismaDb.db?.$transaction([
        prismaDb.db?.cart.create({
          data: {
            quantity: cart.quantity!,
            buyerId: cart.buyerId!,
            itemId: cart.itemId!,
            orderStatusUpdated: Math.floor(new Date().getTime() / 1000),
          },
        }),
        prismaDb.db.item.update({
          where: { id: cart.itemId },
          data: {
            stock: {
              decrement: cart.quantity,
            },
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestError(ERRORCODE.BAD_REQUEST_ERROR, error.message);
      } else if (error instanceof Error) {
        throw new InternalServerError(error.message);
      }
    }
  }
}
