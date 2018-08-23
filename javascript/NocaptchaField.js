var _noCaptchaFields=_noCaptchaFields || [];

// Retain which form is being challenged
// So we can submit it with callback
var formToSubmit = null;

function noCaptchaFieldRender() {
    // Default event when form is submitted
    // Will trigger invisble recaptcha
    var submitListener=function(e) {
        formToSubmit = e.target;
        var recaptchaWidget = formToSubmit.querySelectorAll('[data-widgetid]')[0];

        // We need to pass the widget_id to the grecaptcha method
        // Just in case there are multiple forms on the page
        if (recaptchaWidget) {
            e.preventDefault();
            var widget_id = recaptchaWidget.getAttribute('data-widgetid');
            grecaptcha.execute(widget_id);
        }
    };
    
    for(var i=0;i<_noCaptchaFields.length;i++) {
        var field=document.getElementById('Nocaptcha-'+_noCaptchaFields[i]);
        
        // For the invisible captcha we need to setup some callback listeners
        // Also check that the recaptcha is not already initialised (in case of multiple form on a page and ajax refresh call)
        if(field.getAttribute('data-size')=='invisible' && field.getAttribute('data-widgetid') == null) {
            var form=document.getElementById(field.getAttribute('data-form'));
            var superHandler=false;
            var formValidator = false;

            // Check if form validator is applied to this form
            if(typeof jQuery!='undefined' && typeof jQuery.fn.validate!='undefined') {
                formValidator=jQuery(form).data('validator');
            }

            // If jas validator, use superhandler
            if(typeof formValidator !== 'undefined' &&  formValidator !== false) {
                var superHandler=formValidator.settings.submitHandler;
                formValidator.settings.submitHandler=function(form) {
                    formToSubmit = form;
                    grecaptcha.execute(field.getAttribute('data-widgetid'));
                };
            }
            // Otherwise set custom listener for submit event
            else {
                if(form && form.addEventListener) {
                    form.addEventListener('submit', submitListener);
                }else if(form && form.attachEvent) {
                    window.attachEvent('onsubmit', submitListener);
                }else if(console.error) {
                    console.error('Could not attach event to the form');
                }
            }
            
            // Default callback method
            // var currentForm is set in the listener instead of using the form var 
            // in this loop as it would mean if there are multiple forms, only the last one in the 
            // loop would be submitted
            if (field.getAttribute('data-callback') == null) {
                window['Nocaptcha-'+_noCaptchaFields[i]] = function(token) {
                    if(typeof jQuery!='undefined' && typeof jQuery.fn.validate!='undefined' && superHandler) {
                        superHandler(formToSubmit);
                    }else {
                        formToSubmit.submit();
                    }
                };
            }
        }
        
        // Initialise fields that haven;t been initialised yet
        if (field.getAttribute('data-widgetid') == null) {
            var options={
                'sitekey': field.getAttribute('data-sitekey'),
                'theme': field.getAttribute('data-theme'),
                'type': field.getAttribute('data-type'),
                'size': field.getAttribute('data-size'),
                'badge': field.getAttribute('data-badge'),
                'callback': (field.getAttribute('data-callback') ? field.getAttribute('data-callback') : 'Nocaptcha-'+_noCaptchaFields[i])
            };
            
            var widget_id = grecaptcha.render(field, options);
            field.setAttribute("data-widgetid", widget_id);
        }        
    }
}
