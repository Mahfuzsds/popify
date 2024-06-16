import {
  Box,
  Page,
  Text,
  InlineGrid,
  Button,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { authenticate, MONTHLY_PLAN } from "../shopify.server";
import { randomFunction } from "./subscriptions";
import { useLoaderData } from "@remix-run/react";

// ================ Get the active subscription plan

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const { admin } = await authenticate.admin(request);
//   const response = await admin.graphql(
//     `query shopInfo {
//       shop {
//         name
//       }
//       app {
//           installation {
//             launchUrl
//             activeSubscriptions {
//               id
//               name
//               createdAt
//               returnUrl
//               status
//               currentPeriodEnd
//               trialDays
//             }
//           }
//         }
//     }`,
//   );
//   const parsedResponse = await response.json();
//   console.log(parsedResponse.data.app.installation.activeSubscriptions[0].name);
//   return { data: parsedResponse.data };
// };

export async function loader({ request }: LoaderFunctionArgs) {
  const { billing } = await authenticate.admin(request);
  // const billingCheck = await billing.require({
  //   plans: [MONTHLY_PLAN],
  //   onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
  // });
  try {
    console.log("try");
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN],

      onFailure: async () => {
        throw new Error("No active plan");
      },
    });
    const subscription = billingCheck.appSubscriptions[0];
    console.log(`shop is on ${subscription.name} (id ${subscription.id})`);

    // const enabledSubscription = await billing.request({ plan: MONTHLY_PLAN });

    // const cancelledSubscription = await billing.cancel({
    //   subscriptionId: subscription.id,
    //   isTest: true,
    //   prorate: true,
    // });

    return json({ billing, plan: subscription });
  } catch (error) {
    console.log("catch");
    return json({ billing, plan: { name: "Free" } });
  }
}

export default function Plans() {
  // const { plan } = useLoaderData();
  // console.log(plan);

  return (
    <Page>
      <TitleBar title="Plan page" />
      <InlineGrid gap="400" columns={3}>
        <Box padding="600" background="bg-fill">
          <BlockStack gap="400">
            <Text as="p" variant="headingLg">
              Free user
            </Text>
            <Box>
              <Button disabled={true} onClick={() => randomFunction("test")}>
                Select
              </Button>
            </Box>
          </BlockStack>
        </Box>
        <Box padding="600" background="bg-fill">
          <BlockStack gap="400">
            <Text as="p" variant="headingLg">
              Upgrade to monthly plan
            </Text>
            <Box>
              <Button variant="primary" onClick={() => randomFunction("test")}>
                Select
              </Button>
            </Box>
          </BlockStack>
        </Box>
        <Box padding="600" background="bg-fill">
          <BlockStack gap="200">
            <Text as="p" variant="headingLg">
              Upgrade to anual plan
            </Text>
            <Box>
              <Button variant="primary" url="../upgrade">
                Select
              </Button>
            </Box>
          </BlockStack>
        </Box>
      </InlineGrid>
    </Page>
  );
}
