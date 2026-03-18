import { createServiceRoleClient } from "@/lib/supabase/server";

export type ActionType =
  | "process_return"
  | "check_order_status"
  | "update_account"
  | "schedule_callback"
  | "lookup_product"
  | "apply_discount"
  | "cancel_order";

interface ActionResult {
  success: boolean;
  data: Record<string, unknown>;
  message: string;
}

export async function executeAction(
  sessionId: string,
  actionType: ActionType,
  inputData: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = createServiceRoleClient();

  const { data: logEntry } = await supabase
    .from("action_logs")
    .insert({
      session_id: sessionId,
      action_type: actionType,
      input_data: inputData,
      status: "pending",
    })
    .select()
    .single();

  let result: ActionResult;

  try {
    switch (actionType) {
      case "process_return":
        result = await processReturn(inputData);
        break;
      case "check_order_status":
        result = await checkOrderStatus(inputData);
        break;
      case "update_account":
        result = await updateAccount(inputData);
        break;
      case "schedule_callback":
        result = await scheduleCallback(inputData);
        break;
      case "lookup_product":
        result = await lookupProduct(inputData);
        break;
      case "apply_discount":
        result = await applyDiscount(inputData);
        break;
      case "cancel_order":
        result = await cancelOrder(inputData);
        break;
      default:
        result = {
          success: false,
          data: {},
          message: `Unknown action type: ${actionType}`,
        };
    }

    if (logEntry) {
      await supabase
        .from("action_logs")
        .update({
          status: result.success ? "success" : "failed",
          output_data: result.data,
          error_message: result.success ? null : result.message,
        })
        .eq("id", logEntry.id);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    result = { success: false, data: {}, message: errorMessage };

    if (logEntry) {
      await supabase
        .from("action_logs")
        .update({ status: "failed", error_message: errorMessage })
        .eq("id", logEntry.id);
    }
  }

  return result;
}

async function processReturn(input: Record<string, unknown>): Promise<ActionResult> {
  const orderId = input.order_id as string;
  const reason = input.reason as string;
  const items = input.items as string[] | undefined;

  if (!orderId) {
    return { success: false, data: {}, message: "Order ID is required to process a return." };
  }

  // Simulate return processing
  const returnId = `RET-${Date.now().toString(36).toUpperCase()}`;
  const estimatedRefund = Math.floor(Math.random() * 200) + 20;

  return {
    success: true,
    data: {
      return_id: returnId,
      order_id: orderId,
      reason: reason || "Customer requested",
      items: items || ["all"],
      estimated_refund: `$${estimatedRefund}.00`,
      status: "initiated",
      return_label_url: `https://returns.example.com/${returnId}`,
    },
    message: `Return ${returnId} has been initiated for order ${orderId}. Estimated refund: $${estimatedRefund}.00. A return shipping label has been generated.`,
  };
}

async function checkOrderStatus(input: Record<string, unknown>): Promise<ActionResult> {
  const orderId = input.order_id as string;

  if (!orderId) {
    return { success: false, data: {}, message: "Order ID is required to check status." };
  }

  const statuses = ["processing", "shipped", "in_transit", "out_for_delivery", "delivered"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const trackingNumber = `TRK${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    data: {
      order_id: orderId,
      status,
      tracking_number: trackingNumber,
      estimated_delivery: new Date(Date.now() + 3 * 86400000).toLocaleDateString(),
      last_update: new Date().toISOString(),
    },
    message: `Order ${orderId} is currently ${status.replace("_", " ")}. Tracking number: ${trackingNumber}. Estimated delivery: ${new Date(Date.now() + 3 * 86400000).toLocaleDateString()}.`,
  };
}

async function updateAccount(input: Record<string, unknown>): Promise<ActionResult> {
  const field = input.field as string;
  const value = input.value as string;

  if (!field || !value) {
    return { success: false, data: {}, message: "Field and value are required to update account." };
  }

  const allowedFields = ["email", "phone", "address", "name", "preferences"];
  if (!allowedFields.includes(field)) {
    return {
      success: false,
      data: {},
      message: `Cannot update field "${field}". Allowed fields: ${allowedFields.join(", ")}.`,
    };
  }

  return {
    success: true,
    data: { field, new_value: value, updated_at: new Date().toISOString() },
    message: `Account ${field} has been updated successfully.`,
  };
}

async function scheduleCallback(input: Record<string, unknown>): Promise<ActionResult> {
  const phone = input.phone as string;
  const preferredTime = input.preferred_time as string;
  const topic = input.topic as string;

  if (!phone) {
    return { success: false, data: {}, message: "Phone number is required to schedule a callback." };
  }

  const callbackId = `CB-${Date.now().toString(36).toUpperCase()}`;
  const scheduledTime = preferredTime || new Date(Date.now() + 3600000).toISOString();

  return {
    success: true,
    data: {
      callback_id: callbackId,
      phone,
      scheduled_time: scheduledTime,
      topic: topic || "General inquiry",
    },
    message: `Callback ${callbackId} scheduled for ${new Date(scheduledTime).toLocaleString()}. An agent will call ${phone}.`,
  };
}

async function lookupProduct(input: Record<string, unknown>): Promise<ActionResult> {
  const query = input.query as string;
  const productId = input.product_id as string;

  if (!query && !productId) {
    return { success: false, data: {}, message: "A product query or ID is required." };
  }

  return {
    success: true,
    data: {
      product_id: productId || `PROD-${Math.floor(Math.random() * 10000)}`,
      name: query || "Sample Product",
      price: `$${(Math.random() * 200 + 10).toFixed(2)}`,
      in_stock: Math.random() > 0.3,
      category: "General",
    },
    message: `Product found: ${query || productId}. Currently ${Math.random() > 0.3 ? "in stock" : "out of stock"}.`,
  };
}

async function applyDiscount(input: Record<string, unknown>): Promise<ActionResult> {
  const orderId = input.order_id as string;
  const code = input.discount_code as string;
  const percentage = input.percentage as number;

  if (!orderId) {
    return { success: false, data: {}, message: "Order ID is required to apply a discount." };
  }

  const discountAmount = percentage || 10;

  return {
    success: true,
    data: {
      order_id: orderId,
      discount_code: code || `SAVE${discountAmount}`,
      discount_percentage: discountAmount,
      applied_at: new Date().toISOString(),
    },
    message: `${discountAmount}% discount applied to order ${orderId}.`,
  };
}

async function cancelOrder(input: Record<string, unknown>): Promise<ActionResult> {
  const orderId = input.order_id as string;
  const reason = input.reason as string;

  if (!orderId) {
    return { success: false, data: {}, message: "Order ID is required to cancel an order." };
  }

  return {
    success: true,
    data: {
      order_id: orderId,
      status: "cancelled",
      reason: reason || "Customer requested",
      refund_status: "processing",
      cancelled_at: new Date().toISOString(),
    },
    message: `Order ${orderId} has been cancelled. Refund is being processed and should appear within 5-7 business days.`,
  };
}

export function getActionDescription(actionType: ActionType): string {
  const descriptions: Record<ActionType, string> = {
    process_return: "Process product returns and generate return labels",
    check_order_status: "Look up current order status and tracking info",
    update_account: "Update customer account information",
    schedule_callback: "Schedule a callback from a human agent",
    lookup_product: "Search product catalog for availability and details",
    apply_discount: "Apply discount codes or manual discounts to orders",
    cancel_order: "Cancel pending orders and initiate refunds",
  };
  return descriptions[actionType] || actionType;
}

export function getAvailableActions(): { type: ActionType; description: string }[] {
  const types: ActionType[] = [
    "process_return",
    "check_order_status",
    "update_account",
    "schedule_callback",
    "lookup_product",
    "apply_discount",
    "cancel_order",
  ];
  return types.map((t) => ({ type: t, description: getActionDescription(t) }));
}
