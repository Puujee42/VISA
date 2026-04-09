type QPayUrls = {
  name?: string;
  description?: string;
  logo?: string;
  link?: string;
};

type QPayAuthResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
};

type QPayInvoiceRequest = {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code?: string;
  invoice_description: string;
  amount: number;
  callback_url?: string;
  sender_branch_code?: string;
  allow_partial?: boolean;
  minimum_amount?: number;
  metadata?: Record<string, unknown>;
};

type QPayInvoiceResponse = {
  invoice_id?: string;
  qr_text?: string;
  qr_image?: string;
  qpay_shortUrl?: string;
  urls?: QPayUrls[];
  [key: string]: unknown;
};

type QPayPaymentRow = {
  payment_id?: string;
  payment_status?: string;
  payment_date?: string;
  amount?: number;
  [key: string]: unknown;
};

type QPayPaymentCheckResponse = {
  count?: number;
  paid_amount?: number;
  rows?: QPayPaymentRow[];
  [key: string]: unknown;
};

/**
 * Supports both naming styles:
 * - Preferred: QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE, QPAY_BASE_URL
 * - Existing env in your project: MERCHANT_ID, PASSWORD, INVOICE_CODE, QPAY_URL
 */
const QPAY_USERNAME =
  process.env.QPAY_USERNAME ?? process.env.MERCHANT_ID ?? "";
const QPAY_PASSWORD = process.env.QPAY_PASSWORD ?? process.env.PASSWORD ?? "";
const QPAY_INVOICE_CODE =
  process.env.QPAY_INVOICE_CODE ?? process.env.INVOICE_CODE ?? "";

/**
 * Normalize base URL no matter if user provides:
 * - https://merchant.qpay.mn
 * - https://merchant.qpay.mn/
 * - https://merchant.qpay.mn/v2
 * - https://merchant.qpay.mn/v2/
 *
 * We keep base as host-only and append /v2 routes in code.
 */
function normalizeQPayBaseUrl(raw?: string): string {
  const input = (raw || "").trim() || "https://merchant.qpay.mn";

  // Remove trailing slashes
  let cleaned = input.replace(/\/+$/, "");

  // Remove optional /v2 suffix if present
  cleaned = cleaned.replace(/\/v2$/i, "");

  // Ensure protocol
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  return cleaned;
}

const QPAY_BASE_URL = normalizeQPayBaseUrl(
  process.env.QPAY_BASE_URL ?? process.env.QPAY_URL,
);

function assertQPayConfig() {
  if (!QPAY_USERNAME || !QPAY_PASSWORD || !QPAY_INVOICE_CODE) {
    throw new Error(
      "Missing QPay configuration. Please set QPAY_USERNAME/QPAY_PASSWORD/QPAY_INVOICE_CODE or MERCHANT_ID/PASSWORD/INVOICE_CODE in your environment.",
    );
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

function buildAuthHeader(username: string, password: string): string {
  return Buffer.from(`${username}:${password}`).toString("base64");
}

function isTokenValid(): boolean {
  if (!cachedToken) return false;
  // keep a 60s safety margin
  return Date.now() + 60_000 < cachedToken.expiresAt;
}

async function qpayFetch<T>(
  path: string,
  init: RequestInit,
  includeAuthBearer = true,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (includeAuthBearer) {
    const token = await getQPayAccessToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${QPAY_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!res.ok) {
    throw new Error(
      `QPay API error ${res.status}: ${
        typeof payload === "string" ? payload : JSON.stringify(payload)
      }`,
    );
  }

  return payload as T;
}

export async function getQPayAccessToken(): Promise<string> {
  assertQPayConfig();
  if (isTokenValid() && cachedToken) return cachedToken.value;

  const authHeader = buildAuthHeader(QPAY_USERNAME, QPAY_PASSWORD);

  const data = await qpayFetch<QPayAuthResponse>(
    "/v2/auth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({}),
    },
    false,
  );

  if (!data?.access_token) {
    throw new Error("QPay auth response did not include access_token.");
  }

  const expiresInSeconds = data.expires_in ?? 3600;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };

  return data.access_token;
}

export function makeSenderInvoiceNo(prefix = "SHOP"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export async function createQPayInvoice(input: {
  senderInvoiceNo: string;
  invoiceDescription: string;
  amount: number;
  callbackUrl?: string;
  receiverCode?: string;
  senderBranchCode?: string;
  allowPartial?: boolean;
  minimumAmount?: number;
  metadata?: Record<string, unknown>;
}): Promise<QPayInvoiceResponse> {
  if (!input.senderInvoiceNo?.trim()) {
    throw new Error("senderInvoiceNo is required.");
  }
  if (!input.invoiceDescription?.trim()) {
    throw new Error("invoiceDescription is required.");
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("amount must be a positive number.");
  }

  assertQPayConfig();

  const payload: QPayInvoiceRequest = {
    invoice_code: QPAY_INVOICE_CODE,
    sender_invoice_no: input.senderInvoiceNo.trim(),
    invoice_description: input.invoiceDescription.trim(),
    amount: Number(input.amount),
  };

  if (input.callbackUrl) payload.callback_url = input.callbackUrl;
  // invoice_receiver_code is REQUIRED by QPay — default to "terminal" for standard merchant invoices
  payload.invoice_receiver_code = input.receiverCode?.trim() || "terminal";
  if (input.senderBranchCode)
    payload.sender_branch_code = input.senderBranchCode;
  if (typeof input.allowPartial === "boolean")
    payload.allow_partial = input.allowPartial;
  if (typeof input.minimumAmount === "number")
    payload.minimum_amount = input.minimumAmount;
  if (input.metadata) payload.metadata = input.metadata;

  return qpayFetch<QPayInvoiceResponse>("/v2/invoice", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function checkQPayPayment(
  invoiceId: string,
): Promise<QPayPaymentCheckResponse> {
  if (!invoiceId?.trim()) {
    throw new Error("invoiceId is required.");
  }

  return qpayFetch<QPayPaymentCheckResponse>(
    `/v2/payment/check/${encodeURIComponent(invoiceId)}`,
    {
      method: "GET",
    },
  );
}

export function isQPayPaid(result: QPayPaymentCheckResponse): boolean {
  if ((result.paid_amount ?? 0) > 0) return true;

  const rows = result.rows ?? [];
  return rows.some((row) => {
    const status = String(row.payment_status ?? "").toLowerCase();
    return status === "paid" || status === "success" || status === "completed";
  });
}

export type {
  QPayAuthResponse,
  QPayInvoiceResponse,
  QPayPaymentCheckResponse,
  QPayPaymentRow,
  QPayUrls,
};
