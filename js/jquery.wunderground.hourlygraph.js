

(function($) {
    var PLUGIN = "WundergroundGadget"


    var methods = {
        init: function (config) {
            var options = {
                'zipcode': 97401,
                'width': 400,
                'height': 300,
                'num_hours': 36,
                'api_key': "{key}",
            }
            $.extend(options, config)
            return this.each(function() {
                var $this = $(this),
                    data = $this.data(PLUGIN);

                if (!data) {
                    data = {
                        'target': $this,
                        'options': options,
                        'paper': new Raphael(this, options.width, options.height),
                    }
                    $this.data(PLUGIN, data);

                    //Constructor
                    $.get("http://api.wunderground.com/api/"+options.api_key+"/hourly/q/"+zipcode+".json", function(obj) {
                        console.log(obj);
                        var forecast = {
                            temp: [],
                            min_temp: 100,
                            max_temp: 0,
                            precip: [],
                            dew: [],
                            humidity: [],
                            snow: [],
                            sky: [],
                        };

                        for (var i=0; i < obj.hourly_forecast.length; i++) {
                            var hour = obj.hourly_forecast[i];

                            var t = Number(hour.temp.english);
                            if (t < forecast.min_temp)
                                forecast.min_temp = t;
                            if (t > forecast.max_temp)
                                forecast.max_temp = t;
                            forecast.temp.push(t);
                            forecast.precip.push(Number(hour.pop));
                            forecast.dew.push(Number(hour.dewpoint.english));
                            forecast.humidity.push(Number(hour.humidity));
                            forecast.snow.push(Number(hour.snow.english));
                            forecast.sky.push(Number(hour.sky));
                        }
                        forecast.min_temp -= forecast.min_temp % 5;
                        forecast.max_temp += 5-(forecast.max_temp % 5);

                        data.forecast = forecast
                        console.log(data);
                        $this[PLUGIN]('update');
                    })


                }
            });
        },
        destroy: function() {
            return this.each(function() {
                var $this = $(this),
                data = $this.data(PLUGIN);


                //TODO: Destructor


                // remove data
                $this.removeData(PLUGIN);
                //unbind namespaced events
                $(window).unbind('.'+PLUGIN);
            });
        },
        update: function() {
            return this.each(function() {
                var $this = $(this),
                data = $this.data(PLUGIN);

                var x, y, i, p;
                var padding = 10;
                var y_unit = data.options.height / (data.forecast.max_temp - data.forecast.min_temp);
                var x_unit = (data.options.width - padding - 40) / data.options.num_hours;

                var tick_attrs = {
                    'stroke': "rgb(200,200,200)",
                    'stroke-width': "0.5",
                }
                var temp_attrs = {
                    'stroke': "rgba(155,145,130,128)",
                    'fill': "rgba(155,145,130,64)",
                }
                var precip_attrs = {
                    'stroke': "rgba(130,145,155,128)",
                    'fill': "rgba(130,145,155,64)",
                }
                var sky_attrs = {
                    'stroke': "rgba(130,245,155,128)",
                    'fill': "rgba(130,245,155,64)",
                }


                // temperature ticks
                y = data.options.height - padding;
                x = padding;
                p = ["M"+x+","+y];
                for (i = data.forecast.min_temp; i <= data.forecast.max_temp; i += 5) {
                    p.push("H"+(x+20));
                    p.push("M"+x+","+y);
                    data.paper.text(x, y, ""+i);
                    y -= y_unit*5;
                }
                data.paper.path(p.join(" ")).attr(tick_attrs);

                // precipitation ticks
                y_unit = data.options.height / 100;
                y = data.options.height - padding;
                x = data.options.width - padding;
                p = ["M"+x+","+y];
                for (i = 0; i < 100; i += 10) {
                    p.push("H"+(x-20));
                    p.push("M"+x+","+y);
                    data.paper.text(x, y, ""+i);
                    y -= y_unit*10;
                }
                data.paper.path(p.join(" ")).attr(tick_attrs);




                // temperature plot
                y_unit = data.options.height / (data.forecast.max_temp - data.forecast.min_temp);
                x = 20+padding;
                y = data.options.height - padding;
                p = ["M"+x+","+y]
                for (i=0; i < data.options.num_hours; i += 1) {
                    x = 20 + padding + i*x_unit;
                    y = data.options.height - padding - (data.forecast.temp[i] - data.forecast.min_temp)*y_unit;
                    p.push("L"+x+","+y);
                }
                p.push("L"+x+","+(data.options.height - padding))
                p.push("Z")
                data.paper.path(p.join(" ")).attr(temp_attrs);


                // cloudcover plot
                y_unit = data.options.height / 100;
                x = 20+padding;
                y = data.options.height - padding;
                p = ["M"+x+","+y];
                for (i=0; i < data.options.num_hours; i += 1) {
                    x = 20 + padding + i*x_unit;
                    y = data.options.height - padding - data.forecast.sky[i]*y_unit;
                    p.push("L"+x+","+y);
                }
                p.push("L"+x+","+(data.options.height - padding))
                p.push("Z")
                data.paper.path(p.join(" ")).attr(sky_attrs);



                // precipitation plot
                y_unit = data.options.height / 100;
                x = 20+padding;
                y = data.options.height - padding;
                p = ["M"+x+","+y];
                for (i=0; i < data.options.num_hours; i += 1) {
                    x = 20 + padding + i*x_unit;
                    y = data.options.height - padding - data.forecast.precip[i]*y_unit;
                    p.push("L"+x+","+y);
                }
                p.push("L"+x+","+(data.options.height - padding))
                p.push("Z")
                data.paper.path(p.join(" ")).attr(precip_attrs);




            });
        }


    };

    $.fn[PLUGIN] = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method == 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+'does not exist on jQuery.'+PLUGIN);
        }
    }

})(jQuery);

