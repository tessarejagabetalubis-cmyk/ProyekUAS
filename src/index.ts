// =====================================================================
// KASIR TARIF PARKIR BERBASIS CLI (TypeScript) - UAS Pemrograman Dasar
// Pengembangan dari proyek UTS: ditambah loop, array, fungsi, CRUD, dan Search
//
// PEMBAGIAN BAGIAN KODE (satu file, dibagi per blok supaya tidak bentrok):
//   BAGIAN 1 : Elsha  - struktur data, fungsi bantu, validasi input
//   BAGIAN 2 : Tessa  - hitungBiaya (operator, if, switch, nested)
//   BAGIAN 3 : Elsha  - Create
//   BAGIAN 4 : Dita   - Read dan Update
//   BAGIAN 5 : Tessa  - Delete dan Search
//   BAGIAN 6 : Elsha  - seed, menu utama (loop)
// =====================================================================

// =====================================================================
// BAGIAN 1 - ELSHA: Struktur project, tipe data, variabel global, fungsi bantu, dan validasi input
// =====================================================================

// Mengimpor modul fs bawaan Node.js untuk membaca input dari terminal
import * as fs from "fs";

// Entitas utama: satu transaksi parkir yang disimpan di dalam array
interface TransaksiParkir {
  id: string; // kode unik transaksi, contoh "TRX-001" (string)
  platNomor: string; // plat nomor kendaraan (string)
  kendaraan: number; // jenis kendaraan: 1 = Motor, 2 = Mobil, 3 = Bus (number)
  hari: number; // jenis hari: 1 = Senin-Jumat, 2 = Sabtu, 3 = Minggu (number)
  lamaMenit: number; // lama parkir dalam menit (number)
  member: boolean; // true jika pemegang kartu member (boolean)
  totalBayar: number; // total bayar hasil perhitungan dalam rupiah (number)
}

// Hasil perhitungan biaya parkir (dikembalikan oleh fungsi hitungBiaya)
interface RincianBiaya {
  jam: number; // lama parkir dalam jam (dibulatkan ke atas)
  tambahanHari: number; // biaya tambahan sesuai jenis hari
  diskonPersen: number; // persentase diskon member
  gratisJam1: boolean; // true jika berhak jam pertama gratis
  total: number; // total bayar akhir
}

// Array penyimpan seluruh transaksi di dalam memori (isinya berubah, maka let)
let daftarTransaksi: TransaksiParkir[] = [];

// Penghitung nomor urut untuk membuat id baru (nilainya terus bertambah, maka let)
let nomorUrut: number = 0;

// Batas lama parkir maksimal dalam menit (nilai tetap, maka const) = 7 hari
const MAKS_MENIT: number = 10080;

// Fungsi membaca satu baris teks dari terminal (parameter: pesan, return: string)
function tanya(pesan: string): string {
  // Menampilkan pesan pertanyaan tanpa pindah baris
  process.stdout.write(pesan);
  // Menyiapkan buffer 1 byte untuk membaca input satu per satu
  const buf: Buffer = Buffer.alloc(1);
  // Menampung byte yang dibaca sampai pengguna menekan Enter
  const bytes: number[] = [];
  // Mengulang membaca byte selama Enter belum ditekan
  while (true) {
    // Jumlah byte yang berhasil dibaca pada putaran ini
    let terbaca: number = 0;
    try {
      // Membaca 1 byte dari standar input (file descriptor 0)
      terbaca = fs.readSync(0, buf, 0, 1, null);
    } catch (e) {
      // Jika input belum siap, ulangi membaca; selain itu dianggap input selesai
      if ((e as NodeJS.ErrnoException).code === "EAGAIN") {
        continue;
      }
      terbaca = 0;
    }
    // Jika tidak ada byte lagi (input berakhir) maka keluar dari pembacaan
    if (terbaca <= 0) {
      // Jika belum ada isi sama sekali, hentikan program dengan rapi
      if (bytes.length === 0) {
        console.log("\nInput berakhir. Program dihentikan.");
        process.exit(0);
      }
      break;
    }
    // Mengambil nilai byte yang baru dibaca
    const kode: number = buf.readUInt8(0);
    // Jika karakter adalah Enter (newline), selesai membaca satu baris
    if (kode === 10) {
      break;
    }
    // Mengabaikan karakter carriage return (13) milik Windows, simpan sisanya
    if (kode !== 13) {
      bytes.push(kode);
    }
  }
  // Mengubah kumpulan byte menjadi teks UTF-8
  return Buffer.from(bytes).toString("utf8");
}

// Fungsi mengubah angka menjadi format rupiah (parameter: angka, return: string)
function formatRupiah(angka: number): string {
  // Memakai pemisah ribuan gaya Indonesia lalu diberi awalan Rp
  return "Rp" + angka.toLocaleString("id-ID");
}

// Fungsi mengubah kode jenis kendaraan menjadi nama (SWITCH dengan 4 jalur)
function namaKendaraan(kode: number): string {
  // Memilih nama berdasarkan kode kendaraan
  switch (kode) {
    case 1:
      return "Motor"; // kode 1 = Motor
    case 2:
      return "Mobil"; // kode 2 = Mobil
    case 3:
      return "Bus"; // kode 3 = Bus
    default:
      return "Tidak dikenal"; // kode di luar 1-3
  }
}

// Fungsi mengubah kode jenis hari menjadi nama (SWITCH dengan 4 jalur)
function namaHari(kode: number): string {
  // Memilih nama berdasarkan kode hari
  switch (kode) {
    case 1:
      return "Senin-Jumat"; // kode 1 = hari kerja
    case 2:
      return "Sabtu"; // kode 2 = Sabtu
    case 3:
      return "Minggu"; // kode 3 = Minggu
    default:
      return "Tidak dikenal"; // kode di luar 1-3
  }
}

// Fungsi mencetak satu baris data dalam bentuk tabel (parameter: satu transaksi, void)
function cetakBaris(t: TransaksiParkir): void {
  // Menyusun satu baris dengan lebar kolom tetap agar rapi
  console.log(
    t.id.padEnd(9) +
      t.platNomor.padEnd(11) +
      namaKendaraan(t.kendaraan).padEnd(8) +
      namaHari(t.hari).padEnd(13) +
      String(t.lamaMenit).padStart(6) +
      (t.member ? "  Ya   " : "  Tidak") +
      formatRupiah(t.totalBayar).padStart(11)
  );
}

// Fungsi mencetak judul kolom tabel (tanpa parameter, void)
function cetakJudulTabel(): void {
  // Judul kolom dengan lebar yang sama seperti cetakBaris
  console.log(
    "ID".padEnd(9) +
      "Plat".padEnd(11) +
      "Jenis".padEnd(8) +
      "Hari".padEnd(13) +
      "Menit".padStart(6) +
      "  Member" +
      "Total".padStart(11)
  );
  // Garis pemisah
  console.log("-".repeat(65));
}

// Fungsi membuat id baru yang unik (tanpa parameter, return: string)
function buatIdBaru(): string {
  // Kandidat id yang akan dicek keunikannya
  let kandidat: string = "";
  // Mengulang membuat id sampai id belum dipakai data lain (cegah duplikasi ID)
  do {
    // Menambah nomor urut dengan compound operator +=
    nomorUrut += 1;
    // Menyusun id dengan format TRX-001, TRX-002, dst.
    kandidat = "TRX-" + String(nomorUrut).padStart(3, "0");
    // Mengulang jika id kandidat ternyata sudah ada di array
  } while (daftarTransaksi.some((t) => t.id === kandidat));
  // Mengembalikan id yang sudah pasti unik
  return kandidat;
}

// Fungsi membaca angka dengan validasi lengkap
// parameter: pesan, batas min, batas maks, boleh dikosongkan (untuk Update), nilai lama
function bacaAngka(
  pesan: string,
  min: number,
  maks: number,
  bolehKosong: boolean = false,
  nilaiLama: number = 0
): number {
  // Nilai hasil input yang sudah valid
  let hasil: number = 0;
  // Penanda apakah input sudah benar
  let valid: boolean = false;
  // Mengulang bertanya sampai input valid (program tidak berhenti saat salah)
  while (!valid) {
    // Membaca input lalu membuang spasi di awal dan akhir
    const teks: string = tanya(pesan).trim();
    // Kasus 1: input kosong
    if (teks === "") {
      // Pada mode Update, kosong berarti melewati kolom (pakai nilai lama)
      if (bolehKosong) {
        return nilaiLama;
      }
      console.log("  [!] Input tidak boleh kosong.");
      continue;
    }
    // Mengubah teks menjadi number
    const angka: number = Number(teks);
    // Kasus 2: bukan angka
    if (isNaN(angka)) {
      console.log("  [!] Input harus berupa angka.");
    } else if (angka < 0) {
      // Kasus 3: angka negatif
      console.log("  [!] Angka tidak boleh negatif.");
    } else if (angka < min || angka > maks) {
      // Kasus 4: angka di luar rentang yang diizinkan
      console.log("  [!] Angka harus di antara " + min + " dan " + maks + ".");
    } else {
      // Semua pemeriksaan lolos: simpan hasil dan akhiri perulangan
      hasil = angka;
      valid = true;
    }
  }
  // Mengembalikan angka yang valid
  return hasil;
}

// Fungsi membaca jawaban y/t menjadi boolean
// parameter: pesan, boleh kosong (untuk Update), nilai lama
function bacaYaTidak(
  pesan: string,
  bolehKosong: boolean = false,
  nilaiLama: boolean = false
): boolean {
  // Mengulang sampai jawaban benar-benar y atau t
  while (true) {
    // Membaca jawaban, dibuang spasinya, dan dijadikan huruf kecil
    const jawab: string = tanya(pesan).trim().toLowerCase();
    // Jika dikosongkan pada mode Update, pakai nilai lama
    if (jawab === "" && bolehKosong) {
      return nilaiLama;
    }
    // Jika jawaban y (ya) maka true
    if (jawab === "y") {
      return true;
    }
    // Jika jawaban t (tidak) maka false
    if (jawab === "t") {
      return false;
    }
    // Selain itu jawaban tidak valid
    console.log("  [!] Jawab dengan y atau t.");
  }
}

// Fungsi membaca plat nomor dengan validasi tidak boleh kosong
// parameter: boleh kosong (untuk Update), nilai lama
function bacaPlat(bolehKosong: boolean = false, nilaiLama: string = ""): string {
  // Mengulang sampai plat nomor terisi
  while (true) {
    // Membaca plat, dibuang spasi ujung, dan dijadikan huruf besar
    const plat: string = tanya("Plat nomor : ").trim().toUpperCase();
    // Jika dikosongkan pada mode Update, pakai nilai lama
    if (plat === "" && bolehKosong) {
      return nilaiLama;
    }
    // Jika terisi, kembalikan sebagai hasil
    if (plat !== "") {
      return plat;
    }
    // Jika kosong pada mode Create, tampilkan pesan kesalahan
    console.log("  [!] Plat nomor tidak boleh kosong.");
  }
}


// #####################################################################
// (garis pemisah, jangan diubah supaya Git tidak bentrok)
// #####################################################################

// =====================================================================
// BAGIAN 2 - TESSA: Perhitungan biaya parkir (integrasi operator, if, switch, nested)
// =====================================================================

// (SEMENTARA / STUB) Tessa akan mengganti seluruh fungsi ini dengan versi lengkap
function hitungBiaya(
  kendaraan: number,
  hari: number,
  lamaMenit: number,
  member: boolean
): RincianBiaya {
  // Sementara semua nilai 0 supaya program tetap bisa dijalankan
  return { jam: 0, tambahanHari: 0, diskonPersen: 0, gratisJam1: false, total: 0 };
}

// #####################################################################
// (garis pemisah, jangan diubah supaya Git tidak bentrok)
// #####################################################################

// =====================================================================
// BAGIAN 3 - ELSHA: Fitur Create (tambah data)
// =====================================================================

// Fungsi menambah transaksi parkir baru (tanpa parameter, tanpa return / void)
function tambahData(): void {
  // Judul fitur
  console.log("\n--- TAMBAH TRANSAKSI PARKIR ---");
  // Membaca data dari pengguna dengan validasi di setiap input
  const platNomor: string = bacaPlat();
  const kendaraan: number = bacaAngka("Kendaraan (1=Motor, 2=Mobil, 3=Bus) : ", 1, 3);
  const hari: number = bacaAngka("Hari (1=Senin-Jumat, 2=Sabtu, 3=Minggu) : ", 1, 3);
  const lamaMenit: number = bacaAngka("Lama parkir (menit, 1-" + MAKS_MENIT + ") : ", 1, MAKS_MENIT);
  const member: boolean = bacaYaTidak("Member? (y/t) : ");

  // Menghitung biaya memakai fungsi hitungBiaya
  const rincian: RincianBiaya = hitungBiaya(kendaraan, hari, lamaMenit, member);

  // Menyusun objek transaksi baru dengan id unik
  const baru: TransaksiParkir = {
    id: buatIdBaru(),
    platNomor: platNomor,
    kendaraan: kendaraan,
    hari: hari,
    lamaMenit: lamaMenit,
    member: member,
    totalBayar: rincian.total,
  };
  // Menyimpan transaksi baru ke akhir array memakai push
  daftarTransaksi.push(baru);
  // Memberi tahu pengguna bahwa data berhasil disimpan
  console.log("\nData berhasil ditambahkan dengan ID " + baru.id + ".");
  console.log("Total bayar: " + formatRupiah(baru.totalBayar));
}

// #####################################################################
// (garis pemisah, jangan diubah supaya Git tidak bentrok)
// #####################################################################

// =====================================================================
// BAGIAN 4 - DITA: Fitur Read (semua data + detail by ID) dan Update
// =====================================================================

// (SEMENTARA / STUB) Dita akan mengganti fungsi ini
function tampilSemuaData(): void {
  console.log("Fitur Read semua data belum dikerjakan.");
}

// (SEMENTARA / STUB) Dita akan mengganti fungsi ini
function tampilDetail(): void {
  console.log("Fitur Read detail belum dikerjakan.");
}

// (SEMENTARA / STUB) Dita akan mengganti fungsi ini
function ubahData(): void {
  console.log("Fitur Update belum dikerjakan.");
}

// #####################################################################
// (garis pemisah, jangan diubah supaya Git tidak bentrok)
// #####################################################################

// =====================================================================
// BAGIAN 5 - TESSA: Fitur Delete (hapus data) dan Search (pencarian)
// =====================================================================

// (SEMENTARA / STUB) Tessa akan mengganti fungsi ini
function hapusData(): void {
  console.log("Fitur Delete belum dikerjakan.");
}

// (SEMENTARA / STUB) Tessa akan mengganti fungsi ini
function cariData(): void {
  console.log("Fitur Search belum dikerjakan.");
}

// #####################################################################
// (garis pemisah, jangan diubah supaya Git tidak bentrok)
// #####################################################################

// =====================================================================
// BAGIAN 6 - ELSHA: Data awal (seed), menu utama (loop), dan pemanggil program
// =====================================================================

// Fungsi mengisi 5 data awal (seed) agar program langsung punya contoh data
function isiDataAwal(): void {
  // Daftar data contoh: plat, kendaraan, hari, menit, member
  const contoh: [string, number, number, number, boolean][] = [
    ["N 1234 AB", 1, 1, 90, false],
    ["B 5678 CD", 2, 1, 400, true],
    ["AE 9012 EF", 3, 3, 150, false],
    ["N 3456 GH", 2, 2, 45, true],
    ["L 7890 IJ", 1, 3, 30, false],
  ];
  // LOOP for...of: membuat objek transaksi dari tiap data contoh
  for (const [plat, kend, hr, menit, mem] of contoh) {
    // Menghitung total bayar tiap contoh
    const r: RincianBiaya = hitungBiaya(kend, hr, menit, mem);
    // Memasukkan ke array dengan id unik
    daftarTransaksi.push({
      id: buatIdBaru(),
      platNomor: plat,
      kendaraan: kend,
      hari: hr,
      lamaMenit: menit,
      member: mem,
      totalBayar: r.total,
    });
  }
}

// Fungsi menampilkan daftar menu (tanpa parameter, void)
function tampilMenu(): void {
  console.log("\n==================================");
  console.log("     KASIR TARIF PARKIR (CLI)");
  console.log("==================================");
  console.log("1. Tambah transaksi (Create)");
  console.log("2. Lihat semua transaksi (Read)");
  console.log("3. Lihat detail berdasarkan ID (Read)");
  console.log("4. Ubah transaksi (Update)");
  console.log("5. Hapus transaksi (Delete)");
  console.log("6. Cari transaksi (Search)");
  console.log("0. Keluar");
  console.log("==================================");
}

// Fungsi utama: menjalankan menu berulang sampai pengguna memilih keluar
function main(): void {
  // Mengisi data awal sebelum menu tampil
  isiDataAwal();
  // Penanda program masih berjalan
  let berjalan: boolean = true;
  // LOOP while: menu terus tampil sampai pengguna memilih 0
  while (berjalan) {
    // Menampilkan menu
    tampilMenu();
    // Membaca pilihan menu sebagai teks lalu dibersihkan
    const pilihan: string = tanya("Pilih menu (0-6) : ").trim();
    // SWITCH 3: mengarahkan pilihan ke fitur yang sesuai
    switch (pilihan) {
      case "1":
        tambahData(); // Create
        break;
      case "2":
        tampilSemuaData(); // Read semua
        break;
      case "3":
        tampilDetail(); // Read detail
        break;
      case "4":
        ubahData(); // Update
        break;
      case "5":
        hapusData(); // Delete
        break;
      case "6":
        cariData(); // Search
        break;
      case "0":
        // Pilihan keluar: hentikan perulangan menu
        console.log("\nTerima kasih. Program selesai.");
        berjalan = false;
        break;
      default:
        // Pilihan di luar menu: tampilkan pesan, menu akan tampil lagi
        console.log("\n[!] Pilihan tidak valid. Masukkan angka 0 sampai 6.");
        break;
    }
  }
}

// Memanggil fungsi utama untuk memulai program
main();