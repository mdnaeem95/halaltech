// src/lib/email/service.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendFreelancerApprovalEmail(
  email: string,
  name: string
) {
  try {
    await resend.emails.send({
      from: 'noreply@yourplatform.com',
      to: email,
      subject: 'Your Freelancer Application Has Been Approved!',
      html: `
        <h2>Congratulations ${name}!</h2>
        <p>Your freelancer application has been approved. You can now complete your profile and start accepting projects.</p>
        <p>Please log in to your account to complete the onboarding process.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/freelancers/onboarding">Complete Your Profile</a>
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
      from: 'noreply@yourplatform.com',
      to: email,
      subject: 'Update on Your Freelancer Application',
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for your interest in joining our freelancer network.</p>
        <p>After careful review, we are unable to approve your application at this time.</p>
        ${reason ? `<p>Feedback: ${reason}</p>` : ''}
        <p>You're welcome to reapply in the future as our needs evolve.</p>
      `
    })
  } catch (error) {
    console.error('Failed to send rejection email:', error)
  }
}