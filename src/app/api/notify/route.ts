import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? "");
  try {
    const { carName, fullName, email, phone, fromDate, toDate, message } =
      await req.json();

    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("sr-Latn-ME", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    const days = Math.max(
      1,
      Math.ceil(
        (new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86_400_000,
      ),
    );

    await resend.emails.send({
      from: "Rent a Car 55 <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL!,
      subject: `🚗 Nova rezervacija — ${carName}`,
      html: `
<!DOCTYPE html>
<html lang="sr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:28px 28px 20px;margin-bottom:16px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f59e0b;">Rent a Car 55</p>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Nova rezervacija</h1>
      <p style="margin:8px 0 0;font-size:13px;color:#71717a;">Stigla je nova rezervacija. Prijavi se u admin panel da je potvrdiš.</p>
    </div>

    <!-- Car + dates -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:24px 28px;margin-bottom:16px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f59e0b;">Vozilo</p>
      <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${carName}</p>

      <div style="margin-top:20px;display:flex;gap:16px;">
        <div style="flex:1;background:#09090b;border-radius:10px;padding:14px;">
          <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:0.1em;">Preuzimanje</p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${fmt(fromDate)}</p>
        </div>
        <div style="flex:1;background:#09090b;border-radius:10px;padding:14px;">
          <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:0.1em;">Vraćanje</p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${fmt(toDate)}</p>
        </div>
        <div style="background:#09090b;border-radius:10px;padding:14px;min-width:70px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:0.1em;">Dana</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#f59e0b;">${days}</p>
        </div>
      </div>
    </div>

    <!-- Customer -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:24px 28px;margin-bottom:16px;">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f59e0b;">Korisnik</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#52525b;width:90px;">Ime</td>
          <td style="padding:6px 0;font-size:14px;color:#ffffff;font-weight:600;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#52525b;">Telefon</td>
          <td style="padding:6px 0;font-size:14px;color:#ffffff;font-weight:600;">${phone}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#52525b;">Email</td>
          <td style="padding:6px 0;font-size:14px;color:#ffffff;">${email}</td>
        </tr>
        ${
          message
            ? `<tr>
          <td style="padding:6px 0;font-size:12px;color:#52525b;vertical-align:top;">Poruka</td>
          <td style="padding:6px 0;font-size:14px;color:#a1a1aa;">${message}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;padding:8px 0 24px;">
      <a href="https://www.55rentacar.me/admin/login?k=rentacar55"
         style="display:inline-block;background:#f59e0b;color:#000000;font-weight:700;font-size:14px;padding:14px 32px;border-radius:999px;text-decoration:none;">
        Otvori Admin Panel →
      </a>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:11px;color:#3f3f46;margin:0;">
      Rent a Car 55 · Nikšić, Crna Gora
    </p>

  </div>
</body>
</html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
