var svgMapDe = d3.select("#de-map");
var width = svgMapDe.node().getBoundingClientRect().width;
var height = svgMapDe.node().getBoundingClientRect().height;

var svgPie = d3.select("#de-pie");
var pieWidth = svgPie.node().getBoundingClientRect().width;
var pieHeight = svgPie.node().getBoundingClientRect().height;
console.log(width)
var margin = height / 30;
var radius = Math.min(width, height) / 2 - margin

function getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

d3.json("../common/assets/data/bundeslaender.json").then(function (data) {

    var center = d3.geoCentroid(data)
    var scale = 1
    var projection = d3.geoMercator().scale(scale).center(center).translate([width / 2, height / 2])
    var path = d3.geoPath().projection(projection)

    var bounds = path.bounds(data)
    var hscale = scale * width / 1.1 / (bounds[1][0] - bounds[0][0]);
    var vscale = scale * height / 1.01 / (bounds[1][1] - bounds[0][1]);
    var scale = (hscale < vscale) ? hscale : vscale;
    var offset = [width - (bounds[0][0] + bounds[1][0]) / 2,
    height - (bounds[0][1] + bounds[1][1]) / 2];

    projection = d3.geoMercator().center(center).scale(scale).translate(offset);


    d3.csv("../common/assets/data/pro-kopf-haushalten-2020.csv").then(function (packData) {

        var linearScale = d3.scaleLinear().domain([50, 100]).range([0, 1])
        var legendValues = [50, 60, 70, 80, 90, 95]
        var currentLabel = data.features.filter(d => d.properties.GEN === 'Berlin')
        console.log(currentLabel)

        svgMapDe.append("g")
            .attr("class", "map-contours")
            .attr("transform", "translate(0, 25)")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", d3.geoPath().projection(projection))
            .each(function (d, i) {
                packData.map(el => {
                    if (d.properties.GEN === el.Land) {
                        d3.select(this)
                            .attr("fill", d3.interpolateOranges(linearScale(el["Verpackungsmüll"])))
                    }
                })
            })
            .on('click', function () {
                currentLabel = data.features.filter(d => d.properties.GEN === this['__data__'].properties.GEN)
                // var activeLabel = this['__data__'].properties.GEN
                svgMapDe.selectAll("text")
                    .each(function (el) {
                        if (el.label !== undefined) {
                            d3.select(this)
                                .attr("class", el.label !== currentLabel[0].properties.GEN ? 'invisible-text' : '')
                        }

                    })
            })

        svgMapDe.append("g")
            .attr("class", "legend")
            .selectAll("rect")
            .data(legendValues)
            .enter().append("rect")
            .attr("x", 10)
            .attr("y", (d, i) => i * 25)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d => d3.interpolateOranges(linearScale(d)))

        svgMapDe.select(".legend")
            .selectAll("text")
            .data(legendValues)
            .enter().append("text")
            .attr("class", "legend-label")
            .attr("fill", "#412589")
            .attr("x", 40)
            .attr("y", (d, i) => ((i + 1) * 25) - 10)
            .text(function (d, i) {
                var nextValueI = i + 1
                return i < legendValues.length - 1 ? `${d} – ${legendValues[nextValueI]}` : `< ${d}`
            })


        var bundesLabels = data.features.map(d => {
            var bundesCenter = projection(d3.geoCentroid(d))
            var y = bundesCenter[1]
            var kgProKopf = 0

            if (d.properties.GEN === 'Bremen') {
                y = y - 20
            } else if (d.properties.GEN === 'Brandenburg') {
                y = y + 20
            }

            packData.forEach(el => {
                if (el.Land === d.properties.GEN) {
                    kgProKopf = +el["Verpackungsmüll"]
                }
            })

            return {
                // width: bundesWidth,
                x: bundesCenter[0],
                y,
                label: d.properties.GEN,
                kgProKopf
            }
        }).filter(d => { return !d.label.includes('(Bodensee)') }).reverse()

        const filteredLabels = getUniqueListBy(bundesLabels, 'label')
        // console.log(filteredLabels)

        svgMapDe.select(".map-contours")
            .append("g")
            .selectAll("text")
            .data(filteredLabels)
            .enter().append("text")
            .attr("class", [d => d.label, "invisible"])
            .attr("x", d => d.x)
            .attr("y", d => d.y + 10)
            .attr("fill", "transparent")
            .attr("stroke", "#412589")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 1)
            .text(function (d) { return d.kgProKopf + 'Kg » ' + d.label })

        svgMapDe.select(".map-contours")
            .append("g")
            .selectAll("text")
            .data(filteredLabels)
            .enter().append("text")
            .attr("class", d => d.label)
            .attr("fill", "white")
            .attr("x", d => d.x)
            .attr("y", d => d.y + 10)
            .text(function (d) { return d.kgProKopf + 'Kg » ' + d.label })

    })
})

d3.csv("../common/assets/data/de-composition.csv").then(function (pieData) {
    var colorScale = d3.scaleOrdinal().domain(pieData.map(d => d.Type_EN)).range(["#EA5C13", "#F7AA63", "#FAD46A", "#3D3589", "#6B72B3", "#ACA5D1", "#AA8B72", "#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

    var pie = d3.pie().value(function (d) { return +d.Perc })
    var dataReady = pie(pieData)
    var translateY = width <= 400 ? height / 3.5 : height / 2;
    var eventType = width <= 400 ? 'click' : 'mouseover'
    var currentLabel = dataReady.filter(d => d.data.Type_EN === "Organic Waste")
    var previousElement

    svgPie.append("g")
        .attr("transform", "translate(" + width / 2 + "," + translateY + ")")
        .selectAll("path")
        .data(dataReady)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(radius / 1.3)         // This is the size of the donut hole
            .outerRadius(radius)
        )
        .attr('fill', function (d) { return (colorScale(d.data.Type_EN)) })
        .attr("stroke", "white")
        .style("opacity", 0.7)
        .on(eventType, function () {
            currentLabel = dataReady.filter(d => d.data.Type_EN === this['__data__'].data.Type_EN)
            svgPie.selectAll("path")
                .each(function (el) {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('stroke-width', el.data.Type_EN === currentLabel[0].data.Type_EN ? '2px' : '1px')
                        .attr('d', d3.arc()
                            .innerRadius(el.data.Type_EN === currentLabel[0].data.Type_EN ? radius / 1.3 + 10 : radius / 1.3)         // This is the size of the donut hole
                            .outerRadius(el.data.Type_EN === currentLabel[0].data.Type_EN ? radius + 10 : radius)
                        )
                })



            svgPie.select("#interactive-label")
                .data(currentLabel)
                .text(currentLabel[0].data.Type_EN)

            svgPie.select("#interactive-label-name")
                .data(currentLabel)
                .text(currentLabel[0].value + "%")

            previousElement = this


        })
        .on('mouseout', function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr('stroke-width', '1px')
                .attr('d', d3.arc()
                    .innerRadius(radius / 1.3)         // This is the size of the donut hole
                    .outerRadius(radius)
                )

            var currentLabel = dataReady.filter(d => d.data.Type_EN === "Organic Waste")

            svgPie.select("#interactive-label")
                .data(currentLabel)
                .text(currentLabel[0].data.Type_EN)

            svgPie.select("#interactive-label-name")
                .data(currentLabel)
                .text(currentLabel[0].value + "%")
        })

    svgPie.select("g")
        .append("g")
        .attr("class", "text-label")
        .selectAll("text")
        .data(currentLabel)
        .enter().append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr('fill', '#412589')
        .attr('id', 'interactive-label-name')
        .attr("text-anchor", "middle")
        .text(currentLabel[0].data.Type_EN)

    svgPie.select(".text-label")
        .append("g")
        .selectAll("text")
        .data(currentLabel)
        .enter().append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr('fill', '#412589')
        .attr('id', 'interactive-label')
        .attr("text-anchor", "middle")
        .text(currentLabel[0].value + "%")
})