// shortcuts to access elements
function x(s) { return document.querySelector(s); }
function X(s) { return document.querySelectorAll(s); }

// shortcut to remove/add classes to elements
function toggleClass(el, klass) { return el.classList.toggle(klass)}

// this variable will hold the metadata from the data file
var data = null;

// this variables is a reference to the DOM element holding the SVG elements 
var map = x('#map');

var elementsHistory = [];

// load the SVG file and add its elements to the map
fetch('kitchen.svg')
  .then(r => r.text())
  .then(text => { 
		map.innerHTML = text;		
		// initialize the map if data is loaded, too:
		if (data!=null) load();
	})

// load data file and add to data variable
fetch('waste_data.json')
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
    show: function (e) {
        // reset all active classes from elements
		reset();
        
        // Get unique id of active object
        var id = Tooltip.activeObj.id;
        
        // Store cursor position @ click in two variables
        var xPositionClick = e.layerX;
        var yPositionClick = e.layerY;

        // Defining scrollOptions for window.scrollTo() - enjoy some smooth scrolling.
        var scrollOptions = {
            left: e.layerX - (window.innerWidth>>1),
            top: e.layerY - (window.innerHeight>>1),
            behavior: 'smooth' // does not work in Safari, polyfill needed: https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions
        }

        // this object's name and info is added to the info box
        x("#info").innerHTML = "<h2>" + data[id].name_EN + "</h2>" 
            + "<p>" + data[id].recyclable_EN + "</p>"
            + "<p>" + data[id].material_info_EN + "</p>";

        // positions the info box on click position
        x("#info").style.left = Math.floor(xPositionClick) + 'px';
        x("#info").style.top = Math.floor(yPositionClick) + 'px';

        // scrolls and centers clicked element in the viewport
        window.scrollTo(scrollOptions);

        // add a class to clicked object
        x("#"+id).classList.add("active");
        // the infobox is also made visible (see style in style.css)
        x("#info").classList.add("active");
    },
    hide: function() {
        // removes classes and hide tooltip
        reset();
        Tooltip.activeObj = undefined;
    }
}

// add click events to all svg elements that have an entry in data file
function load() {
    // variable references the history panel
    var history = x("#history");
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
                    // execute function that renders tooltip		
                    Tooltip.show(event, this);
                    addElementToHistoryPanel(this.id, elementsHistory);
                }
            }
	}
	
	// when clicking on the background, the selection is reset and history panel is closed (if open)
	var bg = svg.getElementById("background")
	bg.onclick = function() { 
        Tooltip.hide();

        if (history.classList.contains('active-history')) {
            toggleClass(x("#bin").firstElementChild, 'closed-bin');
            toggleClass(x("#bin").firstElementChild, 'open-bin');

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

    // By clicking on the bin's parent some classes are toggled    
    x("#bin").onclick = function(event) {
        toggleClass(event.target, 'open-bin');
        toggleClass(event.target, 'closed-bin');
        
        // I am toggling some classes to trigger the panel in sliding in
        toggleClass(history, "closed-history");
        toggleClass(history, "active-history");

        // Here more things happening when clicking on the history bin could happen.
    }

    var resetView = x("#reset");
    // resets the whole view
    resetView.onclick = function() {
        var scrollOptions = {
            left: 0,
            top: 0,
            behavior: 'smooth' // does not work in Safari, polyfill needed: https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions
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

// for now this just defaults to no object selected, later maybe more…
function reset() {
	X(".active").forEach(el => el.classList.remove('active'));
}

function addElementToHistoryPanel(currentObj, elementsHistory) {
    // checks if element has already been discovered, otherwise it adds it to the list
    if (!elementsHistory.includes(data[currentObj].name_EN)) {
        elementsHistory.push(data[currentObj].name_EN)

        x("#history").innerHTML += `<p class=${"object-name"}>` + data[currentObj].name_EN + "</p>"
    }
} 