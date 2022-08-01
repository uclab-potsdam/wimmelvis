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
        // Tooltips content can be expanded by replacing/adding divs, spans or other HTML elements to the info box parent
        // and its children. Please note, if you don't replace inner HTML but add elements by using '+=' you also need to
        // erase all new elements when the tooltip is destroyed – see reset() function.

        // Add here things that should happen to the tooltip when shown
        ////////////////////////

        // reset all active classes from elements
        reset();

        // stores unique id of active object
        const id = Tooltip.activeObj.id || Tooltip.activeObj.attributes['data-id'].nodeValue;
        // stores unique data object
        const tooltipData = data[id];

        const infoBox = x('#info');
        const infoContent = x('#info-content');

        // check if object already has coordinates stored
        if (!tooltipData.hasOwnProperty('elementCoordinates')) {
            // Store cursor position @ click in one property, 0 is x, 1 is y
            tooltipData.elementCoordinates = [e.layerX, e.layerY];
        }

        const movetoX = tooltipData.elementCoordinates[0] - (window.innerWidth >> 1)
        const movetoY = tooltipData.elementCoordinates[1] - (window.innerHeight >> 1)

        // Defining scrollOptions for window.scrollTo() - enjoy some smooth scrolling.
        // behavior: 'smooth' does not work in Safari, polyfill needed: 
        // https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions
        const scrollOptions = {
            left: movetoX,
            top: movetoY, 
            behavior: 'smooth'
        }

        // if condition helps on smaller viewports so the object is always visible
        if (width < 400) {
            scrollOptions.top = scrollOptions.top - 100;
        }


        // this object's name and info is added to the info box
        infoContent.innerHTML = `
        <div class='inner-text'>
            <h2>${tooltipData.name_DE}</h2>
            <p class='recyclable'>${tooltipData.recyclable_DE}</p><p>${tooltipData.material_info_DE}</p>
        </div>
        `;

        // child with correct sticker as a bg image is added to info box
        x('#sticker-container').innerHTML = `<div class='sticker ${isRecyclableClass[tooltipData.Recyclable]}'></div>`

        // scrolls and centers clicked element in the viewport
        x('#map').scrollTo(scrollOptions);

        // positions the info box at the center of the viewport, 
        // if/else helps with edge cases where the info box would be rendered outside of the viewport
        infoBox.style.left = Math.floor(window.innerWidth >> 1) + 'px';
        infoBox.style.top = window.innerHeight >> 1 < 400
            ? Math.floor(window.innerHeight >> 1 - 100) + 'px'
            : Math.floor(window.innerHeight >> 1) + 'px'

        // add a class to clicked object
        x('#' + id).classList.add('active');
        // the infobox is also made visible (see style in style.css)
        infoBox.classList.add('active');

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




//////////////////////// data and scene fetching, load function gets executed ////////////////////////

// Change these variables with the local path to your design and data
const pathToScene = './assets/scene.svg';
const pathToData = './assets/waste_data.json';

// load the SVG file and add its elements to the map
var fetchScene = fetch(pathToScene)
    .then(r => r.text())
    .then(text => {
        map.innerHTML = text;
    });

// load data file and add to data variable
var fetchData = fetch(pathToData)
    .then(r => r.json())
    .then(d => {
        data = d;
    });

Promise.all([fetchScene, fetchData]).then(() => {
    load()
})




//////////////////////// main load function ////////////////////////

function load() {
    // print in console how many objects are found, turn off when deploying
    console.info('You have ' + Object.keys(data).length + ' items in your dataset');

    // immediately updates the counter visible to users
    existingItems = Object.keys(data).length;
    x('#counter').innerHTML = `<p>${foundItems} / ${existingItems}</p>`

    // variable holds the viewport width
    const currentViewportWidth = detectedViewportWidth();
    
    // variable references the history panel
    const history = x('#history');
    const historyToggle = x('#history-toggle');

    const draggableMap = x('#map');
    
	// variable references the svg object
	const svg = x('#map svg');
    // tags svg appropriately for screen readers
    ensureSvgAccessibility('root', svg);
    
	// iterate over all data items
	for (id in data) {
		
		var obj = svg.getElementById(id);

        // tags each object within svgs appropriately and provide aria labelling
        ensureSvgAccessibility('element', obj, id);
		
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
    historyToggle.onclick = function (event) {
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
    // from here on we define how navigation happens, we might not want the background to be draggable!
    // If that's the case you can simply set the attribute 'dragnavigation as false in the index.html file to get a
    // scroll only template
    ////////////////////////

    // Eventing is executed only if dragnavigation is set to true
    if (draggableMap.getAttribute('dragnavigation') === 'true') {
        let pos = { top: 0, left: 0, x: 0, y: 0 };

        // Handler for when the cursor is pressed down
        const mouseDownHandler = function (e) {

            // Stores data on the current scroll and mouse position
            pos = {
                // The current scroll 
                left: draggableMap.scrollLeft,
                top: document.documentElement.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };

            // Change style of cursor and disable selection for better UX
            draggableMap.style.cursor = 'grabbing';
            draggableMap.style.userSelect = 'none';

            // Attach events when the cursor is moved or released
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
            reset();
        };

        // Handler for when the cursor is moving
        // If you don't want to hold down the cursor and have the container to always follow the pointer
        // you will need ONLY this handler
        const mouseMoveHandler = function (e) {
            // How far the mouse has been moved
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;

            // Scroll the element
            document.documentElement.scrollTop = pos.top - dy;
            draggableMap.scrollLeft = pos.left - dx;
        };

        // Handler for when the cursor is released
        const mouseUpHandler = function () {
            // Revert previous style changes
            draggableMap.style.cursor = 'default';
            draggableMap.style.removeProperty('user-select');
            // IMPORTANT! This stops the container to be scrolled once the cursor is pressed
            document.removeEventListener('mousemove', mouseMoveHandler);
        };

        // Attach handler when the cursor is pressed
        draggableMap.addEventListener('mousedown', mouseDownHandler);
    }

    ////////////////////////
    // from here on we define how views are cleaned and resetted
    ////////////////////////

    // when clicking on the background, the selection is reset and history panel is closed (if open)
    var bg = svg.getElementById('background')
    bg.onclick = function () {
        Tooltip.hide();

        if (history.classList.contains('active-history')) {
            toggleClass(historyToggle.firstElementChild, 'closed-history');
            toggleClass(historyToggle.firstElementChild, 'open-history');

            toggleClass(history, 'closed-history');
            toggleClass(history, 'active-history');
        }
    }

    // also when the escape key is pressed
    document.onkeyup = function (e) {
        if (e.key === 'Escape') {
            reset();

            if (history.classList.contains('active-history')) {
                toggleClass(historyToggle.firstElementChild, 'closed-history');
                toggleClass(historyToggle.firstElementChild, 'open-history');

                toggleClass(history, 'closed-history');
                toggleClass(history, 'active-history');
            }
        }
    }
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


// This function helps us to make svgs accessible for screen readers. By providing context, readable element and data we can specify
// unique descriptions that will appear as alt text. For better accessibility dragnavigation can be set to false in index.html and further
// features could be added. For instance additional voice salutation on objects selection.
function ensureSvgAccessibility(context, el, id) {
    if (context === 'root') {
        el.setAttribute("role", "img")
        el.setAttribute("tabindex", "0")
        el.innerHTML += `<title id="svgTitle">Du bist in deiner schönen und chaotischen Küche</title>`
        el.innerHTML += `<desc id="svgDesc">Sie können mit der Registerkarte navigieren und Objekte anhören, die schwer zu recyceln sind</desc>`
        el.setAttribute("aria-labelledby", "svgTitle svgDesc")
    } else {
        el.setAttribute("tabindex", 0)
        el.innerHTML += `<title id="${id}-objTitle">${data[id].name_DE}</title>`
        el.innerHTML += `<desc id="${id}-objDesc">${data[id].recyclable_DE + data[id].material_info_DE}</desc>`
        el.setAttribute("aria-labelledby", `${id}-objTitle ${id}-objDesc`)
    }
}
