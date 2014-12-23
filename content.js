/**
 * Pixel Talk
 * Let's talk about the pixels in this page
 *
 * @version 0.1
 * @author Alejandro Moraga <moraga86@gmail.com>
 */

'use strict';

var // boxes container
	box = [],
	// main reference
	ref = document.body,
	// draggable box
	drg = null,
	// active or desactive by click on extension button
	act = true,
	// runs once control
	ini = true,
	// time control
	tmr;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	// background interaction
	act = msg.set;
	
	// activate
	if (act) {
		if (ini) {
			ini = false;
			
			// enables box drag
			ref.addEventListener('mousemove', function(evt) {
				if (drg) {
					drg[0].style.top  = 2 + evt.pageY + 'px';
					drg[0].style.left = 2 + evt.pageX + 'px';
				}
			}, false);

			// enables box drop
			ref.addEventListener('mouseup', function(evt) {
				if (tmr)
					tmr = clearTimeout(tmr);
				if (drg) {
					// set up the new coordinates
					drg[1].top = evt.offsetY;
					drg[1].lft = evt.offsetX;
					drg[1].pth = pth(evt.target);
					drg = null;
					sav();
				}
			}, false);

			// creates a new box on click
			ref.addEventListener('click', function(evt) {
				if (act) {
					evt.preventDefault();
					evt.stopPropagation();
					drw({
						pth: pth(evt.target),
						top: evt.offsetY,
						lft: evt.offsetX,
						txt: '',
						bgc: 'rgb(255, 255, 255)'
					}, evt.target);
				}
			}, false);
		}
		
		// get data from server
		upd();
	}
	// desactivate
	else {
		drg = null;
		if (tmr)
			tmr = clearTimeout(tmr);
		// remove boxes
		for (var i=box.length; i--; ref.removeChild(box[i].div));
		box = [];
	}
	
	// sends the response
	sendResponse(true);
});

/**
 * Draw a box
 * @param object cnf Box settings
 * @param object e Optional referenced element
 */
function drw(cnf, e) {
	if (!e && !(e = document.evaluate(cnf.pth, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue))
		return;	
	
	var // box container
		div = document.createElement('div'),
		// textarea
		txt = document.createElement('textarea'),
		// close button
		cls = document.createElement('div'),
		// color button
		clr = document.createElement('input'),
		// base position
		pos = ofs(e);
	
	div.style.backgroundColor = cnf.bgc;
	div.style.position = 'absolute';
	div.style.top = pos.top + cnf.top + 'px';
	div.style.left = pos.left + cnf.lft + 'px';
	div.style.width = '200px';
	div.style.height = '70px';
	div.style.zIndex = '99999999';
	ref.appendChild(div);
	
	txt.style.backgroundColor = 'transparent';
	txt.style.boxSizing = 'border-box';
	txt.style.color = cnf.clr;
	txt.style.font = '13px Verdana';
	txt.style.resize = 'none';
	txt.style.margin = '0px';
	txt.style.padding = '2px 5px';
	txt.style.width = '100%';
	txt.style.height = '100%';
	txt.value = cnf.txt;
	div.appendChild(txt);
	
	cls.style.backgroundColor = '#a9a9a9';
	cls.style.color = '#fff';
	cls.style.cursor = 'default';
	cls.style.font = '10px Arial';
	cls.style.padding = '2px';
	cls.style.position = 'absolute';
	cls.style.bottom = '100%';
	cls.style.right = '0px';
	cls.innerHTML = 'fechar';
	div.appendChild(cls);
	
	clr.type = 'color';
	clr.style.margin = '0px';
	clr.style.padding = '0px';
	clr.style.position = 'absolute';
	clr.style.bottom = '0px';
	clr.style.right = '0px';
	clr.style.width = '18px';
	clr.style.height = '18px';
	div.appendChild(clr);
	
	// set a hex color
	clr.value = '#' + cnf.bgc.match(/\d+/g).map(function(num) {
		return (num = parseInt(num).toString(16)).length == 1 ? '0' + num : num;
	}).join('');
	
	// prevents to create new box
	div.onclick = function(evt) {
		evt.stopPropagation();
	};
	
	// enable drag the box
	div.onmousedown = function() {
		if (tmr)
			tmr = clearTimeout(tmr);
		tmr = setTimeout(function() {
			drg = [div, cnf];
		}, 100);
	};
	
	// save content changes
	txt.onkeyup = function() {
		cnf.txt = this.value;
		if (tmr)
			tmr = clearTimeout(tmr);
		tmr = setTimeout(sav, 800);
	};
	
	// delete the box
	cls.onclick = function() {
		for (var tmp=[], i=0; i < box.length; i++)
			if (box[i].div != div)
				tmp.push(box[i]);
		box = tmp;
		div.parentNode.removeChild(div);
		sav();
	};
	
	// update background and text colors
	clr.onchange = function(evt) {
		var r = parseInt(this.value.substr(1, 2), 16),
			g = parseInt(this.value.substr(3, 2), 16),
			b = parseInt(this.value.substr(5, 2), 16);
		cnf.bgc = 'rgb('+ [r, g, b].join(',') +')';
		div.style.backgroundColor = cnf.bgc;
		txt.style.color = ((r * 299 + g * 587 + b * 144) / 1000) >= 125 ? '#000' : '#fff';
		!evt || sav();
	};
	
	// gets the font color by triggering color input
	clr.onchange();
	
	// push the new box
	box.push({div: div, cnf: cnf});
}

/**
 * Saves changes
 * @return void
 */
function sav() {
	var xhr = new XMLHttpRequest, prm = '', i=0, k;
	for (; i < box.length; i++)
		for (k in box[i].cnf)
			prm += i + '['+ k +']=' + box[i].cnf[k] + '&';
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4);
	};
	xhr.open('POST', '//moraga.com.br/pixeltalk/save.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(prm);
}

/**
 * Gets the content from server
 * @return void
 */
function upd() {
	var xhr = new XMLHttpRequest;
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4)
			hdr(JSON.parse(xhr.responseText))
	};
	xhr.open('GET', '//moraga.com.br/pixeltalk/get.php');
	xhr.send();
}

/**
 * Handles data from server
 * @return void
 */
function hdr(arr) {
	for (var i=0; arr && i < arr.length; drw(arr[i++]));
}

/**
 * Gets the element position
 * @param object e DOM element
 * @return object Top and left positions
 */
function ofs(e) {
	for (var r = {top: 0, left: 0}; e; r.top += e.offsetTop, r.left += e.offsetLeft, e = e.offsetParent);
	return r;
}

/**
 * Gets the element xpath
 * @param object e DOM element
 * @return string
 */
function pth(e) {
	var pth = [], i, j;
	while (e.parentNode) {
		for (i=0, j=1; i < e.parentNode.childNodes.length; i++)
			if (e.parentNode.childNodes[i] == e)
				break;
			else if (e.parentNode.childNodes[i].nodeName == e.nodeName)
				j++;
		pth.push(e.nodeName +'['+ j +']');
		e = e.parentNode;
	}
	return pth.reverse().join('/').toLowerCase();
}