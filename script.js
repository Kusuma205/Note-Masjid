const form = document.getElementById('kegiatanForm');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const btnBatalEdit = document.getElementById('btn-batal-edit');

let dataKegiatan = JSON.parse(localStorage.getItem('kegiatanBaiturrahmah')) || [];
let editIndex = null; // Menandai indeks data yang sedang diedit

const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Fungsi menampilkan arsip per bulan (Dilengkapi tombol Edit & Hapus)
function tampilkanArsip() {
    const container = document.getElementById('arsipContainer');
    container.innerHTML = '';

    if (dataKegiatan.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-10">Belum ada catatan kegiatan.</p>`;
        return;
    }

    // Kelompokkan data berdasarkan Bulan dan Tahun
    const kelompok = {};

    // Berikan ID asli ke setiap data sebelum diurutkan agar tidak salah hapus/edit
    dataKegiatan.forEach((item, index) => {
        item.originalIndex = index;
        const d = new Date(item.tanggal);
        const kunci = `${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
        if (!kelompok[kunci]) kelompok[kunci] = [];
        kelompok[kunci].push(item);
    });

    // Tampilkan sebagai Folder/Accordion
    Object.keys(kelompok).reverse().forEach(bulan => {
        const folder = document.createElement('details');
        folder.className = "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden";

        const summary = document.createElement('summary');
        summary.className = "p-4 font-bold text-gray-700 cursor-pointer bg-gray-50 flex justify-between items-center";
        summary.innerHTML = `<span>📂 ${bulan}</span> <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">${kelompok[bulan].length} Kegiatan</span>`;

        const list = document.createElement('div');
        list.className = "p-2 space-y-2 border-t border-gray-100 bg-gray-50";

        // Urutkan kegiatan di dalam folder berdasarkan tanggal terbaru
        kelompok[bulan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).forEach((item) => {
            const itemCard = document.createElement('div');
            itemCard.className = "p-3 bg-white rounded-lg border border-gray-200 shadow-2xs text-sm flex justify-between items-start gap-2";

            itemCard.innerHTML = `
                <div class="space-y-1 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            ${item.tanggal.split('-').reverse().join('/')}
                        </span>
                        <span class="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                            ${item.hari}
                        </span>
                        <span class="text-xs text-gray-500 font-mono">${item.waktu} WIB</span>
                    </div>
                    <div class="text-gray-800 font-semibold text-base mt-1">${item.namaKegiatan}</div>
                    ${item.keterangan ? `<div class="text-xs text-gray-500 italic">"${item.keterangan}"</div>` : ''}
                </div>
                <div class="flex gap-2 text-xs">
                    <button onclick="siapkanEdit(${item.originalIndex})" class="text-blue-600 hover:underline font-medium">Edit</button>
                    <button onclick="hapusSatu(${item.originalIndex})" class="text-red-500 hover:text-red-700 font-semibold">✕</button>
                </div>
            `;
            list.appendChild(itemCard);
        });

        folder.appendChild(summary);
        folder.appendChild(list);
        container.appendChild(folder);
    });
}

// Fungsi memindahkan data ke form untuk siap Diedit
function siapkanEdit(index) {
    editIndex = index;
    const item = dataKegiatan[index];

    // Isi nilai form dengan data lama
    document.getElementById('tanggal').value = item.tanggal;
    document.getElementById('hari').value = item.hari;
    document.getElementById('namaKegiatan').value = item.namaKegiatan;
    document.getElementById('waktu').value = item.waktu;
    document.getElementById('keterangan').value = item.keterangan;

    // Ubah UI Form ke Mode Edit
    formTitle.innerText = "✏️ Edit Kegiatan";
    submitBtn.innerText = "Perbarui Kegiatan";
    submitBtn.className = "w-full bg-blue-600 text-white font-medium p-3 rounded-lg shadow-sm hover:bg-blue-700";
    btnBatalEdit.classList.remove('hidden');

    // Pindahkan user ke Tab Input secara otomatis
    switchTab('input');
}

// Fungsi membatalkan mode edit
function batalEdit() {
    editIndex = null;
    form.reset();
    formTitle.innerText = "Catat Kegiatan";
    submitBtn.innerText = "Simpan Kegiatan";
    submitBtn.className = "w-full bg-emerald-600 text-white font-medium p-3 rounded-lg shadow-sm hover:bg-emerald-700";
    btnBatalEdit.classList.add('hidden');
}

// Handle submit (Bisa Simpan Baru atau Update Data Lama)
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const dataBaru = {
        tanggal: document.getElementById('tanggal').value,
        hari: document.getElementById('hari').value,
        namaKegiatan: document.getElementById('namaKegiatan').value.replace(/,/g, '-'),
        waktu: document.getElementById('waktu').value,
        keterangan: document.getElementById('keterangan').value.replace(/,/g, '-')
    };

    if (editIndex !== null) {
        // Mode Update data lama
        dataKegiatan[editIndex] = dataBaru;
        editIndex = null;
        alert('Catatan berhasil diperbarui!');
        batalEdit();
    } else {
        // Mode Simpan data baru
        dataKegiatan.push(dataBaru);
        alert('Catatan berhasil disimpan!');
        form.reset();
    }

    localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
});

function exportKeExcel() {
    if (dataKegiatan.length === 0) {
        alert("Belum ada data untuk diunduh!");
        return;
    }
    let csv = "Tanggal,Hari,Waktu,Kegiatan,Keterangan\n";
    dataKegiatan.forEach(i => { csv += `${i.tanggal},${i.hari},${i.waktu},${i.namaKegiatan},${i.keterangan}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Laporan_Baiturrahmah.csv'; a.click();
}

function hapusSatu(index) {
    if (confirm('Hapus catatan kegiatan ini?')) {
        dataKegiatan.splice(index, 1);
        localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
        tampilkanArsip();
    }
}

function hapusSemua() {
    if (confirm('Hapus seluruh arsip data kegiatan?')) {
        localStorage.removeItem('kegiatanBaiturrahmah');
        dataKegiatan = [];
        tampilkanArsip();
    }
}