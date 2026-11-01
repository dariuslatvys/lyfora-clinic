# Lyfora — klinikos platforma

Veikianti Lyfora paciento („Mano sveikata“) ir gydytojo („Gydytojo darbo vieta“) platforma su SQLite duomenų baze ir realiais laboratoriniais duomenimis.

## Kas veikia dabar

- Dvi aplinkos su atskiru prisijungimu (LT / EN)
- Paciento meniu dešinėje, įskaitant **Apžvalga | Mano skaitmeninis dvynys**
- Sveikatos kategorijų spalvos pagal `Health Category Colour Determination` + žymenis + SNP rizikos matricą
- Markerio detalės, normos, pokyčių grafikas
- SNP paaiškinimai iš `Gene_SNP_Risk_Table` (Mechanism) + bazinio SNP tyrimo pavadinimai
- Cardiovascular: NGS retų mutacijų blokas, kai yra VCF (demo pacientė)
- Gydytojo pacientų santrauka

## Demo prisijungimai

| Rolė | El. paštas | Slaptažodis |
|------|------------|-------------|
| Pacientas (tikri kraujo tyrimai) | `pacientas@lyfora.lt` | `lyfora2026` |
| Pacientė (demo SNP + NGS VCF) | `paciente@lyfora.lt` | `lyfora2026` |
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

- Darius Latvys — importuoti PDF laboratoriniai tyrimai (2024–2026) + vyrų NGS VCF (`MYBPC3`, `MSH2` demonstracinės pozicijos). SNP microarray failas dar neįkeltas — bazinio SNP sluoksnio spalvos jam skaičiuojamos iš žymenų.
- Ona Pavyzdinė — demonstraciniai SNP genotipai + sintetinis moterų NGS VCF (PALB2, RYR1).

## Stack

Next.js (App Router) · TypeScript · Tailwind · SQLite (better-sqlite3) · Recharts
