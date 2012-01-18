/*
 * raphael.shapes 0.0.2
 *
 * Copyright (c) 2009 Wout Fierens
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */


// extending raphael with a polygon function (to be used with raw SVG polygon data)
Raphael.fn.polygon = function(cx, cy, points) {
  return this.path()
          .sett({ type: "polygon", points: points })
          .translate(cx, cy);
};

// adding a n-gon element
Raphael.fn.ngon = function(cx, cy, r, points) {
  return this.path()
          .sett({ type: "ngon", r: r, points: points })
          .translate(cx, cy);
};

// adding a star element
Raphael.fn.star = function(cx, cy, r1, r2, points) {
  return this.path()
          .sett({ type: "star", r1: r1, r2: r2, points: points })
          .translate(cx, cy);
};

// adding a star element
Raphael.el.sett = function() {
  var setts = {};
  if (typeof arguments[0] == "string") {
    setts[arguments[0]] = arguments[1];
  } else if (arguments[0]) {
    setts = arguments[0];
  }
  
  this.setts = {};
  for (var key in setts) {
    this.setts[key] = setts[key];
  }

  return this.attr("path", this[this.setts.type]());
};

// n-gon path function
Raphael.el.ngon = function() {
  var points = [],
      n = this.setts.points,
      r = this.setts.r,
      part = 360 / n,
      i = 0;

  while(n--) {    
    var a = i * part - 90,
        x = r * Math.cos(a * Math.PI / 180),
        y = r * Math.sin(a * Math.PI / 180);
    points.push((i == 0 ? "M" : "L") + x + "," + y);
    i++;
  }
  points.push("Z");
  return points.join(" ");
};

// star path function
Raphael.el.star = function() {
  var points = [],
      n = this.setts.points,
      r1 = this.setts.r1,
      r2 = this.setts.r2,
      part = 360 / n,
      i = 0;

  while(n--) {
    var a = i * part + 90,
        x = r1 * Math.cos(a * Math.PI / 180),
        y = r1 * Math.sin(a * Math.PI / 180);
    points.push((i == 0 ? "M" : "L") + x + "," + y);
    a += part / 2;
    x = r2 * Math.cos(a * Math.PI / 180),
    y = r2 * Math.sin(a * Math.PI / 180),
    points.push("L" + x + "," + y);
    i++;
  }
  points.push("Z");
  return points.join(" ");
};

// polygon function
Raphael.el.polygon = function() {
  var poly_array = ["M"],
      points = typeof this.setts.points == "string" ? this.setts.points.split(" ") : this.setts.points,
      n = points.length,
      i = 0;
      
  while (n--) {
    var point = typeof points[i] == "string" ? points[i].split(",") : points[i],
        p;
    
    if (!isNaN(p = parseFloat(point[0]))) {
        poly_array.push(parseFloat(p));
    }
    
    if (!isNaN(p = parseFloat(point[1]))) {
        poly_array.push(parseFloat(p));
    }
    
    if (i == 0) {
        poly_array.push("L");
    }
    i++;
  }

  poly_array.push("Z");
  return poly_array;
};
