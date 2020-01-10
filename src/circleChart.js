(function ($) {
    "use strict";
    $.fn.circleChart = function (options) {
        const defaults = {
            color: "#3459eb",
            backgroundColor: "#e6e6e6",
            background: true,
            speed: 2000,
            widthRatio: 1,
            // 0 - 1 
            value: options.value ? options : 1,
            previousValue: 0,
            unit: 'percent',
            // represents the target 0 - 1
            targetOee: 0.75,
            producedPartCount: 0,
            theoricalPartCount: 0,
            textIn: false,
            // 75 start from top
            startAngle: 0,
            counterclockwise: false,
            size: 110,
            animate: true,
            backgroundFix: true,
            lineCap: "round",
            animation: "easeInOutCubic",
            text: function(){ return false },
            textColor : {
                valueColor: '#ffffff',
                percentSymbolColor: '#ffffff',
                producedPartCountColor: '#ffffff',
                partsTextColor : '#ffffff',
                partsBehindTextColor: '#ffffff',
            },
            redraw: false,
            cAngle: 0,
            textCenter: true,
            textSize: false,
            textWeight: 'normal',
            textFamily: 'Roboto, Arial, sans-serif',
            relativeTextSize: 1 / 7,
            autoCss: true,
            onDraw: false,
            
        };

        // Animation Math functions
        let math = {};

        math.linearTween = (t, b, c, d) => c * t / d + b;
        math.easeInQuad = (t, b, c, d) => {
            t /= d;
            return c * t * t + b;
        };
        math.easeOutQuad = (t, b, c, d) => {
            t /= d;
            return -c * t * (t - 2) + b;
        };
        math.easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };
        math.easeInCubic = (t, b, c, d) => {
            t /= d;
            return c * t * t * t + b;
        };
        math.easeOutCubic = (t, b, c, d) => {
            t /= d;
            t--;
            return c * (t * t * t + 1) + b;
        };
        math.easeInOutCubic = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        };
        math.easeInQuart = (t, b, c, d) => {
            t /= d;
            return c * t * t * t * t + b;
        };
        math.easeOutQuart = (t, b, c, d) => {
            t /= d;
            t--;
            return -c * (t * t * t * t - 1) + b;
        };
        math.easeInOutQuart = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t * t + b;
            t -= 2;
            return -c / 2 * (t * t * t * t - 2) + b;
        };
        math.easeInQuint = (t, b, c, d) => {
            t /= d;
            return c * t * t * t * t * t + b;
        };
        math.easeOutQuint = (t, b, c, d) => {
            t /= d;
            t--;
            return c * (t * t * t * t * t + 1) + b;
        };
        math.easeInOutQuint = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t * t * t + 2) + b;
        };
        math.easeInSine = (t, b, c, d) => -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        math.easeOutSine = (t, b, c, d) => c * Math.sin(t / d * (Math.PI / 2)) + b;
        math.easeInOutSine = (t, b, c, d) => -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        math.easeInExpo = (t, b, c, d) => c * Math.pow(2, 10 * (t / d - 1)) + b;
        math.easeOutExpo = (t, b, c, d) => c * (-Math.pow(2, -10 * t / d) + 1) + b;
        math.easeInOutExpo = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1)
                return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            t--;
            return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
        };
        math.easeInCirc = (t, b, c, d) => {
            t /= d;
            return -c * (Math.sqrt(1 - t * t) - 1) + b;
        };
        math.easeOutCubic = (t, b, c, d) => {
            t /= d;
            t--;
            return c * (t * t * t + 1) + b;
        };
        math.easeInOutCubic = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        };
        math.easeOutCirc = (t, b, c, d) => {
            t /= d;
            t--;
            return c * Math.sqrt(1 - t * t) + b;
        };
        math.easeInOutCirc = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1)
                return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            t -= 2;
            return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
        };

        let Circle = (pos, bAngle, eAngle, cAngle, radius, lineWidth, sAngle, settings) => {
            let circle = Object.create(Circle.prototype);
            circle.pos = pos;
            circle.bAngle = bAngle;
            circle.eAngle = eAngle;
            circle.cAngle = cAngle;
            circle.radius = radius;
            circle.lineWidth = lineWidth;
            circle.sAngle = sAngle;
            circle.settings = settings;
            return circle;
        };

        Circle.prototype = {
            onDraw(el) {
                if (this.settings.onDraw !== false) {
                    let copy = Object.assign({}, this);
                    let units = {
                        'percent': rToP,
                        'rad': (e) => e,
                        'default': rToD
                    };
                    copy.value = (units[this.settings.unit] || units['default'])(copy.cAngle);
                    copy.text = (text) => setCircleText(el, text);
                    copy.settings.onDraw(el, copy);
                }
            },
            drawBackground(ctx) {
                ctx.beginPath();
                ctx.arc(this.pos, this.pos, this.settings.backgroundFix
                    ? this.radius * 0.9999
                    : this.radius, 0, 2 * Math.PI);
                ctx.lineWidth = this.settings.backgroundFix
                    ? this.lineWidth * 0.95
                    : this.lineWidth;
                ctx.strokeStyle = this.settings.backgroundColor;
                ctx.stroke();
            },
            draw(ctx) {
                ctx.beginPath();
                if (this.settings.counterclockwise) {
                    let k = 2 * Math.PI;
                    ctx.arc(this.pos, this.pos, this.radius, k - this.bAngle, k - (this.bAngle + this.cAngle), this.settings.counterclockwise);
                } else {
                    ctx.arc(this.pos, this.pos, this.radius, this.bAngle, this.bAngle + this.cAngle, this.settings.counterclockwise);
                }
                ctx.lineWidth = this.lineWidth;
                ctx.lineCap = this.settings.lineCap;
                ctx.strokeStyle = this.settings.color;
                ctx.stroke();
               
            },
            drawTarget(ctx){
                // draw target
                ctx.beginPath();
                let lineWidth = this.settings.backgroundFix
                    ? this.lineWidth * 0.95 / 2 
                    : this.lineWidth / 2;
                let x =  this.pos + this.radius * Math.cos(Math.PI/180 * ( (this.settings.targetOee * 360) - 90) );
                let y =  this.pos + this.radius * Math.sin(Math.PI/180 * ( (this.settings.targetOee * 360) - 90) );
                let startAngle = 0 * Math.PI;
                let endAngle = 2 * Math.PI;
                ctx.arc(x, y, lineWidth, startAngle, endAngle );
                let color = this.settings.value >= this.settings.targetOee ? this.settings.backgroundColor : "#ffffff";
                ctx.fillStyle = color;
                ctx.fill(); 
                // update text
            },
            animate(el, ctx, time, startTime, move/*move counterclockwise*/) {
                let mspf = new Date().getTime() - time; //milliseconds per frame
                if (mspf < 1) {
                    mspf = 1;
                }
                if ((time - startTime < this.settings.speed * 1.05)/* time not over */ && (!move && (this.cAngle) * 1000 <= Math.floor((this.eAngle) * 1000)/* move clockwise */ || move && (this.cAngle) * 1000 >= Math.floor((this.eAngle) * 1000)/* move counterclockwise */)) {
                    this.cAngle = math[this.settings.animation]((time - startTime) / mspf, this.sAngle, this.eAngle - this.sAngle, this.settings.speed / mspf);
                    ctx.clearRect(0, 0, this.settings.size, this.settings.size);
                    if (this.settings.background) {
                        this.drawBackground(ctx);
                    }
                    this.draw(ctx);
                    this.drawTarget(ctx);
                    this.onDraw(el);
                    time = new Date().getTime();
                    rAF(() => this.animate(el, ctx, time, startTime, move));
                } else {

                    this.cAngle = this.eAngle;
                    ctx.clearRect(0, 0, this.settings.size, this.settings.size);
                    if (this.settings.background) {
                        this.drawBackground(ctx);
                    }
                    this.draw(ctx);
                    this.drawTarget(ctx);
                    this.setCurrentAnglesData(el);
                    this.drawTarget(ctx);
                }
            },
            setCurrentAnglesData(el) {
                let units = {
                    'percent': rToP,
                    'rad': (e) => e,
                    'default': rToD
                };

                let f = (units[this.settings.unit] || units['default']);

                el.data("current-c-angle", f(this.cAngle));
                el.data("current-start-angle", f(this.bAngle));
            }
        };

        let setCircleText = (el, text) => {
            el.data("text", text);
            $(".circleChart_text", el).html(text);
        };

        let scaleCanvas = (c) => {
            let ctx = c.getContext("2d");
            let dpr = window.devicePixelRatio || 1;
            let bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

            let ratio = dpr / bsr;

            let oldWidth = c.width;
            let oldHeight = c.height;

            c.width = oldWidth * ratio;
            c.height = oldHeight * ratio;

            c.style.width = oldWidth + 'px';
            c.style.height = oldHeight + 'px';

            ctx.scale(ratio, ratio);
        };

        let rToD = (rad) => rad / Math.PI * 180;
        let dToR = (deg) => deg / 180 * Math.PI;
        let pToR = (percent) => dToR(percent / 100 * 360);
        let rToP = (rad) => rToD(rad) / 360 * 100;

        let rAF = ((c) => window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (c) {
            window.setTimeout(c, 1000 / 60);
        })();

        return this.each((idx, element) => {
            let el = $(element);
            let cache = {};
            let _data = el.data();
            for (let key in _data) {
                if (_data.hasOwnProperty(key) && key.indexOf('_cache_') === 0) {
                    if (defaults.hasOwnProperty(key.substring(7))) {
                        cache[key.substring(7)] = _data[key];
                    }
                }
            }

            let settings = Object.assign({}, defaults, cache, _data, options);
            for (let key in settings) {
                if (settings.hasOwnProperty(key) && key.indexOf('_cache_') !== 0)
                    el.data('_cache_' + key, settings[key]);
            }
            if (!$("canvas.circleChart_canvas", el).length) {
                el.append(function () {
                    return $('<canvas/>', {'class': 'circleChart_canvas'}).prop({
                        width: settings.size,
                        height: settings.size
                    }).css(settings.autoCss
                        ? {
                            "margin-left": "auto",
                            "margin-right": "auto",
                            "display": "block"
                        }
                        : {});
                });
                scaleCanvas($("canvas", el).get(0));
            }
            if (!$("p.circleChart_text", el).length) {
                let target_parts_goal = '';
                try{
                    target_parts_goal = settings.text();
                }catch(e){
                    throw Error('You have to set theoricalPartCount');
                }

                if (settings.textIn) {
                    el.append("<p class='circleChart_text'>"
                    + "<span class='circleChart_value'>" + Math.round( (settings.value * 100 / settings.targetOee) )  + "<sup class='unit_percent'>%</sup></span>"
                    + "<span class='circleChart_part_count'>" + settings.producedPartCount + "</span>"
                    + "<span class='circleChart_part_text'>PARTS</span></p>"
                    + "<p class='circleChart-text-behind'>" + settings.text() + "</p>");
                    if (settings.autoCss) {
                        if (settings.textCenter) {
                            $("p.circleChart_text", el).css({
                                "display": "block",
                                "position": "absolute",
                                "top": 0,
                                "left": 0,
                                "text-align": "center",
                                "width": "100%" ,
                                "margin-top": (settings.size/5 + "px"),
                                "padding": 0,
                                "vertical-align": "middle",
                                "font-family": settings.textFamily
                            });
                            $("span.circleChart_value", el).css({
                                "display": "block",
                                "width": "100%",
                                //"line-height": (settings.size/1.5 + "px"),
                                "font-weight": "bold",
                                "color" : settings.textColor.valueColor,
                                "font-size": settings.textSize !== false
                                    ? settings.textSize
                                    : settings.size * settings.relativeTextSize,
                                // "font-weight": settings.textWeight,
                            });
                            $("sup.unit_percent", el).css({
                                "color" : settings.textColor.percentSymbolColor,
                                "font-size": "56px",
                                "line-height": "56px",
                                "text-align": "center",
                                "width": "42px"
                            });
                            $("span.circleChart_part_count", el).css({
                                "color" : settings.textColor.producedPartCountColor,
                                "line-height": "115px",
                                "display": "block",
                                "width": "100%",
                                "font-size": "96px",
                                "font-weight": "bold",
                                "text-align": "center"
                            });
                            $("span.circleChart_part_text", el).css({
                                "color" : settings.textColor.partsTextColor,
                                'text-align': 'center',
                                'display': 'block',
                                'width': '100%',
                                'font-size': '32px',
                                'font-weight': 'lighter',	
                                'line-height': '38px'
                            });
                            $("p.circleChart-text-behind", el).css({
                                "color" : settings.textColor.partsBehindTextColor,
                                'height': '28px',
                                'font-size': '24px',	
                                'font-weight': 'bold',
                                'line-height': '28px',
                                'text-align': 'center'
                            });
                            
                        }
                    }
                }
            } else {
                if(settings.textIn){
                    $('.circleChart_part_count', el).text(settings.producedPartCount);
                    $('.circleChart_value', el).contents()
                    .filter(function(){ return this.nodeType == 3; })
                    .first()
                    .replaceWith(Math.round( (settings.value * 100 / settings.targetOee) ));
                }
            }

            if (settings.autoCss) {
                el.css("position", "relative");
            }

            if (!settings.redraw) {
                settings.cAngle = settings.currentCAngle
                    ? settings.currentCAngle
                    : settings.cAngle;
                settings.startAngle = settings.currentStartAngle
                    ? settings.currentStartAngle
                    : settings.startAngle;
            }

            let c = $("canvas", el).get(0);
            let ctx = c.getContext("2d");

            let units = {
                'percent': pToR,
                'rad': (e) => e,
                'default': dToR
            };

            let f = (units[settings.unit] || units['default']);
            let bAngle = f(settings.startAngle);
            let eAngle = f(settings.value * 100);
            let cAngle = f(settings.cAngle);

            let pos = settings.size / 2;
            let radius = pos * (1 - settings.widthRatio / 2);
            let lineWidth = radius * settings.widthRatio;
            let circle = Circle(pos, bAngle, eAngle, cAngle, radius, lineWidth, cAngle, settings);
            el.data("size", settings.size);
            if (!settings.animate) {
                circle.cAngle = circle.eAngle;
                rAF(() => {
                    ctx.clearRect(0, 0, settings.size, settings.size);
                    if (settings.background) {
                        circle.drawBackground(ctx);
                    }
                    if (settings.value !== 0) {
                        circle.draw(ctx);
                        circle.drawTarget(ctx);
                        circle.setCurrentAnglesData(el);
                    } else {
                        if (circle.settings.background) {
                            circle.drawBackground(ctx);
                        }
                    }
                    circle.onDraw(el);
                });
            } else {
                if (settings.value !== 0) {
                    circle.animate(el, ctx, new Date().getTime(), new Date().getTime(), cAngle > eAngle);
                } else {
                    rAF(() => {
                        ctx.clearRect(0, 0, settings.size, settings.size);
                        if (circle.settings.background) {
                            circle.drawBackground(ctx);
                        }
                        circle.onDraw(el);
                    });
                }
            }
        });
    };
}(jQuery));
