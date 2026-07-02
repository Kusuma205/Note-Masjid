// Inisialisasi Elemen DOM
const form = document.getElementById('kegiatanForm');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const btnBatalEdit = document.getElementById('btn-batal-edit');

// State Aplikasi & Sinkronisasi Data Persisten LocalStorage
let dataKegiatan = JSON.parse(localStorage.getItem('kegiatanBaiturrahmah')) || [];
let editIndex = null;

const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Manajemen Navigasi Tab
function switchTab(tab) {
    const inputSec = document.getElementById('section-input');
    const riwayatSec = document.getElementById('section-riwayat');
    const tInput = document.getElementById('tab-input');
    const tRiwayat = document.getElementById('tab-riwayat');

    if (!inputSec || !riwayatSec || !tInput || !tRiwayat) return;

    if (tab === 'input') {
        inputSec.classList.remove('hidden');
        riwayatSec.classList.add('hidden');
        tInput.classList.add('active-tab');
        tRiwayat.classList.remove('active-tab');
    } else {
        inputSec.classList.add('hidden');
        riwayatSec.classList.remove('hidden');
        tInput.classList.remove('active-tab');
        tRiwayat.classList.add('active-tab');
        tampilkanArsip();
    }
}

// Operasi Form: Tambah / Edit Catatan Kegiatan
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const dataBaru = {
        tanggal: document.getElementById('input-tanggal').value,
        hari: document.getElementById('input-hari').value,
        waktu: document.getElementById('input-waktu').value,
        namaKegiatan: document.getElementById('input-nama').value,
        keterangan: document.getElementById('input-keterangan').value
    };

    if (editIndex === null) {
        // Mode Tambah Baru
        dataKegiatan.push(dataBaru);
    } else {
        // Mode Perbarui Data
        dataKegiatan[editIndex] = dataBaru;
        editIndex = null;
        submitBtn.innerText = "Simpan Catatan";
        formTitle.innerText = "Tambah Kegiatan";
        btnBatalEdit.classList.add('hidden');
    }

    // Urutkan data berdasarkan urutan kronologis tanggal terbaru
    dataKegiatan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
    form.reset();
    alert("Data berhasil disimpan.");
    switchTab('riwayat');
});

// Membatalkan Aksi Edit Data
btnBatalEdit.addEventListener('click', function () {
    editIndex = null;
    form.reset();
    submitBtn.innerText = "Simpan Catatan";
    formTitle.innerText = "Tambah Kegiatan";
    this.classList.add('hidden');
});

// Rendering Data Arsip Secara Dinamis Berdasarkan Pengelompokan Bulan
function tampilkanArsip() {
    const container = document.getElementById('arsipContainer');
    if (!container) return;
    container.innerHTML = '';

    if (dataKegiatan.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-10">Belum ada catatan kegiatan.</p>`;
        return;
    }

    // Memetakan indeks asli array sebelum dikelompokkan
    const dataDenganId = dataKegiatan.map((item, index) => ({ ...item, originalIndex: index }));

    // Pengelompokan Berdasarkan Kunci Bulan-Tahun
    const kelompok = {};
    dataDenganId.forEach(item => {
        const dateObj = new Date(item.tanggal);
        if (isNaN(dateObj)) return; // Cegah tanggal invalid
        const kunci = `${namaBulan[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        if (!kelompok[kunci]) kelompok[kunci] = [];
        kelompok[kunci].push(item);
    });

    // Membuat Tampilan Folder Akordion di UI
    for (const [bulanTahun, listKegiatan] of Object.entries(kelompok)) {
        const folderDiv = document.createElement('div');
        folderDiv.className = "bg-white rounded-xl shadow-xs border overflow-hidden";

        let htmlKonten = `
            <div class="bg-gray-50 p-3 font-semibold text-gray-700 border-b flex justify-between items-center">
                <span>📁 ${bulanTahun}</span>
                <span class="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full">${listKegiatan.length} Catatan</span>
            </div>
            <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        `;

        listKegiatan.forEach(item => {
            const tglSaja = item.tanggal.split('-').reverse().join('/');
            htmlKonten += `
                <div class="p-4 space-y-1 hover:bg-gray-50 transition-all">
                    <div class="flex justify-between items-start">
                        <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">${item.hari}, ${tglSaja} (${item.waktu} WIB)</span>
                        <div class="flex gap-3 text-xs text-gray-400">
                            <button onclick="pemicuEdit(${item.originalIndex})" class="text-blue-600 font-medium hover:underline">Edit</button>
                            <button onclick="hapusSatu(${item.originalIndex})" class="text-red-600 font-medium hover:underline">Hapus</button>
                        </div>
                    </div>
                    <h4 class="font-bold text-gray-800 text-sm pt-1">${item.namaKegiatan}</h4>
                    <p class="text-xs text-gray-500">${item.keterangan || '-'}</p>
                </div>
            `;
        });

        htmlKonten += `</div>`;
        folderDiv.innerHTML = htmlKonten;
        container.appendChild(folderDiv);
    }
}

// Memuat Data Terpilih Kembali Ke Form Untuk Diubah
window.pemicuEdit = function (index) {
    const item = dataKegiatan[index];
    if (!item) return;

    editIndex = index;
    document.getElementById('input-tanggal').value = item.tanggal;
    document.getElementById('input-hari').value = item.hari;
    document.getElementById('input-waktu').value = item.waktu;
    document.getElementById('input-nama').value = item.namaKegiatan;
    document.getElementById('input-keterangan').value = item.keterangan || '';

    submitBtn.innerText = "Perbarui Catatan";
    formTitle.innerText = "Edit Kegiatan ID: #" + (index + 1);
    btnBatalEdit.classList.remove('hidden');

    switchTab('input');
};

// Menghapus Satu Item Data Terpilih
window.hapusSatu = function (index) {
    if (confirm('Apakah Anda yakin ingin menghapus catatan kegiatan ini?')) {
        dataKegiatan.splice(index, 1);
        localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
        tampilkanArsip();
    }
};

// Pembersihan Massal Penyimpanan
window.hapusSemua = function () {
    if (confirm('⚠️ PERINGATAN MUTLAK! Seluruh arsip bulanan akan dihapus permanen dari memori browser ini. Lanjutkan?')) {
        dataKegiatan = [];
        localStorage.removeItem('kegiatanBaiturrahmah');
        tampilkanArsip();
    }
};

// Fungsi Ekspor Laporan Excel Berformat .xlsx Menggunakan SheetJS
window.unduhExcel = function () {
    if (dataKegiatan.length === 0) {
        alert("Gagal ekspor: Tidak ada data catatan untuk dicetak!");
        return;
    }

    // 1. Transformasi Data Sesuai Format Kolom Excel
    const dataFormatExcel = dataKegiatan.map(item => ({
        "Tanggal": item.tanggal.split('-').reverse().join('/'),
        "Hari": item.hari,
        "Waktu Tugas": `${item.waktu} WIB`,
        "Nama Kegiatan": item.namaKegiatan,
        "Keterangan": item.keterangan || "-"
    }));

    // 2. Pembuatan Lembar Kerja Baru
    const worksheet = XLSX.utils.json_to_sheet(dataFormatExcel);
    const workbook = XLSX.utils.book_new();

    XXLSX.utils.book_append_sheet(workbook, worksheet, "Jurnal Baiturrahmah");

    // 3. Set Format Lebar Kolom Lembar Kerja Otomatis
    const maxProps = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 30 }];
    worksheet['!cols'] = maxProps;

    // 4. Trigger Unduhan Berkas ke Client Browser
    XLSX.writeFile(workbook, 'Laporan_Kegiatan_Baiturrahmah.xlsx');
};

// Registrasi Service Worker untuk Persyaratan Mutlak PWA (Progressive Web App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA Service Worker terdaftar aman pada scope:', reg.scope))
            .catch(err => console.error('Kritis: PWA Service Worker gagal beroperasi:', err));
    });
}