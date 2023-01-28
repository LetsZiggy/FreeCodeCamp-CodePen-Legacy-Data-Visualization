let url = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
let jsonData = null;
let tableRect = null;
let simulation = null;
let link = null;
let node = null;
let svg = d3.select('#table').append('svg');

function center() {
  tableRect = document.getElementById('table').getBoundingClientRect();

  // Change svg size on window resize
  svg.attr('width', Math.floor(tableRect.width)).
  attr('height', Math.floor(tableRect.height));

  // Recenter
  simulation.force("center").
  x(tableRect.width / 2).
  y(tableRect.height / 2);

  simulation.alpha(0.3).restart();
}

function renderGraph() {
  tableRect = document.getElementById('table').getBoundingClientRect();

  // Set Force Simulation
  simulation = d3.forceSimulation().
  force('link', d3.forceLink().id((v, i, a) => v.index))
  // .force('collide', d3.forceCollide(16).iterations(1))
  .force('charge', d3.forceManyBody()).
  force('center', d3.forceCenter(tableRect.width / 2, tableRect.height / 2)).
  force('x', d3.forceX(0)).
  force('y', d3.forceY(0));

  // Change svg size on window resize
  svg.attr('width', Math.floor(tableRect.width)).
  attr('height', Math.floor(tableRect.height));

  // Add and select the links
  link = svg.append('g').
  attr('class', 'links').
  selectAll('line').
  data(jsonData.links).
  enter().
  append('line').
  style('stroke', 'black').
  style('stroke-width', '1');

  // Add the nodes
  svg.append('g').
  attr('class', 'nodes').
  selectAll('foreignObject')
  // .selectAll('circle')
  .data(jsonData.nodes).
  enter().
  append('foreignObject').
  attr('width', (v, i, a) => 20).
  attr('height', (v, i, a) => 15)
  // .append('circle')
  // .attr('r', 8)
  .append('xhtml:span').
  attr('class', (v, i, a) => `flag-icon flag-icon-${v.code}`).
  attr('title', (v, i, a) => `${v.country}`);

  // Select the nodes
  node = svg.select('.nodes').
  selectAll('foreignObject').
  data(jsonData.nodes).
  call(d3.drag().
  on('start', (v, i, a) => {
    if (!d3.event.active) {simulation.alphaTarget(0.3).restart();}
    v.fx = v.x;
    v.fy = v.y;
  }).
  on('drag', (v, i, a) => {
    v.fx = d3.event.x;
    v.fy = d3.event.y;
  }).
  on('end', (v, i, a) => {
    if (!d3.event.active) {simulation.alphaTarget(0.3);}
    v.fx = null;
    v.fy = null;
  }));


  // Apply simulation
  simulation.nodes(jsonData.nodes).
  on('tick', () => {
    link.attr('x1', (v, i, a) => v.source.x).
    attr('y1', (v, i, a) => v.source.y).
    attr('x2', (v, i, a) => v.target.x).
    attr('y2', (v, i, a) => v.target.y);

    node.attr('x', (v, i, a) => v.x - 10).
    attr('y', (v, i, a) => v.y - 10);
  });

  simulation.force('link').
  links(jsonData.links);
}

fetch(url).then(res => res.json()).
then(data => {
  jsonData = data;
  renderGraph();
});

window.addEventListener('resize', () => {center();});
window.addEventListener('unload', () => {
  window.removeEventListener('resize', () => {center();});
});