let urlData = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
let urlWorld = 'https://unpkg.com/world-atlas@1/world/110m.json';
let list = [urlData, urlWorld];
let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
let jsonData = null;
let jsonWorld = null;
let tableRect = null;
let massMaxMin = { max: null, min: null };
let massArr = [];
let currentScale = 1;
let dragCoords = { x: null, y: null };

let svg = d3.select('#table').append('svg').style('background-color', 'mintcream');

function renderGraph() {
  tableRect = document.getElementById('table').getBoundingClientRect();

  // Mass scale
  let massScale = d3.scaleLinear().
  domain([massMaxMin['min'], massMaxMin['max']]).
  range([1.5, 50]);

  // Change svg size on window resize
  svg.attr('width', Math.floor(tableRect.width)).
  attr('height', Math.floor(tableRect.height));

  // Create worldmap projection
  let projection = d3.geoMercator().
  center([0, 0]).
  rotate([0, 0]).
  scale(tableRect.width / 4)
  // .scale(tableRect.height / 4)
  .translate([tableRect.width / 2, tableRect.height / 2]);

  // Create worldmap path
  let path = d3.geoPath().
  projection(projection);

  // Add group
  let g = svg.append('g').attr('id', 'group-id');

  // Have not figured out how to resize window without duplicates
  svg.selectAll('path').
  remove();
  svg.selectAll('circle').
  remove();

  // Set worldmap
  let worldmapPath = g.selectAll('path').
  data(topojson.feature(jsonWorld, jsonWorld.objects.countries).features);

  worldmapPath.enter().
  append('path').
  attr('fill', 'lightgrey').
  attr('stroke', 'silver')
  // .merge(worldmapPath) // Need to figure out how to get it working
  .attr('d', path);

  // Add data circles
  let circles = g.selectAll('circle').
  data(jsonData['features']);

  circles.enter().
  append('circle').
  attr('class', 'circles')
  // .merge(circles) // Need to figure out how to get it working
  .attr('r', (v, i, a) => v['properties']['mass'] !== null ? massScale(v['properties']['mass']) : 0) // v['properties']['mass']
  .attr('cx', (v, i, a) => v['geometry'] !== null ? projection([v['geometry']['coordinates'][0], v['geometry']['coordinates'][1]])[0] : 0).
  attr('cy', (v, i, a) => v['geometry'] !== null ? projection([v['geometry']['coordinates'][0], v['geometry']['coordinates'][1]])[1] : 0).
  attr('fill', () => 'crimson').
  attr('stroke', () => 'black').
  on('mouseenter', function (v, i, a) {
    svg.append('foreignObject').
    attr('id', 'info').
    attr('x', () => d3.event.x).
    attr('y', () => d3.event.y).
    html(`
               <div style="background-color: rgba(0, 0, 0, 0.5); color: white; width: 12.5rem; min-height: 2.5rem; padding-bottom: 0.25rem; padding-left: 0.5rem; padding-right: 0.5rem; border-radius: 5px;">
                 <h5 style="line-height: 1.25rem; transform: translateY(0.5rem);">Name: ${v['properties']['name']}</h5>
                 <p style="line-height: 0.5rem; transform: translateY(0rem);">Year: ${v['properties']['year'].slice(0, 4)}</p>
                 <p style="line-height: 0.5rem; transform: translateY(0rem);">Class: ${v['properties']['recclass']}</p>
                 <p style="line-height: 0.5rem; transform: translateY(0rem);">Mass: ${v['properties']['mass']}</p>
                 <p style="line-height: 0.5rem; transform: translateY(0rem);">Long: ${v['properties']['reclong']}</p>
                 <p style="line-height: 0.5rem; transform: translateY(0rem);">Lat: ${v['properties']['reclat']}</p>
               </div>
             `);
  }).
  on('mouseleave', function () {
    svg.select('#info').
    remove();
  });

  // Define dragHandler
  let dragHandler = d3.drag().
  on('start', function () {
    dragCoords['x'] = +d3.event.x;
    dragCoords['y'] = +d3.event.y;
  }).
  on('drag', function (v, i, a) {
    if (this.getAttribute('transform')) {
      let currentScaleString = this.getAttribute('transform').
      split(' ')[1];
      currentScale = +currentScaleString.substring(6, currentScaleString.length - 1);
    }
    d3.select(this).
    attr('cx', v.x = dragCoords['x'] + (d3.event.x - dragCoords['x']) / currentScale).
    attr('cy', v.y = dragCoords['y'] + (d3.event.y - dragCoords['y']) / currentScale);
  });

  // Define zoomHandler
  let zoomHandler = d3.zoom().
  on('zoom', () => {
    g.style('stroke-width', `${1 / d3.event.transform.k}px`).
    attr('transform', d3.event.transform);
  });

  dragHandler(circles);
  svg.call(zoomHandler);
}

function createPromise(url) {
  return (
    new Promise((resolve, reject) => {
      fetch(url).then(res => res.json()).
      then(data => {
        resolve(data);
      });
    }));

}

list.forEach((v, i, a) => {
  a[i] = createPromise(v);
});

Promise.all(list).then(values => {
  jsonData = values[0];
  jsonWorld = values[1];

  jsonData['features'].forEach((v, i, a) => {
    if (massArr.indexOf(v['properties']['mass']) === -1) {
      massArr.push(parseFloat(v['properties']['mass']));
    }
  });

  massMaxMin['min'] = d3.min(massArr);
  massMaxMin['max'] = d3.max(massArr);

  renderGraph();
});

window.addEventListener('resize', () => {renderGraph();});
window.addEventListener('unload', () => {
  window.removeEventListener('resize', () => {renderGraph();});
});