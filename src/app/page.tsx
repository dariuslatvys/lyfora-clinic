import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landing-dna" aria-hidden="true">
        <Image
          src="/brand/molecule-rich.png"
          alt=""
          fill
          priority
          className="landing-dna-img"
          sizes="100vw"
        />
      </div>

      <div className="landing-in relative z-10">
        <div className="landing-top rise-in">
          <Image
            src="/brand/lyfora-logo.png"
            alt="Lyfora"
            width={220}
            height={73}
            priority
            className="landing-logo"
          />
          <span className="landing-pill">
            <strong>24/7</strong>
            <small>tavo individualus sveikatos dvynys</small>
          </span>
        </div>

        <div className="landing-copy rise-in-delay">
          <h1>Sveikata, kuri jus pažįsta</h1>
          <p className="landing-lead">
            Lyfora jungia pacientą ir gydytoją: viena kortelė, tie patys
            duomenys, dvi aplinkos.
          </p>
        </div>

        <div className="landing-grid rise-in-delay-2">
          <Link href="/login/patient" className="env-card">
            <span className="env-ic" aria-hidden="true">
              <HeartIcon />
            </span>
            <span className="eyebrow">Pacientams</span>
            <h2>Mano sveikata</h2>
            <p>
              Visa jūsų sveikatos informacija vienoje vietoje: kortelė, tyrimai,
              DNR ir rekomendacijos.
            </p>
            <span className="env-cta">Prisijungti</span>
          </Link>

          <Link href="/login/doctor" className="env-card">
            <span className="env-ic" aria-hidden="true">
              <UsersIcon />
            </span>
            <span className="eyebrow">Specialistams</span>
            <h2>Gydytojo darbo vieta</h2>
            <p>
              Pacientų apžvalga, skaitmeninis dvynys ir rami klinikos darbo
              erdvė.
            </p>
            <span className="env-cta">Prisijungti</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 18.5c.8-3 2.8-4.5 5.5-4.5s4.7 1.5 5.5 4.5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M14.2 18.5c.5-2.2 1.8-3.4 3.8-3.4 1.5 0 2.7.7 3.5 2" />
    </svg>
  );
}
