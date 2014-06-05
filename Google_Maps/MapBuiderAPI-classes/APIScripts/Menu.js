/// <reference path="../Scripts/jquery-ui-1.10.4.min.js" />
/// <reference path="../Scripts/jquery-ui-1.10.4.js" />
/// <reference path="../Scripts/jquery-2.1.1.js" />
/// <reference path="google-maps-3-vs-1-0.js" />

var menu = (function (maps) {
    var mediator,
        menuMap,
        menuItems = (function () {
            button = (function () {
                var editingOnHandlerObject = {
                    type: 'editingModeOn', handler: show
                },
                    editingOffHandlerObject = {
                        type: 'editingModeOff', handler: hide
                    }, createdHidden = true;

                var Button = function (controlContent, events, position, createdHidden) {
                    this.html = createButtonControl(controlContent, createdHidden);
                    this.map = menuMap;
                    this.position = position;
                    this.map.controls[position].push(this.html);

                    var self = this;
                    events.forEach(function (e) {
                        mediator.subscribe(self.html, e.type, e.handler);
                    });
                };

                var blockButton = (function () {
                    var position = maps.ControlPosition.LEFT,
                        saveBlocksButtonPos = maps.ControlPosition.BOTTOM_LEFT;

                    function create(buttonAction) {
                        var button;
                        switch (buttonAction) {
                            case 'delete':
                                // create 'delete button'
                                button = new Button('Delete Block', [{
                                    type: 'click', handler: publish('blockDeleted blockUnselected')
                                }, {
                                    type: 'blockSelected', handler: show
                                }, {
                                    type: 'blockUnselected editingModeOff', handler: hide
                                }], position, createdHidden);
                                break;
                            case 'build':
                                // When button is clicked block is not necessary created. 
                                // 'blockButtonClicked' is fired and then builder fires 'blockCanbeBuilt'
                                // if at least 3 markers are present.
                                button = new Button('Build Block', [{
                                    type: 'click', handler: publish('blockButtonClicked')
                                }, {
                                    type: 'blockCanBeBuilt', handler: showBlockWindow
                                }, editingOnHandlerObject, editingOffHandlerObject], position, createdHidden);
                                break;
                            case 'saveAll':
                                button = new Button('Save Blocks',
                                    [{
                                        type: 'click', handler: publish('saveBlocks blockUnselected')
                                    }, {
                                        type: 'editingModeOn', handler: show
                                    }, { type: 'editingModeOff', handler: hide }], saveBlocksButtonPos, createdHidden);
                                break;
                            default:
                        }

                        return button;
                    }

                    function showBlockWindow() {
                        var dialogForm = $("#dialog-form"),
                            name = dialogForm.find('#name'),
                            description = dialogForm.find('#description'),
                            blockInfo;

                        name.val('');
                        description.val('');
                        //dialogForm.css('position', 'abslolute');
                        dialogForm.dialog({
                            autoOpen: false,
                            height: 400,
                            width: 350,
                            modal: true,
                            position: 'center',
                            buttons: {
                                "Create Block": function submitBlockInfo() {                                  

                                    if (name.val().length < 6) {
                                        name.addClass("ui-state-error");
                                        displayError("Block name must be at least 6 characters long!");

                                    } else {
                                        blockInfo = { name: name.val(), description: description.val() };
                                        mediator.publish('blockCreated pointUnselected', blockInfo);
                                        $(this).dialog("close");
                                    }
                                }
                            }
                        });
                        dialogForm.dialog('open');
                    }

                    function displayError(t) {
                        var errorContainer = $('#error-content');

                        errorContainer.text(t)
                            .addClass("ui-state-highlight");

                        setTimeout(function () {
                            errorContainer.text('Fill in block name and description')
                                .removeClass("ui-state-highlight");
                        }, 2500);
                    }

                    return {
                        create: create
                    };
                })();

                var pointButton = (function () {
                    var position = maps.ControlPosition.RIGHT;

                    function create(buttonAction) {
                        var button;

                        switch (buttonAction) {
                            case 'deleteAll':
                                button = new Button('Delete all points',
                                    [{
                                        type: 'click', handler: publish('allPointsDeleted pointUnselected')
                                    }, editingOnHandlerObject, editingOffHandlerObject], position, createdHidden);
                                break;
                            case 'delete':
                                button = new Button('Delete Point',
                                    [{
                                        type: 'click', handler: publish('pointDeleted pointUnselected')
                                    }, {
                                        type: 'pointSelected', handler: show

                                    }, {
                                        type: 'pointUnselected editingModeOff', handler: hide
                                    }], position, createdHidden);
                                break;
                            default:
                        }

                        return button;
                    }

                    return {
                        create: create
                    };

                })();

                var globalButton = (function () {
                    var position = maps.ControlPosition.TOP,
                        editingModeOn = false;


                    function toggleEditingMode() {
                        var editingModeOnEvent = 'editingModeOn',
                            editingModeOffEvent = 'editingModeOff';

                        editingModeOn = !editingModeOn;

                        if (editingModeOn) {
                            mediator.publish(editingModeOnEvent);
                            $(this).find('.control').first().html('Disable editing');
                        } else {
                            mediator.publish(editingModeOffEvent + ' pointUnselected blockUnselected');
                            $(this).find('.control').first().html('Enable editing');                            
                        }
                    }

                    function create(buttonAction) {
                        var button;
                        switch (buttonAction) {
                            case 'edit':
                                button = new Button('Enable editing', [{ type: 'click', handler: toggleEditingMode }], position);
                                break;
                            default:
                                break;
                        }

                        return button;
                    }

                    return {
                        create: create
                    };
                })();

                // 'this' refers to 'self.html'. See  event handling attachment in 'Button'.
                // #region visibility
                function show() {
                    $(this).removeClass('control-container-hidden');
                }

                function hide() {
                    $(this).addClass('control-container-hidden');
                }
                // #endregion

                function createButtonControl(controlName, createdHidden) {
                    var buttonHTML = '<div class="control-container">' +
                        '<div class="control">' + controlName + '</div></div>',
                        container = $(buttonHTML);

                    if (createdHidden === true) {
                        container.addClass('control-container-hidden');
                    }

                    // return the 'Element' object.
                    return container[0];
                }

                function publish(eventType) {
                    return function () { mediator.publish(eventType); };
                }
                // Creates button based on its type
                function create(buttonSubType) {
                    var separatorIndex = buttonSubType.indexOf('.'),
                        supType = buttonSubType.substr(0, separatorIndex),
                        buttonAction = buttonSubType.substr(separatorIndex + 1);

                    switch (supType) {
                        case 'block':
                            blockButton.create(buttonAction); // TODO: should return button.
                            break;
                        case 'point':
                            pointButton.create(buttonAction);
                            break;
                        case 'global':
                            globalButton.create(buttonAction);
                            break;
                        default:
                    }
                }

                return {
                    create: create
                };
            })();
    
            function create(menuItemType) {
                var separatorIndex = menuItemType.indexOf('.');
                var itemMainType = menuItemType.substr(0, separatorIndex);
                var itemSubType = menuItemType.substr(separatorIndex + 1),
                    item;

                switch (itemMainType) {
                    case 'button':
                        item = button.create(itemSubType);
                        break;                   
                    default:
                        break;
                }
            }

            return {
                create: create
            };
        })();

    function Menu(map, menuPosition, eventMediator) {
        this.map = map;
        this.menuPosition = menuPosition || maps.ControlPosition.TOP_CENTER;
        this.controls = [];
        // TODO: 'mediator' should be initialized in 'create' as this constructor will be hidden.
        mediator = eventMediator;

        menuMap = map;
    }

    function create(isEditMode) {
        if (isEditMode) {
            createEditModeMenu();
        }
    }

    function createEditModeMenu() {
        // Buttons will be added to the map in their 'create' functions
        // In the order they were invoked.
        var startEditingButton = menuItems.create('button.global.edit'),
            createBlockButton = menuItems.create('button.block.build'),
            deleteBlockButton = menuItems.create('button.block.delete'),
            saveAllBlocksButton = menuItems.create('button.block.saveAll'),
            deleteAllPointsButton = menuItems.create('button.point.deleteAll'),
            deletePointButton = menuItems.create('button.point.delete');
            
    }

    return {
        Menu: Menu,
        create: create
    };
})(google.maps);
