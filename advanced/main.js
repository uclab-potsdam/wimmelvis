// this variable will hold the metadata from the data file
var data = null;

// this variables is a reference to the DOM element holding the SVG elements 
var map = x('#map');

var elementsHistory = [];

// load the SVG file and add its elements to the map
fetch('./assets/scene.svg')
  .then(r => r.text())
  .then(text => { 
		map.innerHTML = text;	

        // initialize the map if data is loaded, too:
		if (data!=null) load();
	})

// load data file and add to data variable
fetch('./assets/waste_data.json')
  .then(r => r.json())
	.then(d => {
		data = d;
		// initialize the map if svg is loaded, too:
		if (typeof x('#map svg') != "null") load();
	});

// this variable holds information and methods necessary to trigger the appropriate tooltip
var Tooltip = {
    // Stores current active object to trigger event correctly
    activeObj: undefined,
    show: function (e, width) {
        // reset all active classes from elements
		reset();

        // Get unique id of active object
        var id = Tooltip.activeObj.id || Tooltip.activeObj.attributes["data-id"].nodeValue;
        
        // check if object already has coordinates stored
        if (!data[id].hasOwnProperty("elementCoordinates")) {
            // Store cursor position @ click in one property, 0 is x, 1 is y
            data[id].elementCoordinates = [e.layerX, e.layerY];
        }

        // Defining scrollOptions for window.scrollTo() - enjoy some smooth scrolling.
        // behavior: 'smooth' does not work in Safari, polyfill needed: 
        // https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions
        var scrollOptions = { 
            left: data[id].elementCoordinates[0] - (window.innerWidth >> 1), 
            top: data[id].elementCoordinates[1] - (window.innerHeight >> 1), behavior: 'smooth' 
        }

        // if condition helps on smaller viewports so the object is always visible
        if (width < 400) {
            scrollOptions.top = data[id].elementCoordinates[1] - (window.innerHeight >> 1) - 100;
        }

        // this object's name and info is added to the info box
        x("#info").innerHTML = "<div id='close-info'><p>x</p></div><div><h2>" + data[id].name_DE + "</h2>"
            + "<p class='recyclable'>" + data[id].recyclable_DE + "</p>"
            + "<p>" + data[id].material_info_DE + "</p></div>";

        // positions the info box on click position, 
        // if/else helps with edge cases where the info box would be rendered outside of the viewport
        x("#info").style.left = Math.floor(data[id].elementCoordinates[0]) + 'px';
        x("#info").style.top = data[id].elementCoordinates[1] < 400 
            ? Math.floor(data[id].elementCoordinates[1] + 300) + 'px' 
            : Math.floor(data[id].elementCoordinates[1]) + 'px';

        // scrolls and centers clicked element in the viewport
        window.scrollTo(scrollOptions);

        // add a class to clicked object
        x("#"+id).classList.add("active");
        // the infobox is also made visible (see style in style.css)
        x("#info").classList.add("active");

        // Click on tiny x in box closes tooltip
        x("#close-info").onclick = function () {
            Tooltip.hide();
        }
    },
    hide: function() {
        // removes classes and hide tooltip
        reset();
        Tooltip.activeObj = undefined;
    }
}

// add click events to all svg elements that have an entry in data file
function load() {
    // variable holds the viewport width
    var currentViewportWidth = detectedViewportWidth();
    
    // variable references the history panel
    var history = x("#history");
    
    // variable references the reset div
    var resetView = x("#reset");

	// variable references the svg object
	var svg = x("#map svg");
	console.warn("You have " + Object.keys(data).length + " items in your dataset")
	// iterate over all data items
	for (id in data) {
		
		var obj = svg.getElementById(id);
		
		// if id not found among svg elements issue warning and continue with loop
		if (obj == null) {
			console.warn(id+" not found in the map");
			continue;
		}
		
		// the object that is matched gets class object and is made invisible (see stylesheet)
		obj.classList.add("object");
        
            // object gets a click event
            obj.onclick = function(event) {
                // prevent event to be triggered if the clicked object is already active
                if (Tooltip.activeObj == undefined || Tooltip.activeObj.id !== this.id) {
                    // Assign current active object to tooltip
                    Tooltip.activeObj = this;	
                    // execute function that renders tooltip (we need to pass the viewport width to catch problematic tooltips)		
                    Tooltip.show(event, currentViewportWidth);
                    addElementToHistoryPanel(this.id, elementsHistory);
                }
            }
	}

    // By clicking on the bin's parent some classes are toggled    
    x("#history-toggle").onclick = function (event) {
        toggleClass(event.target, 'open-history');
        toggleClass(event.target, 'closed-history');

        // I am toggling some classes to trigger the panel in sliding in
        toggleClass(history, "closed-history");
        toggleClass(history, "active-history");

        // Here more things happening when clicking on the history bin could happen.
    }

    history.onclick = function (event) {
        // Possible way to fix click problem: add to data additional fields with tooltip and object's position on screen
        // Then trigger the position and elements based on these stored values instead of clicks.
        Tooltip.activeObj = event.target;
        Tooltip.show(event, currentViewportWidth);
    }

    ////////
    ///// from here on we define how views are cleaned and resetted
    ////////

	// when clicking on the background, the selection is reset and history panel is closed (if open)
	var bg = svg.getElementById("background")
	bg.onclick = function() { 
        Tooltip.hide();

        if (history.classList.contains('active-history')) {
            toggleClass(x("#history-toggle").firstElementChild, 'closed-history');
            toggleClass(x("#history-toggle").firstElementChild, 'open-history');

            toggleClass(history, 'closed-history');
            toggleClass(history, "active-history");
        }
    }
	
	// also when the escape key is pressed
	document.onkeyup = function(e) {
	   if (e.key === "Escape") {
			 reset();
		 }
	}

    // resets the whole view
    resetView.onclick = function() {
        var scrollOptions = {
            left: 0,
            top: 0,
            behavior: 'smooth'
        }

        // remove selection
        reset();
        // cleans history
        elementsHistory = [];
        x("#history").innerHTML = '<h4>Collected objects:</h4>';
        // scroll to top left corner
        window.scrollTo(scrollOptions);
    }
}

////////
///// helpers
////////


// for now this just defaults to no object selected, later maybe more…
function reset() {
	X(".active").forEach(el => el.classList.remove('active'));
}

function addElementToHistoryPanel(currentObj, elementsHistory) {
    // checks if element has already been discovered, otherwise it adds it to the list
    if (!elementsHistory.includes(data[currentObj].name_EN)) {
        elementsHistory.push(data[currentObj].name_EN)

        x("#history").innerHTML += `<p class=${"object-name"} data-id="` + currentObj + `">` + data[currentObj].name_DE + "</p>"
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

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
