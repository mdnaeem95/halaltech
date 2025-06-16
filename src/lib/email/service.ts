// src/lib/email/service.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendFreelancerApplicationEmail(
  email: string,
  name: string,
  includePasswordSetup: boolean = false
) {
  try {
    const subject = 'Application Received - TechHalal Freelancer Network'
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Applying!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>We've received your application to join the TechHalal Freelancer Network. Thank you for your interest in helping Muslim-owned businesses in Singapore succeed online!</p>
              
              ${includePasswordSetup ? `
                <div class="info-box">
                  <h3>🔐 Account Created - Action Required</h3>
                  <p>We've created an account for you. Please check your email for a <strong>password reset link</strong> to set up your password. The email should arrive within a few minutes.</p>
                  <p><strong>Can't find the email?</strong> Check your spam folder or visit our website to request a new password reset link.</p>
                </div>
              ` : ''}
              
              <h3>What happens next?</h3>
              <ol>
                <li><strong>Application Review:</strong> Our team will review your application within 2-3 business days.</li>
                <li><strong>Email Notification:</strong> You'll receive an email with our decision.</li>
                <li><strong>Profile Setup:</strong> If approved, you'll be able to complete your freelancer profile and start receiving project opportunities.</li>
              </ol>
              
              <h3>Your Application Details:</h3>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</li>
                <li><strong>Status:</strong> Under Review</li>
              </ul>
              
              <p>If you have any questions about your application, please don't hesitate to contact our support team.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Visit TechHalal</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 TechHalal. Empowering Muslim-owned businesses in Singapore.</p>
              <p>This email was sent to ${email} because you submitted a freelancer application.</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'TechHalal <noreply@techhalal.sg>',
      to: email,
      subject,
      html,
    })
    
    console.log(`Application confirmation email sent to ${email}`)
  } catch (error) {
    console.error('Failed to send application email:', error)
    throw error
  }
}

export async function sendFreelancerApprovalEmail(
  email: string,
  name: string
) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'TechHalal <noreply@techhalal.sg>',
      to: email,
      subject: 'Your Freelancer Application Has Been Approved!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .success-box { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations!</h1>
              </div>
              <div class="content">
                <h2>Hello ${name},</h2>
                
                <div class="success-box">
                  <p><strong>Great news!</strong> Your freelancer application has been approved. Welcome to the TechHalal Freelancer Network!</p>
                </div>
                
                <p>You can now:</p>
                <ul>
                  <li>Complete your freelancer profile</li>
                  <li>Set your hourly rates and availability</li>
                  <li>Start receiving project opportunities</li>
                  <li>Connect with Muslim-owned businesses in Singapore</li>
                </ul>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/freelancers/onboarding" class="button">Complete Your Profile</a>
                </div>
                
                <p>We're excited to have you as part of our mission to empower Muslim-owned businesses through technology!</p>
              </div>
            </div>
          </body>
        </html>
      `
    })
  } catch (error) {
    console.error('Failed to send approval email:', error)
  }
}

export async function sendFreelancerRejectionEmail(
  email: string,
  name: string,
  reason?: string
) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'TechHalal <noreply@techhalal.sg>',
      to: email,
      subject: 'Update on Your Freelancer Application',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #6c757d; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Application Update</h1>
              </div>
              <div class="content">
                <h2>Hello ${name},</h2>
                
                <p>Thank you for your interest in joining the TechHalal Freelancer Network.</p>
                
                <div class="info-box">
                  <p>After careful review, we are unable to approve your application at this time.</p>
                  ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}
                </div>
                
                <p>This decision isn't necessarily final. As our platform grows and our needs evolve, we encourage you to:</p>
                <ul>
                  <li>Continue developing your skills and portfolio</li>
                  <li>Gain more experience with Muslim-owned businesses</li>
                  <li>Reapply in the future when you feel ready</li>
                </ul>
                
                <p>We appreciate your understanding and wish you the best in your professional journey.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })
  } catch (error) {
    console.error('Failed to send rejection email:', error)
  }
}