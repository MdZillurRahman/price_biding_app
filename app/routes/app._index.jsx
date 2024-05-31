import { useEffect } from "react";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";


export const loader = async ({ request }) => {
  const auth = await authenticate.admin(request);
  const shop = auth.session.shop;
  
  // get data from database for that shop acending by id
  const bidingData = await db.productBid.findMany({
    where: {
      shop: shop,
    },
    orderBy: {
      id: "asc",
    },
  });

  return json(bidingData);
};

export const action = async ({ request }) => {
  const auth = await authenticate.admin(request);
  const { admin } = await authenticate.admin(request);
  const shop = auth.session.shop;
  let details = await request.formData();
  details = Object.fromEntries(details);

  var formdata = new FormData();
  const _action = details?._action;

  console.log(details);

  switch (_action) {
    case "DELETE":
      formdata.append("id", details?.productBidingId);
      formdata.append("shop", shop);
      formdata.append("_action", details?._action);
      
      break;
    case "PATCH":
      formdata.append("id", details?.productBidingId);
      formdata.append("shop", shop);
      formdata.append("isActive", details?.isActive);
      formdata.append("_action", details?._action);
      
      break;
    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }
  
  var requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  // You can use newUser to create a new user in your database
  fetch(process.env.APP_URL + "/api/bid-product", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(error => console.log('error', error));

  // Redirect to the user page
  return json(formdata);
};

export default function Index() {
  const bidingData = useLoaderData();

  console.log(bidingData);

  return (
    <Page title="Product Price Biding Overview">
      <ui-title-bar title="Overview">
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            {bidingData && bidingData.map((product, index) => (
              <Card roundedAbove="sm" key={index}>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingSm">
                    {product.productTitle}
                  </Text>
                  <Text as="h2" variant="headingSm">
                    {product.productPrice}
                  </Text>
                  <Text as="h2" variant="headingSm">
                    {product.customerName}
                  </Text>
                  <InlineStack align="end">
                    {product.isActive == false ?
                      (<ButtonGroup>
                        <Form method="POST">
                          <input type="text" name="_action" defaultValue="DELETE" hidden/>
                          <input type="text" name="productBidingId" defaultValue={product.id} hidden/>
                          <Button variant="secondary" tone="critical" submit={true} accessibilityLabel="Denied">Denied</Button>
                        </Form>
                        <Form method="POST">
                          <input type="text" name="_action" defaultValue="PATCH" hidden/>
                          <input type="text" name="productBidingId" defaultValue={product.id} hidden/>
                          <input type="text" name="isActive" defaultValue="true" hidden/>
                          <Button variant="primary" submit={true} accessibilityLabel="Accept Biding">Accept Biding</Button>
                        </Form>
                      </ButtonGroup>) :
                      (
                        <Text as="h3" variant="headingLg" tone="success">
                          Permitted to purchase
                        </Text>
                      )}
                  </InlineStack>
                </BlockStack>
              </Card>
            ))}
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
