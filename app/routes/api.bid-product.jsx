import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils";
import { authenticate } from "../shopify.server";

// get request: accept request with request: customerId, shop, productId.
// read database and return product biding items for that customer.
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");


  if(!customerId || !shop || !productId) {
    return json({
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET"
    });
  }

  // If customerId, shop, productId is provided, return product biding items for that customer.
  const productBiding = await db.productBid.findMany({
    where: {
      customerId: customerId,
      shop: shop,
      productId: productId,
    },
  });


  const response = json({
    ok: true,
    message: "Success",
    data: productBiding,
  });

  return cors(request, response);

}


// Expexted data comes from post request. If
// customerID, productID, shop
export async function action({ request }) {
  let data = await request.formData();
  data = Object.fromEntries(data);

  const Id = data.id;
  const customerId = data.customerId;
  const customerName = data.customerName;
  const productId = data.productId;
  const productTitle = data.productTitle;
  const productPrice = Number(data.productPrice);
  const isActive = data.isActive == "true" ? true : false;
  const shop = data.shop;
  const _action = data._action;

  let response;

  switch (_action) {
    case "CREATE":
      // Handle POST request logic here
      // For example, adding a new item to the product biding 
      
      if(!customerId || !productId || !shop || !_action || !productPrice) {
        return json({
          message: "Missing data. Required data: customerId, productId, shop, _action, productPrice",
          method: _action
        });
      }

      await db.productBid.create({
        data: {
          customerId,
          customerName,
          productId,
          productTitle,
          productPrice,
          isActive,
          shop,
        },
      });

      response = json({ message: "Product added to biding list", method: _action});
      return cors(request, response);

    case "PATCH":
      // Handle PATCH request logic here
      // For example, updating an existing item in the product biding
      if(!Id || !shop || !_action || !isActive) {
        return json({
          message: "Missing data. Required data: Id, shop, _action, isActive",
          method: _action
        });
      }

      await db.productBid.update({
        where: {
          id: Number(Id),
          shop: shop,
        },
        data: {
          isActive: isActive
        }
      })

      response = json({ message: "Product updated in bid list", method: _action});
      return cors(request, response);

    case "DELETE":
      // Handle DELETE request logic here (Not tested)
      // For example, removing an item from the product biding

      if(!Id || !shop || !_action) {
        return json({
          message: "Missing data. Required data: Id, shop, _action",
          method: _action
        });
      }

      await db.productBid.deleteMany({
        where: {
          id: Number(Id),
          shop: shop,
        },
      });

      response = json({ message: "Product removed from bid list", method: _action});
      return cors(request, response);

    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }

}