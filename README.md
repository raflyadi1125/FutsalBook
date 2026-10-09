# FutsalBook

Sistem pemesanan (booking) lapangan futsal berbasis web.

## Struktur Proyek

```
Futsal_book/
│
├── frontend/   # React (Vite) + Tailwind CSS
├── backend/    # Express.js REST API (MySQL)
├── database/   # Skema & seed database (schema.sql)
└── README.md
```

## Mulai Cepat

Install semua dependensi lalu jalankan frontend + backend sekaligus dari **root** folder:

```bash
npm run install:all   # sekali saja
npm run db:init       # sekali saja: import database/schema.sql
npm run dev           # start database (jika belum jalan) + API :5000 + Web :5173
```

Atau jalankan terpisah:

```bash
npm run db:start      # hanya start database (MySQL/MariaDB)
npm run dev:backend    # hanya backend
npm run dev:frontend   # hanya frontend
```

### 1. Database (MySQL / MariaDB)

`npm run db:init` memanggil klien MySQL yang terinstall (default user `root`, tanpa password).
Kalau mau manual:

```bash
mysql -u root -p < database/schema.sql
```

Kredensial database diatur di `backend/.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

### 2. Backend (manual)

```bash
cd backend
copy .env.example .env   # sesuaikan kredensial database & JWT_SECRET
npm install
npm run dev              # http://localhost:5000
```

Admin default (dari seed): `admin@futsalbook.test` / `admin1234`

### 3. Frontend (manual)

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

## API Endpoints

| Method | Route                  | Auth  | Deskripsi                     |
|--------|------------------------|-------|-------------------------------|
| POST   | /api/auth/register     | -     | Registrasi user               |
| POST   | /api/auth/login        | -     | Login, mengembalikan token JWT|
| GET    | /api/auth/me           | JWT   | Data user yang login          |
| GET    | /api/fields            | -     | Daftar lapangan               |
| GET    | /api/fields/:id        | -     | Detail lapangan               |
| POST   | /api/fields            | admin | Tambah lapangan               |
| PATCH  | /api/fields/:id        | admin | Ubah lapangan                 |
| DELETE | /api/fields/:id        | admin | Hapus lapangan                |
| GET    | /api/bookings          | JWT   | Daftar booking (milik sendiri) |
| POST   | /api/bookings          | JWT   | Buat booking                  |
| PATCH  | /api/bookings/:id/status | admin | Ubah status booking         |
| GET    | /api/payments          | JWT   | Daftar pembayaran             |
| POST   | /api/payments          | JWT   | Catat pembayaran              |
| PATCH  | /api/payments/:id/status | JWT | Ubah status pembayaran      |

Semua request (kecuali register/login/fields publik) membutuhkan header:

```
Authorization: Bearer <token>
```