import * as img_utils from './img_utils.js';

var d3 = require('d3')

const label_ = ['Airplane', 'Automobile', 'Bird', 'Cat', 'Deer', 'Dog', 'Frog', 'Horse', 'Ship', 'Truck']
var selectedInstance = -1;
var selectedPerturbation = 0; // is either 0, 1, 2, or 3
var clickedModel = [];
var barchartSVG;

// Start of confidence level bartchart variables and functions
const confidenceLevelMargins = {top: 100, right: 130, bottom: 40, left: 62};
const confidenceLevelWidth = 510 - confidenceLevelMargins.left - confidenceLevelMargins.right;
const confidenceLevelHeight = 820 - confidenceLevelMargins.top - confidenceLevelMargins.bottom;
const categoryTop = "BeforeAttack"
const categoryBottom = "AfterAttack"
const confidenceLevelColours = ["#7F609E", "#FFA500"]
const confidTextColours = ["#7F609E", "#F39E00"]
const confidenceLevelCategories = [categoryTop, categoryBottom]
const yScale = d3.scaleBand().rangeRound([0, confidenceLevelHeight], .5);
const xScale = d3.scaleLinear().rangeRound([0, confidenceLevelWidth]);
const textOffsetX = 6;
const textOffsetY = 14;
const darkerLevel = 1.1;

var baseConfidenceLevels = {"mVGG16":{},"mVGG19":{}}

export function perturbationUpdate(val){
  selectedPerturbation = val;
}

export function showConfidenceLevels(){
  d3.select("#confidence_level_barchart").selectAll('.axis,.attackLegend,.modelLegend,.axisText,.barDiff,.barText').style("visibility","visible");
  d3.select("#confidence_level_barchart").select('#confidenceLevelMessage').style("visibility","hidden");
}

export function hideConfidenceLevels(){
  d3.select("#confidence_level_barchart")
    .selectAll('.bars,.barText,.barDiff')
    .style("visibility","hidden");

  //d3.select("#confidence_level_barchart")
  //.selectAll('.barSpace,.bars,.barText,.axis,.attackLegend,.modelLegend,.axisText,.barDiff')
  //.style("visibility","hidden");

  var modelLegend = barchartSVG.selectAll(".modelLegend")

  modelLegend.selectAll("#confid_text1")
    .text(function(d) { return "Model: [Unknown]" });

  modelLegend.selectAll("#confid_text2")
    .text(function(d) { return "Perturbation Level: [Unknown]"});

  if (d3.select("#confidence_level_barchart").select('#confidenceLevelMessage').style("visibility") != "visible"){
    img_utils.typewriter("#confidenceLevelMessage", "Please click on an instance in the scatterplots ☺", d3.easeQuad, 2400);
  }

  d3.select("#confidence_level_barchart").select('#confidenceLevelMessage').style("visibility","visible");
}

export function mouseOverBarText(d){
    d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+d.classValue).filter("."+categoryTop).style("fill", d3.rgb(confidenceLevelColours[confidenceLevelCategories.indexOf(categoryTop)]).darker(darkerLevel));
    d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+d.classValue).filter("."+categoryBottom).style("fill", d3.rgb(confidenceLevelColours[confidenceLevelCategories.indexOf(categoryBottom)]).darker(darkerLevel));
    d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+d.classValue).filter("."+categoryTop).style("opacity", "0")
    d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+d.classValue).filter("."+categoryBottom).style("opacity", "0")
    d3.select("#confidence_level_barchart").selectAll(".barDiff").filter("."+d.classValue).filter("."+categoryBottom).style("opacity", "1")
}

export function mouseOutBarText(d){
  d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+d.classValue).filter("."+categoryTop).style("fill", confidenceLevelColours[confidenceLevelCategories.indexOf(categoryTop)]);
  d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+d.classValue).filter("."+categoryBottom).style("fill", confidenceLevelColours[confidenceLevelCategories.indexOf(categoryBottom)]);
  d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+d.classValue).filter("."+categoryTop).style("opacity", "1")
  d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+d.classValue).filter("."+categoryBottom).style("opacity", "1")
  d3.select("#confidence_level_barchart").selectAll(".barDiff").filter("."+d.classValue).filter("."+categoryBottom).style("opacity", "0")
}

export function readConfidenceLevels(d, i, modelName){

  for(var c=0;c<10;c++){

    if(selectedPerturbation=="0"){
      if(!("i"+i.toString() in baseConfidenceLevels["m"+modelName])){
        baseConfidenceLevels["m"+modelName]["i"+i.toString()] = {}
      }
      baseConfidenceLevels["m"+modelName]["i"+i.toString()][label_[c]] = parseFloat(d[c])*100
    }
  }

}

export function initializeConfidenceLevels(data,modelName){

  img_utils.typewriter("#confidenceLevelMessage", "Please click on an instance in the scatterplots ☺", d3.easeQuad, 2400);

  if(modelName=="VGG19"){
    return
  }

  const classKeys = [0,1,2,3,4,5,6,7,8,9];

  var yAxis = d3.axisLeft().scale(yScale)
                              .tickValues(classKeys)
                              .tickFormat(function(d,i){ return label_[d] });

  var xAxis = d3.axisBottom().scale(xScale);

  barchartSVG = d3.select('#confidence_level_barchart').select("svg")
              .select("g")
              .attr("transform", "translate(" + confidenceLevelMargins.left + "," + confidenceLevelMargins.top + ")");

  barchartSVG.append("text")
        .style("text-anchor", "left")
        .attr("id","xAxisText")
        .attr("class","axisText")
        .text("Classes")
        .style('font-size','12px')
        .attr("transform", "translate(-30,710) rotate(-90)")

  barchartSVG.append("text")
        .style("text-anchor", "left")
        .attr("id","yAxisText")
        .attr("class","axisText")
        .text("Confidence Levels (%)")
        .style('font-size','12px')
        .attr("transform", "translate(-24,720)")

  yScale.domain(classKeys);
  xScale.domain([0, 100]);

  barchartSVG.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  barchartSVG.append("g")
    .attr("class", "x axis")
    .attr("transform",function(d) { return "translate(0,"+confidenceLevelHeight+")"; })
    .call(xAxis)

    // barchart attackLegend
    var attackLegend = barchartSVG.selectAll(".attackLegend")
                          .data(confidenceLevelCategories)
                          .enter().append("g")
                          .attr("class", "attackLegend")
                          .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
                          .style("visibility","visible");

    var attackLegendX = 80
    var attackLegendY = 50

    attackLegend.append("rect")
        .attr("x", confidenceLevelWidth + confidenceLevelMargins.right - (attackLegendX-6))
        .attr("y", - attackLegendY)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return confidenceLevelColours[confidenceLevelCategories.indexOf(d)]; });


    attackLegend.append("text")
        .attr("x", confidenceLevelWidth + confidenceLevelMargins.right - attackLegendX)
        .attr("y", - (attackLegendY-9))
        .attr("dy", ".35em")
        .attr("font-size","12px")
        .style("text-anchor", "end")
        .text(function(d) { if(d=="BeforeAttack"){return "before attack"}else if(d=="AfterAttack"){return "after attack"} return d; });

// ---------------drawing bars/texts-------------
      const pseudoData = []
      for(var c=0;c<=9;c++){
        pseudoData.push({classNum:c,classValue:label_[c],categoryName:"BeforeAttack",confidenceValue:0})
        pseudoData.push({classNum:c,classValue:label_[c],categoryName:"AfterAttack",confidenceValue:0})
      }

      barchartSVG.selectAll(".barSpace")
                            .data(pseudoData)
                            .enter().append("g")
                            .attr("class", function(d){ return "g"+d.classValue+d.categoryName})
                            .attr("transform",function(d) { return "translate(0,"+yScale(d.classNum)+")"; })

      barchartSVG.selectAll(".barText")
        .data(pseudoData)
        .enter().append("text")
          .attr('text-anchor', 'left')
          .attr("class",function(d) {return "barText "+d.classValue+" "+d.categoryName;})
          .attr("x", "0")
          .attr("transform",function(d) { if(d.categoryName=="BeforeAttack"){  return "translate(0,"+(textOffsetY+yScale.bandwidth()/4+yScale(d.classNum))+")";}else{  return "translate(0,"+(textOffsetY+yScale.bandwidth()/4*2+yScale(d.classNum))+")"} })
          .style("fill", function(d){return d3.rgb(confidTextColours[confidenceLevelCategories.indexOf(d.categoryName)])})
          .style("opacity","0")
          .style("font", "10px")
          .text("")
          .on("mouseover", function(d){mouseOverBarText(d)})
          .on("mouseout", function(d){mouseOutBarText(d)})

      barchartSVG.selectAll(".barDiff")
        .data(pseudoData)
        .enter().append("text")
          .attr('text-anchor', 'left')
          .attr("class",function(d) { return "barDiff "+d.classValue+" "+d.categoryName;})
          .attr("x", "0")
          .attr("transform",function(d) { if(d.categoryName=="BeforeAttack"){  return "";}else{  return "translate(0,"+(textOffsetY+yScale.bandwidth()/4*1.5+yScale(d.classNum))+")"} })
          .style("fill", "black")
          .style("opacity","0")
          .style("font", "10px")
          .text("")
          .on("mouseover", function(d){mouseOverBarText(d)})
          .on("mouseout", function(d){mouseOutBarText(d)})

      barchartSVG.selectAll(".rect")
        .data(pseudoData)
        .enter().append("rect")
          .attr("height", yScale.bandwidth()/4)
          .style("fill", function(d) { return confidenceLevelColours[confidenceLevelCategories.indexOf(d.categoryName)] })
          .attr("x", "0")
          .attr("transform",function(d) { if(d.categoryName=="BeforeAttack"){  return "translate(0,"+(yScale.bandwidth()/4+yScale(d.classNum))+")";}else{  return "translate(0,"+(yScale.bandwidth()/4*2+yScale(d.classNum))+")"} })
          .attr("width", "0")
          .attr("class", function(d){ return "bars "+d.classValue+" "+d.categoryName; })
          .on("mouseover", function(d){mouseOverBarText(d)})
          .on("mouseout", function(d){mouseOutBarText(d)})


    hideConfidenceLevels();
}

export function updateConfidenceLevels(d,model){

  selectedInstance = d.idx;
  d3.select("#confidence_level_barchart").selectAll(".bars").style("visibility","hidden");

  d3.select("#confidence_level_barchart").selectAll(".barText").style("opacity","0");
  d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+categoryTop).attr("x","0")
  d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+categoryBottom).attr("x","0")

  d3.select("#confidence_level_barchart").selectAll(".barDiff").style("opacity","0");
  d3.select("#confidence_level_barchart").selectAll(".barDiff").filter("."+categoryBottom).attr("x","0")

  d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+categoryTop).attr("width","0");
  d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+categoryBottom).attr("width","0");
  d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+categoryTop).style("visibility","visible");
  d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+categoryBottom).style("visibility","visible");
  d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+categoryTop).style("opacity","1")
  d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+categoryBottom).style("opacity","1")
  clickedModel = [model]

  const duration = 1000
  const delay = 300

  for(var c=0;c<=9;c++){
    const beforeConfidenceLevel = baseConfidenceLevels["m"+model]["i"+d.idx][label_[c]];
    const afterConfidenceLevel = d[c.toString()]*100;

    d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+categoryTop).filter("."+label_[c])
      .transition()
      .duration(duration)
      .delay(delay)
      .attr("width", function(d){ return xScale(beforeConfidenceLevel); })

    d3.select("#confidence_level_barchart").selectAll(".bars").filter("."+categoryBottom).filter("."+label_[c])
      .transition()
      .duration(duration)
      .delay(delay)
      .attr("width", function(d){ return xScale(afterConfidenceLevel); })

    d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+categoryTop).filter("."+label_[c])
      .text(beforeConfidenceLevel.toFixed(3)+"%")
      .transition()
      .duration(duration)
      .delay(delay)
      .attr("x", function(d) { return xScale(beforeConfidenceLevel)+textOffsetX; } )

    d3.select("#confidence_level_barchart").selectAll(".barText").filter("."+categoryBottom).filter("."+label_[c])
      .text(afterConfidenceLevel.toFixed(3)+"%")
      .transition()
      .duration(duration)
      .delay(delay)
      .attr("x", function(d) { return xScale(afterConfidenceLevel)+textOffsetX; } )

    d3.select("#confidence_level_barchart").selectAll(".barDiff").filter("."+categoryBottom).filter("."+label_[c])
      .text(function(d){var diff = (afterConfidenceLevel.toFixed(3)-beforeConfidenceLevel.toFixed(3)); if(diff>=0){return "+"+diff.toFixed(3)+"%"}else{return diff.toFixed(3)+"%"}})
      .transition()
      .duration(duration)
      .delay(delay)
      .attr("x", function(d) {return xScale(Math.max(beforeConfidenceLevel,afterConfidenceLevel))+textOffsetX; })

  }

  barchartSVG.selectAll(".modelLegend").remove()

  var modelLegend = barchartSVG.selectAll(".modelLegend")
                               .data(clickedModel)
                               .enter().append("g")
                               .attr("class", "modelLegend")
                               .attr("transform", function(d) { return "translate(0," +"-30" + ")"; })
                               .style("visibility","visible");

  var xPositionForLegends = -50;

  modelLegend.append("text")
      .attr("id", "confid_text1")
      .attr("x", xPositionForLegends)
      .attr("y", -12)
      .style("font-size", "14px")
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return "Model: "+d });

  modelLegend.append("text")
      .attr("id", "confid_text2")
      .attr("x", xPositionForLegends)
      .attr("y", 4)
      .style("font-size", "14px")
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return "Perturbation Level: 0.0"+selectedPerturbation });

  showConfidenceLevels();
}
