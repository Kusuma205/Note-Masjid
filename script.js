const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycby-J7ux6VGauILrrv1OBc2pe1ZX6wecoaz2w7CEbrp-_SwZX5Stz6sDTwv90dKqXH2T/exec";

const form = document.getElementById('kegiatanForm');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const btnBatalEdit = document.getElementById('btn-batal-edit');

let dataKegiatan = JSON.parse(localStorage.getItem('kegiatanBaiturrahmah')) || [];
let editIndex = null;

const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// ... (Simpan fungsi switchTab dan tampilkanArsip seperti yang kamu miliki sekarang) ...

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
    submitBtn.innerText = "Mengirim...";

    fetch(GOOGLE_SHEET_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataBaru)
    })
        .then(() => {
            if (editIndex === null) dataKegiatan.push(dataBaru);
            else { dataKegiatan[editIndex] = dataBaru; editIndex = null; }

            dataKegiatan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            localStorage.setItem('kegiatanBaiturrahmah', JSON.stringify(dataKegiatan));
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerText = "Simpan Catatan";
            switchTab('riwayat');
        })
        .catch(err => {
            alert("Gagal sinkronisasi Cloud. Tersimpan di lokal saja.");
            submitBtn.disabled = false;
            submitBtn.innerText = "Simpan Catatan";
        });
});

window.unduhExcel = function () {
    if (dataKegiatan.length === 0) return;
    const dataFormatExcel = dataKegiatan.map(item => ({
        "Tanggal": item.tanggal.split('-').reverse().join('/'),
        "Hari": item.hari,
        "Waktu": item.waktu,
        "Kegiatan": item.namaKegiatan,
        "Keterangan": item.keterangan || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataFormatExcel);
    const workbook = XLSX.utils.book_new();
    // PERBAIKAN: Mengganti XXLSX menjadi XLSX
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jurnal");
    XLSX.writeFile(workbook, 'Laporan_Kegiatan.xlsx');
};