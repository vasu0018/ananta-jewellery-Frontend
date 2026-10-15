import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { formatDate } from "@/lib/format";
import type { BlogPostCard } from "@/lib/types";

/** Reader-facing name for a post type. */
export const postKind = (type?: string) => (type === "LOOKBOOK" ? "Lookbook" : "Journal");

export function PostCard({ post, large }: { post: BlogPostCard; large?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className={`relative overflow-hidden rounded-[var(--radius-card)] bg-cream ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Img src={post.coverImage} alt={post.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
          {postKind(post.type)}
          {post.publishedAt && <span className="text-muted"> · {formatDate(post.publishedAt)}</span>}
        </p>
        <h3 className={`mt-2 font-display font-medium leading-snug text-ink transition group-hover:text-rose-dark ${large ? "text-3xl" : "text-[22px]"}`}>{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
