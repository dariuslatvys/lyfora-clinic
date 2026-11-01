import Link from "next/link";

export default function HomePage() {
  return (
    <main className="hero-atmosphere">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="rise-in text-sm uppercase tracking-[0.28em] text-white/70">
          Lyfora
        </p>
        <h1 className="rise-in-delay mt-4 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] md:text-7xl">
          Lyfora | Tavo personalinė klinika
        </h1>
        <p className="rise-in-delay-2 mt-6 max-w-xl text-lg text-white/85">
          Sveikatos skaitmeninis dvynys pacientui ir rami darbo vieta gydytojui —
          lietuviškai ir angliškai.
        </p>
        <div className="rise-in-delay-2 mt-10 flex flex-wrap gap-3">
          <Link
            href="/login/patient"
            className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/90"
          >
            Mano sveikata
          </Link>
          <Link
            href="/login/doctor"
            className="rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Gydytojo darbo vieta
          </Link>
        </div>
      </div>
    </main>
  );
}
