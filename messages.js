$.fn.notify = function(settings_overwrite){
    settings = {
        placement:"top",
        default_class: ".message",
        delay:0
    };
    $.extend(settings, settings_overwrite);
    
    $(settings.default_class).each(function(){$(this).hide();});
    
    $(this).show().css(settings.placement, -$(this).outerHeight());
    obj = $(this);
    
    if(settings.placement == "bottom"){
        setTimeout(function(){obj.animate({bottom:"0"}, 500)},settings.delay);
    }
    else{
        setTimeout(function(){obj.animate({top:"0"}, 500)},settings.delay);
    }
}

/** begin notification alerts
-------------------------------------**/
$(document).ready(function ($) {
    $('.message').on('click', (function () {
        $(this).fadeTo('slow', 0, function() {
            $(this).slideUp("slow", function() {
                $(this).remove();
            });
        });
    }));
});

$(document).ready(function(){
    
$("#notify_deployment").notify({
        delay:500
    });

    $(".startGame").click(function(){
        $("#notify_wait").notify();
        return false;
    });	

    
});   