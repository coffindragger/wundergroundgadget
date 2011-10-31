
(function($) {

    var PLUGIN = "WundergroundConditions";

    var methods = {
        init: function (config) {
            var options = {
                'api_key': "{key}",
                'zipcode': 97401,

            }
            $.extend(options, config)
            return this.each(function() {
                var $this = $(this),
                    data = $this.data(PLUGIN);

                if (!data) {
                    data = {
                        target: $this,
                    };
                    $this.data(PLUGIN, data);




                    //TODO: Constructor
                    $.get("http://api.wunderground.com/api/"+options.api_key+"/conditions/q/"+zipcode+".json", function(obj) {
                        data.conditions = obj.current_observation;
                        $this[PLUGIN]('update');
                    });

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


        // Class Methods
        update: function() {
            return this.each(function() {
                var $this = $(this),
                data = $this.data(PLUGIN);
                console.log(data);

                data.target.append('<img src="'+data.conditions.icon_url+'"/> <span class="temp">'+data.conditions.temp_f+'</span><span class="degF">&deg; F</span>');
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

