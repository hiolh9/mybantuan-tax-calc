# MyBantuan & Tax Calc

Static site: Malaysian government aid (Bantuan) + University directory.

## Structure

```
/
  index.html              # Hub (Bantuan | Universiti)
  css/ style.css
  bantuan/
    index.html            # Bantuan listing (STR, SARA, JKM...)
    data/programs.json
    str-2026.html, sara-2026.html, ...  # detail pages
    css/ js/
  universiti/
    index.html            # University listing with filters
    data/universities.json
    css/ js/
```

## Bantuan
- Data driven by `bantuan/data/programs.json`
- Status from startDate/endDate (not hardcoded)
- Detail pages with application guides + CTA to official portals

## Universiti
- 38 universities: 20 awam, ~12 swasta, ~6 foreign branch campuses
- Filter by type (Awam/Swasta/Cawangan Asing), state, search by name/field/city
- Cards show location + strength tags; link to official website

## Maintain
- Add aid: edit `bantuan/data/programs.json` (+ optional detail HTML)
- Add university: edit `universiti/data/universities.json`
