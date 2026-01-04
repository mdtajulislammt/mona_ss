document.getElementById('captureBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const btn = document.getElementById('captureBtn');

    // Connection check: Message pathiye dekha content.js ready kina
    try {
        const pageInfo = await chrome.tabs.sendMessage(tab.id, { action: "getPageInfo" });
        
        btn.disabled = true;
        btn.innerText = "Capturing...";

        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = pageInfo.width;
        fullCanvas.height = pageInfo.height;
        const ctx = fullCanvas.getContext('2d');

        let currentScroll = 0;

        while (currentScroll < pageInfo.height) {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (y) => window.scrollTo(0, y),
                args: [currentScroll]
            });

            await new Promise(r => setTimeout(r, 800));

            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
            const img = await loadImage(dataUrl);
            ctx.drawImage(img, 0, currentScroll);
            
            currentScroll += pageInfo.viewportHeight;
        }

        btn.innerText = "Saving PDF...";

        // --- CONSTRUCTOR ERROR FIX ---
        // window.jspdf er bhitorer jsPDF ke call kora
        const { jsPDF } = window.jspdf; 
        const doc = new jsPDF({
            orientation: fullCanvas.width > fullCanvas.height ? 'l' : 'p',
            unit: 'px',
            format: [fullCanvas.width, fullCanvas.height]
        });

        const imgData = fullCanvas.toDataURL('image/jpeg', 0.8);
        doc.addImage(imgData, 'JPEG', 0, 0, fullCanvas.width, fullCanvas.height);
        doc.save(`Screenshot_${Date.now()}.pdf`);

        btn.disabled = false;
        btn.innerText = "Capture Full Page";

    } catch (err) {
        alert("Error: Please REFRESH the website page first!");
        btn.disabled = false;
        console.error(err);
    }
});

function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = url;
    });
}