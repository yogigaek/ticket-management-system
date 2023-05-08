# API Documentation

## USER

### USER REGISTRATION
URL : "/auth/register/",
Method: "POST",
Deskripsi :
API ini digunakan oleh pengguna atau admin untuk mendaftar akun baru dengan aturan sebagai berikut:
- Kolom email harus berisi alamat email yang valid.
- Pengguna tidak dapat mendaftar dengan email yang sudah terdaftar.
- Kata sandi harus berisi setidaknya satu huruf besar, satu huruf kecil, dan satu angka.
- Mohon berikan email yang valid di karenakan nofifikasi melalui email.

### USER LOGIN
URL : "/auth/login/",
Method: "POST",
Deskripsi :
API ini digunakan oleh pengguna atau admin(tim teknis) untuk masuk ke aplikasi tiket.

### USER LOGOUT
URL : "/auth/logout/",
Method: "POST",
Description :
API ini digunakan oleh pengguna atau admin untuk keluar dari aplikasi tiket.

## Tiket

### User Submission Ticket
URL : "/api/ticket",
Method: "POST",
Deskripsi :
API ini digunakan oleh pengguna untuk mengajukan tiket untuk permintaan, keluhan, atau masalah teknis melalui aplikasi.
- Saat pengguna mengajukan tiket, nomor tiket yang diajukan akan di-generate secara otomatis dan dikirim ke email pengguna.

### User Submission Ticket
URL : "/api/ticket?skip=0&limit=20",
Method: "GET",
Deskripsi :
- API ini digunakan oleh pengguna untuk melacak status permintaan mereka dan mendapatkan pembaruan dari tim teknis melalui aplikasi (hanya pengajuan tiket pengguna itu sendiri yang bisa dilihat).
- API ini juga digunakan oleh admin untuk melihat semua tiket yang masuk dari pengguna.

### User Delete Ticket Submission
URL : "/api/ticket/:id",
Method: "POST",
Deskripsi :
API ini digunakan oleh pengguna untuk menghapus pengajuan tiket
- API ini menggunakan safe delete untuk meminimalisir penghapusan tiket yang tidak sengaja (data dapat dikembalikan).

## Technical Team Response

### Status Update Ticket User technical team
URL : "/api/responTeknis/:id",
Method: "PUT",
Deskripsi :
API ini digunakan oleh tim teknis untuk mengelola setiap permintaan dengan mengubah status tiket, seperti "menunggu tindakan", "sedang dalam proses", "sedang direspon", dan "telah selesai".
- Terdapat 2 field required yang diperlukan, yaitu status dan respon dari tim teknis.

### Last Api For User Ticket Related Reports
URL : "/api/responTeknis/?skip=0&limit=20",
Method: "GET",
Deskripsi :
API ini digunakan untuk melihat laporan terkait tiket yang masuk dari pengguna dan bertujuan untuk memudahkan tim teknis dalam mengelola tiket. Terdapat beberapa filter, di antaranya:
1. prioritas = rendah, sedang, tinggi 
    bertujuan untuk melihat permintaan mendesak atau masalah kritis mendapatkan perhatian lebih cepat
2. email = email dari pengguna
3. username = username dari pengguna
4. userId = userId dari pengguna