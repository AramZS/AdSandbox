//document.IFRAME

var preventStandardUnload = function (e) {
	console.log('jsi', 'Performance navigation type', performance.navigation.type);
	var dialogText = 'It looks like you are trying to be taken to another site against your will.';
	if (performance.navigation.type != 1) {
		e.preventDefault();
		e.stopPropagation();
		e.returnValue = dialogText;
		console.log('jsi', 'Prevent unload event - navigation type is cause.');
		window.top.location.href = window.top.location.href += '?no=true';
		return dialogText;
	}
	if (!document.activeElement.hasAttribute('href')) {
		e.returnValue = dialogText;
		console.log('jsi', 'Prevent unload event - link is cause.');
		console.log('jsi', 'Active element: ', document.activeElement, e);
		return dialogText;
	}
	if (e.timeStamp < 25000) {
		e.preventDefault();
		e.stopPropagation();
		e.returnValue = dialogText;
		console.log('jsi', 'Prevent unload event - time is cause.');
		return dialogText;
	}
	return e;
};

// window.addEventListener('beforeunload', preventStandardUnload);


window.freqIframeControl = false;

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function setOfSandboxProps() {
	return [
		"allow-forms",
		// "allow-modals",
		"allow-scripts",
		"allow-same-origin",
		// "allow-storage-access-by-user-activation",
		"allow-top-navigation-by-user-activation"
	];
}

function processSandboxValuesToDOMTokens(frame) {

	var iterator = frame.sandbox.entries();
	for (var value of iterator) {
		frame.sandbox.remove(value);
	}
	setOfSandboxProps().forEach(function (item) {
		frame.sandbox.add(item);
	});
	return frame;
}

function reAttachIframe(item) {
	var wrapper = document.createElement('div');
	var parent = item.parentNode;
	parent.replaceChild(wrapper, item);
	wrapper.appendChild(item);
}

function frequencyControl() {
	return false;
	if (window.freqIframeControl) {
		return true;
	} else {
		setTimeout(function () { window.freqIframeControl = false; }, 1000)
		window.freqIframeControl = true;
		return false;
	}
}

function bindActiveFrames() {
	console.log('jsi', 'BINDING IFRAMES');
	var frames = document.getElementsByTagName('iframe');
	for (let item of frames) {
		//item.sandbox = setOfSandboxProps.join(' ');
		processSandboxValuesToDOMTokens(item);
		reAttachIframe(item);
		// JSON.stringify(item);
		// item = item;
	};
	var config = { attributes: true, childList: true, subtree: true };
	var callback = function (mutationsList, observer) {
		for (var mutation of mutationsList) {
			if (!frequencyControl()) {
				if (mutation.type == 'childList') {
					for (var aNode of mutation.addedNodes) {
						// console.log('jsi', 'aNode:', aNode);

						var equalityOfSettings = false;
						if (aNode.nodeName === "IFRAME") {
							if (aNode.sandbox.entries().length > 0) {
								var iterator = aNode.sandbox.entries();
								var attrs = [];
								for (var value of iterator) {
									var sandboxVal = '';
									if (Array.isArray(value) && value.length > 1) {
										sandboxVal = value[1];
									} else if (Array.isArray(value) && value.length == 1) {
										sandboxVal = value[0];
									} else {
										sandboxVal = value;
									}
									attrs.push(sandboxVal);
								}
								equalityOfSettings = arraysEqual(attrs, setOfSandboxProps());
							}
						}
						// if (!arraysEqual(attrs, setOfSandboxProps())) {
						if (aNode.nodeName === "IFRAME" && !aNode.classList.contains('jsi') && (false === equalityOfSettings)) {
							//aNode.sandbox = setOfSandboxProps.join(' ');

							processSandboxValuesToDOMTokens(aNode);
							aNode.classList.add('jsi');
							reAttachIframe(aNode);
							console.log('jsi', 'IFrame Secured', mutation);
						} else if (aNode.nodeName === "IFRAME" && aNode.classList.contains('jsi')) {
							aNode.classList.remove('jsi');
						}
					}
				}
				else if (mutation.type == 'attributes') {
					// console.log('jsi', 'The ' + mutation.attributeName + ' attribute was modified.', JSON.stringify(mutation.target[mutation.attributeName]));
					if (mutation.attributeName === "sandbox") {
						var equalityOfSettings = false;
						if (mutation.target.sandbox.entries().length > 0) {
							var iterator = mutation.target.sandbox.entries();
							var attrs = [];
							for (var value of iterator) {
								var sandboxVal = '';
								if (Array.isArray(value) && value.length > 1) {
									sandboxVal = value[1];
								} else if (Array.isArray(value) && value.length == 1) {
									sandboxVal = value[0];
								} else {
									sandboxVal = value;
								}
								attrs.push(sandboxVal);
							}
							equalityOfSettings = arraysEqual(attrs, setOfSandboxProps());
						}
						if (false === equalityOfSettings) {
							console.log('jsi', 'The ' + mutation.attributeName + ' attribute was modified against spec.', mutation, mutation.target.sandbox.entries(), JSON.stringify(mutation));
							//mutation.target.sandbox = setOfSandboxProps.join(' ');
							// processSandboxValuesToDOMTokens(mutation.target);
							// reAttachIframe(mutation.target);
						}
					}
				}
				else if (mutation.type == 'subtree') {
					console.log('jsi', 'The subtree was modified.', mutation);
				}
			}
		}
	};
	var observer = new MutationObserver(callback);
	observer.observe(document, config);
	console.log('jsi', 'Observers set');
}

chrome.storage.sync.get('sandbox_whitelist', function (result) {
	if (!result || !result.hasOwnProperty('sandbox_whitelist')) { result = { sandbox_whitelist: [] }; }
	var url = new URL(document.location.href)
	var domain = url.hostname
	if (result.sandbox_whitelist.includes(domain)) {
		// chrome.browserAction.setIcon({ path: "x-icon-s.png" });
		chrome.runtime.sendMessage({ changeIcon: true });
	} else {
		// chrome.browserAction.setIcon({ path: "icon.png" });
		try {
			document.body.addEventListener(
				'load', function () { console.log('jsi', 'Body ready'); }
			);
			bindActiveFrames();
			console.log('jsi', 'Body ready checked');
		} catch (e) {
			console.log('jsi', 'Need to wait for body');
			if (document.body || document.readyState === "complete" ||
				(document.readyState !== "loading" && !document.documentElement.doScroll)) {
				bindActiveFrames();
			} else {
				window.addEventListener(
					'DOMContentLoaded',
					bindActiveFrames
				);
			}
		}
	}
});

