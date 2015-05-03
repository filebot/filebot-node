/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('FileBot.view.task.Task', {
    extend: 'Ext.container.Container',
    requires: [
        'FileBot.view.task.TaskController',
        'FileBot.view.task.TaskModel',
        'FileBot.view.taskmanager.TaskManager',
        'FileBot.view.tasklogcat.TaskLogCat',
        'FileBot.store.RenameActions',
        'FileBot.store.MediaLabels'
    ],

    xtype: 'section-task',

    controller: 'task',
    viewModel: {
        type: 'task'
    },

    listeners: {
        afterrender: 'restoreState'
    },

    defaults: {
        collapsible: true,
        split: true,
        scrollable: true,
        floatable: false,
        bodyPadding: 10
    },

    layout: 'border',

    items: [{
        region: 'center',
        xtype: 'form',
        title: 'Organize Files',
        headerPosition: 'left',
        bodyPadding: 20,
        collapsible: false,
        items: [{
            xtype: 'fieldset',
            title: 'Basic Options',
            collapsible: false,
            defaults: {
                anchor: '100%'
            },
            items: [{
                xtype: 'hidden',
                name: 'fn',
                value: 'amc',
                hidden: true
            }, {
                xtype: 'textfield',
                fieldLabel: 'Input Folder',
                name: 'input',
                emptyText: '/path/to/input',
                allowBlank: false
            }, {
                xtype: 'combobox',
                fieldLabel: 'Input Type',
                name: 'label',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'media-labels'
                },
                forceSelection: true,
                editable: false,
                queryMode: 'local'
            }, {
                xtype: 'checkboxfield',
                name: 'strict',
                fieldLabel: 'Strict Mode',
                boxLabel: 'enabled'
            }, {
                xtype: 'combobox',
                fieldLabel: 'Rename Action',
                name: 'action',
                displayField: 'label',
                valueField: 'value',
                value: 'duplicate',
                store: {
                    type: 'rename-actions'
                },
                forceSelection: true,
                editable: false,
                queryMode: 'local'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Output Folder',
                name: 'output',
                emptyText: '/path/to/output',
                allowBlank: false
            }]
        }, {
            xtype: 'fieldset',
            collapsible: true,
            collapsed: false,
            
            title: 'Advanced Options',
            defaults: {
                anchor: '100%'
            },
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Filter',
                name: 'filter',
                emptyText: 'age < 7'
            }, {
                xtype: 'checkboxfield',
                name: 'clean',
                fieldLabel: 'Clean',
                boxLabel: 'empty folders and clutter files'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Movie Format',
                name: 'movieFormat',
                emptyText: 'Movies/{n} {y}/{fn}'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Series Format',
                name: 'seriesFormat',
                emptyText: 'TV/{n}/{\'S\'+s}/{fn}'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Anime Format',
                name: 'animeFormat',
                emptyText: 'Anime/{n}/{fn}'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Music Format',
                name: 'musicFormat',
                emptyText: 'Music/{n}/{fn}'
            }]
        }],
        
        buttons: [{
            xtype: 'splitbutton',
            formBind: true,
            scale: 'small',
            iconCls: 'run-btn',
            text: 'Execute',
            // handle a click on the button itself
            handler: 'onExecute',
            menu: new Ext.menu.Menu({
                items: [
                    // these will render as dropdown menu items when the arrow is clicked:
                    {text: 'Dry Run', handler: 'onTest'},
                    {text: 'Schedule', handler: 'onSchedule'}
                ]
            }),
            style:'margin-right: 3em'
        }]
    }, {
        xtype: 'container',
        region: 'south',
        frame: true,
        layout: 'border',
        height: 200,
        scrollable: false,

        items: [{
            region: 'west',
            xtype: 'taskmanager',
            headerPosition: 'left',
            collapsible: true,
            floatable: false,
            overflowY: 'auto',
            width: 325
        }, {
            region: 'center',
            xtype: 'tasklogcat',
            collapsible: false,
            floatable: false,
            scrollable: true
        }]
    }]
});