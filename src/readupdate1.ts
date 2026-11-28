import type { TransaksiParkir } from "./struktur";
import {
  daftarTransaksi,
  namaKendaraan,
  namaHari,
  formatRupiah,
  MAKS_MENIT,
} from "./struktur";

import type { RincianBiaya } from "./biaya";
import { hitungBiaya } from "./biaya";

import {
  tanya,
  bacaAngka,
  bacaPlat,
  bacaYaTidak,
} from "./validasi";

// ---------------------------------------------------------------------
// BAGIAN 6: FITUR READ
// ---------------------------------------------------------------------

// Fungsi mencetak satu baris data transaksi
function cetakBaris(t: TransaksiParkir): void {
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

// Fungsi mencetak judul kolom tabel
function cetakJudulTabel(): void {
  console.log(
    "ID".padEnd(9) +
      "Plat".padEnd(11) +
      "Jenis".padEnd(8) +
      "Hari".padEnd(13) +
      "Menit".padStart(6) +
      "  Member" +
      "Total".padStart(11)
  );

  console.log("-".repeat(65));
}

// Fungsi menampilkan seluruh transaksi
function tampilSemuaData(): void {
  console.log("\n--- DAFTAR SEMUA TRANSAKSI ---");

  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }

  cetakJudulTabel();

  for (let i = 0; i < daftarTransaksi.length; i++) {
    cetakBaris(daftarTransaksi[i]!);
  }

  let totalPendapatan: number = 0;

  for (const t of daftarTransaksi) {
    totalPendapatan += t.totalBayar;
  }

  console.log("-".repeat(65));
  console.log("Jumlah transaksi : " + daftarTransaksi.length);
  console.log("Total pendapatan : " + formatRupiah(totalPendapatan));
}

// Fungsi menampilkan detail transaksi berdasarkan ID
function tampilDetail(): void {
  console.log("\n--- DETAIL TRANSAKSI BERDASARKAN ID ---");

  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }

  const idCari: string = tanya(
    "Masukkan ID (contoh TRX-001) : "
  ).trim().toUpperCase();

  const t: TransaksiParkir | undefined = daftarTransaksi.find(
    (x: TransaksiParkir) => x.id === idCari
  );

  if (t === undefined) {
    console.log("ID " + idCari + " tidak ditemukan.");
    return;
  }

  const r: RincianBiaya = hitungBiaya(
    t.kendaraan,
    t.hari,
    t.lamaMenit,
    t.member
  );

  console.log("ID               : " + t.id);
  console.log("Plat nomor       : " + t.platNomor);
  console.log("Kendaraan        : " + namaKendaraan(t.kendaraan));
  console.log("Hari             : " + namaHari(t.hari));
  console.log(
    "Lama parkir      : " + t.lamaMenit + " menit (" + r.jam + " jam)"
  );
  console.log("Member           : " + (t.member ? "Ya" : "Tidak"));
  console.log("Biaya tambahan   : " + formatRupiah(r.tambahanHari));
  console.log("Diskon member    : " + r.diskonPersen + "%");

  if (r.gratisJam1) {
    console.log("Keterangan       : Jam pertama gratis");
  }

  console.log("TOTAL BAYAR      : " + formatRupiah(t.totalBayar));
}

// ---------------------------------------------------------------------
// BAGIAN 7: FITUR UPDATE
// ---------------------------------------------------------------------

// Fungsi mengubah transaksi berdasarkan ID
function ubahData(): void {
  console.log("\n--- UBAH TRANSAKSI PARKIR ---");

  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }

  const idCari: string = tanya(
    "Masukkan ID yang diubah : "
  ).trim().toUpperCase();

  const posisi: number = daftarTransaksi.findIndex(
    (x: TransaksiParkir) => x.id === idCari
  );

  if (posisi === -1) {
    console.log("ID " + idCari + " tidak ditemukan.");
    return;
  }

  const lama: TransaksiParkir = daftarTransaksi[posisi]!;

  console.log("Data lama:");
  cetakJudulTabel();
  cetakBaris(lama);

  console.log("(Tekan Enter untuk melewati kolom yang tidak diubah)\n");

  const platBaru: string = bacaPlat(true, lama.platNomor);

  const kendaraanBaru: number = bacaAngka(
    "Kendaraan (1-3) [" + namaKendaraan(lama.kendaraan) + "] : ",
    1,
    3,
    true,
    lama.kendaraan
  );

  const hariBaru: number = bacaAngka(
    "Hari (1-3) [" + namaHari(lama.hari) + "] : ",
    1,
    3,
    true,
    lama.hari
  );

  const menitBaru: number = bacaAngka(
    "Lama parkir menit [" + lama.lamaMenit + "] : ",
    1,
    MAKS_MENIT,
    true,
    lama.lamaMenit
  );

  const memberBaru: boolean = bacaYaTidak(
    "Member? y/t [" + (lama.member ? "y" : "t") + "] : ",
    true,
    lama.member
  );

  const rincian: RincianBiaya = hitungBiaya(
    kendaraanBaru,
    hariBaru,
    menitBaru,
    memberBaru
  );

  daftarTransaksi[posisi] = {
    id: lama.id,
    platNomor: platBaru,
    kendaraan: kendaraanBaru,
    hari: hariBaru,
    lamaMenit: menitBaru,
    member: memberBaru,
    totalBayar: rincian.total,
  };

  console.log(
    "\nData " +
      lama.id +
      " berhasil diubah. Total baru: " +
      formatRupiah(rincian.total)
  );
}

// Fungsi yang dapat digunakan oleh file lain
export {
  cetakBaris,
  cetakJudulTabel,
  tampilSemuaData,
  tampilDetail,
  ubahData,
};
