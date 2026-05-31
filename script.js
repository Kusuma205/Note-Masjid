// 1. Inisialisasi Elemen HTML
const form = document.getElementById('kegiatanForm');
const daftarContainer = document.getElementById('daftarKegiatan');

// 2. Mengambil data lama yang tersimpan di memori HP (LocalStorage)
let dataKegiatan = JSON.parse(localStorage.getItem('kegiatanBaiturrahmah')) || [];

// 3. Fungsi untuk menampilkan data ke layar HP
function tampilkanData() {
    daftarContainer.innerHTML = '';

    // Jika data masih kosong
    if (dataKegiatan.length === 0) {
        daftarContainer.innerHTML = `
            <p class="text-center text-gray-500 text-sm py-8 bg-white rounded-xl border border-dashed border-gray-300">
                Belum ada kegiatan yang dicatat.
            </p>`;
        return;
    }

    // Urutkan data berdasarkan Tanggal terlebih dahulu, lalu Waktu (Jam)
    dataKegiatan.sort((a, b) => {
        if (a.tanggal !== b.tanggal) {
            return new Date(a.tanggal) - new Date(b.tanggal);
        }

        // Urutan hari manual agar Senin di atas dan Minggu di bawah
        const urutanHari = {
            "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4,
            "Jumat": 5, "Sabtu": 6, "Minggu": 7
        };

        if (a.hari !== b.hari) {
            return urutanHari[a.hari] - urutanHari[b.hari];
        } 
        
        return a.waktu.localeCompare(b.waktu);
    });

    // Looping data untuk mendesain kartu catatan di HP
    dataKegiatan.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-xl shadow-xs border-l-4 border-emerald-500 flex justify-between items-start animate-fade-in";

        // Format tanggal agar lebih enak dibaca (YYYY-MM-DD menjadi DD/MM/YYYY)
        const formatTanggal = item.tanggal.split('-').reverse().join('/');

        card.innerHTML = `
            <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ${formatTanggal}
                    </span>
                    <span class="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                        ${item.hari}
                    </span>
                    <span class="text-xs text-gray-500 font-mono">${item.waktu} WIB</span>
                </div>
                <h3 class="font-semibold text-gray-800 text-base">${item.namaKegiatan}</h3>
                ${item.keterangan ? `<p class="text-xs text-gray-600 italic">"${item.keterangan}"</p>` : ''}
            </div>
            <button onclick="hapusSatu(${index})" class="text-gray-400 hover:text-red-500 text-sm p-1 transition-colors duration-150">
                ✕
            </button>
        `;
        daftarContainer.appendChild(card);
    });
}

// 4. Event Listener saat Tombol 'Simpan' Ditekan
form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Ambil nilai dari Form dan bersihkan koma agar format CSV/Excel aman
    const dataBaru = {
        tanggal: document.getElementById('tanggal').value,
        hari: document.getElementById('hari').value,
        namaKegiatan: document.getElementById('namaKegiatan').value.replace(/,/g, '-'),
        waktu: document.getElementById('waktu').value,
        keterangan: document.getElementById('keterangan').value.replace(/,/g, '-')
    };

    // Tambahkan ke array dan simpan ke memori internal HP
    dataKegiatan.push(dataBaru);
    localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));

    // Perbarui tampilan layar dan reset form input
    tampilkanData();
    form.reset();
});

// 5. Fungsi untuk Mengunduh Laporan dalam Bentuk Excel (.csv)
function exportKeExcel() {
    if (dataKegiatan.length === 0) {
        alert("Belum ada data untuk diunduh. Silakan isi kegiatan terlebih dahulu!");
        return;
    }

    // Judul Kolom di Excel (Ditambahkan kolom Tanggal paling depan)
    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Hari,Waktu,Nama Kegiatan,Keterangan\n";

    // Memasukkan data baris demi baris
    dataKegiatan.forEach(function (rowArray) {
        let row = `${rowArray.tanggal},${rowArray.hari},${rowArray.waktu},${rowArray.namaKegiatan},${rowArray.keterangan}`;
        csvContent += row + "\r\n";
    });

    // Proses download otomatis di browser HP / Laptop
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Log_Kegiatan_Baiturrahmah.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

// 6. Fungsi Hapus Salah Satu Catatan
function hapusSatu(index) {
    if (confirm('Apakah Anda yakin ingin menghapus catatan kegiatan ini?')) {
        dataKegiatan.splice(index, 1);
        localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
        tampilkanData();
    }
}

// 7. Fungsi Hapus Semua Catatan Sekaligus
function hapusSemua() {
    if (confirm('PERINGATAN! Apakah Anda yakin ingin menghapus seluruh catatan kegiatan yang tersimpan?')) {
        dataKegiatan = [];
        localStorage.removeItem('kegiatanBaiturrahmah');
        tampilkanData();
    }
}

// 8. Jalankan pemuatan data otomatis saat aplikasi pertama kali dibuka
tampilkanData();