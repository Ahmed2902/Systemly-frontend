// src/modules/landing/components/FinalCta.tsx

export function FinalCta() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl rounded-2xl bg-accent/10 border border-accent/30 p-12 text-center">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Ready to transform your booking process?
        </h2>
        <p className="mt-3 text-muted">
          Get your professional website and booking system live in just 10
          minutes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-64 rounded-md border border-surfaceBorder bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted"
          />
          <button className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent/90">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
