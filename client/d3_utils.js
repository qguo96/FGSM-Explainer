
var d3 = require('d3')

export function clickCur(g){

    g.on("click", function(d) {

            d3.select('.canvas')
                .append('circle')
                .attr('class', 'cur_cir')
                .attr('r', 1)
                .attr('cx', function() {
                    return d3.mouse(this)[0];
                })
                .attr('cy', function() {
                    return d3.mouse(this)[1];
                })
                .style('fill', '#C5ADE7')
                .transition()
                .ease(d3.easeLinear)
                .duration(200)
                .attr('r', 50)
                .style('fill-opacity', 0)
                .on('end', function(){
                    d3.select(this).remove();
                })

        })

}

export function hoverCir(g, k){

    g.transition("mousehover")
        .duration(60)
        .attr("r", 15/k)
        .attr("stroke-width", function(d) {
            if (d.pred != d.target) {
                return 3/k;
            }
            return 0.1/k;
        })

}

export function unhoverCir(g, k){

    g.transition("mousehover")
        .duration(60)
        .attr("r", 7/k)
        .attr("stroke-width", function(d) {
            if (d.pred != d.target) {
                return 2/k;
            }
            return 0.1/k;
        })

}

export function welcomeAppear(){

    var startTranslateState = 'translate(-50%, -50%) scale(0.1)';
    var endTranslateState = 'translate(-50%, -50%) scale(1.0)';
    var translateInterpolator = d3.interpolateString(startTranslateState, endTranslateState);

    d3.select(".welcome_bg")
      .transition()
      .duration(1000)
      .ease(d3.easeBack)
      .style('opacity', 0.20)

    d3.select("#welcome_window")
      .transition()
      .delay(500)
      .duration(1000)
      .ease(d3.easeBack)
      .styleTween('transform', function (d) {
          return translateInterpolator;
      })
      .style('opacity', 1)

}

export function welcomeDisappear(){

    d3.select("#icon_gibbon")
      .transition()
      .duration(600)
      .style('opacity', 1)

    d3.select("#icon_panda")
      .transition()
      .duration(600)
      .style('opacity', 0)

    var startTranslateState = 'translate(-50%, -50%) scale(1.0)';
    var endTranslateState = 'translate(-50%, -50%) scale(0.1)';
    var translateInterpolator = d3.interpolateString(startTranslateState, endTranslateState);

    d3.select("#welcome_window")
      .transition()
      .delay(1200)
      .duration(1000)
      .ease(d3.easeBack)
      .styleTween('transform', function (d) {
          return translateInterpolator;
      })
      .style('opacity', 0)
      .on('end', function(){
        d3.select("#welcome_window").remove();
      })

    d3.select(".welcome_bg")
      .transition()
      .delay(800)
      .duration(1000)
      .ease(d3.easeBack)
      .style('opacity', 0)
      .on('end', function(){
        //d3.select(".welcome_bg").remove();
        d3.select(".welcome_bg").style("pointer-events", "none").style("visibility","hidden");
      })
}

export function welcomeRemove(){

    d3.select("#welcome_window").remove()
    d3.select(".welcome_bg").remove()

}
