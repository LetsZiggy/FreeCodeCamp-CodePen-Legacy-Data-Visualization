let url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
let arrData = [];
let jsonData = { place: [], timeSeconds: [], timeRange: null };
let tableRect = null;
let xScale = null;
let yScale = null;

let svg = d3.select('#table').append('svg');
svg.append('g').attr('class', 'xaxis');
svg.append('g').attr('class', 'yaxis');
svg.append('foreignObject').attr('id', 'graph-title').html(`
                                                      <div class="graph-title">
                                                        <h2>Doping in Professional Bicycle Racing</h2>
                                                        <h4>35 Fastest times up Alpe d'Huez</h4>
                                                        <p>Normalized to 13.8km distance</p>
                                                      </div>
                                                    `);
svg.append('text').attr('class', 'xaxisTitle').text('Minutes Behind Fastest Time');
svg.append('text').attr('class', 'yaxisTitle').text('Ranking');

function renderGraph() {
  tableRect = document.getElementById('table').getBoundingClientRect();
  xScale = d3.scaleLinear()
             .domain([jsonData['timeRange'] + 30, 0])
             .range([0, (tableRect.width - (6.5 * rem))]);
  yScale = d3.scaleLinear()
             .domain([jsonData['place'][0], jsonData['place'][jsonData['place'].length - 1] + 1])
             .range([0, (tableRect.height - (2.5 * rem))]);

  // Change svg size on window resize
  svg.attr('width', Math.floor(tableRect.width))
     .attr('height', Math.floor(tableRect.height));

  // Add the circles
  let circles = svg.selectAll('circle')
                   .data(arrData);

  // Allows circles to be resized on window resize
  circles.enter()
         .append('circle')
         .style('fill', (v, i, a) => v['Doping'].length ? 'crimson' : 'lightslategrey')
         .style('stroke', (v, i, a) => v['Doping'].length ? 'crimson' : 'lightslategrey')
         .style('stroke-width', '1')
         .merge(circles)
         .attr("r", 5)
         .attr("cx", (v, i, a) => xScale(jsonData['timeSeconds'][i]))
         .attr("cy", (v, i, a) => (1.25 * rem) + yScale(v['Place']))
         .on('mouseenter', function(v, i, a) {
           d3.select(this)
             .attr("r", 6)
             .style('fill', v['Doping'].length ? 'darkred' : 'black')
             .style('stroke', v['Doping'].length ? 'darkred' : 'black');
           svg.append('foreignObject')
              .attr('id', 'info')
              .attr('x', tableRect.width - (6.5 * rem) - 225)
              .attr('y', tableRect.height - (2.5 * rem) - 200)
              .html(`
                <div class="info">
                  <span>${v['Place']}. ${v['Name']} (${v['Nationality']})</span>
                  <br>
                  <span>Time: ${v['Time']} (${v['Year']})</span>
                  <br>
                  <br>
                  <span>${v['Doping']}</span>
                </div>
              `);
         })
         .on('mouseleave', function(v, i, a) {
           d3.select(this)
             .attr("r", 5)
             .style('fill', (v, i, a) => v['Doping'].length ? 'crimson' : 'lightslategrey')
             .style('stroke', (v, i, a) => v['Doping'].length ? 'crimson' : 'lightslategrey')
           svg.select('#info')
              .remove();
         });

  // Add the name texts
  let nametexts = svg.selectAll('.nametext')
                     .data(arrData);

  // Allows name texts to be resized on window resize
  nametexts.enter()
           .append('text')
           .attr('class', 'nametext')
           .style('font-size', `10px`)
           .style('color', `dimgrey`)
           .merge(nametexts)
           .attr('transform', (v, i, a) => `translate(${(0.5 * rem) + xScale(jsonData['timeSeconds'][i])}, ${(1.5 * rem) + yScale(v['Place'])})`)
           .text((v, i, a) => v['Name'])
           .on('mouseenter', function(v, i, a) {
             svg.append('foreignObject')
                .attr('id', 'info')
                .attr('x', tableRect.width - (6.5 * rem) - 225)
                .attr('y', tableRect.height - (2.5 * rem) - 200)
                .html(`
                  <div class="info">
                    <span>${v['Place']}. ${v['Name']} (${v['Nationality']})</span>
                    <br>
                    <span>Time: ${v['Time']} (${v['Year']})</span>
                    <br>
                    <br>
                    <span>${v['Doping']}</span>
                  </div>
                `);
           })
           .on('mouseleave', function(v, i, a) {
             svg.select('#info')
                .remove();
           });

  // Add the x-axis to g.xaxis
  svg.selectAll('g.xaxis')
     .attr('transform', `translate(${rem}, ${tableRect.height - (1.25 * rem)})`)
     .style('font-size', `8px`)
     .call(
       d3.axisBottom(xScale)
         .ticks(10)
     )
     .selectAll('text')
     .text((v, i, a) => `${ Math.floor(v / 60) < 10 ? '0' + Math.floor(v / 60) : Math.floor(v / 60) }:${ Math.floor(v % 60) < 10 ? '0' + Math.floor(v % 60) : Math.floor(v % 60) }`)
     .attr('x', -12)
     .attr('y', 5);

  // Add the y-axis to g.yaxis
  svg.selectAll('g.yaxis')
     .attr('transform', `translate(${rem}, ${1.25 * rem})`)
     .style('font-size', `8px`)
     .call(
       d3.axisLeft(yScale)
         .ticks(10)
     )
     .selectAll('text')
     .attr('x', -1)
     .attr('y', -5)
     .select(function(v, i, a) { return(i === 0 ? this : null); })
     .attr('opacity', 0);

  // Transform x-axis title
  svg.selectAll('.xaxisTitle')
     .attr('transform', `translate(${tableRect.width - 240}, ${tableRect.height - (1.35 * rem)})`)
     .style('font-size', `12px`);

  // Transform y-axis title
  svg.selectAll('.yaxisTitle')
     .attr('transform', `translate(13, 67) rotate(-90)`)
     .style('font-size', `12px`);

  svg.selectAll('#graph-title')
     .attr('x', -10)
     .attr('y', -25);
}

fetch(url).then(res => res.json())
          .then(data => {
            arrData = data;
            jsonData['timeRange'] = data[data.length - 1]['Seconds'] - data[0]['Seconds'];

            data.forEach((v, i ,a) => {
              jsonData['timeSeconds'].push(v['Seconds'] - a[0]['Seconds']);
              jsonData['place'].push(v['Place']);
            });

            renderGraph();
          });

window.addEventListener('resize', () => { renderGraph(); });
window.addEventListener('unload', () => {
  window.removeEventListener('resize', () => { renderGraph(); });
});