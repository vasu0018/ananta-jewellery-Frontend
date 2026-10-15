/** Shown while a server-rendered page streams in; header and footer stay in place. */
export default function Loading() {
  return (
    <div className="container-x flex min-h-[50vh] items-center justify-center py-20" role="status" aria-label="Loading">
      <span className="relative flex size-12 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-blush" />
        <span className="relative size-3 rounded-full bg-rose" />
      </span>
    </div>
  );
}
