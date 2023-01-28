let url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';
let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
let jsonData = null;
let tableRect = null;
let xScale = null;
let yScale = null;
let mouse = null;

let svg = d3.select('#table').append('svg');
svg.append('g').attr('class', 'xaxis');
svg.append('g').attr('class', 'yaxis');
svg.append('text').attr('class', 'yaxisTitle').text('Quarterly Gross Domestic Product, USA (Trillion)');

function renderGraph() {
  tableRect = document.getElementById('table').getBoundingClientRect();
  xScale = d3.scaleLinear()
             .domain([jsonData.fromYear, jsonData.toYear])
             .range([0, (tableRect.width - (2 * rem))]);
  yScale = d3.scaleLinear()
             .domain([jsonData.dataMin, jsonData.dataMax])
             .range([(tableRect.height - (2 * rem)), 0]);

  // Change svg size on window resize
  svg.attr('width', Math.floor(tableRect.width))
     .attr('height', Math.floor(tableRect.height));

  // Add the bars
  let rects = svg.selectAll('rect')
                 .data(jsonData.data);

  // Allows bars to be resized on window resize
  rects.enter()
       .append('rect')
       .style('fill', 'steelblue')
       .style('stroke', 'steelblue')
       .style('stroke-width', '1')
       .merge(rects)
       .attr('width', (v, i, a) => Math.round((tableRect.width - (2 * rem)) / (jsonData.data.length) * 10) / 10)
       .attr('height', (v, i, a) => (tableRect.height - (2 * rem)) - Math.floor(yScale(v[1])) + (5 * (a.length - i) / a.length))
       .attr('x', (v, i, a) => i * ((tableRect.width - (2 * rem)) / (jsonData.data.length)) + rem)
       .attr('y', (v, i, a) => Math.floor(yScale(v[1])) + rem - (5 * (a.length - i) / a.length))
       .on('mouseenter', function(v, i, a) {
         mouse = d3.mouse(this);
         d3.select(this).style('fill', 'lightsteelblue').style('stroke', 'lightsteelblue');
         svg.append('foreignObject')
            .attr('id', 'info')
            .attr('x', () => {
              if(mouse[0] < tableRect.width - (12.5 * rem)) { return(mouse[0] + rem); }
              else { return(mouse[0] - (12 * rem)); }
            })
            .attr('y', mouse[1] - (3.5 * rem))
            .html(`
              <div style="text-align: center; background-color: gainsboro; width: 11rem; height: 3rem; border-radius: 5px;">
                <h5 style="line-height: 1rem; transform: translateY(0.25rem);">$${v[1]} Billion</h5>
                <p style="line-height: 0.5rem;">${v[0].slice(0, v[0].length - 3)}</p>
              </div>
            `);
       })
       .on('mouseleave', function(v, i, a) {
         d3.select(this).style('fill', 'steelblue').style('stroke', 'steelblue');
         svg.select('#info')
            .remove();
       })
       .on('mousemove', function(v, i, a) {
         mouse = d3.mouse(this);
         svg.select('#info')
            .attr('y', mouse[1] - (3.5 * rem));
       });

  // Add the x-axis to g.xaxis
  svg.selectAll('g.xaxis')
     .attr('transform', `translate(${rem}, ${tableRect.height - rem})`)
     .style('font-size', `8px`)
     .call(
       d3.axisBottom(xScale)
         .ticks(10)
     )
     .selectAll('text')
     .attr('x', -12)
     .attr('y', 5);

  // Add the y-axis to g.yaxis
  svg.selectAll('g.yaxis')
     .attr('transform', `translate(${rem}, ${rem})`)
     .style('font-size', `10px`)
     .call(
       d3.axisLeft(yScale)
         .ticks(10)
         .tickFormat((v, i, a) => `${v / 1000}T`)
     )
     .selectAll('text')
     .attr('x', -5)
     .attr('y', -5)
     .attr('transform', `rotate(-90)`);

  // Transform y-axis title
  svg.selectAll('.yaxisTitle')
     .attr('transform', `translate(${2.25 * rem}, ${(tableRect.height / 2) + (7.5 * rem)}) rotate(-90)`)
     .style('font-size', `14px`)
     .style('font-weight', `bold`);

  // Remove current gridlines on window resize
  svg.selectAll('.grid')
     .remove();

  // Add X gridlines on top of rects
  svg.append('g')
     .attr('class', 'grid x')
     .attr('transform', `translate(${rem}, ${tableRect.height - (1.25 * rem)})`)
     .call(
           d3.axisBottom(xScale)
             .ticks(5)
             .tickSize(-tableRect.height)
             .tickFormat("")
     );

  // Add Y gridlines on top of rects
  svg.append('g')
     .attr('class', 'grid y')
     .attr('transform', `translate(${rem}, ${1.25 * rem})`)
     .call(
           d3.axisLeft(yScale)
             .ticks(10)
             .tickSize(-tableRect.width)
             .tickFormat("")
     );
}

fetch(url).then(res => res.json())
          .then(data => {
            jsonData = {
                         from_date: data.from_date,
                         to_date: data.to_date,
                         data: data.data,
                         fromYear: parseInt(data.from_date.slice(0, 4)),
                         toYear: parseInt(data.to_date.slice(0, 4)),
                         dataMax: d3.max(data.data, data => data[1]),
                         dataMin: d3.min(data.data, data => data[1])
                       };

            renderGraph();
          });

window.addEventListener('resize', () => { renderGraph(); });
window.addEventListener('unload', () => {
  window.removeEventListener('resize', () => { renderGraph(); });
});