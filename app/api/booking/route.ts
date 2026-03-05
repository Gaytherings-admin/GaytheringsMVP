import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// Email configuration
const PRIMARY_RECIPIENT = 'vahan@gaytherings.com';
const CC_RECIPIENTS = [
  'matthew@gaytherings.com',
  'expert.techie31@gmail.com'
];

// Create transporter - using Gmail SMTP as default
// For production, configure these via environment variables
const createTransporter = () => {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      'SMTP credentials not configured. Please add SMTP_USER and SMTP_PASS to your .env.local file. ' +
      'For Gmail: Enable 2FA, generate an App Password, and use that (not your regular password). ' +
      'See EMAIL_SETUP.md for detailed instructions.'
    );
  }

  // If custom SMTP host is provided, use custom SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Default: Use Gmail with App Password
  // Gmail App Passwords are 16 characters (no spaces)
  // If password is too short or contains spaces, it's likely a regular password
  const password = process.env.SMTP_PASS;
  if (password.length < 16 || password.includes(' ')) {
    throw new Error(
      'Invalid Gmail App Password format. Gmail App Passwords are 16 characters with no spaces. ' +
      'You may be using your regular Gmail password. Please: ' +
      '1. Enable 2-Factor Authentication on your Gmail account, ' +
      '2. Go to Google Account → Security → 2-Step Verification → App passwords, ' +
      '3. Generate a new App Password for "Mail", ' +
      '4. Use that 16-character password (not your regular Gmail password). ' +
      'See EMAIL_SETUP.md for step-by-step instructions.'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, eventDescription, ticketingPlatform, timeSlots, ndaSigned } = body;

    // Validate required fields
    if (!name || !email || !eventDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format time slots
    const timeSlotsText = timeSlots && timeSlots.length > 0
      ? timeSlots.join(', ')
      : 'No time slots selected';

    // Create email content
    const emailSubject = `New Booking Request: ${name} - Intro Call`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9f9f9;
            }
            .header {
              background: #2563eb;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 20px;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
              display: block;
            }
            .value {
              color: #333;
              padding: 8px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .time-slots {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .time-slot {
              background: #2563eb;
              color: white;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Booking Request - Intro Call</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Name:</span>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <span class="label">Email:</span>
                <div class="value">${email}</div>
              </div>
              
              <div class="field">
                <span class="label">Event Description:</span>
                <div class="value">${eventDescription.replace(/\n/g, '<br>')}</div>
              </div>
              
              <div class="field">
                <span class="label">Current Ticketing Platform:</span>
                <div class="value">${ticketingPlatform || 'Not specified'}</div>
              </div>
              
              <div class="field">
                <span class="label">Preferred Time Slots:</span>
                <div class="value">
                  <div class="time-slots">
                    ${timeSlots && timeSlots.length > 0
                      ? timeSlots.map((slot: string) => `<span class="time-slot">${slot}</span>`).join('')
                      : '<span>No time slots selected</span>'
                    }
                  </div>
                </div>
              </div>
              
              <div class="field">
                <span class="label">NDA Signed:</span>
                <div class="value">${ndaSigned ? '✅ Yes' : '❌ No'}</div>
              </div>
              
              <div class="field" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                  This booking request was submitted from the Gatherings CMS platform.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New Booking Request - Intro Call

Name: ${name}
Email: ${email}

Event Description:
${eventDescription}

Current Ticketing Platform: ${ticketingPlatform || 'Not specified'}

Preferred Time Slots: ${timeSlotsText}

NDA Signed: ${ndaSigned ? 'Yes' : 'No'}

---
This booking request was submitted from the Gatherings CMS platform.
    `;

    // Create transporter
    const transporter = createTransporter();

    // Send email to primary recipient with CC
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gatherings.com',
      to: PRIMARY_RECIPIENT,
      cc: CC_RECIPIENTS,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Booking request submitted successfully. Email sent to vahan@gaytherings.com with CC to matthew@gaytherings.com and expert.techie31@gmail.com.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending booking email:', error);
    
    // Provide helpful error messages
    let errorMessage = 'Failed to send booking request';
    let helpfulMessage = '';
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // Gmail authentication errors
      if (errorMsg.includes('invalid login') || errorMsg.includes('badcredentials') || errorMsg.includes('username and password not accepted')) {
        errorMessage = 'Gmail Authentication Failed';
        helpfulMessage = 'Your Gmail credentials are incorrect. Make sure you are using an App Password (not your regular password). ' +
          'Steps: 1) Enable 2-Factor Authentication, 2) Generate App Password at https://myaccount.google.com/apppasswords, ' +
          '3) Use the 16-character App Password in SMTP_PASS. See EMAIL_SETUP.md for details.';
      } else if (errorMsg.includes('smtp credentials not configured')) {
        errorMessage = 'Email Not Configured';
        helpfulMessage = error.message;
      } else if (errorMsg.includes('invalid gmail app password format')) {
        errorMessage = 'Invalid App Password Format';
        helpfulMessage = error.message;
      } else {
        helpfulMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: helpfulMessage || (error instanceof Error ? error.message : 'Unknown error'),
        troubleshooting: 'Check your .env.local file has SMTP_USER and SMTP_PASS set correctly. ' +
          'For Gmail, you MUST use an App Password, not your regular password. ' +
          'See EMAIL_SETUP.md for complete setup instructions.'
      },
      { status: 500 }
    );
  }
}

