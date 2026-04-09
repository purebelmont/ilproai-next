"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BLOG_POSTS } from "../page";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg, #F9F9FB)" }}>
        <div className="text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-lg font-bold mb-2">글을 찾을 수 없습니다</div>
          <Link href="/blog" className="text-sm font-semibold" style={{ color: "#7D2AE7" }}>← 블로그로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const currentIndex = BLOG_POSTS.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg, #F9F9FB)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.85)", borderBottom: "1px solid var(--border, #E5E5EA)" }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sm font-medium" style={{ color: "#7D2AE7", textDecoration: "none" }}>
            ← 블로그
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "#7D2AE7", textDecoration: "none" }}>
            무료로 시작하기
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-5 py-8">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{post.icon}</span>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-bold text-white" style={{ background: post.categoryColor }}>
            {post.category}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted, #56565A)" }}>{post.date}</span>
          <span className="text-xs" style={{ color: "var(--text-muted, #56565A)" }}>{post.readTime} 읽기</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ color: "var(--text, #1D1D1F)", lineHeight: 1.3 }}>
          {post.title}
        </h1>
        <p className="text-base mb-8" style={{ color: "var(--text-muted, #56565A)" }}>
          {post.subtitle}
        </p>

        {/* Color divider */}
        <div className="h-1 rounded-full mb-8" style={{ background: `linear-gradient(90deg, ${post.categoryColor}, ${post.categoryColor}40)` }} />

        {/* Content — rendered as styled markdown */}
        <div className="prose-ilpro">
          {post.content.split("\n\n").map((block, i) => {
            // Headings
            if (block.startsWith("#### ")) return <h4 key={i} className="text-sm font-bold mt-6 mb-2" style={{ color: "var(--text, #1D1D1F)" }}>{block.replace("#### ", "")}</h4>;
            if (block.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-8 mb-3" style={{ color: "var(--text, #1D1D1F)" }}>{block.replace("### ", "")}</h3>;
            if (block.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--text, #1D1D1F)" }}>{block.replace("## ", "")}</h2>;

            // Blockquote
            if (block.startsWith("> ")) return (
              <div key={i} className="rounded-xl p-4 my-4" style={{ background: "linear-gradient(135deg, rgba(125,42,231,0.08), rgba(0,113,227,0.08))", borderLeft: "3px solid #7D2AE7" }}>
                <p className="text-sm" style={{ color: "var(--text, #1D1D1F)" }}>{block.replace(/^> /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</p>
              </div>
            );

            // Table
            if (block.includes("| ") && block.includes(" |")) {
              const rows = block.split("\n").filter(r => !r.match(/^\|[-|]+\|$/));
              return (
                <div key={i} className="overflow-x-auto my-4">
                  <table className="w-full text-sm rounded-xl overflow-hidden" style={{ border: "1px solid var(--border, #E5E5EA)" }}>
                    <tbody>
                      {rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri === 0 ? "var(--bg-card, #F5F5F7)" : "white" }}>
                          {row.split("|").filter(Boolean).map((cell, ci) => (
                            ri === 0 ?
                              <th key={ci} className="px-4 py-2.5 text-left text-xs font-bold" style={{ color: "var(--text-muted, #56565A)" }}>{cell.trim()}</th> :
                              <td key={ci} className="px-4 py-2.5 text-xs" style={{ color: "var(--text, #1D1D1F)", borderTop: "1px solid var(--border, #E5E5EA)" }}>{cell.trim()}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            // List items
            if (block.match(/^- /m)) {
              const items = block.split("\n").filter(l => l.startsWith("- "));
              return (
                <ul key={i} className="space-y-2 my-4">
                  {items.map((item, li) => (
                    <li key={li} className="flex gap-2 text-sm" style={{ color: "var(--text, #1D1D1F)" }}>
                      <span className="text-[#7D2AE7] shrink-0">•</span>
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    </li>
                  ))}
                </ul>
              );
            }

            // Numbered list
            if (block.match(/^\d+\. /m)) {
              const items = block.split("\n").filter(l => l.match(/^\d+\. /));
              return (
                <ol key={i} className="space-y-2 my-4">
                  {items.map((item, li) => (
                    <li key={li} className="flex gap-2 text-sm" style={{ color: "var(--text, #1D1D1F)" }}>
                      <span className="font-bold shrink-0" style={{ color: "#7D2AE7" }}>{li + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    </li>
                  ))}
                </ol>
              );
            }

            // Regular paragraph
            return (
              <p key={i} className="text-sm leading-relaxed my-3" style={{ color: "var(--text, #1D1D1F)" }}
                dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#7D2AE7;text-decoration:underline">$1</a>') }} />
            );
          })}
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mt-8 mb-8">
          {post.tags.map(tag => (
            <span key={tag} className="text-[11px] px-3 py-1 rounded-full font-medium" style={{ background: "var(--bg-card, #F5F5F7)", color: "var(--text-muted, #56565A)", border: "1px solid var(--border, #E5E5EA)" }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-6 text-center mb-8" style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>
          <div className="text-xl mb-2">✨</div>
          <div className="text-white font-bold text-base mb-1">지금 바로 체험해보세요</div>
          <div className="text-white/70 text-xs mb-4">무료 회원가입 후 모든 기본 기능을 사용할 수 있습니다</div>
          <Link href="/auth" className="inline-block px-6 py-3 rounded-xl text-sm font-bold bg-white" style={{ color: "#7D2AE7", textDecoration: "none" }}>
            무료로 시작하기 →
          </Link>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex gap-4">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className="flex-1 rounded-xl p-4 group" style={{ background: "var(--bg-card, white)", border: "1px solid var(--border, #E5E5EA)", textDecoration: "none" }}>
              <div className="text-[10px] font-medium mb-1" style={{ color: "var(--text-muted, #56565A)" }}>← 이전</div>
              <div className="text-xs font-bold group-hover:text-[#7D2AE7] transition-colors" style={{ color: "var(--text, #1D1D1F)" }}>{prevPost.title}</div>
            </Link>
          ) : <div className="flex-1" />}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className="flex-1 rounded-xl p-4 text-right group" style={{ background: "var(--bg-card, white)", border: "1px solid var(--border, #E5E5EA)", textDecoration: "none" }}>
              <div className="text-[10px] font-medium mb-1" style={{ color: "var(--text-muted, #56565A)" }}>다음 →</div>
              <div className="text-xs font-bold group-hover:text-[#7D2AE7] transition-colors" style={{ color: "var(--text, #1D1D1F)" }}>{nextPost.title}</div>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </article>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-xs" style={{ color: "var(--text-muted, #56565A)", borderTop: "1px solid var(--border, #E5E5EA)" }}>
        <p>&copy; 2026 일프로AI. 소상공인과 중소기업을 위한 AI 업무자동화 플랫폼.</p>
      </footer>
    </div>
  );
}
