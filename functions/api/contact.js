// Cloudflare Pages Function — POST /api/contact
// Handles booking/contact submissions from the form on /contact/.
//
// Required env vars (set in Cloudflare Pages → Settings → Environment variables):
//   RESEND_API_KEY  Resend API token (https://resend.com/api-keys)
//   CONTACT_TO      Recipient address, e.g. marc@vankessel-it.com
//   CONTACT_FROM    Verified sender, e.g. "Spoor 7 website <noreply@spoor7coverband.nl>"

export async function onRequestPost({ request, env }) {
  const ct = request.headers.get("content-type") || "";
  let raw;
  try {
    if (ct.includes("application/json")) {
      raw = await request.json();
    } else {
      const fd = await request.formData();
      raw = Object.fromEntries(fd);
    }
  } catch {
    return json({ ok: false, error: "Ongeldige aanvraag." }, 400);
  }

  const name     = str(raw.name).slice(0, 200);
  const email    = str(raw.email).slice(0, 200);
  const phone    = str(raw.phone).slice(0, 60);
  const occasion = str(raw.occasion).slice(0, 200);
  const message  = str(raw.message).slice(0, 5000);
  const honey    = str(raw.website);

  if (honey) return json({ ok: true });

  if (!name || !email || !message) {
    return json({ ok: false, error: "Vul a.u.b. alle verplichte velden in." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Ongeldig e-mailadres." }, 400);
  }

  const safeName = name.replace(/[\r\n]+/g, " ");
  const lines = [
    `Naam: ${name}`,
    `E-mail: ${email}`,
    phone ? `Telefoon: ${phone}` : null,
    occasion ? `Gelegenheid/datum: ${occasion}` : null,
    "",
    message,
  ].filter((x) => x !== null);

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `Boekingsaanvraag: ${safeName}`,
      text: lines.join("\n"),
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    console.error("Resend error", resp.status, detail);
    return json(
      { ok: false, error: "Verzenden mislukt, probeer het later opnieuw of mail direct naar marc@vankessel-it.com." },
      502,
    );
  }

  return json({ ok: true });
}

export function onRequest() {
  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
