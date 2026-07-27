/** Snake_case DB columns → camelCase API fields (Mongo-compatible responses). */

const FIELD_MAP: Record<string, string> = {
  clerk_id: "clerkId",
  full_name: "fullName",
  student_id: "studentId",
  documents_submitted: "documentsSubmitted",
  documents_reviewed_by: "documentsReviewedBy",
  documents_approved_at: "documentsApprovedAt",
  activity_history: "activityHistory",
  events_attended_count: "eventsAttendedCount",
  user_id: "userId",
  program_id: "programId",
  first_name: "firstName",
  last_name: "lastName",
  service_id: "serviceId",
  service_title: "serviceTitle",
  livekit_room: "livekitRoom",
  file_url: "fileUrl",
  file_name: "fileName",
  file_type: "fileType",
  sent_by: "sentBy",
  sent_to: "sentTo",
  is_for_all: "isForAll",
  is_active: "isActive",
  item_id: "itemId",
  item_name: "itemName",
  qpay_invoice_id: "qpayInvoiceId",
  qpay_invoice_no: "qpayInvoiceNo",
  qpay_qr_text: "qpayQrText",
  qpay_qr_image: "qpayQrImage",
  qpay_urls: "qpayUrls",
  paid_amount: "paidAmount",
  paid_at: "paidAt",
  expires_at: "expiresAt",
  qpay_raw: "qpayRaw",
  qpay_raw_check: "qpayRawCheck",
  posted_date: "postedDate",
  published_date: "publishedDate",
  club_id: "clubId",
  time_string: "timeString",
  country_tag: "countryTag",
  image_url: "imageUrl",
  video_url: "videoUrl",
  created_at: "createdAt",
  updated_at: "updatedAt",
  field_key: "fieldKey",
  sort_order: "sortOrder",
  is_system: "isSystem",
  is_read: "isRead",
};

const REVERSE_MAP = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([snake, camel]) => [camel, snake]),
);

export function isDbId(id: string): boolean {
  return (
    /^[0-9a-fA-F]{24}$/.test(id) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

export function toApi<T extends Record<string, unknown>>(
  row: T | null | undefined,
): (T & { _id: string }) | null {
  if (!row) return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "id") {
      out._id = value;
      out.id = value;
      continue;
    }
    out[FIELD_MAP[key] ?? key] = value;
  }
  return out as T & { _id: string };
}

export function toApiList<T extends Record<string, unknown>>(
  rows: T[] | null | undefined,
): (T & { _id: string })[] {
  return (rows ?? []).map((r) => toApi(r)!);
}

export function toDb(
  data: Record<string, unknown>,
  extraMap: Record<string, string> = {},
): Record<string, unknown> {
  const map = { ...REVERSE_MAP, ...extraMap };
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "_id" || key === "id") continue;
    out[map[key] ?? key] = value;
  }
  return out;
}

export function withAttendees<
  T extends { id: string },
  A extends { id: string; full_name?: string; photo?: string },
>(row: T, attendeeRows: A[]) {
  const api = toApi(row)!;
  return {
    ...api,
    attendees: attendeeRows.map((u) => ({
      _id: u.id,
      fullName: u.full_name ?? "",
      photo: u.photo ?? "",
    })),
  };
}
