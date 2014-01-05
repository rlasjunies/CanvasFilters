/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Canvas.ts" />
function grayscale() {
    var c = new mtg.util.canvas.Canvas(document.getElementById('orig'));
    var imgDest = document.getElementById('dest');
    c.grayscale();
    imgDest.src = c.canvas.toDataURL();
}

function brightness() {
    var c = new mtg.util.canvas.Canvas(document.getElementById('orig'));
    var imgDest = document.getElementById('dest');
    c.brightness();
    imgDest.src = c.canvas.toDataURL();
}

function threshold() {
    var c = new mtg.util.canvas.Canvas(document.getElementById('orig'));
    var imgDest = document.getElementById('dest');
    c.threshold();
    imgDest.src = c.canvas.toDataURL();
}

function sharpen() {
    var c = new mtg.util.canvas.Canvas(document.getElementById('orig'));
    var imgDest = document.getElementById('dest');
    c.convolute([
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0], 1);
    imgDest.src = c.canvas.toDataURL();
}

function myblur() {
    var c = new mtg.util.canvas.Canvas(document.getElementById('orig'));
    var imgDest = document.getElementById('dest');
    c.convolute([1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9], 1);
    imgDest.src = c.canvas.toDataURL();
}

function sobel() {
    var gray = new mtg.util.canvas.Canvas(document.getElementById('orig'));
    var imgDest = document.getElementById('dest');
    gray.grayscale();

    imgDest.src = gray.canvas.toDataURL();

    var vertical = jQuery.extend(true, {}, gray);
    var horizontal = jQuery.extend(true, {}, gray);

    // Note that ImageData values are clamped between 0 and 255, so we need
    // to use a Float32Array for the gradient values because they
    // range between -255 and 255.
    var src1 = vertical.convoluteFloat32([
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1], 1);
    imgDest.src = vertical.canvas.toDataURL();

    var src2 = horizontal.convoluteFloat32([
        -1, -2, -1,
        0, 0, 0,
        1, 2, 1], 1);

    gray.mergeSobel(src1, src2);
    gray.canvas.width = 700;
    gray.canvas.height = 337;

    imgDest.src = gray.canvas.toDataURL();
}
//# sourceMappingURL=app.js.map
