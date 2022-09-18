import './assets/scss/app.scss'

import * as utils from './d3_utils.js';
import * as img_utils from './img_utils.js';
import {createAccCharts, updateChart} from "./chart_utils.js";
import * as confid_utils from './confid_utils.js'

var $ = require('jquery')
var d3 = require('d3')
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

var map_ = ['#f48382', '#f8bd61', '#ece137', '#c3c580', '#82a69a', '#80b2c5', '#8088c5', '#a380c5', '#c77bab', '#9a9494'];
var perturb = ['None', '0.01', '0.02', '0.03'];
const label_ = ['Airplane', 'Automobile', 'Bird', 'Cat', 'Deer', 'Dog', 'Frog', 'Horse', 'Ship', 'Truck']
var k1 = 1.0;
var k2 = 1.0;
var translateVar = [0, 0];
var width = 500;
var height = 500;
var perturb_ = "000"

/**
 *   define numbers of instances that are incorrectly predicted
 *   the first element is the natural prediction without perturbation
 */
let VGG16Info = {
    "000": 1 - 0.03,
    "001": 1 - 0.15,
    "002": 1 - 0.42,
    "003": 1 - 0.58,
};
let VGG19Info = {
    "000": 1 - 0.03,
    "001": 1 - 0.16,
    "002": 1 - 0.43,
    "003": 1 - 0.66,
};

$('#slider1').on('input', e => $('span').text(perturb[e.target.value]));

$(document).ready(function() {

    /**
    * create two bar charts
    */
    let chartVGG16 = createAccCharts('VGG16', [VGG16Info["000"], VGG16Info["000"]]);
    let chartVGG19 = createAccCharts('VGG19', [VGG19Info["000"], VGG19Info["000"]]);

    utils.clickCur(d3.select('.canvas1'));
    utils.clickCur(d3.select('.canvas2'));
    utils.welcomeAppear();
    //utils.welcomeRemove();//FIXME

    var x1 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([50, 450])
    var y1 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([50, 450])

    var x2 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([0, 500])
    var y2 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([0, 500])

    const gGrid1 = d3.select('.canvas1').append("g");
    const gGrid2 = d3.select('.canvas2').append("g");

    var zoom1 = d3.zoom()
                    .scaleExtent([0.5, 100])
                    .on("zoom", function () {
                        k1 = d3.event.transform.k;
                        translateVar[0] = d3.event.transform.x;
                        translateVar[1] = d3.event.transform.y;

                        //need to separate this for the highlighted dot
                        d3.select('.canvas1')
                            .selectAll('circle')
                            .attr("transform", d3.zoomTransform(this))

                        d3.select('.canvas1')
                            .select('.pin')
                            .attr("transform", d3.zoomTransform(this))

                        if (d3.select('.canvas1').select('.dot_highlight').size() != 0) {

                            var cx_ = d3.select('.canvas1').select('.dot_highlight').attr("cx");
                            var cy_ = d3.select('.canvas1').select('.dot_highlight').attr("cy");

                            d3.select('.canvas1')
                                .select('.pin')
                                .attr("width", 40/k1)
                                .attr("height", 48/k1)
                                .attr('x', cx_-20/k1)
                                .attr('y', cy_-50/k1)

                        }

                        //for the highlighted dot
                        d3.select('.canvas1')
                            .select('.dot_highlight')
                            .attr('r', 20/k1)
                            .attr("stroke-width", function(d) {
                                if (d3.select(this).attr('accu') == 1) {
                                    return 0.2/k1;
                                }
                                return 6.0/k1;
                            })

                        d3.select('.canvas1')
                            .selectAll('.dot')
                            .attr("transform", d3.zoomTransform(this))
                            .attr("r", 7/k1)
                            .attr("stroke-width", function(d, i) {
                                if (d.pred != d.target) {
                                    return 2/k1;
                                }
                                return 0.1/k1;
                            })
                            .on("mouseover", function(d, i) {
                                utils.hoverCir(d3.select(this), k1)
                                utils.hoverCir(d3.select(".canvas2").select("#dot" + i), k2)
                                //add textbox
                                d3.select('.canvas').call(textbox, d, i);
                            })
                            .on("mouseout", function(d, i){
                                utils.unhoverCir(d3.select(this), k1)
                                utils.unhoverCir(d3.select(".canvas2").select("#dot" + i), k2)
                                //remove textbox
                                d3.select("#r" + i).remove();
                                d3.select("#t1" + i).remove();
                                d3.select("#t2" + i).remove();
                                d3.select("#t3" + i).remove();
                            })

                            const gGrid1 = d3.select('.canvas1').select("g");
                            const zx = d3.event.transform.rescaleX(x2).interpolate(d3.interpolateRound);
                            const zy = d3.event.transform.rescaleY(y2).interpolate(d3.interpolateRound);
                            gGrid1.call(grid, zx, zy);

                    })

    var zoom2 = d3.zoom()
                    .scaleExtent([0.5, 100])
                    .on("zoom", function () {
                        k2 = d3.event.transform.k;
                        translateVar[0] = d3.event.transform.x;
                        translateVar[1] = d3.event.transform.y;

                        //need to separate this for the highlighted dot
                        d3.select('.canvas2')
                            .selectAll('circle')
                            .attr("transform", d3.zoomTransform(this))

                        d3.select('.canvas2')
                            .select('.pin')
                            .attr("transform", d3.zoomTransform(this))

                        if (d3.select('.canvas2').select('.dot_highlight').size() != 0) {

                            var cx_ = d3.select('.canvas2').select('.dot_highlight').attr("cx");
                            var cy_ = d3.select('.canvas2').select('.dot_highlight').attr("cy");

                            d3.select('.canvas2')
                                .select('.pin')
                                .attr("width", 40/k2)
                                .attr("height", 48/k2)
                                .attr('x', cx_-20/k2)
                                .attr('y', cy_-50/k2)

                        }

                        //for the highlighted dot
                        d3.select('.canvas2')
                            .select('.dot_highlight')
                            .attr('r', 20/k2)
                            .attr("stroke-width", function(d) {
                                if (d3.select(this).attr('accu') == 1) {
                                    return 0.2/k2;
                                }
                                return 6.0/k2;
                            })

                        d3.select('.canvas2')
                            .selectAll('.dot')
                            .attr("transform", d3.zoomTransform(this))
                            .attr("r", 7/k2)
                            .attr("stroke-width", function(d, i) {
                                if (d.pred != d.target) {
                                    return 2/k2;
                                }
                                return 0.1/k2;
                            })
                            .on("mouseover", function(d, i) {
                                utils.hoverCir(d3.select(this), k2)
                                utils.hoverCir(d3.select(".canvas1").select("#dot" + i), k1)
                                //add textbox
                                d3.select('.canvas').call(textbox, d, i);
                            })
                            .on("mouseout", function(d, i){
                                utils.unhoverCir(d3.select(this), k2)
                                utils.unhoverCir(d3.select(".canvas1").select("#dot" + i), k1)
                                //remove textbox
                                d3.select("#r" + i).remove();
                                d3.select("#t1" + i).remove();
                                d3.select("#t2" + i).remove();
                                d3.select("#t3" + i).remove();
                            })

                            const gGrid2 = d3.select('.canvas2').select("g");
                            const zx = d3.event.transform.rescaleX(x2).interpolate(d3.interpolateRound);
                            const zy = d3.event.transform.rescaleY(y2).interpolate(d3.interpolateRound);
                            gGrid2.call(grid, zx, zy);

                    })

    d3.csv('/data/vgg16/000/data.csv', function(d, i) {

    	d.x = +d.xposp
    	d.y = +d.yposp
    	d.pred = +d.pred
    	d.target = +d.target
      d.idx = i

      confid_utils.readConfidenceLevels(d, i, "VGG16")
      img_utils.recordPredictions("vgg16","000",i,d.pred);

    	return d;

    }).then(function(data) {

        confid_utils.initializeConfidenceLevels(data,"VGG16")

        gGrid1.call(grid, x2, y2);

        d3.select('.canvas1')
            .selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
                .attr('class', 'dot')
                .attr("idx", function (d) { return d.idx; })
                .attr("id", function (d) { return "dot" +  d.idx; })
                .attr('cx', function() {
                    return getRndInteger(20, 480);
                })
                .attr('cy', function() {
                    return getRndInteger(20, 480);
                })
                .attr('r', 7/k1)
                .style("fill", function(d) {
                    return map_[d.target];
                })
                .attr("stroke", function(d) {
                    if (d.pred != d.target) {
                        return map_[d.pred];
                    }
                    return '#111010';
                })
                .attr("stroke-width", function(d) {
                    if (d.pred != d.target) {
                        return 2.0;
                    }
                    return 0.1;
                })

            d3.select('.canvas1')
                .selectAll('circle')
                .transition()
                .ease(d3.easeBack)
                .duration(1000)
                .attr('cx', function(d) {
                    return x1(d.x);
                })
                .attr('cy', function(d) {
                    return y1(d.y);
                })

            d3.select('.canvas1')
                .selectAll('circle')
                .on("mouseover", function(d, i) {
                    utils.hoverCir(d3.select(this), k1)
                    utils.hoverCir(d3.select(".canvas2").select("#dot" + i), k2)

                    //add textbox
                    d3.select('.canvas').call(textbox, d, i);

                })
                .on("mouseout", function(d, i){
                    utils.unhoverCir(d3.select(this), k1)
                    utils.unhoverCir(d3.select(".canvas2").select("#dot" + i), k2)
                    d3.select("#r" + i).remove();
                    d3.select("#t1" + i).remove();
                    d3.select("#t2" + i).remove();
                    d3.select("#t3" + i).remove();
                })
                .on("click", function(d, i) {

                    confid_utils.updateConfidenceLevels(d,"VGG16");
                    img_utils.instanceClicked(i, "vgg16", perturb_);

                    d3.select('.canvas2')
                        .select(".dot_highlight")
                        .transition()
                        .duration(200)
                        .attr("r", 0.1/k2)
                        .attr("stroke-width", 0.1/k2)
                        .on('end', function(){
                            d3.select('.canvas2').select(".dot_highlight").remove();
                        })

                    var x = -x1(d.x) + 250/k1;
                    var y = -y1(d.y) + 250/k1;
                    d3.select('.canvas1')
                        .transition()
                        .duration(600)
                        .ease(d3.easeBack)
                        .call(
                            zoom1.transform,
                            d3.zoomIdentity.translate(0, 0).scale(k1).translate(x, y)
                        );

                    //obtain the properties of the circle we're trying to replicate
                    var cx_ = d3.select(this).attr("cx")
                    var cy_ = d3.select(this).attr("cy")
                    var fill_ = d3.select(this).style('fill')
                    var stroke_ = d3.select(this).attr("stroke")
                    var idx_ = d3.select(this).attr("idx")

                    d3.select('.canvas1').select(".dot_highlight").remove();
                    d3.select('.pin').remove();

                    d3.select('.canvas1')
                        .append('circle')
                        .attr('class', 'dot_highlight')
                        .attr('r', 15/k1)
                        .attr('cx', cx_)
                        .attr('cy', cy_)
                        .style('fill', fill_)
                        .attr('stroke', stroke_)
                        .attr('accu', function(d) {
                            //check the stroke color to see if the instance is predicted accurately
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                return 1;
                            }
                            return 0;
                        })
                        .attr("stroke-width", function(d) {
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                return 0.2/k1;
                            }
                            return 6.0/k1;
                        })

                    d3.select('.canvas1').select('.dot_highlight').call(expandCir, data[idx_], idx_, 1)

                    d3.select('.canvas1')
                        .append('svg:image')
                        .attr("class", "pin")
                        .attr("xlink:href", function() {
                            const imagePath = require("./assets/media/pin.gif");
                            return imagePath;
                        })
                        .attr("width", 40/k1)
                        .attr("height", 48/k1)
                        .attr('x', cx_-20/k1)
                        .attr('y', cy_-50/k1)
                })

                d3.select('.canvas1')
                    .call(zoom1)

    })

    //VGG19
    d3.csv('/data/vgg19/000/data.csv', function(d, i) {

      d.x = +d.xposp
    	d.y = +d.yposp
    	d.pred = +d.pred
    	d.target = +d.target
      d.idx = i

      confid_utils.readConfidenceLevels(d, i, "VGG19");
      img_utils.recordPredictions("vgg19","000",i,d.pred);

    	return d;

    }).then(function(data) {

        confid_utils.initializeConfidenceLevels(data, "VGG19");

        gGrid2.call(grid, x2, y2);

        d3.select('.canvas2')
            .selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
                .attr('class', 'dot')
                .attr("idx", function (d) { return d.idx; })
                .attr("id", function (d) { return "dot" +  d.idx; })
                .attr('cx', function() {
                    return getRndInteger(20, 480);
                })
                .attr('cy', function() {
                    return getRndInteger(20, 480);
                })
                .attr('r', 7/k2)
                .style("fill", function(d) {
                    return map_[d.target];
                })
                .attr("stroke", function(d) {
                    if (d.pred != d.target) {
                        return map_[d.pred];
                    }
                    return '#111010';
                })
                .attr("stroke-width", function(d) {
                    if (d.pred != d.target) {
                        return 2.0;
                    }
                    return 0.1;
                })

        d3.select('.canvas2')
            .selectAll('circle')
            .transition()
            .ease(d3.easeBack)
            .duration(1000)
            .attr('cx', function(d) {
                return x1(d.x);
            })
            .attr('cy', function(d) {
                return y1(d.y);
            })

        d3.select('.canvas2')
            .selectAll('circle')
            .on("mouseover", function(d, i) {
                d3.selectAll("#dot" + i + ".dot")
                utils.hoverCir(d3.select(this), k2)
                utils.hoverCir(d3.select(".canvas1").select("#dot" + i), k1)

                //add textbox
                d3.select('.canvas').call(textbox, d, i);

            })
            .on("mouseout", function(d, i){
                utils.unhoverCir(d3.select(this), k2)
                utils.unhoverCir(d3.select(".canvas1").select("#dot" + i), k1)
                d3.select("#r" + i).remove();
                d3.select("#t1" + i).remove();
                d3.select("#t2" + i).remove();
                d3.select("#t3" + i).remove();
            })
            .on("click", function(d, i) {

                confid_utils.updateConfidenceLevels(d,"VGG19");
                img_utils.instanceClicked(i, "vgg19", perturb_);

                d3.select('.canvas1')
                    .select(".dot_highlight")
                    .transition()
                    .duration(200)
                    .attr("r", 0.1/k1)
                    .attr("stroke-width", 0.1/k1)
                    .on('end', function(){
                        d3.select('.canvas1').select(".dot_highlight").remove();
                    })

                var x = -x1(d.x) + 250/k2;
                var y = -y1(d.y) + 250/k2;
                d3.select('.canvas2')
                    .transition()
                    .duration(600)
                    .ease(d3.easeBack)
                    .call(
                        zoom2.transform,
                        d3.zoomIdentity.translate(0, 0).scale(k2).translate(x, y)
                    );

                    //obtain the properties of the circle we're trying to replicate
                    var cx_ = d3.select(this).attr("cx")
                    var cy_ = d3.select(this).attr("cy")
                    var fill_ = d3.select(this).style('fill')
                    var stroke_ = d3.select(this).attr("stroke")
                    var idx_ = d3.select(this).attr("idx")

                    d3.select('.canvas2').select(".dot_highlight").remove();
                    d3.select('.pin').remove();

                    d3.select('.canvas2')
                        .append('circle')
                        .attr('class', 'dot_highlight')
                        .attr('r', 15/k2)
                        .attr('cx', cx_)
                        .attr('cy', cy_)
                        .style('fill', fill_)
                        .attr('stroke', stroke_)
                        .attr('accu', function(d) {
                            //check the stroke color to see if the instance is predicted accurately
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                return 1;
                            }
                            return 0;
                        })
                        .attr("stroke-width", function(d) {
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                return 0.2/k2;
                            }
                            return 6.0/k2;
                        })

                    d3.select('.canvas2').select('.dot_highlight').call(expandCir, data[idx_], idx_, 2)

                    d3.select('.canvas2')
                        .append('svg:image')
                        .attr("class", "pin")
                        .attr("xlink:href", function() {
                            const imagePath = require("./assets/media/pin.gif");
                            return imagePath;
                        })
                        .attr("width", 40/k2)
                        .attr("height", 48/k2)
                        .attr('x', cx_-20/k2)
                        .attr('y', cy_-50/k2)
            })

            d3.select('.canvas2')
                .call(zoom2)


    })

    //reset button 1
    d3.select("#reset1").on("click", function() {

        d3.select('.canvas1')
            .transition()
            .duration(750)
            .call(zoom1.transform, d3.zoomIdentity);

    })

    //reset button 2
    d3.select("#reset2").on("click", function() {

        d3.select('.canvas2')
            .transition()
            .duration(750)
            .call(zoom2.transform, d3.zoomIdentity);

    })

    //zoom in button1
    d3.select("#zoom_in1").on("click", function() {
        zoom1.scaleBy(d3.select('.canvas1').transition().duration(300), 2.0);
    })

    //zoom out button1
    d3.select("#zoom_out1").on("click", function() {
        zoom1.scaleBy(d3.select('.canvas1').transition().duration(300), 0.5);
    })

    //zoom in button2
    d3.select("#zoom_in2").on("click", function() {
        zoom2.scaleBy(d3.select('.canvas2').transition().duration(300), 2.0);
    })

    //zoom out button2
    d3.select("#zoom_out2").on("click", function() {
        zoom2.scaleBy(d3.select('.canvas2').transition().duration(300), 0.5);
    })

    //help button 1
    d3.select("#help1").on("mouseover", function() {
   		//add textbox
   		//added an additional transparent svg to prevent textbox getting cut off
   		d3.select('.canvas').call(helptextbox, "help1");
   	})
   	.on("mouseout", function(){
   		//remove textbox
   		d3.select("#rhelp1").remove();
   		d3.select("#t1help1").remove();
   		d3.select("#t2help1").remove();
   		d3.select("#t3help1").remove();
   	})

       //help button 2
       d3.select("#help2").on("mouseover", function() {
   		//add textbox
   		//added an additional transparent svg to prevent textbox getting cut off
   		d3.select('.canvas').call(helptextbox, "help2");
   	})
   	.on("mouseout", function(){
   		//remove textbox
   		d3.select("#rhelp2").remove();
   		d3.select("#t1help2").remove();
   		d3.select("#t2help2").remove();
   		d3.select("#t3help2").remove();
   	})

    d3.select("#trans1").on("click", function() {
        d3.select('#image1').style("cursor","default")
        d3.select('#image2').style("cursor","default")
        d3.select('#image3').style("cursor","default")

        confid_utils.hideConfidenceLevels();
        img_utils.resetInstances();

        d3.select('.pin').remove()

        d3.select('.canvas1')
            .select(".dot_highlight")
            .transition()
            .duration(200)
            .attr("r", 0.1/k1)
            .attr("stroke-width", 0.1/k1)
            .on('end', function(){
                d3.select('.canvas1').select(".dot_highlight").remove();
            })

        d3.select('.canvas2')
            .select(".dot_highlight")
            .transition()
            .duration(200)
            .attr("r", 0.1/k1)
            .attr("stroke-width", 0.1/k1)
            .on('end', function(){
                d3.select('.canvas2').select(".dot_highlight").remove();
            })

        var slider = document.getElementById('slider1');

        var perturb_filename = "00" + slider.value;
        perturb_ = perturb_filename;
        confid_utils.perturbationUpdate(slider.value.toString());

        /**
         * change bar chart
         */
        updateChart(chartVGG16, VGG16Info[perturb_filename]);
        updateChart(chartVGG19, VGG19Info[perturb_filename]);

        var filename1 = '/data/vgg16/' + perturb_filename + '/data.csv'
        var filename2 = '/data/vgg19/' + perturb_filename + '/data.csv'

        d3.csv(filename1, function(d, i) {

        	d.x = +d.xposp
        	d.y = +d.yposp
        	d.pred = +d.pred
        	d.target = +d.target
          d.idx = i
          img_utils.recordPredictions("vgg16",perturb_filename,i,d.pred);

        	return d;

        }).then(function(data) {

            d3.select('.canvas1')
                .selectAll('.dot')
                .data(data)
                .enter()

            //animation transition
            d3.select('.canvas1')
              .selectAll('.dot')
              .transition()
              .ease(d3.easeSin)
              .duration(600)
                .attr('cx', function(d, i) {
                   return x1(d.x);
                })
                .attr('cy', function(d, i) {
                   return y1(d.y);
                })
                .attr("stroke", function(d, i) {
                    if (d.pred != d.target) {
                       return map_[d.pred];
                    }
                    return '#111010';
                })
                .attr("stroke-width", function(d, i) {
                    if (d.pred != d.target) {
                        return 2/k1;
                    }
                    return 0.1/k1;
                })

            //mouseover event needs to be separated from transition animation
            d3.select('.canvas1')
              .selectAll('.dot')
                .on("mouseover", function(d, i) {
                    utils.hoverCir(d3.select(this), k1)
                    utils.hoverCir(d3.select(".canvas2").select("#dot" + i), k2)
                    //add textbox
                    //added an additional transparent svg to prevent textbox getting cut off
                    d3.select('.canvas').call(textbox, d, i);
                })
                .on("mouseout", function(d, i){
                    utils.unhoverCir(d3.select(this), k1)
                    utils.unhoverCir(d3.select(".canvas2").select("#dot" + i), k2)
                    //remove textbox
                    d3.select("#r" + i).remove();
                    d3.select("#t1" + i).remove();
                    d3.select("#t2" + i).remove();
                    d3.select("#t3" + i).remove();
                })
                .on("click", function(d, i) {

                    confid_utils.updateConfidenceLevels(d,"VGG16");
                    img_utils.instanceClicked(i, "vgg16", perturb_);

                    d3.select('.canvas2')
                        .select(".dot_highlight")
                        .transition()
                        .duration(200)
                        .attr("r", 0.1/k2)
                        .attr("stroke-width", 0.1/k2)
                        .on('end', function(){
                            d3.select('.canvas2').select(".dot_highlight").remove();
                        })
                    var x = -x1(d.x) + 250/k1;
                    var y = -y1(d.y) + 250/k1;
                    d3.select('.canvas1')
                        .transition()
                        .duration(600)
                        .ease(d3.easeBack)
                        .call(
                            zoom1.transform,
                            d3.zoomIdentity.translate(0, 0).scale(k1).translate(x, y)
                        );
                    //obtain the properties of the circle we're trying to replicate
                    var cx_ = d3.select(this).attr("cx")
                    var cy_ = d3.select(this).attr("cy")
                    var fill_ = d3.select(this).style('fill')
                    var stroke_ = d3.select(this).attr("stroke")
                    var idx_ = d3.select(this).attr("idx")
                    d3.select('.canvas1').select(".dot_highlight").remove();
                    d3.select('.pin').remove();
                    d3.select('.canvas1')
                        .append('circle')
                        .attr('class', 'dot_highlight')
                        .attr('r', 15/k1)
                        .attr('cx', cx_)
                        .attr('cy', cy_)
                        .style('fill', fill_)
                        .attr('stroke', stroke_)
                        .attr('accu', function(d) {
                            //check the stroke color to see if the instance is predicted accurately
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                return 1;
                            }
                            return 0;
                        })
                        .attr("stroke-width", function(d) {
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                return 0.2/k1;
                            }
                            return 6.0/k1;
                        })
                    d3.select('.canvas1').select('.dot_highlight').call(expandCir, data[idx_], idx_, 1)
                    d3.select('.canvas1')
                        .append('svg:image')
                        .attr("class", "pin")
                        .attr("xlink:href", function() {
                            const imagePath = require("./assets/media/pin.gif");
                            return imagePath;
                        })
                        .attr("width", 40/k1)
                        .attr("height", 48/k1)
                        .attr('x', cx_-20/k1)
                        .attr('y', cy_-50/k1)
                })

            d3.select('.canvas1')
                .call(zoom1)

        })

        d3.csv(filename2, function(d, i) {

          d.x = +d.xposp
          d.y = +d.yposp
          d.pred = +d.pred
          d.target = +d.target
          d.idx = i
          img_utils.recordPredictions("vgg19",perturb_filename,i,d.pred);

          return d;

        }).then(function(data) {

            d3.select('.canvas2')
                .selectAll('.dot')
                .data(data)
                .enter()

            //animation transition
            d3.select('.canvas2')
              .selectAll('.dot')
              .transition()
              .ease(d3.easeSin)
              .duration(600)
                .attr('cx', function(d, i) {
                   return x1(d.x);
                })
                .attr('cy', function(d, i) {
                   return y1(d.y);
                })
                .attr("stroke", function(d, i) {
                    if (d.pred != d.target) {
                       return map_[d.pred];
                    }
                    return '#111010';
                })
                .attr("stroke-width", function(d, i) {
                    if (d.pred != d.target) {
                        return 2/k2;
                    }
                    return 0.1/k2;
                })

            //mouseover event needs to be separated from transition animation
            d3.select('.canvas2')
              .selectAll('.dot')
                .on("mouseover", function(d, i) {
                    utils.hoverCir(d3.select(this), k2)
                    utils.hoverCir(d3.select(".canvas1").select("#dot" + i), k1)
                    //add textbox
                    //added an additional transparent svg to prevent textbox getting cut off
                    d3.select('.canvas').call(textbox, d, i);
                })
                .on("mouseout", function(d, i){
                    utils.unhoverCir(d3.select(this), k2)
                    utils.unhoverCir(d3.select(".canvas1").select("#dot" + i), k1)
                    //remove textbox
                    d3.select("#r" + i).remove();
                    d3.select("#t1" + i).remove();
                    d3.select("#t2" + i).remove();
                    d3.select("#t3" + i).remove();
                })
                .on("click", function(d, i) {

                    confid_utils.updateConfidenceLevels(d,"VGG19");
                    img_utils.instanceClicked(i, "vgg19", perturb_);

                    d3.select('.canvas1')
                        .select(".dot_highlight")
                        .transition()
                        .duration(200)
                        .attr("r", 0.1/k1)
                        .attr("stroke-width", 0.1/k1)
                        .on('end', function(){
                            d3.select('.canvas1').select(".dot_highlight").remove();
                        })
                    var x = -x1(d.x) + 250/k2;
                    var y = -y1(d.y) + 250/k2;
                    d3.select('.canvas2')
                        .transition()
                        .duration(600)
                        .ease(d3.easeBack)
                        .call(
                            zoom2.transform,
                            d3.zoomIdentity.translate(0, 0).scale(k2).translate(x, y)
                        );
                        //obtain the properties of the circle we're trying to replicate
                        var cx_ = d3.select(this).attr("cx")
                        var cy_ = d3.select(this).attr("cy")
                        var fill_ = d3.select(this).style('fill')
                        var stroke_ = d3.select(this).attr("stroke")
                        var idx_ = d3.select(this).attr("idx")
                        d3.select('.canvas2').select(".dot_highlight").remove();
                        d3.select('.pin').remove();
                        d3.select('.canvas2')
                            .append('circle')
                            .attr('class', 'dot_highlight')
                            .attr('r', 15/k2)
                            .attr('cx', cx_)
                            .attr('cy', cy_)
                            .style('fill', fill_)
                            .attr('stroke', stroke_)
                            .attr('accu', function(d) {
                                //check the stroke color to see if the instance is predicted accurately
                                if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                    return 1;
                                }
                                return 0;
                            })
                            .attr("stroke-width", function(d) {
                                if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                    return 0.2/k2;
                                }
                                return 6.0/k2;
                            })
                        d3.select('.canvas2').select('.dot_highlight').call(expandCir, data[idx_], idx_, 2)
                        d3.select('.canvas2')
                            .append('svg:image')
                            .attr("class", "pin")
                            .attr("xlink:href", function() {
                                const imagePath = require("./assets/media/pin.gif");
                                return imagePath;
                            })
                            .attr("width", 40/k2)
                            .attr("height", 48/k2)
                            .attr('x', cx_-20/k2)
                            .attr('y', cy_-50/k2)
                })

            d3.select('.canvas2')
                .call(zoom2)

        })

    })

    d3.select(".welcome_enter").on("click", function() {
        d3.select(".welcome_enter").style("cursor","default");
        document.getElementsByClassName('welcome_enter')[0].disabled = true;
        utils.welcomeDisappear();
    })

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    var expandCir = function expandCircle(g, d, i, k_) {

        if (k_ == 1) {
            var k = k1;
        }
        else {
            var k = k2;
        }

        g.transition()
            .duration(200)
            .attr('r', 20/k)
            .on('end', function(){

                var stroke_ = d3.select(this).attr("stroke")

                //add mouseover enlargement to highlighted circle
                g.on("mouseover", function() {

                    if (k_ == 1) {
                        k = k1;
                        utils.hoverCir(d3.select(".canvas2").select("#dot" + i), k2)
                    }
                    else {
                        k = k2;
                        utils.hoverCir(d3.select(".canvas1").select("#dot" + i), k1)
                    }

                    d3.select(this)
                        .transition("mouseTrans")
                        .duration(60)
                        .attr("r", 25/k)
                        .attr("stroke-width", function() {
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)") {
                                return 0.3/k;
                            }
                            return 7.0/k;
                        })
                    //add textbox
                    //added an additional transparent svg to prevent textbox getting cut off
                    d3.select('.canvas').call(textbox, d, i);
                })
                .on("mouseout", function(){

                    if (k_ == 1) {
                        k = k1;
                        utils.unhoverCir(d3.select(".canvas2").select("#dot" + i), k2)
                    }
                    else {
                        k = k2;
                        utils.unhoverCir(d3.select(".canvas1").select("#dot" + i), k1)
                    }

                    d3.select(this)
                        .transition("mouseTrans")
                        .duration(60)
                        .attr("r", 20/k)
                        .attr("stroke-width", function() {
                            if (stroke_ == '#111010' || stroke_ == "rgb(17, 16, 16)"){
                                return 0.2/k;
                            }
                            return 6.0/k;
                        })
                    //remove textbox
                    d3.select("#r" + i).remove();
                    d3.select("#t1" + i).remove();
                    d3.select("#t2" + i).remove();
                    d3.select("#t3" + i).remove();
                })
            })
    }

    var helptextbox = function(g, i) {

        //add textbox
        g.append("rect")
            .attr("id", "r" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] - 200;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 85;
            })
            .attr("height", 70)
            .attr("width", 210)
            .attr("fill", "#fef7f3")
            .attr("stroke", "#a5a4a3")

        g.append('text')
            .attr("id", "t1" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] - 195;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 45 - 20;
            })
            .text("Mouse wheel to zoom")
            .style("font-size", "15px")
            .attr("font-family", "Courier");

        g.append('text')
            .attr("id", "t2" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] - 195;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 45;
            })
            .text("Drag to move around")
            .style("font-size", "15px")
            .attr("font-family", "Courier");

        g.append('text')
            .attr("id", "t3" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] - 195;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 45 + 20;
            })
            .text("Click dot to see more")
            .style("font-size", "15px")
            .attr("font-family", "Courier");
    }

    var textbox = function(g, d, i) {

        //add textbox
        g.append("rect")
            .attr("id", "r" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] + 10;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 85;
            })
            .attr("height", 70)
            .attr("width", function() {
                if (d.target == 0 || d.pred == 0) {
                    return 150;
                }
                if (d.target == 1 || d.pred == 1) {
                    return 170;
                }
                return 120;
            })
            .attr("fill", "#fef7f3")
            .attr("stroke", "#a5a4a3")

        g.append('text')
            .attr("id", "t1" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] + 15;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 45 - 20;
            })
            .text("Instance #" + String(i))
            .style("font-size", "15px")
            .attr("font-family", "Courier");

        g.append('text')
            .attr("id", "t2" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] + 15;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 45;
            })
            .text("Label: " + label_[d.target])
            .style("font-size", "15px")
            .attr("font-family", "Courier");

        g.append('text')
            .attr("id", "t3" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] + 15;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 45 + 20;
            })
            .text("Pred.: " + label_[d.pred])
            .style("font-size", "15px")
            .attr("font-family", "Courier");
    }


    var grid = (g, x, y) => g
        .attr("stroke", "#7f609e")
        .attr("stroke-opacity", 0.3)
        .call(g => g
            .selectAll(".x")
            .data(x.ticks(15))
            .join(
                enter => enter.append("line").attr("class", "x").attr("y2", 500),
                update => update,
                exit => exit.remove()
            )
            .attr("x1", d => 0.5 + x(d))
            .attr("x2", d => 0.5 + x(d)))
        .call(g => g
            .selectAll(".y")
            .data(y.ticks(15))
            .join(
                enter => enter.append("line").attr("class", "y").attr("x2", 500),
                update => update,
                exit => exit.remove()
            )
            .attr("y1", d => 0.5 + y(d))
            .attr("y2", d => 0.5 + y(d)));

})
