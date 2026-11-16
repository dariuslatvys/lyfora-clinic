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

## Viešas demo (Vercel free)

Prototipui pakanka nemokamo `*.vercel.app` adreso. SQLite demo DB yra
`data/demo/lyfora.sqlite` (Vercel’e kopijuojama į `/tmp`).

Vercel Environment Variables (būtina prisijungimui):

- `SESSION_SECRET` — ilga atsitiktinė eilutė (`openssl rand -base64 48`)
- `DEMO_PASSWORD` — slaptažodis demo paskyroms (`pacientas@…` / `paciente@…` / `gydytojas@…`)

Po env išsaugojimo padarykite Redeploy.

### Jūsų žingsniai

1. Cursor’e paspauskite **Create repo** (kad projektas taptų tikru GitHub / Origin repo).
2. Jei repo Origin’e, o Vercel nori GitHub — sukurkite tuščią GitHub repo ir push’inkite:
   ```bash
   git remote add github https://github.com/<jūsų-user>/lyfora-clinic.git
   git push -u github main
   ```
3. Eikite į [vercel.com/new](https://vercel.com/new) (tas pats account, kur `avocadotech.eu`).
4. **Import** tą GitHub repo → Framework: Next.js → Environment Variables: `SESSION_SECRET` ir `DEMO_PASSWORD` → **Deploy**.
5. Po 1–2 min gausite `https://lyfora-clinic-….vercel.app` — tuo dalinkitės.

Pastaba: serverless cold start’e sesijos /tmp DB gali „atsinaujinti“ — demo’ui to užtenka.

## Duomenys

Šaltiniai: `data/lyfora-source/` ir normalizuoti JSON `data/parsed/`.

- Vyrų demo — laboratoriniai žymenys iš Blood tests PDF + bazinis SNP microarray (23andMe sample) + NGS VCF (`MYBPC3`, `MSH2` demonstracinės pozicijos).
- Moterų demo — AncestryDNA SNP microarray (`sampleDNA.txt` → `snp_genotypes_female.json`) + sintetinis NGS VCF (PALB2, RYR1).

## Stack

Next.js (App Router) · TypeScript · Tailwind · SQLite (better-sqlite3) · Recharts
