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
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.changeIcon) {
			chrome.browserAction.setIcon({ path: "x-icon-s.png", tabId: sender.tab.id });
		}
	}
);


chrome.browserAction.onClicked.addListener((tab) => {
	// disable the active tab
	// browser.browserAction.disable(tab.id);
	// requires the "tabs" or "activeTab" permission
	var url = new URL(tab.url)
	var domain = url.hostname
	console.log(tab.url, url, domain);
	chrome.storage.sync.get('sandbox_whitelist', function (result) {
		if (!result || !result.hasOwnProperty('sandbox_whitelist')) { result = { sandbox_whitelist: [] }; }
		if (result.sandbox_whitelist.includes(domain)) {
			var index = result.sandbox_whitelist.indexOf(domain);
			if (index > -1) {
				result.sandbox_whitelist.splice(index, 1);
			}
			chrome.browserAction.setIcon({ path: "icon.png", tabId: tab.id });
			chrome.tabs.executeScript(null, { file: 'content_scripts/bind.js' },
				function () {
					chrome.tabs.executeScript(null, { code: "console.log('Re-bind Iframes')" });
				}
			);
		} else {
			result.sandbox_whitelist.push(domain);
			chrome.browserAction.setIcon({ path: "x-icon-s.png", tabId: tab.id });
			var frames = document.getElementsByTagName('iframe');
			//for (let item of frames) {
			//item.sandbox = "";
			//var wrapper = document.createElement('div');
			//var parent = item.parentNode;
			//parent.replaceChild(wrapper, item);
			//wrapper.appendChild(item);
			// JSON.stringify(item);
			// item = item;
			//};
		}
		chrome.storage.sync.set({ sandbox_whitelist: result.sandbox_whitelist }, function () {
			console.log('Value is set to ' + JSON.stringify(result.sandbox_whitelist));
		});
	});
});

chrome.runtime.onInstalled.addListener(details => {
	var sandboxWhitelist = [];
	chrome.storage.sync.get('sandbox_whitelist', function (result) {
		if (!result || !result.hasOwnProperty('sandbox_whitelist')) { result = { sandbox_whitelist: [] }; }
		// Only on initial install 
		sandboxWhitelist = result.sandbox_whitelist;
		if ((!details.hasOwnProperty('previousVersion') || !details.previousVersion) && (sandboxWhitelist.length === 0)) {

			var baseWhitelist = [
				"github.com",
				"webex.com",
				"*.webex.com", 
				"*.substack.com", 
				"drive.google.com",
				"docs.google.com",
				"wordpress.com",
				"squarespace.com",
				"*.amtrak.com",
				"amp.dev",
				"*.easywebinar.live",
				"hacktext.com",
				"*.okta.com",
				"glitch.com"
			];
			chrome.storage.sync.set({ sandbox_whitelist: sandboxWhitelist.concat(baseWhitelist) }, function () {
				console.log('Value is set to ' + JSON.stringify(sandboxWhitelist.concat(baseWhitelist)));
			});
		}
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
