import 'server-only';
import nodemailer from 'nodemailer';

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

interface BookingDetails {
  serviceTitle: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  note?: string;
}

export async function sendBookingRequestEmail(adminEmail: string, booking: BookingDetails) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject: `Шинэ цаг захиалга - ${escapeHtml(booking.serviceTitle)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E31B23;">Шинэ Цаг Захиалга</h2>
          <p>Та дараах мэдээлэлтэй шинэ захиалга хүлээн авлаа:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Үйлчилгээ:</strong> ${escapeHtml(booking.serviceTitle)}</p>
            <p><strong>Огноо:</strong> ${escapeHtml(booking.date)}</p>
            <p><strong>Цаг:</strong> ${escapeHtml(booking.time)}</p>
            <p><strong>Нэр:</strong> ${escapeHtml(booking.name)}</p>
            <p><strong>И-мэйл:</strong> ${escapeHtml(booking.email)}</p>
            <p><strong>Утас:</strong> ${escapeHtml(booking.phone)}</p>
            ${booking.note ? `<p><strong>Нэмэлт тайлбар:</strong> ${escapeHtml(booking.note)}</p>` : ''}
          </div>
          
          <p>Админ хэсэгт орж захиалгыг баталгаажуулна уу.</p>
        </div>
      `,
    });
    console.log('Booking request email sent to admin');
  } catch (error) {
    console.error('Failed to send booking request email:', error);
  }
}

export async function sendBookingApprovedEmail(userEmail: string, booking: BookingDetails) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: `Таны захиалга баталгаажлаа - ${escapeHtml(booking.serviceTitle)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00C896;">Захиалга Баталгаажлаа ✓</h2>
          <p>Сайн байна уу, ${escapeHtml(booking.name)}!</p>
          <p>Таны захиалга амжилттай баталгаажлаа.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #00C896;">
            <p><strong>Үйлчилгээ:</strong> ${escapeHtml(booking.serviceTitle)}</p>
            <p><strong>Огноо:</strong> ${escapeHtml(booking.date)}</p>
            <p><strong>Цаг:</strong> ${escapeHtml(booking.time)}</p>
          </div>
          
          <p>Та өөрийн Dashboard хэсгээс видео уулзалтанд нэгдэх боломжтой.</p>
          <p>Баярлалаа!</p>
        </div>
      `,
    });
    console.log('Booking approved email sent to user');
  } catch (error) {
    console.error('Failed to send booking approved email:', error);
  }
}

export async function sendBookingRejectedEmail(userEmail: string, booking: BookingDetails) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: `Таны захиалгын талаар`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E31B23;">Захиалгын Мэдэгдэл</h2>
          <p>Сайн байна уу, ${escapeHtml(booking.name)}!</p>
          <p>Уучлаарай, таны захиалгыг одоогоор баталгаажуулах боломжгүй байна.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #E31B23;">
            <p><strong>Үйлчилгээ:</strong> ${escapeHtml(booking.serviceTitle)}</p>
            <p><strong>Огноо:</strong> ${escapeHtml(booking.date)}</p>
            <p><strong>Цаг:</strong> ${escapeHtml(booking.time)}</p>
          </div>
          
          <p>Та дахин өөр цаг сонгож захиалга үүсгэж болно.</p>
          <p>Баярлалаа!</p>
        </div>
      `,
    });
    console.log('Booking rejected email sent to user');
  } catch (error) {
    console.error('Failed to send booking rejected email:', error);
  }
}

// ─── Material Notification ────────────────────────────────────────────────────

interface MaterialDetails {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  category?: string;
}

export async function sendMaterialEmail(
  userEmail: string,
  userName: string,
  material: MaterialDetails,
) {
  const categoryLabel: Record<string, string> = {
    guide: 'Гарын авлага',
    form: 'Маягт',
    study: 'Сургалтын материал',
    document: 'Баримт бичиг',
    announcement: 'Зарлал',
    other: 'Файл',
  };
  const label = categoryLabel[material.category ?? 'other'] ?? 'Файл';
  const year = new Date().getFullYear();

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: `Шинэ материал ирлээ: ${escapeHtml(material.title)}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <div style="background:linear-gradient(135deg,#E31B23 0%,#b91c1c 100%);padding:36px 40px;text-align:center">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 20px;margin-bottom:16px">
              <span style="color:white;font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase">Mongolian Au Pair</span>
            </div>
            <h1 style="color:white;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px">Шинэ Материал</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px">Таньд шинэ материал илгээгдлээ</p>
          </div>
          <div style="padding:36px 40px">
            <p style="color:#334155;font-size:15px;margin:0 0 8px">Сайн байна уу, <strong>${escapeHtml(userName)}</strong>!</p>
            <p style="color:#64748b;font-size:14px;margin:0 0 28px;line-height:1.6">Mongolian Au Pair-ийн баг танд дараах материалыг илгээлээ.</p>
            <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:28px">
              <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8">${escapeHtml(label)}</p>
              <h2 style="margin:0 0 8px;font-size:18px;font-weight:900;color:#0f172a">${escapeHtml(material.title)}</h2>
              ${material.description ? `<p style="margin:0;font-size:13px;color:#64748b;line-height:1.6">${escapeHtml(material.description)}</p>` : ''}
            </div>
            <div style="text-align:center;margin-bottom:28px">
              <a href="${material.fileUrl}" target="_blank" style="display:inline-block;background:#E31B23;color:white;padding:14px 36px;border-radius:12px;font-size:13px;font-weight:800;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase">
                Файл татаж авах
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">Файлын нэр: <strong style="color:#64748b">${escapeHtml(material.fileName)}</strong></p>
          </div>
          <div style="background:#f1f5f9;padding:20px 40px;text-align:center">
            <p style="margin:0;font-size:12px;color:#94a3b8">Copyright ${year} Mongolian Au Pair - Бүх эрх хамгаалагдсан</p>
          </div>
        </div>
      `,
    });
    console.log(`Material email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send material email to ${userEmail}:`, error);
  }
}
