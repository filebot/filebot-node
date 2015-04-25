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
        'FileBot.store.RenameActions'
    ],

    xtype: 'section-task',

    controller: 'task',
    viewModel: {
        type: 'task'
    },

    defaults: {
        split: true,
        bodyPadding: 10,
        scrollable: true
    },

    layout: 'border',
    bodyBorder: true,

    items: [{
        region: 'center',
        collapsible: false,
        xtype: 'form',
        title: 'Organize Files',
        headerPosition: 'left',
        bodyPadding: 20,
        frame: true,
        items: [{
            xtype: 'fieldset',
            collapsible: false,
            title: 'Basic Options',
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
                allowBlank: false,
                value: '/Users/reinhard/Test/AMC-TEST'
            }, {
                xtype: 'combobox',
                fieldLabel: 'Input Type',
                name: 'label',
                displayField: 'label',
                store: {
                    type: 'media-labels'
                },
                value: 'Automatic',
                queryMode: 'local',
                forceSelection: true,
                editable: false,
                allowBlank: false
            }, {
                xtype: 'checkboxfield',
                name: 'strict',
                fieldLabel: 'Strict Mode',
                boxLabel: 'enabled'
            }, {
                xtype: 'combobox',
                fieldLabel: 'Rename Action',
                name: 'action',
                displayField: 'action',
                store: {
                    type: 'rename-actions'
                },
                value: 'Duplicate',
                queryMode: 'local',
                forceSelection: true,
                editable: false,
                allowBlank: false
            }, {
                xtype: 'textfield',
                fieldLabel: 'Output Folder',
                name: 'output',
                emptyText: '/path/to/output',
                allowBlank: false,
                value: '/Users/reinhard/Test/OUTPUT'
            }]
        }, {
            xtype: 'fieldset',
            collapsible: true,
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
            text: 'Test',
            formBind: true,
            listeners: {
                click: 'onTest'
            }
        }, {
            text: 'Execute',
            formBind: true,
            listeners: {
                click: 'onExecute'
            }
        }]
    }]
});
