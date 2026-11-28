import * as fs from "fs";

import type { TransaksiParkir } from "./struktur";
import {
  daftarTransaksi,
  MAKS_MENIT,
  formatRupiah,
} from "./struktur";

import type { RincianBiaya } from "./biaya";
import { hitungBiaya } from "./biaya";

// =====================================================================
// BAGIAN 1: FUNGSI VALIDASI DAN INPUT
// =====================================================================

// Fungsi membaca satu baris teks dari terminal
export function tanya(pesan: string): string {
  process.stdout.write(pesan);

  // Menyiapkan buffer 1 byte
  const buf: Buffer = Buffer.alloc(1);

  // Menampung byte yang dibaca
  const bytes: number[] = [];

  // Membaca input sampai pengguna menekan Enter
  while (true) {
    let terbaca: number = 0;

    try {
      terbaca = fs.readSync(0, buf, 0, 1, null);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EAGAIN") {
        continue;
      }
      terbaca = 0;
    }

    // Jika input berakhir
    if (terbaca <= 0) {
      if (bytes.length === 0) {
        console.log("\nInput berakhir. Program dihentikan.");
        process.exit(0);
      }
      break;
    }

    // Jika karakter Enter
    if (buf[0] === 10) {
      break;
    }

    // Mengabaikan carriage return Windows
    if (buf[0] !== 13) {
      bytes.push(buf.readUInt8(0));
    }
  }

  return Buffer.from(bytes).toString("utf8");
}

// Fungsi membaca angka dengan validasi
export function bacaAngka(
  pesan: string,
  min: number,
  maks: number,
  bolehKosong: boolean = false,
  nilaiLama: number = 0
): number {
  let hasil: number = 0;
  let valid: boolean = false;

  // Mengulang sampai input valid
  while (!valid) {
    const teks: string = tanya(pesan).trim();

    // Input kosong untuk kebutuhan Update
    if (teks === "") {
      if (bolehKosong) {
        return nilaiLama;
      }

      console.log("  [!] Input tidak boleh kosong.");
      continue;
    }

    const angka: number = Number(teks);

    // Memeriksa apakah input berupa angka
    if (isNaN(angka)) {
      console.log("  [!] Input harus berupa angka.");
    } else if (angka < 0) {
      console.log("  [!] Angka tidak boleh negatif.");
    } else if (angka < min || angka > maks) {
      console.log(
        "  [!] Angka harus di antara " + min + " dan " + maks + "."
      );
    } else {
      hasil = angka;
      valid = true;
    }
  }

  return hasil;
}

// Fungsi membaca jawaban y/t menjadi boolean
export function bacaYaTidak(
  pesan: string,
  bolehKosong: boolean = false,
  nilaiLama: boolean = false
): boolean {
  while (true) {
    const jawab: string = tanya(pesan).trim().toLowerCase();

    // Input kosong untuk kebutuhan Update
    if (jawab === "" && bolehKosong) {
      return nilaiLama;
    }

    if (jawab === "y") {
      return true;
    }

    if (jawab === "t") {
      return false;
    }

    console.log("  [!] Jawab dengan y atau t.");
  }
}

// Fungsi membaca plat nomor
export function bacaPlat(
  bolehKosong: boolean = false,
  nilaiLama: string = ""
): string {
  while (true) {
    const plat: string = tanya("Plat nomor : ")
      .trim()
      .toUpperCase();

    // Input kosong untuk kebutuhan Update
    if (plat === "" && bolehKosong) {
      return nilaiLama;
    }

    if (plat !== "") {
      return plat;
    }

    console.log("  [!] Plat nomor tidak boleh kosong.");
  }
}

// =====================================================================
// BAGIAN 2: FUNGSI MEMBUAT ID TRANSAKSI
// =====================================================================

// Penghitung nomor urut transaksi
let nomorUrut: number = 0;

// Fungsi membuat ID transaksi baru yang unik
function buatIdBaru(): string {
  let kandidat: string = "";

  do {
    // Menambah nomor urut
    nomorUrut += 1;

    // Membuat ID dengan format TRX-001
    kandidat = "TRX-" + String(nomorUrut).padStart(3, "0");

    // Memeriksa apakah ID sudah digunakan
  } while (daftarTransaksi.some((t) => t.id === kandidat));

  return kandidat;
}

// =====================================================================
// BAGIAN 3: FITUR CREATE
// =====================================================================

// Fungsi menambah transaksi parkir baru
export function tambahData(): void {
  console.log("\n--- TAMBAH TRANSAKSI PARKIR ---");

  // Membaca data pengguna dengan validasi
  const platNomor: string = bacaPlat();

  const kendaraan: number = bacaAngka(
    "Kendaraan (1=Motor, 2=Mobil, 3=Bus) : ",
    1,
    3
  );

  const hari: number = bacaAngka(
    "Hari (1=Senin-Jumat, 2=Sabtu, 3=Minggu) : ",
    1,
    3
  );

  const lamaMenit: number = bacaAngka(
    "Lama parkir (menit, 1-" + MAKS_MENIT + ") : ",
    1,
    MAKS_MENIT
  );

  const member: boolean = bacaYaTidak("Member? (y/t) : ");

  // Menghitung biaya parkir
  const rincian: RincianBiaya = hitungBiaya(
    kendaraan,
    hari,
    lamaMenit,
    member
  );

  // Membuat objek transaksi baru
  const baru: TransaksiParkir = {
    id: buatIdBaru(),
    platNomor: platNomor,
    kendaraan: kendaraan,
    hari: hari,
    lamaMenit: lamaMenit,
    member: member,
    totalBayar: rincian.total,
  };

  // Menyimpan transaksi ke dalam array
  daftarTransaksi.push(baru);

  // Menampilkan hasil transaksi
  console.log(
    "\nData berhasil ditambahkan dengan ID " + baru.id + "."
  );

  console.log(
    "Total bayar: " + formatRupiah(baru.totalBayar)
  );
}
