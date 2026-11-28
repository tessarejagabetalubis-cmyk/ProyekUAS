// Struktur data untuk menyimpan transaksi parkir
export interface TransaksiParkir {
  id: string;
  platNomor: string;
  kendaraan: number;
  hari: number;
  lamaMenit: number;
  member: boolean;
  totalBayar: number;
}

// Array untuk menyimpan seluruh transaksi
export const daftarTransaksi: TransaksiParkir[] = [];

// Batas maksimal lama parkir dalam menit (7 hari)
export const MAKS_MENIT: number = 10080;

// Fungsi mengubah kode kendaraan menjadi nama kendaraan
export function namaKendaraan(kendaraan: number): string {
  switch (kendaraan) {
    case 1:
      return "Motor";
    case 2:
      return "Mobil";
    case 3:
      return "Bus";
    default:
      return "Tidak diketahui";
  }
}

// Fungsi mengubah kode hari menjadi nama hari
export function namaHari(hari: number): string {
  switch (hari) {
    case 1:
      return "Senin-Jumat";
    case 2:
      return "Sabtu";
    case 3:
      return "Minggu";
    default:
      return "Tidak diketahui";
  }
}

// Fungsi mengubah angka menjadi format rupiah
export function formatRupiah(angka: number): string {
  return "Rp" + angka.toLocaleString("id-ID");
}
