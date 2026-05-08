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
