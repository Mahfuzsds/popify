import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  BillingInterval,
} from "@shopify/shopify-app-remix/server";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-04";
import connectToMongoDB from "./db.server";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb"; // Hypothetical package, check for actual availability or implement custom logic

await connectToMongoDB();

export const MONTHLY_PLAN = "Monthly subscription";
export const ANNUAL_PLAN = "Annual subscription";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.April24,
  scopes: process.env.SCOPES?.split(",") || [],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new MongoDBSessionStorage(
    new URL(process.env.MONGODB_URI || "mongodb://localhost:27017"),
    "pretty_poppers",
  ),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      await shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    v3_lineItemBilling: true,
    unstable_newEmbeddedAuthStrategy: true,
  },
  billing: {
    [MONTHLY_PLAN]: {
      amount: 5,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    },
    [ANNUAL_PLAN]: {
      amount: 50,
      currencyCode: "USD",
      interval: BillingInterval.Annual,
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN && {
    customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN],
  }),
});

export default shopify;
export const apiVersion = ApiVersion.April24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
