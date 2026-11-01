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

## Demo prisijungimai

| Rolė | El. paštas | Slaptažodis |
|------|------------|-------------|
| Pacientas (vyras) | `pacientas@lyfora.lt` | `lyfora2026` |
| Pacientė (moteris) | `paciente@lyfora.lt` | `lyfora2026` |
| Gydytojas | `gydytojas@lyfora.lt` | `lyfora2026` |

## Paleidimas

```bash
npm install
npm run db:seed
npm run dev -- -p 43123 -H 127.0.0.1
```

Atidarykite [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Duomenys

Šaltiniai: `data/lyfora-source/` ir normalizuoti JSON `data/parsed/`.

- Vyrų demo — laboratoriniai žymenys iš Blood tests PDF + bazinis SNP microarray (23andMe sample) + NGS VCF (`MYBPC3`, `MSH2` demonstracinės pozicijos).
- Moterų demo — demonstraciniai SNP genotipai + sintetinis NGS VCF (PALB2, RYR1).

## Stack

Next.js (App Router) · TypeScript · Tailwind · SQLite (better-sqlite3) · Recharts
