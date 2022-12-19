(function () {
  // JS to accompany the HTML to compute the Mohrs Circle 2D.
  // Written by Amarnath S, aka Avijnata, May 2019
  // amarnaths.codeproject@gmail.com
  // Modified in December 2022, as per suggestion from Jan Herman Kuiper PhD

  var sigmax;
  var sigmay;
  var tauxy;
  var sigma1;
  var sigma2;
  var tauMax;
  var canvas01;
  var context01;
  var canvas02;
  var context02;
  var angle;
  var sigmax1;
  var sigmay1;
  var taux1y1;
  var angleDegrees;

  window.onload = init;

  function init() {
    bnCompute.addEventListener("click", bnComputeClick, false);
    raAngle.addEventListener("input", angleChange, false);

    canvas01 = document.getElementById("canvasMohr");
    context01 = canvas01.getContext("2d");

    canvas02 = document.getElementById("canvasTransform");
    context02 = canvas02.getContext("2d");

    bnComputeClick();
  }

  //Compute the Principal Stresses and the corresponding angles.
  function bnComputeClick() {
    var sigmaxStr = document.getElementById("sigmax").value;
    var sigmayStr = document.getElementById("sigmay").value;
    var tauxyStr = document.getElementById("tauxy").value;

    document.getElementById("raAngle").innerHTML = 0.0;

    if (isNaN(sigmaxStr) || isNaN(sigmayStr) || isNaN(tauxyStr)) {
      var errorMsg = "Please enter only numeric values for stresses";
      document.getElementById("opError").textContent = errorMsg;
      document.getElementById("opSigma1").textContent = "";
      document.getElementById("opSigma2").textContent = "";
      document.getElementById("opTauMax").textContent = "";
      document.getElementById("opThetaSigma1").textContent = "";
      document.getElementById("opThetaSigma2").textContent = "";

      document.getElementById("sigmax").value = 15;
      document.getElementById("sigmay").value = 5;
      document.getElementById("tauxy").value = 4;
    } else {
      sigmax = parseFloat(sigmaxStr);
      sigmay = parseFloat(sigmayStr);
      tauxy = parseFloat(tauxyStr);

      var res1 = (sigmax - sigmay) / 2.0;
      var res2 = res1 * res1;
      var res3 = Math.sqrt(res2 + tauxy * tauxy);

      var res4 = (sigmax + sigmay) / 2.0;
      sigma1 = res4 + res3;
      sigma2 = res4 - res3;
      tauMax = res3;

      var sigma1Disp = sigma1.toFixed(4) + " MPa";
      var sigma2Disp = sigma2.toFixed(4) + " MPa";
      var tauMaxDisp = tauMax.toFixed(4) + " MPa";
      var cosTwoTheta = res1 / res3;
      var sinTwoTheta = tauxy / res3;
      var twoThetaSigma1 = Math.atan2(sinTwoTheta, cosTwoTheta);
      var thetaSigma1 = (twoThetaSigma1 * 0.5 * 180.0) / Math.PI; // in degrees
      var thetaSigma2 = thetaSigma1 + 90; // degrees;

      var thetaSigma1Disp, thetaSigma2Disp;
      if (Math.abs(res3) > 0.00001) {
        thetaSigma1Disp = thetaSigma1.toFixed(2) + " degrees";
        thetaSigma2Disp = thetaSigma2.toFixed(2) + " degrees";
      } else {
        // Case when the two principal stresses are identical, and shear stress is zero.
        thetaSigma1Disp = "Any angle";
        thetaSigma2Disp = "Any angle";
      }

      document.getElementById("opSigma1").textContent = sigma1Disp;
      document.getElementById("opSigma2").textContent = sigma2Disp;
      document.getElementById("opTauMax").textContent = tauMaxDisp;
      document.getElementById("opThetaSigma1").textContent = thetaSigma1Disp;
      document.getElementById("opThetaSigma2").textContent = thetaSigma2Disp;
      document.getElementById("opError").textContent = "";

      sigmax1 = sigmax;
      sigmay1 = sigmay;
      taux1y1 = tauxy;
      angleDegrees = 0;
      document.getElementById("raAngle").value = angleDegrees;
      document.getElementById("opAngle").value = angleDegrees + " degrees";

      drawMohrsCircle();
      drawRotatingSquare();
      computeSecondaryStresses(0.0);
    }
  }

  // Draw the Mohr's Circle. This Mohr's circle does not change position irrespective of
  // the stress values. The only things which change are the stress values themselves,
  // in essence the scale of the figure.
  function drawMohrsCircle() {
    var yMargin = 10;
    var rightMargin = 90;

    var cWidth = canvas01.width;
    var cHeight = canvas01.height;
    var diameter = cHeight - 2 * yMargin;
    var rightPoint = cWidth - rightMargin;
    var leftPoint = rightPoint - diameter;

    var centreX = (leftPoint + rightPoint) / 2;
    var centreY = cHeight / 2;
    var radius = diameter / 2;

    context01.fillStyle = "lightyellow";
    context01.fillRect(0, 0, cWidth, cHeight);

    context01.save();

    context01.beginPath();
    context01.arc(centreX, centreY, radius, 0, 2 * Math.PI, false);
    context01.fillStyle = "cornsilk";
    context01.fill();
    context01.lineWidth = 2;
    context01.strokeStyle = "#003300";
    context01.arc(centreX, centreY, 2, 0, 2 * Math.PI, false);

    // Points sigmax, tauxy, and sigmay, -tauxy
    var distance1;
    var distance2;
    var EPSILON = 0.0001;
    if (Math.abs(sigma1 - sigma2) > EPSILON) {
      distance1 = ((sigmax - sigmay) * diameter) / (sigma1 - sigma2);
      distance2 = (tauxy * diameter) / (sigma1 - sigma2);
    } else {
      distance1 = diameter;
      distance2 = 0;
    }

    var point1x = centreX + distance1 / 2;
    var point1y = centreY + distance2;

    var point2x = centreX - distance1 / 2;
    var point2y = centreY - distance2;

    context01.moveTo(point1x, point1y);
    context01.lineTo(point2x, point2y);

    context01.font = "10pt sans-serif";
    context01.fillStyle = "#a52a2a";
    context01.textAlign = "left";
    var text1 = "(" + sigmax.toFixed(2) + ", " + tauxy.toFixed(2) + ")";
    context01.fillText(text1, point1x + 5, point1y + 5);

    context01.textAlign = "right";
    var minusTauxy = -tauxy;
    var minusText = minusTauxy.toFixed(2);
    text1 = "(" + sigmay.toFixed(2) + ", " + minusText + ")";
    context01.fillText(text1, point2x - 5, point2y + 5);

    context01.moveTo(point1x, point1y);
    context01.lineTo(point1x, centreY);

    context01.moveTo(point2x, point2y);
    context01.lineTo(point2x, centreY);
    context01.stroke();

    // Draw the moving circle
    var distance3;
    var distance4;
    if (Math.abs(sigma1 - sigma2) > EPSILON) {
      distance3 = ((sigmax1 - sigmay1) * diameter) / (sigma1 - sigma2);
      distance4 = (taux1y1 * diameter) / (sigma1 - sigma2);
    } else {
      distance3 = diameter;
      distance4 = 0;
    }
    var point3x = centreX + distance3 / 2;
    var point3y = centreY + distance4;
    var dynamicText =
      "\u03C3 = " + sigmax1.toFixed(2) + ", \u03C4 = " + taux1y1.toFixed(2);
    var thetaText = "Included angle = 2\u03B8";

    context01.beginPath();
    context01.fillStyle = "blue";
    context01.arc(point3x, point3y, 5, 0, 2 * Math.PI, true);
    context01.fill();
    // X-axis
    context01.moveTo(10, cHeight / 2);
    context01.lineTo(cWidth - 10, cHeight / 2);

    // Y-axis
    context01.moveTo(10, cHeight - 10);
    context01.lineTo(10, cHeight - 150);

    // Draw the dynamic text at right hand corner
    context01.font = "10pt sans-serif";
    context01.fillStyle = "blue";
    context01.textAlign = "right";
    context01.fillText(dynamicText, canvas01.width - 10, 20);
    context01.fillText(thetaText, canvas01.width - 10, 45);
    context01.stroke();

    drawArrow(context01, cWidth - 20, cHeight / 2, cWidth - 10, cHeight / 2);
    drawArrow(context01, 10, cHeight - 100, 10, cHeight - 10);

    context01.beginPath();
    context01.lineWidth = 1;
    context01.strokeStyle = "CornflowerBlue";
    context01.moveTo(centreX, centreY);
    context01.lineTo(point3x, point3y);
    context01.stroke();

    context01.beginPath();
    var radiusOfArc = diameter / 8;
    var xVal = point1x - centreX;
    var yVal = point1y - centreY;
    var startAngle = Math.atan2(yVal, xVal);
    xVal = point3x - centreX;
    yVal = point3y - centreY;
    var endAngle = Math.atan2(yVal, xVal);
    context01.arc(centreX, centreY, radiusOfArc, startAngle, endAngle, true);
    context01.stroke();

    drawStaticLabels(context01);
    drawCentreOfCircle(context01, leftPoint, rightPoint);
    drawSigma1And2(context01, leftPoint, rightPoint, sigma1, sigma2);

    context01.restore();
  }

  // Draw the static labels on the top canvas - these are the x and y axes
  function drawStaticLabels(context) {
    context.save();
    var xTextMargin1 = canvas01.width - 12;
    context.beginPath();
    context.font = "12pt sans-serif";
    context.fillStyle = "#a52a2a";
    context.textAlign = "right";
    context.fillText("\u03C3", xTextMargin1, canvas01.height / 2 - 10); // sigma
    context.fillText("\u03C4", 30, canvas01.height - 20); // tau
    context.stroke();
    context.restore();
  }

  // From SO site, to draw an arrow head
  function drawArrow(context, fromx, fromy, tox, toy) {
    context.save();
    context.beginPath();
    var headlen = 10; // length of head in pixels
    var angle = Math.atan2(toy - fromy, tox - fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 6),
      toy - headlen * Math.sin(angle - Math.PI / 6)
    );
    context.moveTo(tox, toy);
    context.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 6),
      toy - headlen * Math.sin(angle + Math.PI / 6)
    );
    context.stroke();
    context.restore();
  }

  // Draw the stress value corresponding to the centre of the circle on the top canvas
  function drawCentreOfCircle(context, leftPointX, rightPointX) {
    var centreX = (leftPointX + rightPointX) / 2;
    context.save();
    context.beginPath();
    context.moveTo(centreX, canvas01.height / 2 - 7);
    context.lineTo(centreX, canvas01.height / 2 + 7);

    context.font = "10pt sans-serif";
    context.fillStyle = "#a52a2a";
    context.textAlign = "left";
    var sigmaCentre = (sigmax + sigmay) / 2;
    var sigmaCentreDisp = sigmaCentre.toFixed(2);
    var centreText = "(" + sigmaCentreDisp + ", 0" + ")";
    context.fillText(centreText, centreX + 5, canvas01.height / 2 - 5);

    context.stroke();
    context.restore();
  }

  // Draw the Principal Stresses on the Mohr's circle in the top canvas
  function drawSigma1And2(context, leftPointX, rightPointX, sigma1, sigma2) {
    context.save();

    context.beginPath();
    context.font = "10pt sans-serif";
    context.fillStyle = "#a52a2a";
    context.textAlign = "left";

    var text1 = "(" + sigma1.toFixed(2) + ", 0" + ")";
    context.fillText(text1, rightPointX + 3, canvas01.height / 2 + 15);

    context.textAlign = "right";
    var text2 = "(" + sigma2.toFixed(2) + ", 0" + ")";
    context.fillText(text2, leftPointX - 5, canvas01.height / 2 + 15);
    context.stroke();

    context.restore();
  }

  // Draw the rotating square indicating the rotated square element
  function drawRotatingSquare() {
    var angleValue = document.getElementById("raAngle").value;
    angle = parseFloat(angleValue);
    angle = (angle * Math.PI) / 180.0;

    context02.save();

    var radius = 180;
    var radiusShear = 182;
    var x1, y1, x2, y2, x3, y4, x4, y4;
    var centreX = 200;
    var centreY = canvas02.height / 2;
    x1 = centreX + radius * Math.cos(angle + Math.PI * 0.25);
    y1 = centreY - radius * Math.sin(angle + Math.PI * 0.25);
    x2 = centreX + radius * Math.cos(angle + Math.PI * 0.75);
    y2 = centreY - radius * Math.sin(angle + Math.PI * 0.75);
    x3 = centreX + radius * Math.cos(angle + Math.PI * 1.25);
    y3 = centreY - radius * Math.sin(angle + Math.PI * 1.25);
    x4 = centreX + radius * Math.cos(angle + Math.PI * 1.75);
    y4 = centreY - radius * Math.sin(angle + Math.PI * 1.75);

    context02.beginPath();
    context02.fillStyle = "lightyellow";
    context02.fillRect(0, 0, canvas02.width, canvas02.height);
    context02.lineWidth = 2;
    context02.moveTo(x1, y1); // Point 1
    context02.lineTo(x2, y2); // Point 2
    context02.lineTo(x3, y3); // Point 3
    context02.lineTo(x4, y4); // Point 4
    context02.lineTo(x1, y1); // Point 1
    context02.stroke();

    // For the normal stress components
    var x5 = (x1 + x4) / 2;
    var y5 = (y1 + y4) / 2;

    var x6 = (3 * x5 - centreX) / 2;
    var y6 = (3 * y5 - centreY) / 2;

    context02.font = "14pt sans-serif";
    context02.fillStyle = "#a52a2a";
    context02.textAlign = "left";

    var x61 = x6;
    var y61 = y6 + 15;
    context02.fillText(sigmax1.toFixed(2), x61, y61);
    // context02.fillText("\u03C3", x61, y61);
    // context02.fillText("x", x61 + 10, y61 + 6);
    // context02.fillText("1", x61 + 18, y61 + 13);

    var x7 = (x1 + x2) / 2;
    var y7 = (y1 + y2) / 2;

    var x8 = (3 * x7 - centreX) / 2;
    var y8 = (3 * y7 - centreY) / 2;
    var x81 = x8;
    var y81 = y8 + 15;
    context02.fillText(sigmay1.toFixed(2), x81, y81);
    // context02.fillText("\u03C3", x81, y81);
    // context02.fillText("y", x81 + 10, y81 + 6);
    // context02.fillText("1", x81 + 18, y81 + 13);

    var x9 = (x3 + x2) / 2;
    var y9 = (y3 + y2) / 2;

    var x10 = (3 * x9 - centreX) / 2;
    var y10 = (3 * y9 - centreY) / 2;

    var x101 = x10;
    var y101 = y10 + 15;
    context02.fillText(sigmax1.toFixed(2), x101, y101);
    // context02.fillText("\u03C3", x101, y101);
    // context02.fillText("x", x101 + 10, y101 + 6);
    // context02.fillText("1", x101 + 18, y101 + 13);

    var x11 = (x3 + x4) / 2;
    var y11 = (y3 + y4) / 2;

    var x12 = (3 * x11 - centreX) / 2;
    var y12 = (3 * y11 - centreY) / 2;

    var x121 = x12;
    var y121 = y12 + 15;
    context02.fillText(sigmay1.toFixed(2), x121, y121);
    // context02.fillText("\u03C3", x121, y121);
    // context02.fillText("y", x121 + 10, y121 + 6);
    // context02.fillText("1", x121 + 18, y121 + 13);

    // For the shear stress components
    var x13 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.29);
    var y13 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.29);
    var x14 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.71);
    var y14 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.71);

    var x15 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.79);
    var y15 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.79);
    var x16 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.21);
    var y16 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.21);

    var x17 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.29);
    var y17 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.29);
    var x18 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.71);
    var y18 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.71);

    var x19 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.79);
    var y19 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.79);
    var x20 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.21);
    var y20 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.21);

    var x131 = x13 - 10;
    var y131 = y13 - 10;
    context02.fillText(taux1y1.toFixed(2), x131, y131);
    // context02.fillText("\u03C4", x131, y131);
    // context02.fillText("x", x131 + 10, y131 + 6);
    // context02.fillText("1", x131 + 18, y131 + 13);
    // context02.fillText("y", x131 + 26, y131 + 6);
    // context02.fillText("1", x131 + 34, y131 + 13);

    var x161 = x16 - 30;
    var y161 = y16 + 10;
    context02.fillText(taux1y1.toFixed(2), x161, y161);
    // context02.fillText("\u03C4", x161, y161);
    // context02.fillText("x", x161 + 10, y161 + 6);
    // context02.fillText("1", x161 + 18, y161 + 13);
    // context02.fillText("y", x161 + 26, y161 + 6);
    // context02.fillText("1", x161 + 34, y161 + 13);

    var x171 = x17 - 20;
    var y171 = y17 + 20;
    context02.fillText(taux1y1.toFixed(2), x171, y171);
    // context02.fillText("\u03C4", x171, y171);
    // context02.fillText("x", x171 + 10, y171 + 6);
    // context02.fillText("1", x171 + 18, y171 + 13);
    // context02.fillText("y", x171 + 26, y171 + 6);
    // context02.fillText("1", x171 + 34, y171 + 13);

    var x201 = x20 + 10;
    var y201 = y20 + 20;
    context02.fillText(taux1y1.toFixed(2), x201, y201);
    // context02.fillText("\u03C4", x201, y201);
    // context02.fillText("x", x201 + 10, y201 + 6);
    // context02.fillText("1", x201 + 18, y201 + 13);
    // context02.fillText("y", x201 + 26, y201 + 6);
    // context02.fillText("1", x201 + 34, y201 + 13);

    context02.beginPath();
    context02.moveTo(x5, y5);
    context02.lineTo(x6, y6);
    context02.moveTo(x7, y7);
    context02.lineTo(x8, y8);
    context02.moveTo(x9, y9);
    context02.lineTo(x10, y10);
    context02.moveTo(x11, y11);
    context02.lineTo(x12, y12);

    context02.moveTo(x13, y13);
    context02.lineTo(x14, y14);
    context02.moveTo(x15, y15);
    context02.lineTo(x16, y16);
    context02.moveTo(x17, y17);
    context02.lineTo(x18, y18);
    context02.moveTo(x19, y19);
    context02.lineTo(x20, y20);
    context02.stroke();

    // For the arrow marks
    drawArrow(context02, x5, y5, x6, y6);
    drawArrow(context02, x7, y7, x8, y8);
    drawArrow(context02, x9, y9, x10, y10);
    drawArrow(context02, x11, y11, x12, y12);
    drawArrow(context02, x14, y14, x13, y13);
    drawArrow(context02, x15, y15, x16, y16);
    drawArrow(context02, x18, y18, x17, y17);
    drawArrow(context02, x19, y19, x20, y20);

    // Draw the axes
    var lengthOfSegment = 30;
    context02.beginPath();
    context02.strokeStyle = "#00ff00";
    context02.moveTo(centreX, centreY);
    context02.lineTo(centreX + lengthOfSegment, centreY);
    context02.moveTo(centreX, centreY - lengthOfSegment);
    context02.lineTo(centreX, centreY);
    context02.stroke();

    var x30 = centreX;
    var y30 = centreY;
    var x31 = centreX + lengthOfSegment;
    var y31 = centreY;
    var x32 = centreX;
    var y32 = centreY;
    var x33 = centreX;
    var y33 = centreY - lengthOfSegment;

    drawArrow(context02, x30, y30, x31, y31);
    drawArrow(context02, x32, y32, x33, y33);

    context02.font = "12pt sans-serif";
    context02.fillStyle = "#a52a2a";
    context02.strokeStyle = "#000000";
    context02.textAlign = "left";

    context02.fillText("x", centreX - 10 + lengthOfSegment, centreY + 10);
    context02.fillText("y", centreX - 10, centreY - lengthOfSegment + 10);

    // Draw the rotating axes
    var x56 = centreX + lengthOfSegment * Math.cos(angle);
    var y56 = centreY - lengthOfSegment * Math.sin(angle);
    var x78 = centreX + lengthOfSegment * Math.cos(angle + 1.57);
    var y78 = centreY - lengthOfSegment * Math.sin(angle + 1.57);

    context02.beginPath();
    context02.moveTo(centreX, centreY);
    context02.lineTo(x56, y56);
    context02.moveTo(centreX, centreY);
    context02.lineTo(x78, y78);
    context02.stroke();

    drawArrow(context02, centreX, centreY, x56, y56);
    drawArrow(context02, centreX, centreY, x78, y78);

    context02.font = "12pt sans-serif";
    context02.fillStyle = "#a52a2a";
    context02.textAlign = "left";
    context02.fillText("x", x56, y56 + 10);
    context02.fillText("y", x78, y78 + 10);
    context02.fillText("1", x56 + 8, y56 + 18);
    context02.fillText("1", x78 + 8, y78 + 18);

    context02.restore();

    drawSecondaryStressesText(context02);
  }

  // Draw the text of the Secondary Stresses on the bottom canvas
  function drawSecondaryStressesText(context) {
    context.save();
    var xTextMargin1 = canvas02.width - 160;
    context.beginPath();
    context.font = "13pt sans-serif";
    context.fillStyle = "#a52a2a";
    context.textAlign = "left";

    context.fillText("\u03B8", xTextMargin1, 25);
    var text1 = " = " + angleDegrees + " degrees";
    context.fillText(text1, xTextMargin1 + 25, 25);

    context.fillText("\u03C3", xTextMargin1, 60);
    context.fillText("x", xTextMargin1 + 10, 66);
    context.fillText("1", xTextMargin1 + 18, 73);
    var text1 = " = " + sigmax1.toFixed(2) + " MPa";
    context.fillText(text1, xTextMargin1 + 25, 60);

    context.fillText("\u03C3", xTextMargin1, 95);
    context.fillText("y", xTextMargin1 + 10, 101);
    context.fillText("1", xTextMargin1 + 18, 108);
    text1 = " = " + sigmay1.toFixed(2) + " MPa";
    context.fillText(text1, xTextMargin1 + 25, 95);

    context.fillText("\u03C4", xTextMargin1, 130);
    context.fillText("x", xTextMargin1 + 10, 136);
    context.fillText("1", xTextMargin1 + 18, 143);
    context.fillText("y", xTextMargin1 + 26, 136);
    context.fillText("1", xTextMargin1 + 34, 143);
    text1 = " = " + taux1y1.toFixed(2) + " MPa";
    context.fillText(text1, xTextMargin1 + 36, 130);
    context.stroke();
    context.restore();
  }

  // Input angle is in degrees
  function computeSecondaryStresses(angle) {
    var angleRadians = (angle * Math.PI) / 180.0;
    var sinVal = Math.sin(2.0 * angleRadians);
    var cosVal = Math.cos(2.0 * angleRadians);
    var term1 = (sigmax + sigmay) * 0.5;
    var term2 = (sigmax - sigmay) * 0.5 * cosVal;
    var term3 = tauxy * sinVal;
    sigmax1 = term1 + term2 + term3;
    sigmay1 = term1 - term2 - term3;
    var term4 = (sigmax - sigmay) * 0.5 * sinVal;
    var term5 = tauxy * cosVal;
    taux1y1 = -term4 + term5;
  }

  // Event handler for angle change
  function angleChange() {
    var angleValue = document.getElementById("raAngle").value;
    var angl = parseFloat(angleValue);
    var angl2 = angl.toFixed(2);
    angleDegrees = angl2;
    document.getElementById("opAngle").textContent = angl2 + " degrees";

    computeSecondaryStresses(angl);
    drawRotatingSquare();
    drawMohrsCircle();
  }
})();
