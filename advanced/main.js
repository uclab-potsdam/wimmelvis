//////////////////////// variables ////////////////////////

// this variable will hold the metadata from the data file
var data = null;

// this variables is a reference to the DOM element holding the SVG elements 
var map = x('#map');

// Variables that will store data for the history panel later on
var itemsHistory = [];
var existingItems = [];
var foundItems = 0;

// array that contains the possible statuses for objects, useful if you want to add stickers, labels or trigger a win/lose result
var isRecyclableClass = ['not-recyclable', 'almost-recyclable', 'is-recyclable'];

// this variable holds information and methods necessary to trigger the appropriate tooltip
var Tooltip = {
    // Stores current active object to trigger event correctly
    activeObj: undefined,
    show: function (e, width) {
        ////////////////////////
        // Add here things that should happen to the tooltip when shown
        ////////////////////////

        // reset all active classes from elements
        reset();

        // Get unique id of active object
        var id = Tooltip.activeObj.id || Tooltip.activeObj.attributes['data-id'].nodeValue;
        var tooltipData = data[id];

        // check if object already has coordinates stored
        if (!tooltipData.hasOwnProperty('elementCoordinates')) {
            // Store cursor position @ click in one property, 0 is x, 1 is y
            tooltipData.elementCoordinates = [e.layerX, e.layerY];
        }

        console.log(e)

        const movetoX = tooltipData.elementCoordinates[0] - (window.innerWidth >> 1)
        const movetoY = tooltipData.elementCoordinates[1] - (window.innerHeight >> 1)

        // Defining scrollOptions for window.scrollTo() - enjoy some smooth scrolling.
        // behavior: 'smooth' does not work in Safari, polyfill needed: 
        // https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions
        var scrollOptions = {
            left: movetoX,
            top: movetoY, 
            behavior: 'smooth'
        }

        // if condition helps on smaller viewports so the object is always visible
        if (width < 400) {
            scrollOptions.top = tooltipData.elementCoordinates[1] - (window.innerHeight >> 1) - 100;
        }

        ////////////////////////
        // Tooltips content can be expanded by replacing/adding divs, spans or other HTML elements to the info box parent
        // and its children. Please note, if you don't replace inner HTML but add elements by using '+=' you also need to
        // erase all new elements when the tooltip is destroyed – see reset() function.
        ////////////////////////

        // this object's name and info is added to the info box
        x('#info-content').innerHTML = `
        <div class='inner-text'>
            <h2>${tooltipData.name_DE}</h2>
            <p class='recyclable'>${tooltipData.recyclable_DE}</p><p>${tooltipData.material_info_DE}</p>
        </div>
        `;

        // child with correct sticker as a bg image is added to info box
        x('#sticker-container').innerHTML = `<div class='sticker ${isRecyclableClass[tooltipData.Recyclable]}'></div>`


        // positions the info box on click position, 
        // if/else helps with edge cases where the info box would be rendered outside of the viewport
        x('#info').style.left = Math.floor(movetoX) + 'px';
        x('#info').style.top = Math.floor(movetoY) + 'px';

        // scrolls and centers clicked element in the viewport
        x('#map').scrollTo(scrollOptions);

        // add a class to clicked object
        x('#' + id).classList.add('active');
        // the infobox is also made visible (see style in style.css)
        x('#info').classList.add('active');

        // Click on tiny x in box closes tooltip
        x('#close-info').onclick = function () {
            Tooltip.hide();
        }
    },
    hide: function () {
        ////////////////////////
        // Add here things that should happen when clicking 
        // on the background or on the  'x' to close individual tooltips
        ////////////////////////

        // removes classes and hide tooltip
        reset();
        Tooltip.activeObj = undefined;
    }
}

// load the SVG file and add its elements to the map
var fetchScene = fetch('./assets/scene.svg')
    .then(r => r.text())
    .then(text => {
        map.innerHTML = text;
    });

//////////////////////// data and scene fetching, load function gets executed ////////////////////////

// load data file and add to data variable
var fetchData = fetch('./assets/waste_data.json')
    .then(r => r.json())
    .then(d => {
        data = d;
    });

Promise.all([fetchScene, fetchData]).then(() => {
    load()
})

//////////////////////// main load function ////////////////////////

function load() {

    // immediately updates counter
    existingItems = Object.keys(data).length;
    x('#counter').innerHTML = `<p>${foundItems} / ${existingItems}</p>`

    // variable holds the viewport width
    var currentViewportWidth = detectedViewportWidth();
    
    // variable references the history panel
    var history = x('#history');
    
	// variable references the svg object
	var svg = x('#map svg');
	console.info('You have ' + Object.keys(data).length + ' items in your dataset')
	// iterate over all data items
	for (id in data) {
		
		var obj = svg.getElementById(id);
		
		// if id not found among svg elements issue warning and continue with loop
		if (obj == null) {
			console.warn(id+' not found in the map');
			continue;
		}
		
		// the object that is matched gets class object and is made invisible (see stylesheet)
		obj.classList.add('object');
        
            // object gets a click event
            obj.onclick = function(event) {
            ////////////////////////
            // Add here things that should happen on object's click
            ////////////////////////

                // prevent event to be triggered if the clicked object is already active
                if (Tooltip.activeObj == undefined || Tooltip.activeObj.id !== this.id) {
                    console.log(this)
                    // Assign current active object to tooltip
                    Tooltip.activeObj = this;	
                    // execute function that renders tooltip (we need to pass the viewport width to catch problematic tooltips)		
                    Tooltip.show(event, currentViewportWidth);
                    addElementToHistoryPanel(this.id, itemsHistory);
                }
            }
	}

    // By clicking on the bin's parent some classes are toggled    
    x('#history-toggle').onclick = function (event) {
        toggleClass(event.target, 'open-history');
        toggleClass(event.target, 'closed-history');

        // I am toggling some classes to trigger the panel in sliding in
        toggleClass(history, 'closed-history');
        toggleClass(history, 'active-history');

        // Here more things happening when clicking on the history bin could happen.
    }

    history.onclick = function (event) {
        // When clicking one element in history we are brought back to the tooltip
        Tooltip.activeObj = event.target;
        Tooltip.show(event, currentViewportWidth);
    }

    ////////////////////////
    // from here on we define how views are cleaned and resetted
    ////////////////////////

	// when clicking on the background, the selection is reset and history panel is closed (if open)
	var bg = svg.getElementById('background')
	bg.onclick = function() { 
        Tooltip.hide();

        if (history.classList.contains('active-history')) {
            toggleClass(x('#history-toggle').firstElementChild, 'closed-history');
            toggleClass(x('#history-toggle').firstElementChild, 'open-history');

            toggleClass(history, 'closed-history');
            toggleClass(history, 'active-history');
        }
    }
	
	// also when the escape key is pressed
	document.onkeyup = function(e) {
	   if (e.key === 'Escape') {
			 reset();
		 }
	}

    const ele = document.getElementById('map');
    let pos = { top: 0, left: 0, x: 0, y: 0 };

    console.log(ele)

    const mouseDownHandler = function (e) {
        console.log('triggered')
        pos = {
            // The current scroll 
            left: ele.scrollLeft,
            top: ele.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY,
        };

        ele.style.cursor = 'grabbing';
        ele.style.userSelect = 'none';

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        reset();
    };

    const mouseMoveHandler = function (e) {
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;
        // console.log(pos.top, pos.left)
        // Scroll the element
        ele.scrollTop = pos.top - dy;
        ele.scrollLeft = pos.left - dx;

        // console.log('scroll top', ele.scrollTop, 'scroll left', ele.scrollLeft)
    };

    const mouseUpHandler = function () {
        ele.style.cursor = 'default';
        ele.style.removeProperty('user-select');

        document.removeEventListener('mousemove', mouseMoveHandler);
    };


    ele.addEventListener('mousedown', mouseDownHandler);
}

//////////////////////// helper functions ////////////////////////

// for now this just defaults to no object selected and resets the tooltip vertical position
function reset() {
    ////////////////////////
    // add here things that should happen on reset
    ////////////////////////
	X('.active').forEach(el => el.classList.remove('active'));
    x('#info').scrollTo(0, 0);
    // x('#info').innerHTML = '';
}

function addElementToHistoryPanel(currentObj, itemsHistory) {
    // checks if element has already been discovered, otherwise it adds it to the list
    if (!itemsHistory.includes(data[currentObj].name_EN)) {
        // updates variables
        itemsHistory.push(data[currentObj].name_EN)
        foundItems = foundItems + 1

        // updates visible HTML elements
        x('#counter').innerHTML = `<p>${foundItems} / ${existingItems}</p>`
        x('#history').innerHTML += `<p class=${'object-name'} data-id='${currentObj}'>${data[currentObj].name_DE}</p>`
    }
}

// Detect viewport width and returns its size
function detectedViewportWidth () {
    var body = document.body;
    var html = document.documentElement;

    return Math.max(body.offsetWidth, html.clientWidth, html.offsetWidth);
}

// shortcuts to access elements
function x(s) { return document.querySelector(s); }
function X(s) { return document.querySelectorAll(s); }

// shortcut to remove/add classes to elements
function toggleClass(el, klass) { return el.classList.toggle(klass) }
