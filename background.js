/**
 * Pixel Talk
 * Let's talk about the pixels in this page
 *
 * @version 0.1
 * @author Alejandro Moraga <moraga86@gmail.com>
 */

// active tabs running the script
var run = [];

chrome.browserAction.onClicked.addListener(function (tab) {
	var pos = run.indexOf(tab.id);
	
	chrome.tabs.sendMessage(tab.id, {set: pos == -1}, function(response) {
		if (response == true)
			pos == -1 ? run.push(tab.id) : run.splice(pos, 1);
	});
});