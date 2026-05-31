const form = document.getElementById('kegiatanForm');
let dataKegiatan = JSON.parse(localStorage.getItem('kegiatanBaiturrahmah')) || [];

const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function tampilkanArsip() {
    const container = document.getElementById('arsipContainer');
    container.innerHTML = '';

    if (dataKegiatan.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-10">Belum ada catatan.</p>`;
        return;
    }

    // Kelompokkan data berdasarkan Bulan dan Tahun
    const kelompok = {};
    dataKegiatan.forEach(item => {
        const d = new Date(item.tanggal);
        const kunci = `${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
        if (!kelompok[kunci]) kelompok[kunci] = [];
        kelompok[kunci].push(item);
    });

    // Tampilkan sebagai Folder (Accordion)
    Object.keys(kelompok).reverse().forEach(bulan => {
        const folder = document.createElement('details');
        folder.className = "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden";

        const summary = document.createElement('summary');
        summary.className = "p-4 font-bold text-gray-700 cursor-pointer bg-gray-50 flex justify-between items-center";
        summary.innerHTML = `<span>📂 ${bulan}</span> <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">${kelompok[bulan].length} Kegiatan</span>`;

        const list = document.createElement('div');
        list.className = "p-2 space-y-2 border-t border-gray-100";

        kelompok[bulan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).forEach((item, idx) => {
            list.innerHTML += `
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                    <div class="flex justify-between font-bold text-emerald-600">
                        <span>${item.tanggal.split('-').reverse().join('/')} (${item.hari})</span>
                        <span>${item.waktu}</span>
                    </div>
                    <div class="text-gray-800 font-medium mt-1">${item.namaKegiatan}</div>
                    ${item.keterangan ? `<div class="text-xs text-gray-500 italic mt-1">${item.keterangan}</div>` : ''}
                </div>`;
        });

        folder.appendChild(summary);
        folder.appendChild(list);
        container.appendChild(folder);
    });
}

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const dataBaru = {
        tanggal: document.getElementById('tanggal').value,
        hari: document.getElementById('hari').value,
        namaKegiatan: document.getElementById('namaKegiatan').value,
        waktu: document.getElementById('waktu').value,
        keterangan: document.getElementById('keterangan').value
    };
    dataKegiatan.push(dataBaru);
    localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
    form.reset();
    alert('Catatan berhasil disimpan!');
});

function exportKeExcel() {
    let csv = "Tanggal,Hari,Waktu,Kegiatan,Keterangan\n";
    dataKegiatan.forEach(i => { csv += `${i.tanggal},${i.hari},${i.waktu},${i.namaKegiatan},${i.keterangan}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Laporan_Baiturrahmah.csv'; a.click();
}

function hapusSemua() { if (confirm('Hapus semua data?')) { localStorage.clear(); location.reload(); } }