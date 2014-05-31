/// <reference path="../Scripts/jquery-2.1.1.js" />
var Menu = (function (maps) {
    var Control = (function () {
        function Control(controlType, controlName, controlHadlers) {
            var self = this;
            this.name = controlName;
            this.controlHandlers = controlHadlers;
            this.container = create(controlType, controlName);

            controlHadlers.forEach(function (handler) {
                $(self.container).on(handler.type, handler.func);
            });
        }

        function createButtonControl(controlName) {
            var container = $(DIV_HTML).addClass('control-container'),
                control = $(DIV_HTML).addClass('control').html(controlName);

            container.append(control);

            return container[0];
        }

        // Depending on controlType different creation methods will be called and
        // menu items will be created. 
        function create(controlType, controlName) {
            // later 'controlType' will be used to create control form based on predifined type.
            return createButtonControl(controlName);
        }

        return Control;
    })(),
    DIV_HTML = '<div></div>';

    function Menu(map, menuPosition) {
        this.map = map;
        this.menuPosition = menuPosition || maps.ControlPosition.TOP_CENTER;
        this.controls = [];
    };

    Menu.prototype.addControl = function (controlType, controlName, controlHandlers) {
        var control = new Control(controlType, controlName, controlHandlers);
        this.controls.push(control);        
        this.map.controls[this.menuPosition].push(control.container);
    };

    return Menu;
})(google.maps);
