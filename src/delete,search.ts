// ---------------------------------------------------------------------
// BAGIAN 8: FITUR DELETE
// ---------------------------------------------------------------------

// Fungsi menghapus transaksi berdasarkan id dengan konfirmasi (tanpa parameter, void)
function hapusData(): void {
  // Judul fitur
  console.log("\n--- HAPUS TRANSAKSI PARKIR ---");
  // Jika data kosong, tidak ada yang bisa dihapus
  if (daftarTransaksi.length === 0) {
    console.log("Belum ada data transaksi parkir.");
    return;
  }
  // Membaca id yang akan dihapus
  const idCari: string = tanya("Masukkan ID yang dihapus : ").trim().toUpperCase();
  // Mencari posisi data memakai findIndex
  const posisi: number = daftarTransaksi.findIndex((x) => x.id === idCari);
  // Jika tidak ditemukan, tampilkan pesan lalu keluar
  if (posisi === -1) {
    console.log("ID " + idCari + " tidak ditemukan.");
    return;
  }
  // Menampilkan data yang akan dihapus agar pengguna yakin
  cetakJudulTabel();
  cetakBaris(daftarTransaksi[posisi]!);
  // Meminta konfirmasi Y/N sebelum menghapus
  const yakin: boolean = bacaYaTidak("Yakin hapus data ini? (y/t) : ");
  // Jika pengguna menjawab y, hapus data
  if (yakin) {
    // splice(posisi, 1) membuang 1 elemen pada posisi tersebut
    daftarTransaksi.splice(posisi, 1);
    console.log("Data " + idCari + " berhasil dihapus.");
  } else {
    // Jika menjawab t, data tetap aman
    console.log("Penghapusan dibatalkan.");
  }
}

// ---------------------------------------------------------------------
// BAGIAN 9: FITUR SEARCH
// ---------------------------------------------------------------------

// Fungsi mencari data berdasarkan kata kunci plat + filter kendaraan + filter member
function cariData(): void {
  // Judul fitur
  console.log("\n--- CARI TRANSAKSI PARKIR ---");
  // Membaca kata kunci (kosong berarti semua plat) dan diubah ke huruf kecil
  const kataKunci: string = tanya("Kata kunci plat (Enter = semua) : ").trim().toLowerCase();
  // Filter 1: jenis kendaraan, 0 berarti semua jenis
  const filterKendaraan: number = bacaAngka("Filter kendaraan (0=Semua, 1=Motor, 2=Mobil, 3=Bus) : ", 0, 3);
  // Filter 2: status member, 0 = semua, 1 = member saja, 2 = non-member saja
  const filterMember: number = bacaAngka("Filter member (0=Semua, 1=Member, 2=Non-member) : ", 0, 2);

  // Menyaring array memakai filter dengan tiga syarat yang harus terpenuhi bersamaan
  const hasil: TransaksiParkir[] = daftarTransaksi.filter((t) => {
    // Syarat 1: plat mengandung kata kunci tanpa membedakan huruf besar/kecil
    const cocokPlat: boolean = t.platNomor.toLowerCase().includes(kataKunci);
    // Syarat 2: jenis kendaraan sesuai filter (atau filter = semua)
    const cocokKendaraan: boolean = filterKendaraan === 0 || t.kendaraan === filterKendaraan;
    // Syarat 3: status member sesuai filter (atau filter = semua)
    const cocokMember: boolean =
      filterMember === 0 || (filterMember === 1 && t.member) || (filterMember === 2 && !t.member);
    // Data lolos jika ketiga syarat terpenuhi
    return cocokPlat && cocokKendaraan && cocokMember;
  });

  // Jika tidak ada hasil, tampilkan pesan lalu keluar
  if (hasil.length === 0) {
    console.log("\nData tidak ditemukan.");
    return;
  }
  // Menampilkan jumlah hasil pencarian
  console.log("\nDitemukan " + hasil.length + " data:");
  // Menampilkan judul kolom
  cetakJudulTabel();
  // LOOP forEach: mencetak setiap hasil pencarian
  hasil.forEach((t) => cetakBaris(t));
}