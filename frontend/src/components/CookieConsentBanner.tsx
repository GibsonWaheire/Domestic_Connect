import CookieConsent from "react-cookie-consent";
import { Link } from "react-router-dom";

export function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      cookieName="dc_cookie_consent"
      sameSite="Lax"
      expires={365}
      style={{
        background: "#111827",
        alignItems: "center",
        padding: "12px 16px",
        gap: "12px",
        flexWrap: "wrap",
      }}
      buttonStyle={{
        background: "#f9fafb",
        color: "#111827",
        fontWeight: 600,
        fontSize: "14px",
        padding: "8px 16px",
        borderRadius: "8px",
      }}
      contentStyle={{ flex: "1 1 280px", margin: 0 }}
    >
      <span className="text-sm text-gray-100 leading-snug">
        We use essential cookies for sign-in (including third-party providers) and to remember UI preferences.
        By continuing you agree as described in our{" "}
        <Link to="/privacy-policy" className="underline font-medium text-white hover:text-gray-200">
          Privacy Policy
        </Link>
        .
      </span>
    </CookieConsent>
  );
}
