"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BLOG_POSTS } from "../page";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fafafa" }}>
        <div className="text-center">
          <div className="text-4xl mb-3">404</div>
          <div className="text-lg font-bold mb-2 text-[#111]">글을 찾을 수 없습니다</div>
          <Link href="/blog" className="text-sm text-[#888] hover:text-[#111]">← 블로그로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const currentIndex = BLOG_POSTS.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(250,250,250,0.9)", borderBottom: "1px solid #eee" }}>
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/blog" className="text-sm text-[#888] hover:text-[#111] transition-colors" style={{ textDecoration: "none" }}>
            ← 블로그
          </Link>
          <Link href="/auth" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#111", textDecoration: "none" }}>
            시작하기
          </Link>
        </div>
      </header>

      {/* Hero image */}
      <div className="w-full relative overflow-hidden" style={{ height: 360 }}>
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.3))" }} />
      </div>

      {/* Article */}
      <article className="max-w-[700px] mx-auto px-6 py-10">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 text-sm text-[#888]">
          <span>{post.category}</span>
          <span>&middot;</span>
          <span>{post.date}</span>
          <span>&middot;</span>
          <span>{post.readTime} 읽기</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#111] mb-3" style={{ lineHeight: 1.35 }}>
          {post.title}
        </h1>
        <p className="text-base text-[#888] mb-10">{post.subtitle}</p>

        {/* Content */}
        <div>
          {post.content.split("\n\n").map((block, i) => {
            if (block.startsWith("#### ")) return <h4 key={i} className="text-sm font-semibold mt-8 mb-2 text-[#111]">{block.replace("#### ", "")}</h4>;
            if (block.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-10 mb-3 text-[#111]">{block.replace("### ", "")}</h3>;
            if (block.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-10 mb-3 text-[#111]">{block.replace("## ", "")}</h2>;

            if (block.startsWith("> ")) return (
              <div key={i} className="rounded-lg p-4 my-6" style={{ background: "#f0f0f0", borderLeft: "3px solid #ccc" }}>
                <p className="text-sm text-[#555]">{block.replace(/^> /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</p>
              </div>
            );

            if (block.includes("| ") && block.includes(" |")) {
              const rows = block.split("\n").filter(r => !r.match(/^\|[-|]+\|$/));
              return (
                <div key={i} className="overflow-x-auto my-6">
                  <table className="w-full text-sm" style={{ border: "1px solid #eee" }}>
                    <tbody>
                      {rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri === 0 ? "#f5f5f5" : "white" }}>
                          {row.split("|").filter(Boolean).map((cell, ci) => (
                            ri === 0 ?
                              <th key={ci} className="px-4 py-2.5 text-left text-xs font-semibold text-[#888]">{cell.trim()}</th> :
                              <td key={ci} className="px-4 py-2.5 text-sm text-[#333]" style={{ borderTop: "1px solid #eee" }}>{cell.trim()}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            if (block.match(/^- /m)) {
              const items = block.split("\n").filter(l => l.startsWith("- "));
              return (
                <ul key={i} className="space-y-2 my-4 pl-1">
                  {items.map((item, li) => (
                    <li key={li} className="flex gap-2 text-sm text-[#333] leading-relaxed">
                      <span className="text-[#ccc] shrink-0">—</span>
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    </li>
                  ))}
                </ul>
              );
            }

            if (block.match(/^\d+\. /m)) {
              const items = block.split("\n").filter(l => l.match(/^\d+\. /));
              return (
                <ol key={i} className="space-y-2 my-4 pl-1">
                  {items.map((item, li) => (
                    <li key={li} className="flex gap-2 text-sm text-[#333] leading-relaxed">
                      <span className="text-[#999] shrink-0 font-medium">{li + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    </li>
                  ))}
                </ol>
              );
            }

            return (
              <p key={i} className="text-sm leading-[1.8] my-4 text-[#333]"
                dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#111;text-decoration:underline">$1</a>') }} />
            );
          })}
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mt-10 mb-10">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full text-[#888]" style={{ background: "#f0f0f0" }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px my-8" style={{ background: "#eee" }} />

        {/* CTA */}
        <div className="rounded-xl p-8 text-center" style={{ background: "#111" }}>
          <div className="text-white font-bold text-base mb-2">직접 체험해보세요</div>
          <div className="text-[#666] text-sm mb-5">무료 회원가입 후 바로 사용 가능합니다</div>
          <Link href="/auth" className="inline-block px-6 py-3 rounded-lg text-sm font-semibold text-[#111]" style={{ background: "white", textDecoration: "none" }}>
            무료로 시작하기
          </Link>
        </div>

        {/* Prev / Next */}
        <div className="flex gap-4 mt-10">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className="flex-1 rounded-lg p-4 group hover:bg-white transition-colors" style={{ border: "1px solid #eee", textDecoration: "none" }}>
              <div className="text-xs text-[#bbb] mb-1">← 이전</div>
              <div className="text-sm font-medium text-[#333] group-hover:text-[#111] transition-colors">{prevPost.title}</div>
            </Link>
          ) : <div className="flex-1" />}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className="flex-1 rounded-lg p-4 text-right group hover:bg-white transition-colors" style={{ border: "1px solid #eee", textDecoration: "none" }}>
              <div className="text-xs text-[#bbb] mb-1">다음 →</div>
              <div className="text-sm font-medium text-[#333] group-hover:text-[#111] transition-colors">{nextPost.title}</div>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </article>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-[#bbb]" style={{ borderTop: "1px solid #eee" }}>
        &copy; 2026 일프로AI
      </footer>
    </div>
  );
}
