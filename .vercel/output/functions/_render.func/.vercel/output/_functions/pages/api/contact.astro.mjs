import 'resend';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request, redirect }) => {
  const formData = await request.formData();
  String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const honeypot = String(formData.get("website") || "").trim();
  if (honeypot) {
    return redirect("/contact/thanks", 303);
  }
  if (!email || !message) {
    return new Response("Email and message are required.", { status: 400 });
  }
  {
    console.error("RESEND_API_KEY env var not set on Vercel");
    return new Response("Email service not configured on the server.", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
