/** Centered frame shared by sign-in, sign-up and password pages. */
export function AuthShell({ title, subtitle, children }: { title?: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="container-x flex justify-center py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[400px]">
        {title ? (
          <header className="mb-6 text-center">
            <h1 className="text-[22px] font-semibold leading-tight tracking-[0.72px] text-ink">{title}</h1>
            {subtitle ? <p className="mt-2 text-[16px] leading-[28.8px] text-ink">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
