/**
 * @fileoverview Server actions for payment processing and management
 * @module server/actions/payments
 *
 * This file handles all payment-related server actions including:
 * - Creating payment records from webhooks
 * - Importing payments from external providers
 * - Managing payment access and verification
 * - Administrative payment operations
 *
 * Key responsibilities:
 * - Process webhook events from payment providers (Lemon Squeezy, Stripe, Polar)
 * - Grant user access based on successful payments
 * - Synchronize payment data with external providers
 * - Enforce rate limiting to prevent abuse
 * - Provide admin tools for payment management
 *
 * Dependencies:
 * - PaymentService: Core payment business logic
 * - RateLimitService: Prevent API abuse
 * - Multiple payment provider integrations
 *
 * @security All actions require authentication except webhook handlers
 * @security Rate limiting applied to prevent abuse
 * @security Admin actions require admin role verification
 */

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rateLimits } from "@/config/rate-limits";
import { routes } from "@/config/routes";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { db } from "@/server/db";
import { payments } from "@/server/db/schema";
import { getSession, requireAdmin } from "@/server/lib/auth";
import { getProvider } from "@/server/providers";
import { PaymentService } from "@/server/services/payment-service";
import { RateLimitService } from "@/server/services/rate-limit-service";
import type { ImportProvider, ImportStats } from "@/types/payments";

// Rate limiting service instance - prevents API abuse
const rateLimitService = new RateLimitService();

/**
 * Creates a payment record from LemonSqueezy webhook and grants user access
 *
 * @param data - Payment data from LemonSqueezy webhook
 * @param data.orderId - LemonSqueezy order ID
 * @param data.orderIdentifier - Order identifier for lookup
 * @param data.userId - Optional user ID (from custom data or session)
 * @param data.userEmail - User email for account lookup
 * @param data.customData - Custom data passed during checkout
 *
 * @returns Success status and optional error message
 *
 * @remarks
 * This is typically called from webhook handlers after payment verification.
 * It handles user account creation if needed and grants appropriate access.
 *
 * @security No authentication required as this is called from webhooks
 * @security Payment data must be verified before calling this action
 */
export async function createLemonSqueezyPayment(data: { orderId: string }) {
  // Check if the LemonSqueezy feature is enabled
  if (!env.NEXT_PUBLIC_FEATURE_LEMONSQUEEZY_ENABLED) {
    logger.error("LemonSqueezy feature is disabled. Cannot create payment.");
    throw new Error("LemonSqueezy payments are not enabled.");
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const session = await getSession();
    const userId = session?.user?.id;
    const sessionEmail = session?.user?.email?.toLowerCase().trim();

    if (!userId || !sessionEmail) {
      throw new Error("User not authenticated");
    }

    if (!db) {
      logger.error("Database not initialized", { requestId });
      throw new Error("Database not initialized");
    }

    const orderId = data.orderId?.trim();
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    logger.info("LemonSqueezy payment confirmation requested", {
      requestId,
      orderId,
      userId,
    });

    // Duplicate check before spending an API call.
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });

    if (existingPayment) {
      logger.info("Payment already exists", {
        requestId,
        orderId,
        paymentId: existingPayment.id,
      });
      return { success: true, paymentId: existingPayment.id };
    }

    /*
     * Ask LemonSqueezy what it has for *this* user's email. Filtering the
     * lookup by the session address is what stops a caller from claiming
     * someone else's order id: an order that is not on their own email is
     * simply not in the result set.
     */
    const provider = getProvider("lemonsqueezy");
    if (!provider) {
      throw new Error("LemonSqueezy provider is not configured");
    }

    const orders = await provider.getOrdersByEmail(sessionEmail);
    const order = orders.find((candidate) => candidate.orderId === orderId);

    if (!order) {
      logger.warn("Refused payment confirmation: order not found for this user", {
        requestId,
        orderId,
        userId,
      });
      throw new Error("Order not found");
    }

    if (order.status !== "paid") {
      logger.warn("Refused payment confirmation: order is not paid", {
        requestId,
        orderId,
        status: order.status,
      });
      throw new Error("Order not paid");
    }

    // Every value below comes from the provider, not from the request.
    const payment = await PaymentService.createPayment({
      userId,
      orderId: order.orderId,
      amount: Math.round(order.amount * 100), // stored in cents, as the import path does
      status: "completed",
      processor: "lemonsqueezy",
      metadata: {
        productName: order.productName,
        product_name: order.productName,
        orderIdentifier: order.orderId,
        processorOrderId: order.id,
        userEmail: order.userEmail,
        purchaseDate: order.purchaseDate,
      },
    });

    if (!payment) {
      logger.error("Failed to create payment", { requestId, orderId, userId });
      throw new Error("Failed to create payment");
    }

    logger.info("LemonSqueezy payment created successfully", {
      requestId,
      orderId,
      userId,
      paymentId: payment.id,
      processingTime: Date.now() - startTime,
    });

    return { success: true, paymentId: payment.id };
  } catch (error) {
    logger.error("Error creating LemonSqueezy payment", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });
    throw error;
  }
}

/**
 * Server action to generate a Polar checkout URL
 */
export async function createPolarCheckoutUrl(
  productId: string,
  metadata?: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    [key: string]: any;
  }
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const session = await getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");

    const { createCheckoutUrl } = await import("@/lib/polar");

    // Extract user details and handle null values
    const email = session.user.email ?? undefined;
    const name = session.user.name ?? undefined;

    const url = await createCheckoutUrl({
      productId,
      email,
      userId: session.user.id,
      metadata: {
        userId: session.user.id,
        userEmail: email,
        userName: name,
        ...metadata,
      },
    });

    if (!url) {
      return {
        success: false,
        message: "Failed to generate checkout URL",
      };
    }

    return { success: true, url };
  } catch (error) {
    console.error("Error creating Polar checkout URL:", error);
    return {
      success: false,
      message: "Failed to generate checkout URL",
    };
  }
}

/**
 * Server action to import payments from a specific provider or all providers
 * @param provider - The payment provider to import from (or "all" for all providers)
 * @returns Stats about the import process
 */
export async function importPayments(
  provider: ImportProvider
): Promise<ImportStats | Record<string, any>> {
  const session = await requireAdmin();
  const userId = session.user.id;

  try {
    // Check if the database is initialized
    if (!db) {
      logger.error("Database not initialized");
      throw new Error("Database not initialized");
    }

    // Apply rate limiting with longer duration for imports
    await rateLimitService.checkLimit(userId, "importPayments", rateLimits.importPayments);

    logger.info(`Starting payment import for provider: ${provider}`, { userId });

    // Add overall timeout for the import process
    const importPromise = async () => {
      // Handle import based on the provider argument
      if (provider === "all") {
        // Import from all enabled providers
        // This returns Record<string, any>
        const result = await PaymentService.importAllPayments();

        // Revalidate the admin users page to reflect the new imported data
        revalidatePath(routes.admin.users);

        return result;
      }

      // If not 'all', import from the specific provider
      const specificProvider = getProvider(provider);

      if (!specificProvider) {
        throw new Error(`Provider "${provider}" not found.`);
      }

      if (!specificProvider.isEnabled) {
        throw new Error(`Provider "${provider}" is not enabled.`);
      }

      // Call the specific provider's import method
      // This returns ImportStats
      const stats: ImportStats = await specificProvider.importPayments();

      // Revalidate the admin users page to reflect the new imported data
      revalidatePath(routes.admin.users);

      return stats;
    };

    // Set up timeout for the entire import process
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => {
          reject(new Error(`Import timeout after 10 minutes for provider: ${provider}`));
        },
        10 * 60 * 1000
      ); // 10 minutes timeout
    });

    const result = await Promise.race([importPromise(), timeoutPromise]);

    logger.info(`Payment import completed for provider: ${provider}`, {
      userId,
      provider,
      result: typeof result === "object" ? Object.keys(result) : result,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error importing payments", {
      userId, // Now accessible here
      provider,
      error: errorMessage,
    });

    // Don't expose detailed error messages to the client for security
    if (errorMessage.includes("Unauthorized")) {
      throw new Error("Unauthorized access");
    }
    if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
      throw new Error("Import process timed out. Please try again later.");
    }
    if (errorMessage.includes("rate limit") || errorMessage.includes("Rate limit")) {
      throw new Error("Rate limit exceeded. Please wait before trying again.");
    }

    // Re-throw the error so the client knows the operation failed
    throw new Error("Import failed. Please try again later.");
  }
}

/**
 * Server action to delete all payments from the database
 * @returns Result of the delete operation
 */
export async function deleteAllPayments(): Promise<{
  success: boolean;
  deletedCount: number;
  message?: string;
}> {
  let userId: string | undefined;
  try {
    const session = await requireAdmin();
    userId = session.user.id;

    // Check if the database is initialized
    if (!db) {
      logger.error("Database not initialized");
      throw new Error("Database not initialized");
    }

    // Apply rate limiting
    await rateLimitService.checkLimit(userId, "importPayments", rateLimits.importPayments);

    logger.info("Starting deletion of all payments", { userId });

    // Get count of payments before deletion
    const paymentsBefore = await db.select().from(payments);
    const countBefore = paymentsBefore.length;

    // Delete all payments
    await db.delete(payments);

    logger.info("All payments deleted successfully", {
      userId,
      deletedCount: countBefore,
    });

    // Revalidate the admin payments and users pages
    revalidatePath(routes.admin.payments);
    revalidatePath(routes.admin.users);

    return {
      success: true,
      deletedCount: countBefore,
      message: `Successfully deleted ${countBefore} payments`,
    };
  } catch (error) {
    logger.error("Error deleting payments", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Server action to refresh all payments by re-importing from all providers
 * This deletes existing payments and imports fresh data
 * @returns Stats about the refresh process
 */
export async function refreshAllPayments(): Promise<{
  success: boolean;
  deletedCount: number;
  importResults: Record<string, any>;
  message?: string;
}> {
  let userId: string | undefined;
  try {
    const session = await requireAdmin();
    userId = session.user.id;

    // Check if the database is initialized
    if (!db) {
      logger.error("Database not initialized");
      throw new Error("Database not initialized");
    }

    // Apply rate limiting
    await rateLimitService.checkLimit(userId, "importPayments", rateLimits.importPayments);

    logger.info("Starting refresh of all payments", { userId });

    // First, delete all existing payments
    const paymentsBefore = await db.select().from(payments);
    const deletedCount = paymentsBefore.length;
    await db.delete(payments);

    logger.info("Existing payments deleted", { deletedCount });

    // Then, import fresh data from all providers
    const importResults = await PaymentService.importAllPayments();

    logger.info("Payment refresh completed", {
      userId,
      deletedCount,
      importResults,
    });

    // Revalidate the admin payments and users pages
    revalidatePath(routes.admin.payments);
    revalidatePath(routes.admin.users);

    return {
      success: true,
      deletedCount,
      importResults,
      message: `Successfully refreshed payments: deleted ${deletedCount} old payments and imported fresh data`,
    };
  } catch (error) {
    logger.error("Error refreshing payments", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function createPayment(_data: {
  provider: "stripe" | "lemonsqueezy" | "polar";
  email?: string;
  productId?: string;
  variantId?: string;
  productName?: string;
  amount?: number;
}): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const _session = await getSession();
    // TODO: Implement the rest of the function
    return { success: false, error: "Not implemented" };
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error("Failed to create payment");
  }
}

export async function importPaymentsFromAllProviders() {
  try {
    const session = await requireAdmin();
    const userId = session.user.id;

    await rateLimitService.checkLimit(userId, "importPayments", rateLimits.importPayments);

    // Import payments from all providers
    const importResults = await PaymentService.importAllPayments();

    return {
      success: true,
      results: importResults,
    };
  } catch (error) {
    console.error("Error importing payments:", error);
    throw new Error("Failed to import payments");
  }
}

/**
 * Gets the payment status for the current user
 * @returns Whether the user has paid
 */
export async function getUserPaymentStatus(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;
  return await PaymentService.getUserPaymentStatus(session.user.id);
}
