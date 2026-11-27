// ---------------------------------------------------------------------
// BAGIAN 6: FITUR READ
// ---------------------------------------------------------------------

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

// Fungsi menampilkan seluruh data (tanpa parameter, void)
function tampilSemuaData(): void {
  // Judul fitur
  console.log("\n--- DAFTAR SEMUA TRANSAKSI ---");
  // Penanganan data kosong: tampilkan pesan khusus lalu keluar dari fungsi
  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }
  // Menampilkan judul kolom
  cetakJudulTabel();
  // LOOP for: mencetak setiap transaksi berdasarkan indeks
  for (let i = 0; i < daftarTransaksi.length; i++) {
    cetakBaris(daftarTransaksi[i]!);
  }
  // Total pendapatan awalnya 0 lalu dijumlahkan satu per satu
  let totalPendapatan: number = 0;
  // LOOP for...of: menjumlahkan totalBayar semua transaksi (compound +=)
  for (const t of daftarTransaksi) {
    totalPendapatan += t.totalBayar;
  }
  // Menampilkan ringkasan jumlah data dan total pendapatan
  console.log("-".repeat(65));
  console.log("Jumlah transaksi : " + daftarTransaksi.length);
  console.log("Total pendapatan : " + formatRupiah(totalPendapatan));
}

// Fungsi menampilkan detail satu transaksi berdasarkan id (tanpa parameter, void)
function tampilDetail(): void {
  // Judul fitur
 console.log("\n--- DETAIL TRANSAKSI BERDASARKAN ID ---");
  // Jika data kosong, tidak ada yang bisa dicari
  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }
  // Membaca id yang dicari lalu dijadikan huruf besar agar tidak sensitif huruf
  const idCari: string = tanya("Masukkan ID (contoh TRX-001) : ").trim().toUpperCase();
  // Mencari transaksi dengan id yang sama memakai find
  const t: TransaksiParkir | undefined = daftarTransaksi.find((x) => x.id === idCari);
  // Jika tidak ditemukan, tampilkan pesan khusus
  if (t === undefined) {
    console.log("ID " + idCari + " tidak ditemukan.");
    return;
  }
  // Menghitung ulang rincian biaya untuk ditampilkan
  const r: RincianBiaya = hitungBiaya(t.kendaraan, t.hari, t.lamaMenit, t.member);
  // Menampilkan seluruh properti data
  console.log("ID               : " + t.id);
  console.log("Plat nomor       : " + t.platNomor);
  console.log("Kendaraan        : " + namaKendaraan(t.kendaraan));
  console.log("Hari             : " + namaHari(t.hari));
  console.log("Lama parkir      : " + t.lamaMenit + " menit (" + r.jam + " jam)");
  console.log("Member           : " + (t.member ? "Ya" : "Tidak"));
  console.log("Biaya tambahan   : " + formatRupiah(r.tambahanHari));
  console.log("Diskon member    : " + r.diskonPersen + "%");
  // Keterangan jam pertama gratis hanya tampil jika berhak
  if (r.gratisJam1) {
    console.log("Keterangan       : Jam pertama gratis");
  }
  console.log("TOTAL BAYAR      : " + formatRupiah(t.totalBayar));
}

// ---------------------------------------------------------------------
// BAGIAN 7: FITUR UPDATE
// ---------------------------------------------------------------------

// Fungsi mengubah transaksi berdasarkan id (tanpa parameter, void)
function ubahData(): void {
  // Judul fitur
  console.log("\n--- UBAH TRANSAKSI PARKIR ---");
  // Jika data kosong, tidak ada yang bisa diubah
  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }
  // Membaca id yang akan diubah
  const idCari: string = tanya("Masukkan ID yang diubah : ").trim().toUpperCase();
  // Mencari posisi data di array memakai findIndex (hasil -1 jika tidak ada)
  const posisi: number = daftarTransaksi.findIndex((x) => x.id === idCari);
  // Jika tidak ditemukan, tampilkan pesan lalu keluar
  if (posisi === -1) {
    console.log("ID " + idCari + " tidak ditemukan.");
    return;
  }
  // Mengambil data lama dari array
  const lama: TransaksiParkir = daftarTransaksi[posisi]!;
  // Menampilkan data lama terlebih dahulu
  console.log("Data lama:");
  cetakJudulTabel();
 cetakBaris(lama);
  console.log("(Tekan Enter untuk melewati kolom yang tidak diubah)\n");
  // Membaca nilai baru; kolom kosong memakai nilai lama
  const platBaru: string = bacaPlat(true, lama.platNomor);
  const kendaraanBaru: number = bacaAngka("Kendaraan (1-3) [" + namaKendaraan(lama.kendaraan) + "] : ", 1, 3, true, lama.kendaraan);
  const hariBaru: number = bacaAngka("Hari (1-3) [" + namaHari(lama.hari) + "] : ", 1, 3, true, lama.hari);
  const menitBaru: number = bacaAngka("Lama parkir menit [" + lama.lamaMenit + "] : ", 1, MAKS_MENIT, true, lama.lamaMenit);
  const memberBaru: boolean = bacaYaTidak("Member? y/t [" + (lama.member ? "y" : "t") + "] : ", true, lama.member);
  // Menghitung ulang total bayar dengan data baru
  const rincian: RincianBiaya = hitungBiaya(kendaraanBaru, hariBaru, menitBaru, memberBaru);
  // Menimpa data lama di array dengan data baru (id tetap sama)
  daftarTransaksi[posisi] = {
    id: lama.id,
    platNomor: platBaru,
    kendaraan: kendaraanBaru,
    hari: hariBaru,
    lamaMenit: menitBaru,
    member: memberBaru,
    totalBayar: rincian.total,
  };
  // Memberi tahu pengguna bahwa data berhasil diubah
  console.log("\nData " + lama.id + " berhasil diubah. Total baru: " + formatRupiah(rincian.total));
}

