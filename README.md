# TaskEmployee (CompanyTaskManager3)

Sistem agihan tugasan pegawai **dalam** dan **luar** untuk JPNIN.

## Ciri-ciri

1. Dashboard  
2. Pegawai (Officers)  
3. Tugasan (Tasks)  
4. Cipta Tugasan  
5. Serahan (Submissions)  
6. Kalendar  
7. Laporan  
8. Notifikasi  
9. Tetapan, Profil, Tukar Kata Laluan  
10. Topbar: Logo-Kerajaan.png, JPNIN, gambar profil, nama pengguna  

## Maklumat aplikasi

- **App Name / Title:** TaskEmployee  
- **E-mel demo:** example@perpaduan.gov.my  
- **Kata laluan demo:** TaskEmployee@2026  
- **Folder:** CompanyTaskManager3  

## Jalankan

```bash
cd CompanyTaskManager3
npm install
npm run dev
```

Buka URL yang ditunjukkan (biasanya http://localhost:5173).

## Build produksi

```bash
npm run build
npm run preview
```

Data disimpan dalam `localStorage` pelayar untuk demo.

## Deploy (Vercel)

1. Import repo `ItikHensem/CompanyTaskManager` in Vercel
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy from branch `main`
