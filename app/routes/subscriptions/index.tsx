export async function billingCheck(billingData: any, planName: String) {
  await billingData.require({
    plans: [MONTHLY_PLAN],
    isTest: true,
    onFailure: async () => {
      throw new Error("No active plan");
    },
  });

  return "testdata";
}

// export const enabledSubscription = await billing.request({
//   plan: MONTHLY_PLAN,
// });

// export const cancelledSubscription = await billing.cancel({
//   subscriptionId: subscription.id,
//   isTest: true,
//   prorate: true,
// });

export const randomFunction = (easas: any) => {
  console.log(easas);
};

export default function Index() {
  console.log("calling from randomFunction");
}
