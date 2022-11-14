var svg = d3.select("#de-map");
var width = svg.node().getBoundingClientRect().width;
var height = svg.node().getBoundingClientRect().height;

function getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

d3.json("../common/assets/data/bundeslaender.json").then(function (data) {

    var center = d3.geoCentroid(data)
    var scale = 1
    var projection = d3.geoMercator().scale(scale).center(center).translate([width / 2, height / 2])
    var path = d3.geoPath().projection(projection)

    var bounds = path.bounds(data)
    var hscale = scale * width / 1.5 / (bounds[1][0] - bounds[0][0]);
    var vscale = scale * height / 1.5 / (bounds[1][1] - bounds[0][1]);
    var scale = (hscale < vscale) ? hscale : vscale;
    var offset = [width - (bounds[0][0] + bounds[1][0]) / 2,
    height - (bounds[0][1] + bounds[1][1]) / 2];

    projection = d3.geoMercator().center(center).scale(scale).translate(offset);

    svg.append("g")
        .attr("class", "map-contours")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", d3.geoPath().projection(projection))


    var bundesLabels = data.features.map(d => {
        var bundesCenter = projection(d3.geoCentroid(d))

        var y = bundesCenter[1]

        if (d.properties.GEN === 'Bremen') {
            y = y - 20
        } else if (d.properties.GEN === 'Brandenburg') {
            y = y + 25
        }

        return {
            // width: bundesWidth,
            x: bundesCenter[0],
            y,
            label: d.properties.GEN
        }
    }).filter(d => { return !d.label.includes('(Bodensee)') }).reverse()

    const filteredLabels = getUniqueListBy(bundesLabels, 'label')

    svg.append("g")
        .selectAll("text")
        .data(filteredLabels)
        .enter().append("text")
        // .attr("width", d => d.width + "px")
        // .attr("height", 1 + "px")
        .attr("x", d => d.x)
        .attr("y", d => d.y + 10)
        // .append("xhtml:p")
        // .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .text(function (d) { return d.label })

    console.log(data.features)
})