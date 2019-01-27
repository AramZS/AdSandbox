console.log('Just Sandboxing');
let changeColor = document.getElementById('active_state');

chrome.storage.sync.get('color', function (data) {
	changeColor.style.backgroundColor = data.color;
	changeColor.setAttribute('value', data.color);
});

browser.browserAction.onClicked.addListener((tab) => {
	// disable the active tab
	browser.browserAction.disable(tab.id);
	// requires the "tabs" or "activeTab" permission
	console.log(tab.url);
});