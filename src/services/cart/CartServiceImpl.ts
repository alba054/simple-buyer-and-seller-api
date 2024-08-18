import { CartEntity } from "../../entity/cart/CartEntity";
import { BadRequestError } from "../../Exceptions/http/BadRequestError";
import { NotFoundError } from "../../Exceptions/http/NotFoundError";
import { ERRORCODE } from "../../utils";
import { IPostCartPayload } from "../../utils/interfaces/request/IPostCartPayload";
import { CartService } from "./CartService";

export class CartServiceImpl extends CartService {
  async getCartById(id: string, userId: string): Promise<CartEntity> {
    const cart = await this.cartRepository.getCartById(id);

    if (!cart) {
      throw new NotFoundError(ERRORCODE.COMMON_NOT_FOUND, "cart's not found");
    }

    if (cart.buyerId !== userId && cart.item?.author?.id !== userId) {
      throw new BadRequestError(
        ERRORCODE.BAD_REQUEST_ERROR,
        "you are not the buyer or the author of the item"
      );
    }

    return cart;
  }

  async deleteCartById(id: string, userId: string): Promise<void> {
    const cart = await this.cartRepository.getCartById(id);

    if (!cart) {
      throw new NotFoundError(ERRORCODE.COMMON_NOT_FOUND, "cart's not found");
    }

    if (cart.buyerId !== userId) {
      throw new BadRequestError(
        ERRORCODE.BAD_REQUEST_ERROR,
        "you are not the buyer"
      );
    }

    await this.cartRepository.deleteCartById(id);
  }

  async getCartsByItemAuthorId(userId: string): Promise<CartEntity[]> {
    return await this.cartRepository.getCartsByItemAuthorId(userId);
  }

  async updateCartOrderStatusById(
    id: string,
    isValid: boolean,
    userId: string
  ): Promise<void> {
    const cart = await this.cartRepository.getCartById(id);

    if (!cart) {
      throw new NotFoundError(ERRORCODE.COMMON_NOT_FOUND, "cart's not found");
    }

    // if (cart.item?.author?.id !== userId) {
    //   throw new BadRequestError(
    //     ERRORCODE.BAD_REQUEST_ERROR,
    //     "you are not the author of the item"
    //   );
    // }

    await this.cartItemStockUpdateRepository.updateCartOrderStatusAndItemStock(
      cart,
      isValid
    );
  }

  async getCartsByUserId(userId: string): Promise<CartEntity[]> {
    return await this.cartRepository.getCartsByUserId(userId);
  }

  async addCart(payload: IPostCartPayload, userId: string): Promise<void> {
    const item = await this.itemRepository.getItemById(payload.itemId);

    if (!item) {
      throw new NotFoundError(ERRORCODE.COMMON_NOT_FOUND, "item's not found");
    }

    if (item.stock! < payload.quantity) {
      throw new BadRequestError(
        ERRORCODE.BAD_REQUEST_ERROR,
        "item's stock is not enough"
      );
    }

    const cart = new CartEntity({
      buyerId: userId,
      quantity: payload.quantity,
      itemId: payload.itemId,
    });

    await this.cartItemStockUpdateRepository.addCartAndUpdateItemStock(cart);
  }
}
