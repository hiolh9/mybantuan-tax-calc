# MyBantuan & Tax Calc — Static Homepage

Laman statik untuk menyenaraikan bantuan kerajaan Malaysia (STR, SARA, JKM, cukai, dll).

## Struktur Fail

```
/
├── index.html          ← Laman utama (Bahasa Melayu)
├── detail.html         ← Halaman butiran (dinamis ikut ?id=)
├── css/style.css
├── js/app.js
└── data/
    └── programs.json   ← **Semua data program di sini**
```

## Cara Maintain (Paling Mudah)

1. **Tambah / kemaskini program**  
   Edit hanya fail `data/programs.json`.  
   Field penting:
   - `id` — unik
   - `startDate` / `endDate` (format `YYYY-MM-DD`)  
     - `endDate: null` = berterusan
   - `priority` — nombor tinggi = muncul lebih atas & kad lebih besar
   - `detailPage` — biasanya `detail.html?id=xxxx`

2. **Status tidak hardcode**  
   Status (Sedang Berjalan / Akan Datang / Telah Tamat) dikira secara automatik di `js/app.js` berdasarkan tarikh hari ini.

3. **Had paparan**  
   Laman utama papar maksimum 30 program (boleh ubah `MAX_DISPLAY` dalam `app.js`).

4. **Susunan**  
   Priority tinggi dulu → kemudian `startDate` terbaru.

## Menjalankan secara lokal

Gunakan sebarang static server (contoh):

```bash
npx serve .
# atau
python3 -m http.server 8080
```

Kemudian buka `http://localhost:8080`.

## Nota Reka Bentuk

- Bento grid (saiz kad berbeza untuk hierarchy visual)
- Warna sober (hijau aksen + kelabu)
- Tiada animasi berlebihan
- Responsif mobile
- Semua teks Bahasa Melayu
