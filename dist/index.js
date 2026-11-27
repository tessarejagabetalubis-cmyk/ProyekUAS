// =====================================================================
// KASIR TARIF PARKIR BERBASIS CLI (TypeScript) - UAS Pemrograman Dasar
// Pengembangan dari proyek UTS: ditambah loop, array, fungsi, CRUD, dan Search
// =====================================================================
// Mengimpor modul fs bawaan Node.js untuk membaca input dari terminal
import * as fs from "fs";
// ---------------------------------------------------------------------
// BAGIAN 2: DATA AWAL (SEED) DAN VARIABEL GLOBAL
// ---------------------------------------------------------------------
// Array penyimpan seluruh transaksi di dalam memori (isinya berubah, maka let)
let daftarTransaksi = [];
// Penghitung nomor urut untuk membuat id baru (nilainya terus bertambah, maka let)
let nomorUrut = 0;
// Batas lama parkir maksimal dalam menit (nilai tetap, maka const) = 7 hari
const MAKS_MENIT = 10080;
// ---------------------------------------------------------------------
// BAGIAN 3: FUNGSI BANTU (INPUT, FORMAT, ID)
// ---------------------------------------------------------------------
// Fungsi membaca satu baris teks dari terminal (parameter: pesan, return: string)
function tanya(pesan) {
    // Menampilkan pesan pertanyaan tanpa pindah baris
    process.stdout.write(pesan);
    // Menyiapkan buffer 1 byte untuk membaca input satu per satu
    const buf = Buffer.alloc(1);
    // Menampung byte yang dibaca sampai pengguna menekan Enter
    const bytes = [];
    // Mengulang membaca byte selama Enter belum ditekan
    while (true) {
        // Jumlah byte yang berhasil dibaca pada putaran ini
        let terbaca = 0;
        try {
            // Membaca 1 byte dari standar input (file descriptor 0)
            terbaca = fs.readSync(0, buf, 0, 1, null);
        }
        catch (e) {
            // Jika input belum siap, ulangi membaca; selain itu dianggap input selesai
            if (e.code === "EAGAIN") {
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
        // Jika karakter adalah Enter (newline), selesai membaca satu baris
        if (buf[0] === 10) {
            break;
        }
        // Mengabaikan karakter carriage return (13) milik Windows, simpan sisanya
        if (buf[0] !== 13) {
            bytes.push(buf.readUInt8(0));
        }
    }
    // Mengubah kumpulan byte menjadi teks UTF-8
    return Buffer.from(bytes).toString("utf8");
}
// Fungsi mengubah angka menjadi format rupiah (parameter: angka, return: string)
function formatRupiah(angka) {
    // Memakai pemisah ribuan gaya Indonesia lalu diberi awalan Rp
    return "Rp" + angka.toLocaleString("id-ID");
}
// Fungsi mengubah kode jenis kendaraan menjadi nama (SWITCH dengan 4 jalur)
function namaKendaraan(kode) {
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
function namaHari(kode) {
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
// Fungsi membuat id baru yang unik (tanpa parameter, return: string)
function buatIdBaru() {
    // Kandidat id yang akan dicek keunikannya
    let kandidat = "";
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
function bacaAngka(pesan, min, maks, bolehKosong = false, nilaiLama = 0) {
    // Nilai hasil input yang sudah valid
    let hasil = 0;
    // Penanda apakah input sudah benar
    let valid = false;
    // Mengulang bertanya sampai input valid (program tidak berhenti saat salah)
    while (!valid) {
        // Membaca input lalu membuang spasi di awal dan akhir
        const teks = tanya(pesan).trim();
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
        const angka = Number(teks);
        // Kasus 2: bukan angka
        if (isNaN(angka)) {
            console.log("  [!] Input harus berupa angka.");
        }
        else if (angka < 0) {
            // Kasus 3: angka negatif
            console.log("  [!] Angka tidak boleh negatif.");
        }
        else if (angka < min || angka > maks) {
            // Kasus 4: angka di luar rentang yang diizinkan
            console.log("  [!] Angka harus di antara " + min + " dan " + maks + ".");
        }
        else {
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
function bacaYaTidak(pesan, bolehKosong = false, nilaiLama = false) {
    // Mengulang sampai jawaban benar-benar y atau t
    while (true) {
        // Membaca jawaban, dibuang spasinya, dan dijadikan huruf kecil
        const jawab = tanya(pesan).trim().toLowerCase();
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
function bacaPlat(bolehKosong = false, nilaiLama = "") {
    // Mengulang sampai plat nomor terisi
    while (true) {
        // Membaca plat, dibuang spasi ujung, dan dijadikan huruf besar
        const plat = tanya("Plat nomor : ").trim().toUpperCase();
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
// ---------------------------------------------------------------------
// BAGIAN 4: FUNGSI PERHITUNGAN TARIF (INTI PROYEK UTS)
// ---------------------------------------------------------------------
// Fungsi menghitung biaya parkir (4 parameter bertipe, return: RincianBiaya)
function hitungBiaya(kendaraan, hari, lamaMenit, member) {
    // Sisa menit dengan operator modulus (%): menit yang tidak genap 60
    const sisaMenit = lamaMenit % 60;
    // Jam penuh = menit dikurangi sisa, lalu dibagi 60 memakai compound /=
    let jam = lamaMenit - sisaMenit;
    jam /= 60;
    // IF 1: jika ada sisa menit, jam dibulatkan ke atas (jam += 1)
    if (sisaMenit > 0) {
        jam += 1;
    }
    // Variabel tarif yang akan ditentukan oleh switch kendaraan
    let tarifPertama = 0;
    let tarifLanjut = 0;
    // Penanda jam pertama gratis (awalnya tidak berhak)
    let gratisJam1 = false;
    // SWITCH 1: menentukan tarif berdasarkan jenis kendaraan
    switch (kendaraan) {
        case 1: // Motor
            tarifPertama = 2000;
            tarifLanjut = 1000;
            break;
        case 2: // Mobil
            tarifPertama = 4000;
            tarifLanjut = 2000;
            // IF 2 (nested tingkat 2): parkir lebih dari 5 jam, tarif lanjut turun
            if (jam > 5) {
                // Compound -=: tarif lanjut dikurangi Rp500 per jam
                tarifLanjut -= 500;
                // IF 3 (nested tingkat 3, kondisi majemuk &&): member di hari kerja
                if (member && hari === 1) {
                    // Member mobil di hari kerja berhak jam pertama gratis
                    gratisJam1 = true;
                }
            }
            break;
        case 3: // Bus
            tarifPertama = 8000;
            tarifLanjut = 4000;
            break;
        default: // kode tidak dikenal (tidak terjadi karena sudah divalidasi)
            break;
    }
    // Variabel tambahan biaya berdasarkan hari
    let tambahanHari = 0;
    // SWITCH 2: menentukan biaya tambahan berdasarkan jenis hari
    switch (hari) {
        case 1: // Senin-Jumat
            tambahanHari = 0;
            break;
        case 2: // Sabtu
            tambahanHari = 2000;
            break;
        case 3: // Minggu
            tambahanHari = 4000;
            // IF 4 (nested): khusus bus di hari Minggu ditambah lagi Rp4.000
            if (kendaraan === 3) {
                tambahanHari += 4000;
            }
            break;
        default: // kode tidak dikenal
            break;
    }
    // Biaya jam lanjutan = (jam - 1) lalu dikali tarif lanjut memakai compound *=
    let biayaLanjut = jam - 1;
    biayaLanjut *= tarifLanjut;
    // Total awal = tarif jam pertama + biaya jam lanjutan
    let total = tarifPertama + biayaLanjut;
    // IF 5: jika berhak jam pertama gratis, total dikurangi tarif jam pertama
    if (gratisJam1) {
        total -= tarifPertama;
    }
    // Menambahkan biaya tambahan hari ke total
    total += tambahanHari;
    // Persentase diskon member (awalnya 0)
    let diskonPersen = 0;
    // IF 6 (rantai if / else if / else): diskon berdasarkan status member dan total
    if (member && total >= 15000) {
        diskonPersen = 15; // member dengan total besar: diskon 15%
    }
    else if (member) {
        diskonPersen = 10; // member biasa: diskon 10%
    }
    else {
        diskonPersen = 0; // bukan member: tanpa diskon
    }
    // Mengurangi total dengan nilai diskon (compound -=) lalu dibulatkan
    total -= (total * diskonPersen) / 100;
    total = Math.round(total);
    // Mengembalikan seluruh hasil perhitungan dalam satu objek
    return { jam, tambahanHari, diskonPersen, gratisJam1, total };
}
// ---------------------------------------------------------------------
// BAGIAN 5: FITUR CREATE
// ---------------------------------------------------------------------
// Fungsi menambah transaksi parkir baru (tanpa parameter, tanpa return / void)
function tambahData() {
    // Judul fitur
    console.log("\n--- TAMBAH TRANSAKSI PARKIR ---");
    // Membaca data dari pengguna dengan validasi di setiap input
    const platNomor = bacaPlat();
    const kendaraan = bacaAngka("Kendaraan (1=Motor, 2=Mobil, 3=Bus) : ", 1, 3);
    const hari = bacaAngka("Hari (1=Senin-Jumat, 2=Sabtu, 3=Minggu) : ", 1, 3);
    const lamaMenit = bacaAngka("Lama parkir (menit, 1-" + MAKS_MENIT + ") : ", 1, MAKS_MENIT);
    const member = bacaYaTidak("Member? (y/t) : ");
    // Menghitung biaya memakai fungsi hitungBiaya
    const rincian = hitungBiaya(kendaraan, hari, lamaMenit, member);
    // Menyusun objek transaksi baru dengan id unik
    const baru = {
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
// ---------------------------------------------------------------------
// BAGIAN 6: FITUR READ
// ---------------------------------------------------------------------
// Fungsi mencetak satu baris data dalam bentuk tabel (parameter: satu transaksi, void)
function cetakBaris(t) {
    // Menyusun satu baris dengan lebar kolom tetap agar rapi
    console.log(t.id.padEnd(9) +
        t.platNomor.padEnd(11) +
        namaKendaraan(t.kendaraan).padEnd(8) +
        namaHari(t.hari).padEnd(13) +
        String(t.lamaMenit).padStart(6) +
        (t.member ? "  Ya   " : "  Tidak") +
        formatRupiah(t.totalBayar).padStart(11));
}
// Fungsi mencetak judul kolom tabel (tanpa parameter, void)
function cetakJudulTabel() {
    // Judul kolom dengan lebar yang sama seperti cetakBaris
    console.log("ID".padEnd(9) +
        "Plat".padEnd(11) +
        "Jenis".padEnd(8) +
        "Hari".padEnd(13) +
        "Menit".padStart(6) +
        "  Member" +
        "Total".padStart(11));
    // Garis pemisah
    console.log("-".repeat(65));
}
// Fungsi menampilkan seluruh data (tanpa parameter, void)
function tampilSemuaData() {
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
        cetakBaris(daftarTransaksi[i]);
    }
    // Total pendapatan awalnya 0 lalu dijumlahkan satu per satu
    let totalPendapatan = 0;
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
function tampilDetail() {
    // Judul fitur
    console.log("\n--- DETAIL TRANSAKSI BERDASARKAN ID ---");
    // Jika data kosong, tidak ada yang bisa dicari
    if (daftarTransaksi.length === 0) {
        console.log("Belum ada data transaksi parkir.");
        return;
    }
    // Membaca id yang dicari lalu dijadikan huruf besar agar tidak sensitif huruf
    const idCari = tanya("Masukkan ID (contoh TRX-001) : ").trim().toUpperCase();
    // Mencari transaksi dengan id yang sama memakai find
    const t = daftarTransaksi.find((x) => x.id === idCari);
    // Jika tidak ditemukan, tampilkan pesan khusus
    if (t === undefined) {
        console.log("ID " + idCari + " tidak ditemukan.");
        return;
    }
    // Menghitung ulang rincian biaya untuk ditampilkan
    const r = hitungBiaya(t.kendaraan, t.hari, t.lamaMenit, t.member);
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
function ubahData() {
    // Judul fitur
    console.log("\n--- UBAH TRANSAKSI PARKIR ---");
    // Jika data kosong, tidak ada yang bisa diubah
    if (daftarTransaksi.length === 0) {
        console.log("Belum ada data transaksi parkir.");
        return;
    }
    // Membaca id yang akan diubah
    const idCari = tanya("Masukkan ID yang diubah : ").trim().toUpperCase();
    // Mencari posisi data di array memakai findIndex (hasil -1 jika tidak ada)
    const posisi = daftarTransaksi.findIndex((x) => x.id === idCari);
    // Jika tidak ditemukan, tampilkan pesan lalu keluar
    if (posisi === -1) {
        console.log("ID " + idCari + " tidak ditemukan.");
        return;
    }
    // Mengambil data lama dari array
    const lama = daftarTransaksi[posisi];
    // Menampilkan data lama terlebih dahulu
    console.log("Data lama:");
    cetakJudulTabel();
    cetakBaris(lama);
    console.log("(Tekan Enter untuk melewati kolom yang tidak diubah)\n");
    // Membaca nilai baru; kolom kosong memakai nilai lama
    const platBaru = bacaPlat(true, lama.platNomor);
    const kendaraanBaru = bacaAngka("Kendaraan (1-3) [" + namaKendaraan(lama.kendaraan) + "] : ", 1, 3, true, lama.kendaraan);
    const hariBaru = bacaAngka("Hari (1-3) [" + namaHari(lama.hari) + "] : ", 1, 3, true, lama.hari);
    const menitBaru = bacaAngka("Lama parkir menit [" + lama.lamaMenit + "] : ", 1, MAKS_MENIT, true, lama.lamaMenit);
    const memberBaru = bacaYaTidak("Member? y/t [" + (lama.member ? "y" : "t") + "] : ", true, lama.member);
    // Menghitung ulang total bayar dengan data baru
    const rincian = hitungBiaya(kendaraanBaru, hariBaru, menitBaru, memberBaru);
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
// ---------------------------------------------------------------------
// BAGIAN 8: FITUR DELETE
// ---------------------------------------------------------------------
// Fungsi menghapus transaksi berdasarkan id dengan konfirmasi (tanpa parameter, void)
function hapusData() {
    // Judul fitur
    console.log("\n--- HAPUS TRANSAKSI PARKIR ---");
    // Jika data kosong, tidak ada yang bisa dihapus
    if (daftarTransaksi.length === 0) {
        console.log("Belum ada data transaksi parkir.");
        return;
    }
    // Membaca id yang akan dihapus
    const idCari = tanya("Masukkan ID yang dihapus : ").trim().toUpperCase();
    // Mencari posisi data memakai findIndex
    const posisi = daftarTransaksi.findIndex((x) => x.id === idCari);
    // Jika tidak ditemukan, tampilkan pesan lalu keluar
    if (posisi === -1) {
        console.log("ID " + idCari + " tidak ditemukan.");
        return;
    }
    // Menampilkan data yang akan dihapus agar pengguna yakin
    cetakJudulTabel();
    cetakBaris(daftarTransaksi[posisi]);
    // Meminta konfirmasi Y/N sebelum menghapus
    const yakin = bacaYaTidak("Yakin hapus data ini? (y/t) : ");
    // Jika pengguna menjawab y, hapus data
    if (yakin) {
        // splice(posisi, 1) membuang 1 elemen pada posisi tersebut
        daftarTransaksi.splice(posisi, 1);
        console.log("Data " + idCari + " berhasil dihapus.");
    }
    else {
        // Jika menjawab t, data tetap aman
        console.log("Penghapusan dibatalkan.");
    }
}
// ---------------------------------------------------------------------
// BAGIAN 9: FITUR SEARCH
// ---------------------------------------------------------------------
// Fungsi mencari data berdasarkan kata kunci plat + filter kendaraan + filter member
function cariData() {
    // Judul fitur
    console.log("\n--- CARI TRANSAKSI PARKIR ---");
    // Membaca kata kunci (kosong berarti semua plat) dan diubah ke huruf kecil
    const kataKunci = tanya("Kata kunci plat (Enter = semua) : ").trim().toLowerCase();
    // Filter 1: jenis kendaraan, 0 berarti semua jenis
    const filterKendaraan = bacaAngka("Filter kendaraan (0=Semua, 1=Motor, 2=Mobil, 3=Bus) : ", 0, 3);
    // Filter 2: status member, 0 = semua, 1 = member saja, 2 = non-member saja
    const filterMember = bacaAngka("Filter member (0=Semua, 1=Member, 2=Non-member) : ", 0, 2);
    // Menyaring array memakai filter dengan tiga syarat yang harus terpenuhi bersamaan
    const hasil = daftarTransaksi.filter((t) => {
        // Syarat 1: plat mengandung kata kunci tanpa membedakan huruf besar/kecil
        const cocokPlat = t.platNomor.toLowerCase().includes(kataKunci);
        // Syarat 2: jenis kendaraan sesuai filter (atau filter = semua)
        const cocokKendaraan = filterKendaraan === 0 || t.kendaraan === filterKendaraan;
        // Syarat 3: status member sesuai filter (atau filter = semua)
        const cocokMember = filterMember === 0 || (filterMember === 1 && t.member) || (filterMember === 2 && !t.member);
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
// ---------------------------------------------------------------------
// BAGIAN 10: MENU UTAMA DAN DATA AWAL
// ---------------------------------------------------------------------
// Fungsi mengisi 5 data awal (seed) agar program langsung punya contoh data
function isiDataAwal() {
    // Daftar data contoh: plat, kendaraan, hari, menit, member
    const contoh = [
        ["N 1234 AB", 1, 1, 90, false],
        ["B 5678 CD", 2, 1, 400, true],
        ["AE 9012 EF", 3, 3, 150, false],
        ["N 3456 GH", 2, 2, 45, true],
        ["L 7890 IJ", 1, 3, 30, false],
    ];
    // LOOP for...of: membuat objek transaksi dari tiap data contoh
    for (const [plat, kend, hr, menit, mem] of contoh) {
        // Menghitung total bayar tiap contoh
        const r = hitungBiaya(kend, hr, menit, mem);
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
function tampilMenu() {
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
function main() {
    // Mengisi data awal sebelum menu tampil
    isiDataAwal();
    // Penanda program masih berjalan
    let berjalan = true;
    // LOOP while: menu terus tampil sampai pengguna memilih 0
    while (berjalan) {
        // Menampilkan menu
        tampilMenu();
        // Membaca pilihan menu sebagai teks lalu dibersihkan
        const pilihan = tanya("Pilih menu (0-6) : ").trim();
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
//# sourceMappingURL=index.js.map