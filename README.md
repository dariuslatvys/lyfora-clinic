# Lyfora — klinikos platforma

Veikianti Lyfora paciento („Mano sveikata“) ir gydytojo („Gydytojo darbo vieta“) platforma su SQLite duomenų baze ir demo laboratoriniais / genetikos duomenimis.

## Anonimizacija

UI niekur nerodo tikrų asmenų. Demo pacientai:

| Lytis | LT | EN |
|------|----|----|
| Vyras | Jonas Jonaitis | John Doe |
| Moteris | Rasa Rasaitė | Jane Smith |

## Kas veikia dabar

- Dvi aplinkos su atskiru prisijungimu (LT / EN)
- Paciento ir gydytojo meniu **kairėje**, ryškesnė žalia paletė
- Landing: turtingas molekulių fonas ir **24/7 – tavo individualus sveikatos dvynys**
- Apžvalga: data + pasisveikinimas + dėmesio santrauka su nuorodomis + **kūno žemėlapis** (siluetas ir spalvotos kategorijos aplinkui)
- Meniu: Receptai, Klausti gydytojo 24/7, Skubi konsultacija
- Tyrimai: rodiklių lentelė (paieška, norma, padėties juosta, būsena) + tyrimų paketų tabas
- Atskirų puslapių detalės žymenims, SNP ir retoms mutacijoms + Ask AI
- Sveikatos kategorijų spalvos pagal žymenis + SNP rizikos matricą + NGS (pvz. MYBPC3, MSH2)
- Gydytojo pacientų santrauka

## Demo prisijungimai (tik lokalus seed)

Po `DEMO_PASSWORD=… npm run db:seed` galima jungtis kaip:

| Rolė | El. paštas |
|------|------------|
| Pacientas (vyras) | `pacientas@lyfora.lt` |
| Pacientė (moteris) | `paciente@lyfora.lt` |
| Gydytojas | `gydytojas@lyfora.lt` |

Slaptažodis — tik tas, kurį pateikėte `DEMO_PASSWORD`. Į repo įtrauktame `data/demo/lyfora.sqlite` nėra žinomų prisijungimo slaptažodžių.

## Paleidimas

```bash
npm install
DEMO_PASSWORD='your-local-password' npm run db:seed
export SESSION_SECRET="$(openssl rand -base64 48)"
npm run dev -- -p 43123 -H 127.0.0.1
```

Lokalioje aplinkoje be `SESSION_SECRET` raktas generuojamas į `data/db/.session-secret` (gitignored). Publikuotoje aplinkoje privalomas `SESSION_SECRET`.

Atidarykite [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Viešas demo (Vercel)

Viešas hostas — **Vercel** (repo: [dariuslatvys/lyfora-clinic](https://github.com/dariuslatvys/lyfora-clinic)).
SQLite demo DB yra `data/demo/lyfora.sqlite` (Vercel’e kopijuojama į `/tmp`).

### Environment Variables (Project → Settings → Environment Variables)

Būtina prisijungimui:

- `SESSION_SECRET` — ilga atsitiktinė eilutė (`openssl rand -base64 48`)
- `DEMO_PASSWORD` — slaptažodis demo paskyroms (`pacientas@…` / `paciente@…` / `gydytojas@…`)

Nebūtina (Ask AI):

- `GROQ_API_KEY` / `GEMINI_API_KEY` / `OPENAI_API_KEY` — jei nėra jokio LLM rakto, Ask AI veikia taisyklėmis (įskaitant PMOS)

Po env išsaugojimo padarykite **Redeploy**.

### Deploy

1. Jei projekto Vercel’e dar nėra: [vercel.com/new](https://vercel.com/new) → **Import** `dariuslatvys/lyfora-clinic` → Framework: Next.js → įrašykite `SESSION_SECRET` ir `DEMO_PASSWORD` → **Deploy**.
2. Jei projektas jau prijungtas prie šio GitHub repo — po `main` push Vercel pats redeploy’ina; tik patikrinkite, kad abu env yra nustatyti Production aplinkai.
3. Adresas: `https://lyfora-clinic-….vercel.app` (arba jūsų custom domain).

Pastaba: serverless cold start’e `/tmp` DB gali „atsinaujinti“ — demo’ui to užtenka.

## Duomenys

Šaltiniai: `data/lyfora-source/` ir normalizuoti JSON `data/parsed/`.

- Vyrų demo — laboratoriniai žymenys iš Blood tests PDF + bazinis SNP microarray (23andMe sample) + NGS VCF (`MYBPC3`, `MSH2` demonstracinės pozicijos).
- Moterų demo — AncestryDNA SNP microarray (`sampleDNA.txt` → `snp_genotypes_female.json`) + sintetinis NGS VCF (PALB2, RYR1).

## Stack

Next.js (App Router) · TypeScript · Tailwind · SQLite (better-sqlite3) · Recharts
