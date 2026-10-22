"use client";

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { BadgeCheck, Camera, ImagePlus, Loader2, MessageSquareQuote, Star, ThumbsUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PointerSelect } from "@/components/ui/PointerSelect";
import { Img } from "@/components/ui/Img";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton, Stars } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/auth";
import type { PageMeta, Review, ReviewSummary } from "@/lib/types";

type ReviewPage = { items: Review[]; meta: PageMeta; summary: ReviewSummary };

const HELPFUL_KEY = "aj-helpful";

function RatingInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <div className="flex items-center gap-3">
      <div className="flex" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)} className="p-0.5" aria-label={`${n} star${n > 1 ? "s" : ""}`}>
            <Star className={cn("size-8 transition", (hover || value) >= n ? "fill-gold text-gold" : "text-line-strong")} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted">{labels[hover || value]}</span>
    </div>
  );
}

function WriteReview({ productId, open, onOpenChange }: { productId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const submit = useMutation({
    mutationFn: () => api<{ message: string }>(`/catalog/products/${productId}/reviews`, { body: { rating, title: title || undefined, body, images } }),
    onSuccess: (r) => {
      toast.success(r.message);
      onOpenChange(false);
      setRating(0);
      setTitle("");
      setBody("");
      setImages([]);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 5 - images.length)) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await api<{ url: string }>("/uploads/review", { body: fd });
        setImages((prev) => [...prev, r.url]);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Write a review"
      description="Share how it looks, feels and fits — it helps other shoppers."
      footer={
        <Button block loading={submit.isPending} disabled={!rating || body.trim().length < 10 || uploading} onClick={() => submit.mutate()}>
          Submit review
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="label">Your rating</p>
          <RatingInput value={rating} onChange={setRating} />
        </div>
        <div>
          <label className="label" htmlFor="rv-title">
            Headline <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="rv-title" className="field" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sums it up in a few words" />
        </div>
        <div>
          <label className="label" htmlFor="rv-body">
            Your review
          </label>
          <textarea id="rv-body" className="field" rows={5} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you like? How's the finish and fit?" />
          <p className="mt-1 text-xs text-muted">{body.trim().length < 10 ? `At least ${10 - body.trim().length} more characters` : `${body.length}/2000`}</p>
        </div>
        <div>
          <p className="label">Add photos <span className="font-normal text-muted">(up to 5)</span></p>
          <div className="flex flex-wrap gap-2">
            {images.map((src) => (
              <div key={src} className="relative size-20 overflow-hidden rounded-xl bg-cream">
                <Img src={src} alt="" fill sizes="80px" className="object-cover" />
                <button type="button" onClick={() => setImages(images.filter((i) => i !== src))} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white/90 text-ink" aria-label="Remove photo">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="grid size-20 cursor-pointer place-items-center rounded-xl border border-dashed border-line-strong text-muted transition hover:border-ink hover:text-ink">
                {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => void upload(e.target.files)} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

/** Ratings summary, filterable review list, helpful votes and the write-a-review sheet. */
export function Reviews({ productId, slug, summary }: { productId: string; slug: string; summary: ReviewSummary }) {
  const status = useAuth((s) => s.status);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | null>(null);
  const [photos, setPhotos] = useState(false);
  const [sort, setSort] = useState("recent");
  const [writing, setWriting] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [helpful, setHelpful] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HELPFUL_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  const query = useQuery({
    queryKey: ["reviews", productId, page, rating, photos, sort],
    queryFn: () =>
      api<ReviewPage>(`/catalog/products/${productId}/reviews?page=${page}&limit=6&sort=${sort}${rating ? `&rating=${rating}` : ""}${photos ? "&photos=1" : ""}`),
    placeholderData: keepPreviousData,
    enabled: summary.total > 0,
  });

  const markHelpful = async (id: string) => {
    if (helpful.includes(id)) return;
    const next = [...helpful, id];
    setHelpful(next);
    localStorage.setItem(HELPFUL_KEY, JSON.stringify(next.slice(-200)));
    await api(`/catalog/reviews/${id}/helpful`, { method: "POST" }).catch(() => undefined);
    void query.refetch();
  };

  const openWriter = () => setWriting(true);
  const filter = (r: number | null) => {
    setRating(r);
    setPage(1);
  };

  return (
    <section id="reviews" className="scroll-mt-40 border-t border-line pt-14">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 className="font-display text-3xl text-ink">Customer reviews</h2>
          {summary.total > 0 ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                <span className="font-display text-6xl font-medium text-ink">{summary.average.toFixed(1)}</span>
                <div>
                  <Stars value={summary.average} size={18} />
                  <p className="mt-1 text-sm text-muted">Based on {summary.total} reviews</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {summary.distribution.map((d) => {
                  const pct = summary.total ? Math.round((d.count / summary.total) * 100) : 0;
                  return (
                    <button
                      key={d.rating}
                      type="button"
                      onClick={() => filter(rating === d.rating ? null : d.rating)}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-sm transition hover:bg-cream", rating === d.rating && "bg-cream")}
                      disabled={!d.count}
                    >
                      <span className="flex w-8 items-center gap-0.5 text-ink-soft">
                        {d.rating} <Star className="size-3 fill-gold text-gold" />
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                        <span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-8 text-right text-xs text-muted">{d.count}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">No reviews yet — be the first to share your thoughts.</p>
          )}
          <div className="mt-6">
            {status === "authenticated" ? (
              <Button variant="outline" block onClick={openWriter}>
                Write a review
              </Button>
            ) : (
              <Button asChild variant="outline" block>
                <Link href={`/login?next=${encodeURIComponent(`/products/${slug}#reviews`)}`}>Sign in to write a review</Link>
              </Button>
            )}
          </div>
        </div>

        <div>
          {summary.total > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhotos(!photos);
                  setPage(1);
                }}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition", photos ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft hover:border-ink")}
              >
                <Camera className="size-3.5" /> With photos
              </button>
              {rating && (
                <button type="button" onClick={() => filter(null)} className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3.5 py-1.5 text-[13px] text-ink">
                  {rating} star <X className="size-3.5" />
                </button>
              )}
            <PointerSelect value={sort} onChange={(e) => setSort(e.target.value)} className="field ml-auto !h-9 !w-auto !rounded-full !py-0 !text-[13px]" aria-label="Sort reviews">
              <option value="recent">Most recent</option>
              <option value="helpful">Most helpful</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </PointerSelect>
            </div>
          )}

          {summary.total === 0 ? (
            <div className="flex flex-col items-center rounded-3xl bg-cream px-6 py-12 text-center">
              <MessageSquareQuote className="size-10 text-gold" strokeWidth={1.3} />
              <p className="mt-3 font-display text-2xl text-ink">Loved it? Tell us!</p>
              <p className="mt-1 max-w-sm text-sm text-muted">Your review helps others find the perfect piece.</p>
            </div>
          ) : query.isLoading ? (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : query.data?.items.length ? (
            <div className={cn("divide-y divide-line transition-opacity", query.isFetching && "opacity-60")}>
              {query.data.items.map((r) => (
                <article key={r.id} className="py-6 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <Stars value={r.rating} />
                    <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <h3 className="mt-2 font-medium text-ink">{r.title}</h3>}
                  <p className="mt-1.5 text-sm leading-6 text-ink-soft">{r.body}</p>
                  {r.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.images.map((src) => (
                        <button key={src} type="button" onClick={() => setLightbox(src)} className="relative size-20 overflow-hidden rounded-xl bg-cream" aria-label="View photo">
                          <Img src={src} alt="Customer photo" fill sizes="80px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="font-medium text-ink-soft">{r.name}</span>
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-success">
                        <BadgeCheck className="size-3.5" /> Verified buyer
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => void markHelpful(r.id)}
                      disabled={helpful.includes(r.id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 transition hover:bg-cream disabled:text-gold"
                    >
                      <ThumbsUp className="size-3.5" /> Helpful{r.helpfulCount ? ` (${r.helpfulCount})` : ""}
                    </button>
                  </div>
                  {r.adminReply && (
                    <div className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-gold">Reply from Ananta</p>
                      <p className="mt-1 text-ink-soft">{r.adminReply}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted">No reviews match this filter.</p>
          )}

          {query.data && query.data.meta.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {page} of {query.data.meta.pages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= query.data.meta.pages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {status === "authenticated" && <WriteReview productId={productId} open={writing} onOpenChange={setWriting} />}
      <Sheet open={!!lightbox} onOpenChange={() => setLightbox(null)} side="center" title="Customer photo" hideTitle className="max-w-2xl" bodyClassName="p-3">
        {lightbox && (
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
            <Img src={lightbox} alt="Customer photo" fill sizes="700px" className="object-contain" />
          </div>
        )}
      </Sheet>
    </section>
  );
}
