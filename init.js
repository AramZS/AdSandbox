/*
 * Project icon via https://thenounproject.com/term/sandbox/30514/#_=_
 * attributed to Steve Morris
 */

console.log('sandboxer init');

function attachScriptFirst(scriptName) {
	var stringBlock = "var s = document.createElement('script'); \
	s.src = '"+ chrome.extension.getURL(scriptName + '.js') + "'; \
	(document.head || document.documentElement).prepend(s);";
	console.log(stringBlock);
	return stringBlock;
}

function attachScriptLast(scriptName) {
	var stringBlock = "var s = document.createElement('script'); \
	s.id = 'sandboxer-script-"+ scriptName + "'; \
	s.src = '"+ chrome.extension.getURL(scriptName + '.js') + "'; \
	(document.head || document.documentElement).appendChild(s);";
	console.log(stringBlock);
	return stringBlock;
}

console.log('Just Sandboxing');

chrome.browserAction.onClicked.addListener((tab) => {
	// disable the active tab
	// browser.browserAction.disable(tab.id);
	// requires the "tabs" or "activeTab" permission
	console.log(tab.url);
	chrome.storage.local.get(['sandbox_whitelist'], function (result) {
		if (!result || !result.hasOwnProperty('sandbox_whitelist')) { result = { sandbox_whitelist: [] }; }
		if (result.sandbox_whitelist.includes(tab.url)) {
			var index = result.sandbox_whitelist.indexOf(tab.url);
			if (index > -1) {
				result.sandbox_whitelist.splice(index, 1);
			}
			chrome.browserAction.setIcon({ path: "icon.png" });
		} else {
			result.sandbox_whitelist.push(tab.url);
			chrome.browserAction.setIcon({ path: "x-icon-s.png" });
		}
		chrome.storage.local.set({ sandbox_whitelist: result.sandbox_whitelist }, function () {
			console.log('Value is set to ' + JSON.stringify(result.sandbox_whitelist));
		});
	});
});

// chrome.tabs.executeScript(null,
//	{ code: attachScriptFirst('content_scripts/bind') },
//	function () {
// chrome.tabs.executeScript(null, { code: "setTimeout( function(){ window.initEditor(); }, 2000);" });
//	}
//)

// attachScriptFirst('content_scripts/bind')

//chrome.tabs.executeScript({ file: "/content_scripts/bind.js" })
//,"default_popup": "popup.html"