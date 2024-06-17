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
import { billingCheck, randomFunction } from "./subscriptions";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

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

// Function to create a subscription
async function createSubscription(request: Request) {
  const { billing } = await authenticate.admin(request);
  const billingCheck = await billing.require({
    plans: [MONTHLY_PLAN],
    onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
  });

  console.log("Subscription created or validated:", billingCheck);
}

// Function to cancel a subscription
async function cancelSubscription(request: Request) {
  const { billing } = await authenticate.admin(request);

  const billingCheck = await billing.require({
    plans: [MONTHLY_PLAN],
    onFailure: async () => {
      throw new Error("No active plan");
    },
  });
  const subscription = billingCheck.appSubscriptions[0];
  console.log(`shop is on ${subscription.name} (id ${subscription.id})`);

  const cancelledSubscription = await billing.cancel({
    subscriptionId: subscription.id,
    isTest: true,
    prorate: true,
  });

  console.log("Subscription cancelled:", cancelledSubscription);
}

// Loader function
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "create") {
    await createSubscription(request);
  } else if (action === "cancel") {
    await cancelSubscription(request);
  }
  return {};
}

export default function Plans() {
  const navigate = useNavigate();

  const handleCreateSubscription = () => {
    navigate("?action=create");
  };

  const handleCancelSubscription = () => {
    navigate(`?action=cancel`);
  };

  return (
    <div>
      <button onClick={handleCreateSubscription}>Create Subscription</button>
      <button onClick={handleCancelSubscription}>Cancel Subscription</button>
    </div>
  );
}
