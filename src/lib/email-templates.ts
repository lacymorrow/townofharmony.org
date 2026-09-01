import { siteConfig } from "@/config/site-config";
import { settings } from "@/data/town/settings";

export const esc = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const BRAND = {
	primary: "#3D5038",
	accent: "#C9B57E",
	bg: "#F9F6F0",
	footer: "#1E2118",
	text: "#2D2A24",
	muted: "#635E56",
};

const layout = (body: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:Georgia,serif;color:${BRAND.text};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #DDD7CC;">

        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND.primary};padding:28px 32px;">
            <p style="margin:0;color:${BRAND.accent};font-size:11px;letter-spacing:2px;text-transform:uppercase;">${siteConfig.name} · North Carolina</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:22px;font-weight:normal;">Official Town Website</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:${BRAND.footer};padding:24px 32px;">
            <p style="margin:0 0 8px;color:#aaa;font-size:12px;">${siteConfig.name} — Official Contact Information</p>
            <p style="margin:0 0 4px;color:#ccc;font-size:12px;">${settings.contactInfo.address}</p>
            <p style="margin:0 0 4px;color:#ccc;font-size:12px;">Phone: ${settings.contactInfo.phone} &nbsp;|&nbsp; Email: ${siteConfig.email.support}</p>
            <p style="margin:0;color:#888;font-size:11px;">Office Hours: ${settings.officeHours.weekday}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`.trim();

const row = (label: string, value: string) =>
	`<tr>
    <td style="padding:6px 16px 6px 0;font-size:14px;color:${BRAND.muted};vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:${BRAND.text};vertical-align:top;">${value}</td>
  </tr>`;

export function contactConfirmationEmail(opts: {
	name: string;
	contactInfo?: string;
	message: string;
}): string {
	const safeName = esc(opts.name);
	const safeContact = opts.contactInfo ? esc(opts.contactInfo) : null;
	const safeMessage = esc(opts.message).replace(/\n/g, "<br>");

	const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:normal;color:${BRAND.primary};">Thank You for Reaching Out</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.text};">
      Dear ${safeName}, we have received your message and a member of our team will follow up within <strong>2 business days</strong>.
    </p>

    <h3 style="margin:0 0 10px;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">Your Submission</h3>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row("Name:", safeName)}
      ${safeContact ? row("Contact:", safeContact) : ""}
      ${row("Message:", safeMessage)}
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:${BRAND.muted};">Need to reach us sooner?</p>
    <p style="margin:0;font-size:14px;color:${BRAND.text};">
      Call us at <strong>${settings.contactInfo.phone}</strong> or email <a href="mailto:${siteConfig.email.support}" style="color:${BRAND.primary};">${siteConfig.email.support}</a> during office hours.
    </p>
  `;

	return layout(body);
}

export function townContactConfirmationEmail(opts: {
	firstName: string;
	lastName?: string;
	email?: string;
	phone?: string;
	inquiryType: string;
	message: string;
}): string {
	const safeName = [esc(opts.firstName), opts.lastName ? esc(opts.lastName) : ""]
		.filter(Boolean)
		.join(" ");
	const safeEmail = opts.email ? esc(opts.email) : null;
	const safePhone = opts.phone ? esc(opts.phone) : null;
	const safeInquiry = esc(opts.inquiryType);
	const safeMessage = esc(opts.message).replace(/\n/g, "<br>");

	const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:normal;color:${BRAND.primary};">Your Inquiry Has Been Received</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.text};">
      Dear ${safeName}, thank you for contacting the ${siteConfig.name}. We will respond to your inquiry within <strong>2 business days</strong>.
    </p>

    <h3 style="margin:0 0 10px;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">Your Submission</h3>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row("Name:", safeName)}
      ${safeEmail ? row("Email:", safeEmail) : ""}
      ${safePhone ? row("Phone:", safePhone) : ""}
      ${row("Inquiry Type:", safeInquiry)}
      ${row("Message:", safeMessage)}
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:${BRAND.muted};">Need immediate assistance?</p>
    <p style="margin:0;font-size:14px;color:${BRAND.text};">
      Call us at <strong>${settings.contactInfo.phone}</strong>, email <a href="mailto:${siteConfig.email.support}" style="color:${BRAND.primary};">${siteConfig.email.support}</a>, or visit us at ${settings.contactInfo.address} during office hours (${settings.officeHours.weekday}).
    </p>
  `;

	return layout(body);
}

export function contactNotificationEmail(opts: {
	name: string;
	contactInfo?: string;
	message: string;
	newsletter: boolean;
}): string {
	const safeName = esc(opts.name);
	const safeContact = opts.contactInfo ? esc(opts.contactInfo) : null;
	const safeMessage = esc(opts.message).replace(/\n/g, "<br>");

	const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:normal;color:${BRAND.primary};">New Contact Form Submission</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.text};">
      A visitor has submitted the contact form on the ${siteConfig.name} website.
    </p>

    <h3 style="margin:0 0 10px;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">Submission Details</h3>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row("Name:", safeName)}
      ${safeContact ? row("Contact:", safeContact) : ""}
      ${row("Newsletter:", opts.newsletter ? "Yes" : "No")}
      ${row("Message:", safeMessage)}
    </table>
  `;

	return layout(body);
}

export function townContactNotificationEmail(opts: {
	firstName: string;
	lastName?: string;
	email?: string;
	phone?: string;
	inquiryType: string;
	message: string;
}): string {
	const safeName = [esc(opts.firstName), opts.lastName ? esc(opts.lastName) : ""]
		.filter(Boolean)
		.join(" ");
	const safeEmail = opts.email ? esc(opts.email).replace(/"/g, "&quot;") : null;
	const safePhone = opts.phone ? esc(opts.phone) : null;
	const safeInquiry = esc(opts.inquiryType);
	const safeMessage = esc(opts.message).replace(/\n/g, "<br>");

	const replyHint = safeEmail
		? "Reply to this email to respond directly."
		: safePhone
			? "The visitor did not provide an email — call the phone number below to respond."
			: "";

	const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:normal;color:${BRAND.primary};">New Contact Form Submission</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.text};">
      A visitor has submitted the contact form on the ${siteConfig.name} website.${replyHint ? ` ${replyHint}` : ""}
    </p>

    <h3 style="margin:0 0 10px;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">Submission Details</h3>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row("Name:", safeName)}
      ${safeEmail ? row("Email:", `<a href="mailto:${safeEmail}" style="color:${BRAND.primary};">${safeEmail}</a>`) : ""}
      ${safePhone ? row("Phone:", safePhone) : ""}
      ${row("Inquiry Type:", safeInquiry)}
      ${row("Message:", safeMessage)}
    </table>
  `;

	return layout(body);
}

interface CommunityCenterReservationEmailOpts {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	requestedDate: string;
	requestedTime: string;
	eventPurpose: string;
	expectedAttendance: number;
	notes?: string;
}

const reservationDetailRows = (opts: CommunityCenterReservationEmailOpts): string => {
	const safeName = `${esc(opts.firstName)} ${esc(opts.lastName)}`;
	const safeEmail = esc(opts.email).replace(/"/g, "&quot;");
	const safePhone = opts.phone ? esc(opts.phone) : null;
	const safeDate = esc(opts.requestedDate);
	const safeTime = esc(opts.requestedTime);
	const safePurpose = esc(opts.eventPurpose).replace(/\n/g, "<br>");
	const safeNotes = opts.notes ? esc(opts.notes).replace(/\n/g, "<br>") : null;
	const attendance = String(opts.expectedAttendance);
	return `
      ${row("Name:", safeName)}
      ${row("Email:", `<a href="mailto:${safeEmail}" style="color:${BRAND.primary};">${safeEmail}</a>`)}
      ${safePhone ? row("Phone:", safePhone) : ""}
      ${row("Requested Date:", safeDate)}
      ${row("Requested Time:", safeTime)}
      ${row("Expected Attendance:", attendance)}
      ${row("Event / Purpose:", safePurpose)}
      ${safeNotes ? row("Additional Notes:", safeNotes) : ""}
	`;
};

export function communityCenterReservationNotificationEmail(
	opts: CommunityCenterReservationEmailOpts
): string {
	const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:normal;color:${BRAND.primary};">New Community Center Reservation Request</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.text};">
      A resident has requested to reserve the Harmony Community Center. Reply to this email to respond directly.
    </p>

    <h3 style="margin:0 0 10px;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">Reservation Details</h3>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${reservationDetailRows(opts)}
    </table>

    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Reservation is not confirmed until Town Hall reviews the request, collects payment, and communicates approval.
    </p>
  `;

	return layout(body);
}

export function communityCenterReservationConfirmationEmail(
	opts: CommunityCenterReservationEmailOpts
): string {
	const safeName = `${esc(opts.firstName)} ${esc(opts.lastName)}`;
	const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:normal;color:${BRAND.primary};">Reservation Request Received</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.text};">
      Dear ${safeName}, thank you for your Community Center reservation request. A member of Town Hall will follow up within <strong>2 business days</strong> to confirm availability, collect the rental application and payment, and finalize your reservation.
    </p>

    <h3 style="margin:0 0 10px;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">Your Request</h3>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${reservationDetailRows(opts)}
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:${BRAND.muted};">Need immediate assistance?</p>
    <p style="margin:0;font-size:14px;color:${BRAND.text};">
      Call us at <strong>${settings.contactInfo.phone}</strong>, email <a href="mailto:${siteConfig.email.support}" style="color:${BRAND.primary};">${siteConfig.email.support}</a>, or visit us at ${settings.contactInfo.address} during office hours (${settings.officeHours.weekday}).
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">
      Please note: submitting this form does not guarantee a reservation. Availability is subject to Town Hall confirmation.
    </p>
  `;

	return layout(body);
}
