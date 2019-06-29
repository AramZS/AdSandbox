console.log('Just Sandboxing');
let changeColor = document.getElementById('active_state');

function setOfSandboxProps() {
	return new Promise(function (resolve, reject) {
		chrome.storage.sync.get('sandbox_attributes', function (data) {
			if (!data.hasOwnProperty('sandbox_attributes') || data.sandbox_attributes.length < 1) {
				var defaults = [
					"allow-forms",
					// "allow-modals",
					"allow-scripts",
					"allow-same-origin",
					// "allow-storage-access-by-user-activation",
					"allow-top-navigation-by-user-activation"
				];
				chrome.storage.sync.set({ sandbox_attributes: defaults }, function () {
					console.log('Setting default sandbox props');
				});
				resolve(defaults);
			} else {
				return resolve(data.sandbox_attributes);
			}

		});
	});

}

function defaultWhiteListedUrls() {
	return [
		'foursquare.com',
		'codepen.io',
		'www.chronoto.pe',
		'mail.google.com',
		'secure.meetup.com',
		'console.aws.amazon.com',
		'account.squarespace.com',
		'exchange.prx.org',
		'*.myworkday.com',
		'*.atlassian.net',
		'app.plex.tv',
		'cssdeck.com',
		'giphy.com',
		'hackernoon.com',
		'medium.com',
		'localhost:8000',
		'calendar.google.com',
		'hangouts.google.com',
		'payment.amctheatres.com',
		'github.com',
		'www.amazon.com',
		'*.substack.com',
		'tools.wmflabs.org',
		'commons.wikimedia.org',
		'jsfiddle.net',
		'localhost',
		'drive.google.com',
		'galley.cjr.org',
		'soundcloud.com',
		'groups.google.com',
		'www.elemental.com',
		'www.draw.io',
		'www.dropbox.com',
		'book.jetblue.com',
		'pay.jetblue.com',
		'www.hackerrank.com',
		'appleid.apple.com',
		'appstoreconnect.apple.com',
		'web.archive.org',
		'twitter.com',
		'www.w3schools.com',
		'glitch.com',
		'cloud.mongodb.com',
		'svelte.dev',
		'127.0.0.1',
		'www.are.na',
		'colab.research.google.com',
		'www.amtrak.com',
		'app.jqbx.fm',
		'docs.google.com',
		'www.delta.com',
		'www.concursolutions.com',
		'chaseonline.chase.com',
		'my.bluehost.com',
		'idmsa.apple.com',
		'iadworkbench.apple.com'
	]
}

function whitelisted() {
	return new Promise(function (resolve, reject) {
		chrome.storage.sync.get('sandbox_whitelist', function (result) {
			if (!result || !result.hasOwnProperty('sandbox_whitelist')) { result = { sandbox_whitelist: defaultWhiteListedUrls() }; }
			resolve(result.sandbox_whitelist);
		});
	});
}

var createCheckbox = function (checkboxId, textOfOption, checked) {
	var label = document.createElement('label');
	label.setAttribute('for', checkboxId);
	var input = document.createElement('input');
	input.setAttribute('type', 'checkbox');
	input.id = checkboxId;
	input.value = checkboxId;
	input.setAttribute('name', checkboxId);
	if (checked) {
		input.setAttribute('checked', checked);
	}
	var name = document.createElement('span');
	name.innerHTML = textOfOption;
	label.appendChild(input);
	label.appendChild(name);
	return label;
}

async function populateSandboxOptions() {
	var sandboxProps = await setOfSandboxProps();
	var possibleSandboxOptions = [
		{ id: "allow-forms", name: 'Allow Forms' },
		{ id: "allow-modals", name: 'Allow Modals' },
		{ id: "allow-scripts", name: 'Allow Scripts' },
		{ id: "allow-same-origin", name: 'Allow Same Origin' },
		{ id: "allow-storage-access-by-user-activation", name: 'Allow Storage Access by User Activation' },
		{ id: "allow-top-navigation-by-user-activation", name: 'Allow Top Navigation by User Activation' }
	];
	var optionSpace = document.getElementById('sandbox-options');
	possibleSandboxOptions.forEach(function (option) {
		var checkedStatus = sandboxProps.includes(option.id);
		var option = createCheckbox(option.id, option.name, checkedStatus);
		var anLi = document.createElement('li');
		anLi.appendChild(option)
		optionSpace.appendChild(anLi);
	});
	var whitelistedSites = await whitelisted();
	var textboxForSites = document.getElementById('sandbox-whitelist');
	whitelistedSites.forEach(function (site) {
		var newString = '';
		if (textboxForSites.value.length > 0) {
			newString += ', \n';
		}
		newString += site;
		textboxForSites.value += newString;
	});
}

function saveSandboxerOptions() {
	var untreatedWhitelist = document.getElementById('sandbox-whitelist').value.replace(/(\r\n|\n|\r)/gm, "").trim().split(',');
	var whiteList = [];
	untreatedWhitelist.forEach(function (site) {
		whiteList.push(site.trim());
	});
	chrome.storage.sync.set({ sandbox_whitelist: whiteList }, function () {
		console.log('sandbox_whitelist is set to ' + JSON.stringify(whiteList));
	});
	var attrList = [];
	var checkedBoxes = document.querySelectorAll('#sandbox-options input:checked');
	checkedBoxes.forEach(function (el) {
		if (el.value.length > 0) {
			attrList.push(el.value);
		}
	});
	chrome.storage.sync.set({ 'sandbox_attributes': attrList }, function () {

	});
}

populateSandboxOptions();

window.setTimeout(function () {
	console.log('timeout completed, binding');
	document.querySelector("#save_options").addEventListener("click", (e) => {
		e.preventDefault();
		saveSandboxerOptions();
		// e.stopPropagation();
		//document.addEventListener("click", (e) => 
	}, false);
}, 500);