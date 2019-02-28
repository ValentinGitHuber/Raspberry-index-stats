import './landing.html';
import Current from '../../api/collections/current.js';

Template.landing.onCreated(() => {
    Meteor.subscribe('current');
});

Template.landing.onRendered(() => {

    //focus current day
    let daynr = moment(new Date()).format("E");
    Meteor.call('changeday', daynr, (e, r) => {
            if (r) {
                Session.set('data', r);
            }
        });
    $('header ul li[data-day=' + daynr + ']').addClass('focused')

    //move to right current day
    let liarr = [];
    $.each($('header ul li'), (el, i) => {
        liarr.push(i)
    });
    for (var i = liarr.length - 1; i >= 0; i--) {
        if ($(liarr[i]).hasClass('focused')) {
            break;
        } else {
            $(liarr[i]).insertBefore($('header ul li').eq(0));
        }
    }

    //scroll to current day
    $('header ul').scrollLeft($(window).width());

    Tracker.autorun(function() {
        var data = Session.get('data');

        if (data) {
            var lineGenerator = d3.line().curve(d3.curveCardinal);
            var line = {};

            line.marginTopBottom = 100;
            line.points = [];
            line.svgheight = $('svg').height();
            line.negTemps = false;
            line.minElem = null;
            line.maxElem = null;

            _.each(data, item => {
                if (line.minElem == null) {
                    line.minElem = item;
                    line.maxElem = item;
                } else {
                    if (item < line.minElem) {
                        line.minElem = item;
                    }
                    if (item > line.maxElem) {
                        line.maxElem = item;
                    }
                }
                if (item < 0) {
                    line.negTemps = true;
                }
            });

            if (line.minElem < 0 || line.maxElem < 0) {
                line.multiply = (line.svgheight - line.marginTopBottom * 3) / (line.maxElem - line.minElem);
            } else {
                line.multiply = (line.svgheight - line.marginTopBottom * 3) / (line.maxElem);
            }

            _.each(data, (el, index) => {
                if (line.negTemps) {
                    line.negTemps = line.minElem;
                } else {
                    line.negTemps = 0;
                }
                if (index == 0)
                    line.points.push([0, line.svgheight - line.marginTopBottom * 2 - (el - line.negTemps) * line.multiply, el]);
                else if (index == 1)
                    line.points.push([convertRemToPixels(4.5), line.svgheight - line.marginTopBottom * 2 - (el - line.negTemps) * line.multiply, el]);
                else
                    line.points.push([convertRemToPixels(index * 9) - convertRemToPixels(4.5), line.svgheight - line.marginTopBottom * 2 - (el - line.negTemps) * line.multiply, el]);
            });

            line.pathData = lineGenerator(line.points) + `,V${line.svgheight},H0,V${line.svgheight}`;
            d3.select('path').attr('d', line.pathData);

            d3.select("svg").selectAll("text").remove()
            d3.select('svg')
                .selectAll("text")
                .remove()
                .data(line.points)
                .enter()
                .append("text")
                .attr("x", function(d, i) {
                    if (i == line.points.length - 1) d[0] -= 90
                    return d[0] - 30;
                })
                .attr("y", function(d, i) { return d[1] + 60; })
                .text(function(d, i) {
                    if (i == 0 || i >= 13){ return ''};
                    if(d[2]==''){
                        return '∅';
                    }else{
                        return parseInt(d[2]) + '°C';
                    } 
                })
                .attr("fill", "white");


        }
    });




});

Template.landing.helpers({
    current() {
        var current = Current.findOne();
        return current;
    }
});


Template.landing.events({
    'click header ul li' (e) {
        $('header ul li').removeClass('focused');
        $(e.target).addClass('focused');

        Meteor.call('changeday', $(e.target).attr('data-day'), (e, r) => {
            if (r) {
                Session.set('data', r);
            }
        });
    }
});





function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}