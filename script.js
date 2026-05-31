function exportKeExcel() {
    let csvContent = "data:text/csv;charset=utf-8,Hari,Waktu,Kegiatan,Keterangan\n";

    dataKegiatan.forEach(function (rowArray) {
        let row = `${rowArray.hari},${rowArray.waktu},${rowArray.namaKegiatan},${rowArray.keterangan}`;
        csvContent += row + "\r\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Kegiatan_Baiturrahmah.csv");
    document.body.appendChild(link);
    link.click();
}