import nodemailer from 'nodemailer';

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
