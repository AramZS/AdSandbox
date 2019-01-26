//document.IFRAME
console.log('BINDING IFRAMES');
function bindActiveFrames() {
	const setOfSandboxProps = [
		"allow-forms",
		// "allow-modals",
		"allow-scripts",
		"allow-same-origin",
		// "allow-storage-access-by-user-activation",
		"allow-top-navigation-by-user-activation"
	];
	var frames = document.getElementsByTagName('iframe');
	for (let item of frames) {
		item.sandbox = setOfSandboxProps.join(' ');
		var wrapper = document.createElement('div');
		var parent = item.parentNode;
		parent.replaceChild(wrapper, item);
		wrapper.appendChild(item);
		// JSON.stringify(item);
		// item = item;
	};
	var config = { attributes: true, childList: true, subtree: true };
	var callback = function (mutationsList, observer) {
		for (var mutation of mutationsList) {
			if (mutation.type == 'childList') {
				for (var aNode of mutation.addedNodes) {
					// console.log('aNode:', aNode);
					if (aNode.nodeName === "IFRAME") {
						aNode.sandbox = setOfSandboxProps.join(' ');
						console.log('IFrame Secured', mutation);
					}
				}
			}
			else if (mutation.type == 'attributes') {
				// console.log('The ' + mutation.attributeName + ' attribute was modified.', JSON.stringify(mutation.target[mutation.attributeName]));
				if (mutation.attributeName === "sandbox") {
					if (JSON.stringify(mutation.target.sandbox) !== JSON.stringify(Object.assign({}, setOfSandboxProps))) {
						console.log('The ' + mutation.attributeName + ' attribute was modified against spec.', mutation);
						mutation.target.sandbox = setOfSandboxProps.join(' ');
					}
				}
			}
			else if (mutation.type == 'subtree') {
				console.log('The subtree was modified.', mutation);
			}
		}
	};
	var observer = new MutationObserver(callback);
	observer.observe(document, config);
	console.log('Observers set');
}
try {
	document.body.addEventListener(
		'load', function () { console.log('Body ready'); }
	);
	bindActiveFrames();
	console.log('Body ready checked');
} catch (e) {
	console.log('Need to wait for body');
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
