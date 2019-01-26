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

// chrome.tabs.executeScript(null,
//	{ code: attachScriptFirst('content_scripts/bind') },
//	function () {
// chrome.tabs.executeScript(null, { code: "setTimeout( function(){ window.initEditor(); }, 2000);" });
//	}
//)

attachScriptFirst('content_scripts/bind')

//chrome.tabs.executeScript({ file: "/content_scripts/bind.js" })
//,"default_popup": "popup.html"