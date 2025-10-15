import nodemailer from 'nodemailer';
import { BookingRequest } from '@/types';

// Gmail SMTP 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // 발신 Gmail 주소
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail 앱 비밀번호
  },
});

export interface NewRequestEmailData {
  email: string;
  phone?: string;
  referralEmail?: string;
  requestId: string;
}

export async function sendNewRequestNotification(data: NewRequestEmailData) {
  try {
    const { email, phone, referralEmail, requestId } = data;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL, // 관리자 이메일
      subject: '🔔 새로운 YouTube Premium 가입 신청',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF0000;">새로운 가입 신청이 접수되었습니다</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>신청 ID:</strong> ${requestId}</p>
            <p style="margin: 10px 0;"><strong>이메일:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>전화번호:</strong> ${phone || '-'}</p>
            <p style="margin: 10px 0;"><strong>추천인:</strong> ${referralEmail || '-'}</p>
          </div>

          <p style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin"
               style="background-color: #FF0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              관리자 페이지에서 확인하기
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            이 메일은 자동으로 발송되었습니다.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}

// 영화 예매 신청 알림 이메일
export async function sendMovieBookingNotification(
  booking: BookingRequest,
  vendorEmails: string[]
) {
  try {
    if (vendorEmails.length === 0) {
      console.log('No vendor emails to send notification');
      return false;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: vendorEmails.join(', '), // 여러 판매자에게 발송
      subject: '🎬 새로운 영화 티켓 예매 신청',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">새로운 영화 티켓 예매 신청이 접수되었습니다</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">예매 정보</h3>
            <p style="margin: 10px 0;"><strong>신청 ID:</strong> ${booking.id}</p>
            <p style="margin: 10px 0;"><strong>영화:</strong> ${booking.movieTitle}</p>
            <p style="margin: 10px 0;"><strong>극장:</strong> ${booking.theater}</p>
            <p style="margin: 10px 0;"><strong>날짜/시간:</strong> ${booking.showDate} ${booking.showTime}</p>
            <p style="margin: 10px 0;"><strong>인원:</strong> ${booking.seats}명</p>
            ${booking.additionalInfo ? `<p style="margin: 10px 0;"><strong>추가 요청:</strong> ${booking.additionalInfo}</p>` : ''}
          </div>

          <div style="background-color: #EDE9FE; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">고객 정보</h3>
            <p style="margin: 10px 0;"><strong>이메일:</strong> ${booking.customerEmail}</p>
            <p style="margin: 10px 0;"><strong>전화번호:</strong> ${booking.customerPhone}</p>
          </div>

          ${booking.referralType === 'vendor' ? `
            <div style="background-color: #D1FAE5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="margin: 0; color: #065F46;">
                <strong>💰 판매자 링크 신청:</strong> 이 예매는 귀하의 링크로 신청되어 수익 100%가 귀하에게 돌아갑니다.
              </p>
            </div>
          ` : `
            <div style="background-color: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1E40AF;">
                <strong>📢 공개 신청:</strong> 선착순으로 예매를 진행하실 수 있습니다.
              </p>
            </div>
          `}

          <p style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/movie-bookings"
               style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              예매 관리 페이지에서 확인하기
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            이 메일은 자동으로 발송되었습니다. 빠른 시일 내에 예매를 진행해주세요.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Movie booking notification sent to: ${vendorEmails.join(', ')}`);
    return true;
  } catch (error) {
    console.error('Failed to send movie booking notification email:', error);
    return false;
  }
}
