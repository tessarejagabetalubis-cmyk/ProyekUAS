import type { TransaksiParkir } from "./struktur";
import { daftarTransaksi } from "./struktur";
import { formatRupiah, namaKendaraan, namaHari } from "./struktur";
import { tanya, bacaAngka, bacaYaTidak } from "./validasi";

// ---------------------------------------------------------------------
// FUNGSI UNTUK MENAMPILKAN TABEL TRANSAKSI
// ---------------------------------------------------------------------

// Fungsi menampilkan judul tabel
function cetakJudulTabel(): void {
  console.log(
    "------------------------------------------------------------------------------------------------"
  );
  console.log(
    "ID       | PLAT NOMOR | KENDARAAN | HARI        | DURASI | MEMBER | TOTAL BAYAR"
  );
  console.log(
    "------------------------------------------------------------------------------------------------"
  );
}

// Fungsi menampilkan satu baris transaksi
function cetakBaris(t: TransaksiParkir): void {
  console.log(
    `${t.id.padEnd(8)} | ` +
    `${t.platNomor.padEnd(10)} | ` +
    `${namaKendaraan(t.kendaraan).padEnd(9)} | ` +
    `${namaHari(t.hari).padEnd(11)} | ` +
    `${String(t.lamaMenit).padEnd(6)} | ` +
    `${(t.member ? "Ya" : "Tidak").padEnd(6)} | ` +
    `${formatRupiah(t.totalBayar)}`
  );
}

// ---------------------------------------------------------------------
// BAGIAN 8: FITUR DELETE
// ---------------------------------------------------------------------

// Fungsi menghapus transaksi berdasarkan ID
export function hapusData(): void {
  console.log("\n--- HAPUS TRANSAKSI PARKIR ---");

  // Memeriksa apakah data transaksi kosong
  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }

  // Membaca ID transaksi yang akan dihapus
  const idCari: string = tanya(
    "Masukkan ID yang dihapus : "
  ).trim().toUpperCase();

  // Mencari posisi transaksi
  const posisi: number = daftarTransaksi.findIndex(
    (x: TransaksiParkir) => x.id === idCari
  );

  // Memeriksa apakah ID ditemukan
  if (posisi === -1) {
    console.log("ID " + idCari + " tidak ditemukan.");
    return;
  }

  // Menampilkan transaksi yang akan dihapus
  cetakJudulTabel();
  cetakBaris(daftarTransaksi[posisi]!);

  // Meminta konfirmasi pengguna
  const yakin: boolean = bacaYaTidak(
    "Yakin hapus data ini? (y/t) : "
  );

  // Menghapus transaksi jika pengguna menyetujui
  if (yakin) {
    daftarTransaksi.splice(posisi, 1);
    console.log("Data " + idCari + " berhasil dihapus.");
  } else {
    console.log("Penghapusan dibatalkan.");
  }
}

// ---------------------------------------------------------------------
// BAGIAN 9: FITUR SEARCH
// ---------------------------------------------------------------------

// Fungsi mencari transaksi berdasarkan plat, kendaraan, dan member
export function cariData(): void {
  console.log("\n--- CARI TRANSAKSI PARKIR ---");

  // Membaca kata kunci plat nomor
  const kataKunci: string = tanya(
    "Kata kunci plat (Enter = semua) : "
  ).trim().toLowerCase();

  // Memilih jenis kendaraan
  const filterKendaraan: number = bacaAngka(
    "Filter kendaraan (0=Semua, 1=Motor, 2=Mobil, 3=Bus) : ",
    0,
    3
  );

  // Memilih status member
  const filterMember: number = bacaAngka(
    "Filter member (0=Semua, 1=Member, 2=Non-member) : ",
    0,
    2
  );

  // Menyaring transaksi berdasarkan kriteria pencarian
  const hasil: TransaksiParkir[] = daftarTransaksi.filter(
    (t: TransaksiParkir) => {
      const cocokPlat: boolean = t.platNomor
        .toLowerCase()
        .includes(kataKunci);

      const cocokKendaraan: boolean =
        filterKendaraan === 0 ||
        t.kendaraan === filterKendaraan;

      const cocokMember: boolean =
        filterMember === 0 ||
        (filterMember === 1 && t.member) ||
        (filterMember === 2 && !t.member);

      return cocokPlat && cocokKendaraan && cocokMember;
    }
  );

  // Memeriksa hasil pencarian
  if (hasil.length === 0) {
    console.log("\nData tidak ditemukan.");
    return;
  }

  // Menampilkan jumlah hasil pencarian
  console.log("\nDitemukan " + hasil.length + " data:");

  // Menampilkan hasil pencarian
  cetakJudulTabel();

  hasil.forEach((t: TransaksiParkir) => {
    cetakBaris(t);
  });
}
