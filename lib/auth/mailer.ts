type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function hasRealEnvValue(value: string | undefined) {
  return Boolean(value && !value.includes("..."));
}

function getFromAddress() {
  return process.env.AUTH_EMAIL_FROM || "Mintomics <noreply@mintomics.com>";
}

export async function sendAuthEmail({ to, subject, html, text }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (hasRealEnvValue(apiKey)) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Email delivery failed: ${body}`);
    }

    return;
  }

  console.warn("[Mintomics] Auth email not sent because RESEND_API_KEY is missing.");
  console.info("[Mintomics] To:", to);
  console.info("[Mintomics] Subject:", subject);
  console.info("[Mintomics] Text:", text);
}
