// =====================================================================
// BAGIAN: FUNGSI PERHITUNGAN TARIF PARKIR
// =====================================================================

// Hasil perhitungan biaya parkir
export interface RincianBiaya {
  jam: number;
  tambahanHari: number;
  diskonPersen: number;
  gratisJam1: boolean;
  total: number;
}

// Fungsi menghitung biaya parkir
export function hitungBiaya(
  kendaraan: number,
  hari: number,
  lamaMenit: number,
  member: boolean
): RincianBiaya {

  // Menghitung sisa menit
  const sisaMenit: number = lamaMenit % 60;

  // Menghitung lama parkir dalam jam
  let jam: number = lamaMenit - sisaMenit;
  jam /= 60;

  // Membulatkan jam ke atas jika ada sisa menit
  if (sisaMenit > 0) {
    jam += 1;
  }

  // Menentukan tarif kendaraan
  let tarifPertama: number = 0;
  let tarifLanjut: number = 0;
  let gratisJam1: boolean = false;

  switch (kendaraan) {
    case 1:
      tarifPertama = 2000;
      tarifLanjut = 1000;
      break;

    case 2:
      tarifPertama = 4000;
      tarifLanjut = 2000;

      if (jam > 5) {
        tarifLanjut -= 500;

        if (member && hari === 1) {
          gratisJam1 = true;
        }
      }
      break;

    case 3:
      tarifPertama = 8000;
      tarifLanjut = 4000;
      break;

    default:
      break;
  }

  // Menentukan biaya tambahan berdasarkan hari
  let tambahanHari: number = 0;

  switch (hari) {
    case 1:
      tambahanHari = 0;
      break;

    case 2:
      tambahanHari = 2000;
      break;

    case 3:
      tambahanHari = 4000;

      if (kendaraan === 3) {
        tambahanHari += 4000;
      }
      break;

    default:
      break;
  }

  // Menghitung biaya jam lanjutan
  let biayaLanjut: number = jam - 1;
  biayaLanjut *= tarifLanjut;

  // Menghitung total biaya awal
  let total: number = tarifPertama + biayaLanjut;

  // Mengurangi biaya jika jam pertama gratis
  if (gratisJam1) {
    total -= tarifPertama;
  }

  // Menambahkan biaya tambahan hari
  total += tambahanHari;

  // Menentukan diskon member
  let diskonPersen: number = 0;

  if (member && total >= 15000) {
    diskonPersen = 15;
  } else if (member) {
    diskonPersen = 10;
  } else {
    diskonPersen = 0;
  }

  // Menghitung diskon dan membulatkan total
  total -= (total * diskonPersen) / 100;
  total = Math.round(total);

  // Mengembalikan rincian biaya
  return {
    jam,
    tambahanHari,
    diskonPersen,
    gratisJam1,
    total
  };
}
