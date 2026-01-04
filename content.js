chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageInfo") {
        sendResponse({
            height: document.documentElement.scrollHeight,
            width: document.documentElement.clientWidth,
            viewportHeight: window.innerHeight
        });
    }
    return true; // Important: message connection open rakhar jonno
});