export function AIPrecisionCard() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-primary p-10 shadow-2xl">
      <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="font-display-lg mb-4 text-headline-lg font-extrabold text-white">
            Intelligent Diagnostics
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary-container/90">
            Our clinical-grade AI model v2.4 is currently processing thousands of requests with a
            94.2% semantic accuracy rating. The system is operating at optimal health across all
            primary Ethiopian medical regions.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary-fixed-dim">
            <span className="font-display-lg text-title-md font-bold text-white">94%</span>
            <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-white" />
          </div>
          <span className="text-label-sm font-bold uppercase tracking-widest text-white/70">
            Accuracy Verified
          </span>
        </div>
      </div>
    </section>
  )
}
