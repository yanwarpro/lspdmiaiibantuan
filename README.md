# Bantuan Formulir Asesor LSP

Ekstensi menyediakan bantuan pengisian terbatas untuk formulir FRIA01 dan
FRIA03 pada seluruh ID asesi/asesmen di domain LSP Digital Marketing
Indonesia. Simpan perubahan tetap dilakukan manual.

Pada FRIA01, ekstensi menambahkan tombol untuk mengisi tanda
"-" pada field teks di kolom "Penilaian Lanjut". Checklist "Ya/Tidak" tidak
diubah dan tombol simpan tidak ditekan.

Ekstensi juga dapat menyorot pencapaian yang belum dipilih. Setelah meninjau
butir dan bukti asesmen, **Ya untuk baris aktif** memilih "Ya" hanya pada satu
baris yang sedang disorot. Tidak ada pilihan yang dibuat massal.

Kedua panel dapat diminimalkan dengan tombol **Minimalkan alat bantu**.
Dalam keadaan minim, penanda **Bantuan** tetap terlihat samar dan menjadi
lebih jelas saat diarahkan atau difokuskan.

## Instalasi

1. Buka `chrome://extensions` di Chrome.
2. Aktifkan **Developer mode**.
3. Pilih **Load unpacked** lalu pilih folder ekstensi ini.
4. Buka atau muat ulang halaman FRIA01 atau FRIA03.

## Penggunaan

1. Pada halaman asesmen, klik **Isi "-" Penilaian Lanjut**.
2. Konfirmasi jumlah field kosong yang akan diisi.
3. Tinjau formulir dan tekan tombol simpan sendiri jika sudah benar.

Ekstensi hanya mengisi field kosong yang ditemukan pada kolom "Penilaian
Lanjut". Field dengan nilai yang sudah ada tidak ditimpa. Jika semua field
sudah berisi "-", tombol melaporkan bahwa tidak ada perubahan yang diperlukan.

Untuk pencapaian, klik **Sorot pencapaian kosong** untuk menggulir ke butir
berikutnya yang belum memiliki pilihan. Tinjau butir tersebut, lalu klik **Ya
untuk baris aktif** hanya jika bukti menunjukkan kriteria terpenuhi. Ulangi
untuk setiap butir; pilihan "Tidak" tetap dapat dipilih langsung pada formulir.
Penyimpanan tetap dilakukan manual.

## FRIA03

Pada FRIA03, **Sorot baris yang perlu dilengkapi** menemukan baris yang
memiliki pencapaian belum dipilih atau tanggapan kosong. **Ya untuk baris
aktif** hanya memilih “Ya” pada satu baris kosong setelah ditinjau.
**Isi tanggapan kosong baris ini** menambahkan “Sudah terwakilkan saat
observasi” hanya pada field tanggapan kosong di baris yang disorot, dengan
konfirmasi. Teks tersebut tidak diisi massal; pastikan memang sesuai dengan
hasil observasi untuk tiap butir.

Pilih **Sudah bagus**, **Cukup**, atau **Kurang**, lalu klik **Terapkan ke
semua umpan balik** untuk mengisi atau mengganti nilai pada semua field umpan
balik. Tombol meminta konfirmasi dan menyebut jumlah field yang akan berubah.
Semua perubahan tetap perlu ditinjau dan disimpan manual.
