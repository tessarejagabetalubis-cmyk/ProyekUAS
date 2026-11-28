import * as fs from "fs";

// Fungsi untuk membaca input dari terminal
function tanya(pesan: string): string {
  process.stdout.write(pesan);

  const buffer: Buffer = Buffer.alloc(1024);
  const jumlah: number = fs.readSync(
    process.stdin.fd,
    buffer,
    0,
    buffer.length,
    null
  );

  return buffer.toString("utf8", 0, jumlah).trim();
}

// Fungsi membaca angka sesuai batas yang ditentukan
function bacaAngka(
  pesan: string,
  min: number,
  max: number,
  bolehKosong: boolean = false,
  nilaiLama: number = 0
): number {
  while (true) {
    const jawaban: string = tanya(pesan);

    if (bolehKosong && jawaban === "") {
      return nilaiLama;
    }

    const angka: number = Number(jawaban);

    if (
      jawaban !== "" &&
      Number.isFinite(angka) &&
      angka >= min &&
      angka <= max
    ) {
      return angka;
    }

    console.log("Input tidak valid. Silakan coba lagi.");
  }
}

// Fungsi membaca nomor plat kendaraan
function bacaPlat(
  bolehKosong: boolean = false,
  nilaiLama: string = ""
): string {
  while (true) {
    const plat: string = tanya("Plat nomor: ").toUpperCase();

    if (bolehKosong && plat === "") {
      return nilaiLama;
    }

    if (plat !== "") {
      return plat;
    }

    console.log("Nomor plat tidak boleh kosong.");
  }
}

// Fungsi membaca pilihan ya atau tidak
function bacaYaTidak(
  pesan: string,
  bolehKosong: boolean = false,
  nilaiLama: boolean = false
): boolean {
  while (true) {
    const jawaban: string = tanya(pesan).toLowerCase();

    if (bolehKosong && jawaban === "") {
      return nilaiLama;
    }

    if (jawaban === "y") {
      return true;
    }

    if (jawaban === "t") {
      return false;
    }

    console.log("Masukkan y untuk Ya atau t untuk Tidak.");
  }
}

// Mengexport fungsi agar dapat digunakan file lain
export { tanya, bacaAngka, bacaPlat, bacaYaTidak };

