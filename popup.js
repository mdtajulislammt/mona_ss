document.getElementById('captureBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const btn = document.getElementById('captureBtn');
    btn.disabled = true;
    btn.innerText = "Capturing...";

    try {
        const pageInfo = await chrome.tabs.sendMessage(tab.id, { action: "getPageInfo" });
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
            await new Promise(r => setTimeout(r, 600));
            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
            const img = await loadImage(dataUrl);
            ctx.drawImage(img, 0, currentScroll);
            currentScroll += pageInfo.viewportHeight;
        }

        // Image data-ti session storage-e rakha
        const finalImage = fullCanvas.toDataURL('image/png');
        chrome.storage.local.set({ capturedImg: finalImage }, () => {
            chrome.tabs.create({ url: 'result.html' });
        });

    } catch (err) {
        alert("Please refresh the page first!");
    } finally {
        btn.disabled = false;
        btn.innerText = "Capture Full Page";
    }
});

function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = url;
    });
}