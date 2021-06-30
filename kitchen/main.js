// shortcuts to access elements
function x(s) { return document.querySelector(s); }
function X(s) { return document.querySelectorAll(s); }

// this variable will hold the metadata from the data file
var data = null;

// this variables is a reference to the DOM element holding the SVG elements 
var map = x('#map');

// load the SVG file and add its elements to the map
fetch('graphics_3.0.svg')
  .then(r => r.text())
  .then(text => { 
		map.innerHTML = text;		
		// initialize the map if data is loaded, too:
		if (data!=null) load();
	})

// load data file and add to data variable
fetch('data.json')
  .then(r => r.json())
	.then(d => {
		data = d;
		// initialize the map if svg is loaded, too:
		if (typeof x('#map svg') != "null") load();
	});

// tooltips logic
var Tooltip = {
    // Stores current active object to trigger event correctly
    activeObj: undefined,
    show: function (e, obj) {
        // reset all active classes from elements
		reset();
        
        // Get unique id of active object
        var id = Tooltip.activeObj.id;
        
        var document = x("html");

        var objCoordinates = Tooltip.activeObj.getBoundingClientRect()

        // Store cursor position @ click in two variables
        var xPositionClick = e.layerX;
        var yPositionClick = e.layerY;

        // this object's name and info is added to the info box
        x("#info").innerHTML = "<h2>"+ data[id].name +"</h2>" + "<p>" + data[id].info + "</p>";

        // positions the info box on click position
        x("#info").style.left = xPositionClick + 'px';
        x("#info").style.top = yPositionClick + 'px';

        // scrolls viewport to center active object
        document.scrollLeft = document.scrollLeft / 2 + objCoordinates.x;
        document.scrollTop = document.scrollTop / 2 + objCoordinates.y;
        console.log(document.scrollTop / 2, objCoordinates.x)
        // add a class to clicked object
        x("#"+id).classList.add("active");
        // the infobox is also made visible (see style above)
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
		
		// the object that is matched gets class object and is made invisible (see style above)
		obj.classList.add("object");
        
            // object gets a click event
            obj.onclick = function(event) {
                // prevent event to be triggered if the clicked object is already active
                if (Tooltip.activeObj == undefined || Tooltip.activeObj.id !== this.id) {
                    // Assign current active object to tooltip
                    Tooltip.activeObj = this;	
                    // execute function that renders tooltip		
                    Tooltip.show(event, this);
                }
            }
	}
	
	// when clicking on the background, the selection is reset
	var bg = svg.getElementById("background")
	bg.onclick = function() { Tooltip.hide(); }
	
	// also when the escape key is pressed
	document.onkeyup = function(e) {
	   if (e.key === "Escape") {
			 reset();
		 }
	}	
	
}

// for now this just defaults to no object selected, later maybe more…
function reset() {
	X(".active").forEach(el => el.classList.remove('active'));
}