import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils";

// get request: accept request with request: customerId, shop, productId.
// read database and return wishlist items for that customer.
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

  // If customerId, shop, productId is provided, return wishlist items for that customer.
  const wishlist = await db.ProductBid.findMany({
    where: {
      customerId: customerId,
      shop: shop,
      productId: productId,
    },
  });


  const response = json({
    ok: true,
    message: "Success",
    data: wishlist,
  });

  return cors(request, response);

}


// Expexted data comes from post request. If
// customerID, productID, shop
export async function action({ request }) {
  console.log(request.body);
  let data = await request.formData();
  data = Object.fromEntries(data);

  console.log(data);
  const customerId = data.customerId;
  const customerName = data.customerName;
  const productId = data.productId;
  const productTitle = data.productTitle;
  const productPrice = Number(data.productPrice);
  const shop = data.shop;
  const _action = data._action;

  if(!customerId || !productId || !shop || !_action || !productPrice) {
    return json({
      message: "Missing data. Required data: customerId, productId, shop, _action, productPrice",
      method: _action
    });
  }

  let response;

  switch (_action) {
    case "CREATE":
      // Handle POST request logic here
      // For example, adding a new item to the wishlist
      await db.ProductBid.create({
        data: {
          customerId,
          customerName,
          productId,
          productTitle,
          productPrice,
          shop,
        },
      });

      response = json({ message: "Product added to biding list", method: _action});
      return cors(request, response);

    case "PATCH":
      // Handle PATCH request logic here
      // For example, updating an existing item in the wishlist
      return json({ message: "Success", method: "Patch" });

    case "DELETE":
      // Handle DELETE request logic here (Not tested)
      // For example, removing an item from the wishlist
      await db.ProductBid.deleteMany({
        where: {
          customerId: customerId,
          shop: shop,
          productId: productId,
        },
      });

      response = json({ message: "Product removed from bid list", method: _action});
      return cors(request, response);

    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }

}