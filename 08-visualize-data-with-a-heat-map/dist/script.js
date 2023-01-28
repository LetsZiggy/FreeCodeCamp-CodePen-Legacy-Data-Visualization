let url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let years = { middle: null, data: [] };
let colours = ['navy', 'royalblue', 'lightskyblue', 'lightgreen', 'palegoldenrod', 'lightyellow', 'moccasin', 'orange', 'coral', 'indianred', 'darkred'];
let variances = { min: null, max: null, data: [] };
let baseTemp = null;
let mapData = [];
let tableRect = null;
let xScale = null;
let yScale = null;
let colorScale = null;
let mouse = null;

let svg = d3.select('#table').append('svg');
svg.append('g').attr('class', 'xaxis');
svg.append('g').attr('class', 'yaxis');

function renderGraph() {
  tableRect = document.getElementById('table').getBoundingClientRect();
  xScale = d3.scaleLinear().
  domain([0, years['data'][years['data'].length - 1] - years['data'][0]]).
  range([0, tableRect.width - 2 * rem]);
  yScale = d3.scaleLinear().
  domain([0, 12]).
  range([0, tableRect.height - 2 * rem]);
  colourScale = d3.scaleQuantile().
  domain([variances['min'], variances['max']]).
  range(colours);

  // Change svg size on window resize
  svg.attr('width', Math.floor(tableRect.width)).
  attr('height', Math.floor(tableRect.height));

  // Add the bars
  let rects = svg.selectAll('rect').
  data(mapData);

  // Allows bars to be resized on window resize
  rects.enter().
  append('rect').
  style('stroke', (v, i, a) => '#FAFAFA').
  style('stroke-width', '1').
  merge(rects).
  style('fill', (v, i, a) => colourScale(v['variance'])).
  attr('width', (v, i, a) => xScale(1)).
  attr('height', (v, i, a) => yScale(1)).
  attr('x', (v, i, a) => xScale(v['year'] - years['data'][0]) + rem).
  attr('y', (v, i, a) => yScale(v['month'] - 1) + rem).
  on('mouseenter', function (v, i, a) {
    mouse = d3.mouse(this);
    svg.append('foreignObject').
    attr('id', 'info').
    attr('x', () => {
      if (mouse[0] < Math.floor(tableRect.width / 2)) {return mouse[0] + rem;} else
      {return mouse[0] - 12 * rem;}
    }).
    attr('y', () => {
      if (mouse[1] < Math.floor(tableRect.height / 2)) {return mouse[1] - 1.5 * rem;} else
      {return mouse[1] - 6.5 * rem;}
    }).
    html(`
              <div style="text-align: center; background-color: rgba(0, 0, 0, 0.25); width: 11rem; height: 4.5rem; border-radius: 5px;">
                <h5 style="line-height: 1rem; transform: translateY(0.5rem);">${months[v['month'] - 1]} ${v['year']}</h5>
                <p style="line-height: 0.5rem; transform: translateY(0.15rem);">${(baseTemp + v['variance']).toFixed(3)}℃</p>
                <p style="line-height: 0.5rem; transform: translateY(-0.5rem);">${v['variance']}℃</p>
              </div>
            `);
  }).
  on('mouseleave', function (v, i, a) {
    svg.select('#info').
    remove();
  }).
  on('mousemove', function (v, i, a) {
    mouse = d3.mouse(this);
    svg.select('#info').
    attr('y', () => {
      if (mouse[1] < Math.floor(tableRect.height / 2)) {return mouse[1] - 1.5 * rem;} else
      {return mouse[1] - 6.5 * rem;}
    });
  });

  // Add the x-axis to g.xaxis
  svg.selectAll('g.xaxis').
  attr('transform', `translate(${rem}, ${tableRect.height - rem})`).
  style('font-size', `8px`).
  call(
  d3.axisBottom(xScale).
  ticks(10).
  tickFormat((v, i, a) => (v + years['data'][0]).toString())).

  selectAll('text').
  attr('x', 10).
  attr('y', 5).
  select(function (v, i, a) {return i === a.length - 1 ? this : null;}).
  attr('x', -10);

  // Add the y-axis to g.yaxis
  svg.selectAll('g.yaxis').
  attr('transform', `translate(${rem}, ${rem})`).
  style('font-size', `10px`).
  call(
  d3.axisLeft(yScale).
  tickFormat((v, i, a) => months[i])).

  selectAll('text').
  attr('x', -5).
  attr('y', -5).
  attr('transform', `rotate(-90)`);
}

fetch(url).then(res => res.json()).
then(data => {
  baseTemp = data.baseTemperature;
  mapData = [...data.monthlyVariance];

  data.monthlyVariance.forEach((v, i, a) => {
    if (variances['data'].indexOf(v['variance']) === -1) {
      variances['data'].push(v['variance']);
    }
    if (years['data'].indexOf(v['year']) === -1) {
      years['data'].push(v['year']);
    }
  });

  variances['min'] = d3.min(variances['data']);
  variances['max'] = d3.max(variances['data']);

  renderGraph();
});

window.addEventListener('resize', () => {renderGraph();});
window.addEventListener('unload', () => {
  window.removeEventListener('resize', () => {renderGraph();});
});