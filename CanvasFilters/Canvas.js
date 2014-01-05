var mtg;
(function (mtg) {
    (function (util) {
        (function (canvas) {
            var Canvas = (function () {
                function Canvas(img) {
                    this.getPixels(img);
                }
                Canvas.prototype.getPixels = function (img) {
                    //var c: HTMLCanvasElement = this.getCanvas( img.width, img.height );
                    this.getCanvas(img.width, img.height);
                    this.ctx = this.canvas.getContext('2d');
                    this.ctx.drawImage(img, 0, 0);

                    //return ctx.getImageData( 0, 0, c.width, c.height );
                    this.imagedata = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                };

                Canvas.prototype.getCanvas = function (width, height) {
                    this.canvas = document.createElement('canvas');
                    this.canvas.width = width;
                    this.canvas.height = height;
                    return this.canvas;
                };

                Canvas.prototype.grayscale = function () {
                    //var d = pixels.data;
                    var d = this.imagedata.data;
                    for (var i = 0; i < d.length; i += 4) {
                        var r = d[i];
                        var g = d[i + 1];
                        var b = d[i + 2];

                        // CIE luminance for the RGB
                        // The human eye is bad at seeing red and blue, so we de-emphasize them.
                        var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                        d[i] = d[i + 1] = d[i + 2] = v;
                        console.log(r + ' ' + g + ' ' + b + ' ' + d[i] + ' ' + d[i + 1] + ' ' + d[i + 2]);
                    }

                    this.ctx.putImageData(this.imagedata, 0, 0);
                };

                Canvas.prototype.brightness = function (adjustment) {
                    if (adjustment == undefined)
                        adjustment = 40;

                    //var d = pixels.data;
                    var d = this.imagedata.data;
                    for (var i = 0; i < d.length; i += 4) {
                        d[i] += adjustment;
                        d[i + 1] += adjustment;
                        d[i + 2] += adjustment;
                    }
                    this.ctx.putImageData(this.imagedata, 0, 0);
                };

                Canvas.prototype.threshold = function (threshold) {
                    if (threshold == undefined)
                        threshold = 128;

                    //var d = pixels.data;
                    var d = this.imagedata.data;
                    for (var i = 0; i < d.length; i += 4) {
                        var r = d[i];
                        var g = d[i + 1];
                        var b = d[i + 2];
                        var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
                        d[i] = d[i + 1] = d[i + 2] = v;
                    }
                    this.ctx.putImageData(this.imagedata, 0, 0);
                };

                Canvas.prototype.convolute = function (weights, opaque) {
                    var side = Math.round(Math.sqrt(weights.length));
                    var halfSide = Math.floor(side / 2);
                    var src = this.imagedata.data;
                    var sw = this.imagedata.width;
                    var sh = this.imagedata.height;

                    // pad output by the convolution matrix
                    var w = sw;
                    var h = sh;

                    var tmpCanvas = document.createElement('canvas');
                    var tmpCtx = tmpCanvas.getContext('2d');
                    var output = tmpCtx.createImageData(w, h);
                    var dst = output.data;

                    // go through the destination image pixels
                    var alphaFac = opaque ? 1 : 0;
                    for (var y = 0; y < h; y++) {
                        for (var x = 0; x < w; x++) {
                            var sy = y;
                            var sx = x;
                            var dstOff = (y * w + x) * 4;

                            // calculate the weighed sum of the source image pixels that
                            // fall under the convolution matrix
                            var r = 0, g = 0, b = 0, a = 0;
                            for (var cy = 0; cy < side; cy++) {
                                for (var cx = 0; cx < side; cx++) {
                                    var scy = sy + cy - halfSide;
                                    var scx = sx + cx - halfSide;
                                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                        var srcOff = (scy * sw + scx) * 4;
                                        var wt = weights[cy * side + cx];
                                        r += src[srcOff] * wt;
                                        g += src[srcOff + 1] * wt;
                                        b += src[srcOff + 2] * wt;
                                        a += src[srcOff + 3] * wt;
                                    }
                                }
                            }
                            dst[dstOff] = r;
                            dst[dstOff + 1] = g;
                            dst[dstOff + 2] = b;
                            dst[dstOff + 3] = a + alphaFac * (255 - a);
                        }
                    }

                    //return output;
                    this.ctx.putImageData(output, 0, 0);
                };

                Canvas.prototype.convoluteFloat32 = function (weights, opaque) {
                    var side = Math.round(Math.sqrt(weights.length));
                    var halfSide = Math.floor(side / 2);

                    var src = this.imagedata.data;
                    var sw = this.imagedata.width;
                    var sh = this.imagedata.height;

                    var w = sw;
                    var h = sh;
                    var output = {
                        width: w, height: h, data: new Float32Array(w * h * 4)
                    };
                    var dst = output.data;

                    var alphaFac = opaque ? 1 : 0;

                    for (var y = 0; y < h; y++) {
                        for (var x = 0; x < w; x++) {
                            var sy = y;
                            var sx = x;
                            var dstOff = (y * w + x) * 4;
                            var r = 0, g = 0, b = 0, a = 0;
                            for (var cy = 0; cy < side; cy++) {
                                for (var cx = 0; cx < side; cx++) {
                                    var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                                    var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                                    var srcOff = (scy * sw + scx) * 4;
                                    var wt = weights[cy * side + cx];
                                    r += src[srcOff] * wt;
                                    g += src[srcOff + 1] * wt;
                                    b += src[srcOff + 2] * wt;
                                    a += src[srcOff + 3] * wt;
                                }
                            }
                            dst[dstOff] = r;
                            dst[dstOff + 1] = g;
                            dst[dstOff + 2] = b;
                            dst[dstOff + 3] = a + alphaFac * (255 - a);
                        }
                    }

                    //this.ctx.putImageData( output, 0, 0 );
                    return output;
                };

                Canvas.prototype.mergeSobel = function (src1, src2) {
                    for (var i = 0; i < this.imagedata.data.length; i += 4) {
                        // make the vertical gradient red
                        var v = Math.abs(src1.data[i]);
                        this.imagedata.data[i] = v;

                        // make the horizontal gradient green
                        var h = Math.abs(src2.data[i]);
                        this.imagedata.data[i + 1] = h;

                        // and mix in some blue for aesthetics
                        this.imagedata.data[i + 2] = (v + h) / 4;
                        this.imagedata.data[i + 3] = 255; // opaque alpha
                    }
                    this.ctx.putImageData(this.imagedata, 0, 0);
                };
                return Canvas;
            })();
            canvas.Canvas = Canvas;
        })(util.canvas || (util.canvas = {}));
        var canvas = util.canvas;
    })(mtg.util || (mtg.util = {}));
    var util = mtg.util;
})(mtg || (mtg = {}));
//# sourceMappingURL=canvas.js.map
