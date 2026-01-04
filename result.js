chrome.storage.local.get(['capturedImg'], (data) => {
    const imgElement = document.getElementById('resultImage');
    const imgData = data.capturedImg;
    imgElement.src = imgData;

    // PNG Download
    document.getElementById('downloadPng').onclick = () => {
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = imgData;
        link.click();
    };

    // PDF Download
    document.getElementById('downloadPdf').onclick = () => {
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'px', [img.width, img.height]);
            pdf.addImage(imgData, 'PNG', 0, 0, img.width, img.height);
            pdf.save('screenshot.pdf');
        };
    };
});