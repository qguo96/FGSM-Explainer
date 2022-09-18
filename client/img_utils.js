var d3 = require('d3')

var widthText1;
var widthText2;
var widthText1p;
var widthText2p;

const originalText = "ORIGINAL IMAGE";
const adversarialText = "ADVERSARIAL IMAGE";

function getTextWidth(text, font) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font || getComputedStyle(document.body).font;
  return context.measureText(text).width;
}

const originalMiddleOffset = 14;
const adversarialMiddleOffset = -3;
const originalComparisonOffset = -364;
const adversarialComparisonOffset = 390;
const perturbationMiddleOffset = 228;
const animationLength = 1200;

const label_ = ['Airplane', 'Automobile', 'Bird', 'Cat', 'Deer', 'Dog', 'Frog', 'Horse', 'Ship', 'Truck']

var predictions = {"vgg16":{"000":{},"001":{},"002":{},"003":{}}, "vgg19":{"000":{},"001":{},"002":{},"003":{}}};

function updatePredictions(model, perturb, i, mode){
  var capitalizeModel;
  if(model === "vgg16"){
    capitalizeModel = "VGG16";
  }else if(model === "vgg19"){
    capitalizeModel = "VGG19";
  }
  const textOriginal = capitalizeModel+" Prediction: "+label_[predictions[model]["000"][i]]
  const textAdversarial = capitalizeModel+" Prediction: "+label_[predictions[model][perturb][i]];
  if(mode === 0){
    d3.select("#enlarge_text1p").text(textOriginal);
    widthText1p = getTextWidth(textOriginal, getComputedStyle(document.getElementById("enlarge_text1p")).font);
    widthText1 = getTextWidth(originalText, getComputedStyle(document.getElementById("enlarge_text1")).font);


    d3.select("#enlarge_text2p").text(textAdversarial);
    widthText2p = getTextWidth(textAdversarial, getComputedStyle(document.getElementById("enlarge_text2p")).font);
    widthText2 = getTextWidth(adversarialText, getComputedStyle(document.getElementById("enlarge_text2")).font);

  }else if (mode === 1){
    d3.select("#enlarge_text2p").text(textOriginal);
    widthText2p = getTextWidth(textOriginal, getComputedStyle(document.getElementById("enlarge_text2p")).font);
    widthText2 = getTextWidth(originalText, getComputedStyle(document.getElementById("enlarge_text2")).font);

    d3.select("#enlarge_text1p").text(textAdversarial);
    widthText1p = getTextWidth(textAdversarial, getComputedStyle(document.getElementById("enlarge_text1p")).font);
    widthText1 = getTextWidth(adversarialText, getComputedStyle(document.getElementById("enlarge_text1")).font);
  }
}

export function recordPredictions(model, perturb, i, p){
  if(! (i in predictions[model][perturb])){
    predictions[model][perturb][i] = p;
  }
}

export function changeImgSrc(imgid, newsrc) {
    var img = d3.select("img#"+imgid);
    img.attr("src", newsrc);
}

function makeClickable(imgid, orig_img, attack_img, mode, model, pert, i) {

    d3.select("img#"+imgid)
      .style("cursor","pointer")

    d3.select("img#"+imgid)
        .on("click", function() {

          updatePredictions(model,pert,i,mode);

          if (mode === 0){
              var src_image1 = orig_img;
              var src_image2 = attack_img;
              d3.select('#enlarge_text1').text(originalText).style('left', '200px').style('transform','translate('+originalMiddleOffset+'px, 0px)').style("visibility","visible").style('opacity','1');
              d3.select('#enlarge_text1p').style('left', '200px').style('transform','translate('+(originalMiddleOffset+widthText1/2-widthText1p/2)+'px, 0px)').style("visibility","visible").style('opacity','1');
              d3.select('#enlarge_text2').text(adversarialText).style("visibility","hidden").style('opacity','0');
              d3.select('#enlarge_text2p').style("visibility","hidden").style('opacity','0');
              d3.select('#compare').style('visibility', 'visible');
              d3.select('#compare_disabled').style('visibility', 'hidden');
          }
          else if (mode === 1){
              var src_image2 = orig_img;
              var src_image1 = attack_img;
              d3.select('#enlarge_text1').text(adversarialText).style('left', '200px').style('transform','translate('+adversarialMiddleOffset+'px, 0px)').style("visibility","visible").style('opacity','1');
              d3.select('#enlarge_text1p').style('left', '200px').style('transform','translate('+(adversarialMiddleOffset+widthText1/2-widthText1p/2)+'px, 0px)').style("visibility","visible").style('opacity','1');
              d3.select('#enlarge_text2').text(originalText).style("visibility","hidden").style('opacity','0');
              d3.select('#enlarge_text2p').style("visibility","hidden").style('opacity','0');
              d3.select('#compare').style('visibility', 'visible');
              d3.select('#compare_disabled').style('visibility', 'hidden');
          }
          else if (mode === 2){
              var src_image1 = orig_img;
              d3.select('#enlarge_text1').text("PERTURBATION").style('left', perturbationMiddleOffset+'px').style("visibility","visible").style('opacity','1');
              d3.select('#enlarge_text1p').style('left', (perturbationMiddleOffset+widthText1/2-widthText1p/2)+'px').style("visibility","hidden");
              d3.select('#enlarge_text2').style("visibility","hidden");
              d3.select('#enlarge_text2p').style("visibility","hidden");
              d3.select('#compare').style('visibility', 'hidden');
              d3.select('#compare_disabled').style('visibility', 'visible');
          }

            //black background fade in
            d3.select(".welcome_bg")
              .style("visibility","visible")
              .style("pointer-events", "auto")

            d3.select(".welcome_bg")
              .transition()
              .duration(500)
              .ease(d3.easeLinear)
              .style('opacity', 0.50)

            d3.select("#overlay").style('display', 'block');
            d3.select('#enlarged_image1').attr('src', src_image1);
            d3.select('#enlarged_image2').attr('src', src_image2).attr('opacity', 0);

            //image fade in
            var startTranslateState = 'translate(-50%, -50%) scale(0.1)';
            var endTranslateState = 'translate(-50%, -50%) scale(1.0)';
            var translateInterpolator = d3.interpolateString(startTranslateState, endTranslateState);

            d3.select('.full_image')
              .transition()
              .duration(240)
              .ease(d3.easeCubic)
              .style('opacity', '1')
              .styleTween('transform', function (d) {
                return translateInterpolator;
            })

            d3.select('#compare').on("click", function () {
                if (mode != 2){
                    compareTransition(mode);
                }
            });

            d3.select('#cancel_overlay').on("click", function () {
                cancelOverlay();
            });
        });
}

function cancelOverlay(){

    //image fadeout
    d3.select('.full_image')
      .transition()
      .duration(240)
      .ease(d3.easeCubic)
      .style('opacity', '0')
      .on('end', function(){
        d3.select("#overlay").style('display', 'none');
        d3.select('#compare').html('COMPARE');
      })

    //black background fade out
    d3.select(".welcome_bg")
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .style('opacity', 0)
      .on('end', function(){
        resetPos();
        d3.select(".welcome_bg").style("pointer-events", "none").style("visibility","hidden");
      })
}

function compareTransition(mode) {

    d3.select('#compare')
      .html('RESET')
      .on("click", function () {});

    d3.select('#cancel_overlay')
      .on("click", function () {});

    //image movement
    d3.select('#enlarged_image1')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(0%, 0%)', 'translate(-63%, 0%)');
        }
        return d3.interpolateString('translate(0%, 0%)', 'translate(65%, 0%)');
      })
      .on('end', function(){
          d3.select('#compare').on("click", function () {
              compareTransitionReverse(mode);
          });
          d3.select('#cancel_overlay').on("click", function () {
              cancelOverlay();
          });
      })

    d3.select('#rcorners_enlarge1')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(-7%, -9%)', 'translate(-61%, -9%)');
        }
        return d3.interpolateString('translate(-7%, -9%)', 'translate(49%, -9%)');
      })

    //image movement
    d3.select('#enlarged_image2')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '1')
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(0%, 0%)', 'translate(65%, 0%)');
        }
        return d3.interpolateString('translate(0%, 0%)', 'translate(-63%, 0%)');

      })

    d3.select('#rcorners_enlarge2')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '1')
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(-7%, -9%)', 'translate(49%, -9%)');
        }
        return d3.interpolateString('translate(-7%, -9%)', 'translate(-61%, -9%)');
      })

    d3.select('#enlarge_text1')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if (mode === 0){
            return d3.interpolateString('translate('+originalMiddleOffset+'px, 0px)', 'translate('+originalComparisonOffset+'px, 0px)');
        }
        else if (mode === 1){
            return d3.interpolateString('translate('+adversarialMiddleOffset+'px, 0px)', 'translate('+adversarialComparisonOffset+'px, 0px)');
        };
      })

    d3.select('#enlarge_text1p')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if (mode === 0){
            return d3.interpolateString('translate('+(originalMiddleOffset+widthText1/2-widthText1p/2)+'px, 0px)', 'translate('+(originalComparisonOffset+widthText1/2-widthText1p/2)+'px, 0px)');
        }
        else if (mode === 1){
            return d3.interpolateString('translate('+(adversarialMiddleOffset+widthText1/2-widthText1p/2)+'px, 0px)', 'translate('+(adversarialComparisonOffset+widthText1/2-widthText1p/2)+'px, 0px)');
        };
      })

    d3.select('#enlarge_text2')
      .style('visibility','visible')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '1')
      .styleTween('transform', function (d) {
        if (mode === 0){
            return d3.interpolateString('translate('+adversarialMiddleOffset+'px, 0px)', 'translate('+adversarialComparisonOffset+'px, 0px)');
        }
        else if (mode === 1){
          return d3.interpolateString('translate('+originalMiddleOffset+'px, 0px)', 'translate('+originalComparisonOffset+'px, 0px)');
        }
      })

    d3.select('#enlarge_text2p')
      .style('visibility','visible')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '1')
      .styleTween('transform', function (d) {
        if (mode === 0){
            return d3.interpolateString('translate('+(adversarialMiddleOffset+widthText2/2-widthText2p/2)+'px, 0px)', 'translate('+(adversarialComparisonOffset+widthText2/2-widthText2p/2)+'px, 0px)');
        }
        else if (mode === 1){
          return d3.interpolateString('translate('+(originalMiddleOffset+widthText2/2-widthText2p/2)+'px, 0px)', 'translate('+(originalComparisonOffset+widthText2/2-widthText2p/2)+'px, 0px)');
        }
      })

}

function compareTransitionReverse(mode) {

    d3.select('#compare')
      .html('COMPARE')
      .on("click", function () {});

    d3.select('#cancel_overlay')
      .on("click", function () {});

    //image movement
    d3.select('#enlarged_image1')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(-63%, 0%)', 'translate(0%, 0%)');
        }
        return d3.interpolateString('translate(65%, 0%)', 'translate(0%, 0%)');
      })
      .on('end', function(){
          d3.select('#compare').on("click", function () {
              compareTransition(mode);
          });
          d3.select('#cancel_overlay').on("click", function () {
              cancelOverlay();
          });
      })

    d3.select('#rcorners_enlarge1')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(-61%, -9%)', 'translate(-7%, -9%)');
        }
        return d3.interpolateString('translate(49%, -9%)', 'translate(-7%, -9%)');
      })

    //image movement
    d3.select('#enlarged_image2')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '0')
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(65%, 0%)', 'translate(0%, 0%)');
        }
        return d3.interpolateString('translate(-63%, 0%)', 'translate(0%, 0%)');
      })

    d3.select('#rcorners_enlarge2')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '0')
      .styleTween('transform', function (d) {
        if(mode === 0){
          return d3.interpolateString('translate(49%, -9%)', 'translate(-7%, -9%)');
        }
        return d3.interpolateString('translate(-61%, -9%)', 'translate(-7%, -9%)');
      })

    d3.select('#enlarge_text1')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if (mode === 0){
            return d3.interpolateString('translate('+originalComparisonOffset+'px, 0px)', 'translate('+originalMiddleOffset+'px, 0px)');
        }
        else if (mode === 1){
            return d3.interpolateString('translate('+adversarialComparisonOffset+'px, 0px)', 'translate('+adversarialMiddleOffset+'px, 0px)');
        };
      })

    d3.select('#enlarge_text1p')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .styleTween('transform', function (d) {
        if (mode === 0){
            return d3.interpolateString('translate('+(originalComparisonOffset+widthText1/2-widthText1p/2)+'px, 0px)', 'translate('+(originalMiddleOffset+widthText1/2-widthText1p/2)+'px, 0px)');
        }
        else if (mode === 1){
            return d3.interpolateString('translate('+(adversarialComparisonOffset+widthText1/2-widthText1p/2)+'px, 0px)', 'translate('+(adversarialMiddleOffset+widthText1/2-widthText1p/2)+'px, 0px)');
        };
      })

    d3.select('#enlarge_text2')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '0')
      .styleTween('transform', function (d) {
          if (mode === 0){
              return d3.interpolateString('translate('+adversarialComparisonOffset+'px, px)', 'translate('+adversarialMiddleOffset+'px, 0px)');
          }
          else if (mode === 1){
              return d3.interpolateString('translate('+originalComparisonOffset+'px, 0px)', 'translate('+originalMiddleOffset+'px, 0px)');
          }
      })

    d3.select('#enlarge_text2p')
      .transition()
      .duration(animationLength)
      .ease(d3.easeCubic)
      .style('opacity', '0')
      .styleTween('transform', function (d) {
          if (mode === 0){
              return d3.interpolateString('translate('+(adversarialComparisonOffset+widthText2/2-widthText2p/2)+'px, 0px)', 'translate('+(adversarialMiddleOffset+widthText2/2-widthText2p/2)+'px, 0px)');
          }
          else if (mode === 1){
              return d3.interpolateString('translate('+(originalComparisonOffset+widthText2/2-widthText2p/2)+'px, 0px)', 'translate('+(originalMiddleOffset+widthText2/2-widthText2p/2)+'px, 0px)');
          }
      })

}

function resetPos() {

    d3.select('#enlarged_image1').style('transform', 'translate(0%, 0%)');
    d3.select('#enlarged_image2').style('opacity', '0').style('transform', 'translate(0%, 0%)');
    d3.select('#rcorners_enlarge1').style('transform', 'translate(-7%, -9%)');
    d3.select('#rcorners_enlarge2').style('opacity', '0').style('transform', 'translate(-7%, -9%)');
    d3.select('#enlarge_text1').style('transform', 'translate(0px, 0px)');
    d3.select('#enlarge_text2').style('transform', 'translate(0px, 0px)');
    d3.select('#enlarge_text1p').style('transform', 'translate(0px, 0px)');
    d3.select('#enlarge_text2p').style('transform', 'translate(0px, 0px)');
}

function resetClickable(imgid) {

    d3.select("img#"+imgid)
    .on("click", function() {
        //do nothing
    });
}

export function instanceClicked(i, model, pert) {

    var orig_image = "/data/img_data/" + i + "/img.png";
    var orig_label = "/data/img_data/" + i + "/label.txt";

    var attack_image = "/data/" + model + "/" + pert + "/img_data/" + i + "/img.png";
    var attack_label = "/data/" + model + "/" + pert + "/img_data/" + i + "/label.txt";

    var noise_image = "/data/" + model + "/" + pert + "/img_data/" + i + "/noise.png";
    if(pert=="000") {
        attack_image = orig_image;
        noise_image = "./assets/media/question_.png";
    }

    changeImgSrc("image1", orig_image);
    changeImgSrc("image2", noise_image);
    changeImgSrc("image3", attack_image);

    makeClickable("image1", orig_image, attack_image, 0, model, pert, i);
    makeClickable("image3", orig_image, attack_image, 1, model, pert, i);

    if(pert != "000") {
        makeClickable("image2", noise_image, null, 2, model, pert, i);
    }

    changeImgSrc("image1_", orig_image);
    changeImgSrc("image2_", noise_image);

    d3.select(".model3").html(model.toUpperCase());

    d3.select("#epsilon")
        .text("0.0"+parseInt(pert));

    Promise.all([
	    d3.csv(orig_label),
        d3.csv(attack_label),
    ])
    .then(function(d) {
		//d3.select("#instance_pred1_text")
            //.text(d[1].columns[0]);
        //d3.select("#instance_pred2_text")
            //.text(d[0].columns[0]);

        typewriter("#instance_pred1_text", d[1].columns[0], d3.easeBounceIn);
        typewriter("#instance_pred2_text", d[0].columns[0], d3.easeBounce);
	})
}

export function resetInstances() {

    var orig_image = "./assets/media/panda_.png";
    var attack_image = "./assets/media/panda_noise.png";
    var noise_image = "./assets/media/question_.png";

    changeImgSrc("image1", orig_image);
    changeImgSrc("image2", noise_image);
    changeImgSrc("image3", attack_image);

    resetClickable("image1");
    resetClickable("image2");
    resetClickable("image3");

    changeImgSrc("image1_", orig_image);
    changeImgSrc("image2_", noise_image);

    d3.select("#epsilon").text("???");
    d3.select("#instance_pred1_text").text("???");
    d3.select("#instance_pred2_text").text("???");

    d3.select(".model3").html("MODEL");

}

export function typewriter(id, text_, trans, time_=1200) {
    d3.select(id).transition()
        .duration(time_)
        .ease(trans)
        .tween("text", function () {
            var newText = text_;
            var textLength = newText.length;
            return function (t) {
                this.textContent = newText.substr(0,
                                   Math.round( t * textLength) );
            };
        });
}
