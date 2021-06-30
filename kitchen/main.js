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
		if (data!=null) init();
	})

// load data file and add to data variable
fetch('data.json')
  .then(r => r.json())
	.then(d => {
		data = d;
		// initialize the map if svg is loaded, too:
		if (typeof x('#map svg') != "null") init();
	});

// tooltips logic
var Tooltip = {
    tooltip: undefined,
    show: function (e, obj) {
        console.log(e)
        Tooltip.tooltip = obj;
        var id = Tooltip.tooltip.id;

        // Change div coordinates and move it close to object
        var left  = e.layerX  + "px";
        var top  = e.layerY  + "px";
        x("#info").style.left = left;
        x("#info").style.top = top;

        // add a class to clicked object
        x("#"+id).classList.add("active");
        // this object's name and info is added to the info box
        x("#info").innerHTML = "<h2>"+ data[id].name +"</h2>" + "<p>" + data[id].info + "</p>";
        // the infobox is also made visible (see style above)
        x("#info").classList.add("active");
    },
    hide: function() {
        console.log('hidden');
        // removes classes and hide tooltip
        reset();
    }
}

console.log(Tooltip)

// add click events to all svg elements that have an entry in data file
function init() {
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
        
        // add and remove tooltip on hover
        obj.onmouseover = function(){
            
        }
		// object gets a click event
		obj.onclick = function(event){
			// reset all active classes from elements
			reset();
            // execute function and renders tooltip			
			Tooltip.show(event, this);
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