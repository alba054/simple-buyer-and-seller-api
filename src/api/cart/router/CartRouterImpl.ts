import { Router } from "express";
import { BaseRouter } from "../../base/Router";
import { AuthorizationBearer } from "../../../middleware/auth/AuthorizationBearer";
import { ROLE } from "@prisma/client";
import { CartHandler } from "../handler/CartHandler";

export class CartRouterImpl extends BaseRouter {
  private handler: CartHandler;
  private authorizationMiddleware: AuthorizationBearer;

  constructor(
    handler: CartHandler,
    authorizationMiddleware: AuthorizationBearer
  ) {
    super("/carts");
    this.handler = handler;
    this.authorizationMiddleware = authorizationMiddleware;
  }

  register(): Router {
    // * add cart
    this.router
      .route(this.path)
      .post(
        this.authorizationMiddleware.authorize([ROLE.BUYER]),
        this.handler.postCart
      );

    this.router
      .route(this.path + "/:id")
      .put(
        this.authorizationMiddleware.authorize([ROLE.SELLER, ROLE.BUYER]),
        this.handler.putCartOrderStatus // ! unused
      )
      .delete(
        this.authorizationMiddleware.authorize([ROLE.BUYER]),
        this.handler.deleteCart
      )
      .get(
        this.authorizationMiddleware.authorize([ROLE.BUYER, ROLE.SELLER]),
        this.handler.getCart
      );

    return this.router;
  }
}
