import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const DAY_LABELS: Record<string, string> = { mon: "월요일", tue: "화요일", wed: "수요일", thu: "목요일", fri: "금요일", sat: "토요일", sun: "일요일" };

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: site } = await supabase
    .from("websites")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!site) notFound();

  const c = site.content || {};
  const color = c.theme?.color || "#0071E3";
  const hero = c.hero || {};
  const about = c.about || {};
  const services = c.services || [];
  const hours = c.hours || {};
  const contact = c.contact || {};

  return (
    <html lang="ko">
      <head>
        <title>{site.business_name} | ilpro.ai</title>
        <meta name="description" content={hero.subtitle || `${site.business_name} - ilpro.ai`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={site.business_name} />
        <meta property="og:description" content={hero.subtitle || ""} />
        {hero.image && <meta property="og:image" content={hero.image} />}
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1D1D1F; background: #FAFAFA; -webkit-font-smoothing: antialiased; }
          a { color: inherit; text-decoration: none; }
        `}</style>
      </head>
      <body>
        {/* Hero */}
        <section style={{ background: color, position: "relative", minHeight: 280, display: "flex", alignItems: "flex-end" }}>
          {hero.image && (
            <img src={hero.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />
          )}
          <div style={{ position: "relative", padding: "40px 24px 32px", width: "100%", maxWidth: 640, margin: "0 auto" }}>
            <h1 style={{ color: "white", fontSize: 32, fontWeight: 800, lineHeight: 1.2 }}>{hero.title || site.business_name}</h1>
            {hero.subtitle && <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, marginTop: 8 }}>{hero.subtitle}</p>}
            {contact.phone && (
              <a href={`tel:${contact.phone}`}
                style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: "white", color, borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                📞 전화하기
              </a>
            )}
          </div>
        </section>

        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* About */}
          {about.text && (
            <section style={{ padding: "32px 24px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 12 }}>소개</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#56565A", whiteSpace: "pre-wrap" }}>{about.text}</p>
              {about.image && <img src={about.image} alt="" style={{ width: "100%", borderRadius: 12, marginTop: 16, objectFit: "cover" }} />}
            </section>
          )}

          {/* Services / Menu */}
          {services.filter((s: any) => s.name).length > 0 && (
            <section style={{ padding: "0 24px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 16 }}>
                {site.template === "restaurant" ? "메뉴" : "서비스"}
              </h2>
              <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {services.filter((s: any) => s.name).map((svc: any, i: number) => (
                  <div key={i} style={{ padding: "16px 20px", borderBottom: i < services.filter((s: any) => s.name).length - 1 ? "1px solid #F0F0F0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{svc.name}</div>
                      {svc.description && <div style={{ fontSize: 12, color: "#86868B", marginTop: 4 }}>{svc.description}</div>}
                    </div>
                    {svc.price && <div style={{ fontSize: 15, fontWeight: 700, color, marginLeft: 16, whiteSpace: "nowrap" }}>₩{svc.price}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hours */}
          {Object.values(hours).some((v: any) => v) && (
            <section style={{ padding: "0 24px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 16 }}>영업시간</h2>
              <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {Object.entries(DAY_LABELS).map(([key, label]) => (
                  hours[key] ? (
                    <div key={key} style={{ padding: "12px 20px", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ fontWeight: 500 }}>{label}</span>
                      <span style={{ color: hours[key] === "휴무" ? "#FF3B30" : "#56565A" }}>{hours[key]}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          {(contact.phone || contact.address || contact.email) && (
            <section style={{ padding: "0 24px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 16 }}>연락처</h2>
              <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid #F0F0F0", fontSize: 14 }}>
                    <span>📞</span><span>{contact.phone}</span>
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid #F0F0F0", fontSize: 14 }}>
                    <span>📧</span><span>{contact.email}</span>
                  </a>
                )}
                {contact.address && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid #F0F0F0", fontSize: 14 }}>
                    <span>📍</span><span>{contact.address}</span>
                  </div>
                )}
                {contact.kakao && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", fontSize: 14 }}>
                    <span>💬</span><span>카카오톡: {contact.kakao}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* CTA */}
          {contact.phone && (
            <section style={{ padding: "0 24px 32px" }}>
              <a href={`tel:${contact.phone}`}
                style={{ display: "block", textAlign: "center", padding: "16px", background: color, color: "white", borderRadius: 16, fontSize: 16, fontWeight: 700 }}>
                📞 지금 전화하기
              </a>
            </section>
          )}

          {/* Footer */}
          <footer style={{ padding: "24px", textAlign: "center", borderTop: "1px solid #E5E5EA" }}>
            <div style={{ fontSize: 12, color: "#86868B" }}>
              © {new Date().getFullYear()} {site.business_name}
            </div>
            <div style={{ fontSize: 11, color: "#AEAEB2", marginTop: 4 }}>
              Powered by <a href="https://ilpro.ai" style={{ color }}>일프로AI</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
