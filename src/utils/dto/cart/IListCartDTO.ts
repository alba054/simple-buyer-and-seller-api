import { Category, PAYMENT_STATUS } from "@prisma/client";
import { CartEntity } from "../../../entity/cart/CartEntity";

interface IListCartDTO {
  cartId: string;
  quantity: number;
  authorName: string;
  authorPhoneNumber: string;
  item: {
    name: string;
    id: string;
    price: number;
    thumbnail: string;
    category: Category;
  };
}

export const ListCartDTO = (cart: CartEntity) => {
  return {
    authorName: cart.item?.author?.name,
    cartId: cart.id,
    authorPhoneNumber: cart.item?.author?.phoneNumber,
    item: {
      category: cart.item?.category,
      id: cart.itemId,
      name: cart.item?.name,
      price: cart.item?.price,
      thumbnail: cart.item?.thumbnail,
    },
    status: cart.status,
    quantity: cart.quantity,
  } as IListCartDTO;
};
