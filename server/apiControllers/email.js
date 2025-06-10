const nodemailer = require("nodemailer");

/*--------------------------------- Email templates Start-------------------------*/
function new_registered_email_template(name, password, isByGoogle) {
    const commonGreeting = `
    <div style="background: linear-gradient(to right, #f97316, #fb7185, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="border-radius: 50%; display: inline-block; margin-bottom: 20px;">
        <div style="background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; padding:15px;">
          <img style="width: 100px; aspect-ratio:1; object-fit:cover;" src="https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2Flogo.png?alt=media&token=8f0ccf70-ac46-4ca6-9b46-b1828cfc9988" alt="Spending Smart Logo">
        </div>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        Welcome to <span style="font-weight: 600;">SpendingSmart</span>
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 16px;">
        Hi ${name}, we're excited to have you join us! 🎉
      </p>
    </div>
  `;

    const googleSpecificContent = `
    <div style="background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); padding: 20px; border-radius: 8px; margin: 25px 0; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
      
      <div style="position: relative; z-index: 2;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="background: white; padding: 8px; border-radius: 50%; margin-right: 12px;">
            <span style="font-size: 16px; display: flex;">🔐</span>
          </div>
          <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 500;">
            Google Account Setup Complete
          </h3>
        </div>
        
        <p style="color: rgba(255,255,255,0.95); font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
          You've successfully registered using your Google account. For security, we've generated a temporary password:
        </p>
        
        <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 15px 20px; border-radius: 8px; margin: 15px 0; border: 1px solid rgba(255,255,255,0.2);">
          <div style="color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
            Temporary Password
          </div>
          <div style="color: white; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px;">
            ${password}
          </div>
        </div>
        
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5; margin: 15px 0;">
          <strong style="display: flex; align-items: center;">⚠️ Important:</strong> Please update your password from your profile settings for enhanced security.
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:5173/user-profile" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 25px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(238, 90, 82, 0.3); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
        🔐 Update Password Now
      </a>
    </div>
  `;

    const regularUserContent = `
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); padding: 25px; border-radius: 15px; color: white;">
        <div style="font-size: 48px; margin-bottom: 15px;">🚀</div>
        <h3 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 500;">You're All Set!</h3>
        <p style="margin: 0; font-size: 15px; opacity: 0.9;">
          Start your financial journey with SpendingSmart today.
        </p>
        
        <div style="margin-top: 20px;">
          <a href="http://localhost:5173/dashboard" style="background: rgba(255,255,255,0.2); color: white; text-decoration: none; padding: 12px 24px; border-radius: 20px; font-weight: 500; font-size: 14px; display: inline-block; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
            📊 Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

    const featuresSection = `
    <div style="margin: 30px 0;">
      <h3 style="color: #2f3542; text-align: center; margin-bottom: 25px; font-size: 18px; font-weight: 500;">
        What You Can Do With SpendingSmart
      </h3>
      
      <div style="display: grid;">
        <div style="display: flex; margin-bottom: 10px; align-items: center; padding: 15px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; color: white;">
          <div style="font-size: 24px; margin-right: 15px;">📈</div>
          <div>
            <div style="font-weight: 600; font-size: 15px;">Track Expenses</div>
            <div style="font-size: 13px; opacity: 0.9;">Monitor your spending patterns</div>
          </div>
        </div>
        
        <div style="display: flex; margin-bottom: 10px; align-items: center; padding: 15px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 10px; color: white;">
          <div style="font-size: 24px; margin-right: 15px;">💰</div>
          <div>
            <div style="font-weight: 600; font-size: 15px;">Budget Planning</div>
            <div style="font-size: 13px; opacity: 0.9;">Set and achieve financial goals</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; padding: 15px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 10px; color: white;">
          <div style="font-size: 24px; margin-right: 15px;">📊</div>
          <div>
            <div style="font-weight: 600; font-size: 15px;">Smart Analytics</div>
            <div style="font-size: 13px; opacity: 0.9;">Get insights on your finances</div>
          </div>
        </div>
      </div>
    </div>
  `;

    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SpendingSmart</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      .email-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      @media only screen and (max-width: 600px) {
        .email-container {
          padding: 10px !important;
        }
        
        .main-table {
          width: 100% !important;
          margin: 0 !important;
        }
        
        .content-padding {
          padding: 20px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 20px; min-height: 100vh;" class="email-container">
    <table class="main-table" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 15px; border: 1px solid #ddd; overflow: hidden;">
      <tr>
        <td>
          ${commonGreeting}
        </td>
      </tr>
      
      <tr>
        <td class="content-padding" style="padding: 40px 30px;">
          <div style="color: #444; line-height: 1.6;">
            ${isByGoogle ? googleSpecificContent : regularUserContent}
            ${featuresSection}
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 18px; margin-right: 8px;">💡</span>
                <strong style="color: #2f3542; font-size: 15px;">Quick Tip</strong>
              </div>
              <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">
  Start by adding your first expense manually and take control of your finances. It's simple, quick, and helps you stay on top of your spending.
              </p>
            </div>
            
          </div>
        </td>
      </tr>
      
      <tr>
        <td style="background: linear-gradient(135deg, #2f3542 0%, #1e272e 100%); padding: 25px 30px; text-align: center; color: white;">
          <div style="margin-bottom: 15px;">
            <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 10px; font-size: 13px;">Privacy Policy</a>
            <span style="color: rgba(255,255,255,0.4);">|</span>
            <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 10px; font-size: 13px;">Terms of Service</a>
            <span style="color: rgba(255,255,255,0.4);">|</span>
            <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 10px; font-size: 13px;">Unsubscribe</a>
          </div>
          
          <div style="font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.4;">
            &copy; ${new Date().getFullYear()} SpendingSmart. All rights reserved.<br>
            <span style="font-size: 11px;">This email was sent to you because you created an account with us.</span>
          </div>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="font-size: 11px; color: rgba(255,255,255,0.5); margin: 0;">
              If you didn't create this account, please ignore this email or contact our support team.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// Email Change OTP Template Function
function change_email_otp_template(name, otp) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Change Email - OTP Verification</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fa;
                line-height: 1.6;
                color: #333;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(to right,#f97316,#fb7185,#ec4899);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            
            .message {
                font-size: 16px;
                color: #555;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            
            .otp-container {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 30px 0;
                box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
            }
            
            .otp-label {
                color: white;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }
            
            .otp-code {
                font-size: 36px;
                font-weight: 800;
                color: white;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .otp-note {
                margin-top: 15px;
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
            }
            
            .warning-box {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                display: flex;
                align-items: flex-start;
            }
            
            .warning-icon {
                color: #e17055;
                font-size: 20px;
                margin-right: 12px;
                margin-top: 2px;
            }
            
            .warning-text {
                color: #856404;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .security-tips {
                background-color: #e8f5e8;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            
            .security-tips h3 {
                color: #2d5a2d;
                font-size: 16px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
            }
            
            .security-tips ul {
                color: #2d5a2d;
                font-size: 14px;
                padding-left: 20px;
            }
            
            .security-tips li {
                margin-bottom: 8px;
            }
            
            .footer {
                background-color: #f8f9fa;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .footer p {
                color: #6c757d;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .brand-name {
                color: #667eea;
                font-weight: 600;
            }
            
            .support-link {
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
            }
            
            .support-link:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 8px;
                }
                
                .content {
                    padding: 25px 20px;
                }
                
                .header {
                    padding: 25px 15px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 4px;
                }
                
                .footer {
                    padding: 20px 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container" style="border: 1px solid #ddd;">
            <div class="header">
                <h1>🔐 Email Change Verification</h1>
                <p>Secure your account with OTP verification</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello <strong>${name}</strong>,
                </div>
                
                <div class="message">
                    You've requested to change your email address on your <span class="brand-name">SpendingSmart</span> account. 
                    To complete this process securely, please use the One-Time Password (OTP) below:
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your OTP Code</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning-box">
                    <div class="warning-icon">⚠️</div>
                    <div class="warning-text">
                        <strong>Important:</strong> If you didn't request this email change, please ignore this email and 
                        contact our support team immediately. Your account security is our priority.
                    </div>
                </div>
                
                <div class="security-tips">
                    <h3>🛡️ Security Tips:</h3>
                    <ul>
                        <li>Never share this OTP with anyone</li>
                        <li>Use this code only on the SpendingSmart platform</li>
                    </ul>
                </div>
                
                <div class="message">
                    Once you enter this OTP, your email address will be updated and you'll receive a confirmation email 
                    at your new email address.
                </div>
            </div>
            
            <div class="footer">
                <p>
                    This email was sent by <span class="brand-name">SpendingSmart</span><br>
                    If you need help, contact us at <a href="mailto:support@spendingsmart.com" class="support-link">support@spendingsmart.com</a>
                </p>
                <p style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
                    © 2025 SpendingSmart. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}


/*--------------------------------- Email templates End-------------------------*/

function nodemailer_setup() {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Your email address (e.g., spendingsmart@gmail.com)
            pass: process.env.EMAIL_PASS  // Your app password or email password
        }
    });
    return transporter;
}

async function send_mail_registration(name, email, password, isByGoogle = false) {
    const transporter = nodemailer_setup();

    const mailOptions = {
        from: `"SpendingSmart" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to SpendingSmart 🎉",
        // Fixed: Pass parameters in correct order (name, password, isByGoogle)
        html: new_registered_email_template(name, password, isByGoogle)
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log("📨 Email sent successfully to", email);
        // return { success: true, message: "Email sent successfully" };
        return true;
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
        return false;
        // return { success: false, message: error.message };
    }
}

async function send_mail_change_email_otp(name, email, otp) {
    const transporter = nodemailer_setup();
    
    const mailOptions = {
        from: `"SpendingSmart Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🔐 Verify Your Email Change - OTP Required", // Updated subject line
        html: change_email_otp_template(name, otp)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("📨 Email change OTP sent successfully to", email);
        return true;
    } catch (error) {
        console.error("❌ Failed to send email change OTP:", error.message);
        return false;
    }
}
module.exports = { send_mail_registration, send_mail_change_email_otp };