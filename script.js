const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycby59d1rVth45hqg0TVvDG0_gTZos60n_YAjTdhvzivwXyKFl2ASNuPjSx6pjRsrtkw/exec";

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
window.switchTab = function (tab) {
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
        tampilkanArsip(); // Render ulang data setiap kali tab arsip dibuka
    }
};

// Fungsi Menampilkan & Mengelompokkan Arsip Per Bulan
function tampilkanArsip() {
    const container = document.getElementById('arsipContainer');
    if (!container) return;
    container.innerHTML = '';

    if (dataKegiatan.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-10">Belum ada catatan kegiatan.</p>`;
        return;
    }

    // Kelompokkan data berdasarkan Bulan dan Tahun
    const kelompok = {};
    dataKegiatan.forEach((item, index) => {
        const d = new Date(item.tanggal);
        if (isNaN(d.getTime())) return;
        const bulan = namaBulan[d.getMonth()];
        const tahun = d.getFullYear();
        const kunci = `${bulan} ${tahun}`;

        if (!kelompok[kunci]) {
            kelompok[kunci] = [];
        }
        kelompok[kunci].push({ ...item, originalIndex: index });
    });

    // Render komponen HTML visual per bulan
    for (const kunci in kelompok) {
        const grupDiv = document.createElement('div');
        grupDiv.className = 'bg-white p-4 rounded-xl shadow-xs space-y-3';

        const judulGrup = document.createElement('h3');
        judulGrup.className = 'font-bold text-emerald-700 border-b pb-1 text-sm uppercase tracking-wider';
        judulGrup.innerText = kunci;
        grupDiv.appendChild(judulGrup);

        const listKegiatan = document.createElement('div');
        listKegiatan.className = 'space-y-3';

        kelompok[kunci].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start text-sm';

            const tglFormat = item.tanggal.split('-').reverse().join('/');

            itemDiv.innerHTML = `
                <div class="space-y-1 flex-1 pr-2">
                    <div class="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <span>${tglFormat} (${item.hari})</span>
                        <span class="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">${item.waktu} WIB</span>
                    </div>
                    <h4 class="font-bold text-gray-800">${item.namaKegiatan}</h4>
                    <p class="text-gray-600 text-xs">${item.keterangan || '-'}</p>
                </div>
                <div class="flex gap-2 text-xs font-medium ml-2">
                    <button onclick="editCatatan(${item.originalIndex})" class="text-blue-600 hover:underline">Edit</button>
                    <button onclick="hapusSatu(${item.originalIndex})" class="text-red-600 hover:underline">Hapus</button>
                </div>
            `;
            listKegiatan.appendChild(itemDiv);
        });

        grupDiv.appendChild(listKegiatan);
        container.appendChild(grupDiv);
    }
}

// Operasi Penambahan & Pengeditan Data (Submit Form)
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const dataBaru = {
        tanggal: document.getElementById('input-tanggal').value,
        hari: document.getElementById('input-hari').value,
        waktu: document.getElementById('input-waktu').value,
        namaKegiatan: document.getElementById('input-nama').value,
        keterangan: document.getElementById('input-keterangan').value
    };

    submitBtn.disabled = true;
    submitBtn.innerText = "Mengirim ke Spreadsheet...";

    // Mengirimkan data secara remote ke Google Apps Script API
    fetch(GOOGLE_SHEET_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataBaru)
    })
        .then(() => {
            if (editIndex === null) {
                dataKegiatan.push(dataBaru);
            } else {
                dataKegiatan[editIndex] = dataBaru;
                editIndex = null;
                formTitle.innerText = "Tambah Kegiatan";
                btnBatalEdit.classList.add('hidden');
            }

            dataKegiatan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));

            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerText = "Simpan Catatan";

            alert("Data berhasil disinkronisasi ke Spreadsheet!");
            switchTab('riwayat');
        })
        .catch(err => {
            console.error("Koneksi gagal API:", err);
            alert("Gagal terhubung ke Google Sheets. Data diamankan di memori lokal perangkat.");
            submitBtn.disabled = false;
            submitBtn.innerText = "Simpan Catatan";
        });
});

// Aksi Pembatalan Mode Edit
btnBatalEdit.addEventListener('click', function () {
    form.reset();
    editIndex = null;
    formTitle.innerText = "Tambah Kegiatan";
    submitBtn.innerText = "Simpan Catatan";
    btnBatalEdit.classList.add('hidden');
});

// Fitur Interaktif Manajemen Data (Global Scope binding)
window.editCatatan = function (index) {
    const item = dataKegiatan[index];
    if (!item) return;

    document.getElementById('input-tanggal').value = item.tanggal;
    document.getElementById('input-hari').value = item.hari;
    document.getElementById('input-waktu').value = item.waktu;
    document.getElementById('input-nama').value = item.namaKegiatan;
    document.getElementById('input-keterangan').value = item.keterangan || '';

    editIndex = index;
    formTitle.innerText = "Edit Catatan Kegiatan";
    submitBtn.innerText = "Perbarui Catatan";
    btnBatalEdit.classList.remove('hidden');

    switchTab('input');
};

window.hapusSatu = function (index) {
    if (confirm("Hapus baris catatan kegiatan ini dari perangkat?")) {
        dataKegiatan.splice(index, 1);
        localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
        tampilkanArsip();
    }
};

window.hapusSemua = function () {
    if (confirm("PERINGATAN! Seluruh data lokal di perangkat ini akan dibersihkan secara permanen. Lanjutkan?")) {
        dataKegiatan = [];
        localStorage.removeItem('kegiatanBaiturrahmah');
        tampilkanArsip();
    }
};

// Ekspor Lembar Kerja Excel Berbasis SheetJS
window.unduhExcel = function () {
    if (dataKegiatan.length === 0) {
        alert("Tidak ada data yang dapat diekspor.");
        return;
    }
    const dataFormatExcel = dataKegiatan.map(item => ({
        "Tanggal": item.tanggal.split('-').reverse().join('/'),
        "Hari": item.hari,
        "Waktu Tugas": `${item.waktu} WIB`,
        "Kegiatan": item.namaKegiatan,
        "Keterangan": item.keterangan || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataFormatExcel);
    const workbook = XLSX.utils.book_new();
    XXLSX.utils.book_append_sheet(workbook, worksheet, "Jurnal");

    // Auto-fit lebar kolom
    worksheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 35 }];
    XLSX.writeFile(workbook, 'Laporan_Kegiatan_Baiturrahmah.xlsx');
};

// Jalankan pembacaan data awal saat web pertama dimuat
tampilkanArsip();