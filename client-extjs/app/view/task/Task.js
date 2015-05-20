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
        'FileBot.store.MediaLabels',
        'FileBot.store.LogLevels',
        'FileBot.store.VideoLengthFilters',
        'FileBot.store.FileSizeFilters',
        'FileBot.store.Languages'
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

        defaults: {
            xtype: 'fieldset',
            collapsible: true,
            collapsed: true
        },
        items: [{
            title: 'Organize Files',
            collapsible: false,
            collapsed: false,

            defaults: {
                allowBlank: false,
                forceSelection: true,
                queryMode: 'local'
            },
            items: [{
                xtype: 'hidden',
                name: 'fn',
                value: 'amc',
                hidden: true
            }, {
                xtype: 'textfield',
                name: 'input',
                fieldLabel: 'Input Folder',
                emptyText: '/path/to/input',
                value: Ext.manifest.server.form.input,
                anchor: '100%'
            }, {
                xtype: 'combobox',
                name: 'label',
                fieldLabel: 'Input Type',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'media-labels'
                },
                editable: false
            }, {
                xtype: 'checkboxfield',
                name: 'strict',
                fieldLabel: 'Strict Mode',
                boxLabel: 'enabled',
                checked: false
            }, {
                xtype: 'combobox',
                name: 'action',
                fieldLabel: 'Action',
                displayField: 'label',
                valueField: 'value',
                value: 'duplicate',
                store: {
                    type: 'rename-actions'
                },
                editable: false
            }, {
                xtype: 'textfield',
                name: 'output',
                fieldLabel: 'Output Folder',
                emptyText: '/path/to/output',
                value: Ext.manifest.server.form.output,
                anchor: '100%'
            }, {
                xtype: 'checkboxfield',
                name: 'artwork',
                fieldLabel: 'Artwork',
                boxLabel: 'fetch artwork and generate .nfo files',
                checked: false
            }, {
                xtype: 'checkboxfield',
                name: 'clean',
                fieldLabel: 'Clean',
                boxLabel: 'delete left behind clutter files',
                checked: false
            }, {
                xtype: 'textfield',
                name: 'filter',
                fieldLabel: 'Autodetection Filter',
                emptyText: 'restrict autodetection (e.g. age < 7)',
                allowBlank: true,
                anchor: '100%'
            }, {
                xtype: 'combobox',
                name: 'subtitles',
                fieldLabel: 'Subtitles',
                displayField: 'label',
                valueField: 'iso_639_3',
                store: {
                    type: 'languages'
                },
                emptyText: 'subtitle language (e.g. eng)',
                forceSelection: false,
                editable: true,
                allowBlank: true,
                minWidth: 320
            }]
        }, {
            title: 'File Filters',
            defaults: {
                allowBlank: true,
                forceSelection: true,
                queryMode: 'local'
            },
            items: [{
                xtype: 'checkboxfield',
                name: 'skipExtract',
                fieldLabel: 'Archives',
                boxLabel: 'skip and ignore archives',
                checked: false
            }, {
                xtype: 'textfield',
                name: 'ignore',
                fieldLabel: 'Ignore Rules',
                emptyText: 'regular expression',
                anchor: '100%'
            }, {
                xtype: 'combobox',
                name: 'minLengthMS',
                fieldLabel: 'Minimum Video Length',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'videolength-filters'
                },
                editable: false
            }, {
                xtype: 'combobox',
                name: 'minFileSize',
                fieldLabel: 'Minimum File Size',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'filesize-filters'
                },
                editable: false
            }, {
                xtype: 'textfield',
                name: 'excludeList',
                fieldLabel: 'Exclude List',
                emptyText: 'exclude file that keeps track of processed files (e.g. done.txt)',
                value: '.excludes',
                anchor: '100%'
            }]
        }, {
            title: 'Custom Formats',
            defaults: {
                allowBlank: true,
                xtype: 'textfield',
                anchor: '100%'
            },
            items: [{
                fieldLabel: 'Movie Format',
                name: 'movieFormat',
                emptyText: 'Movies/{n} {y}/{fn}'
            }, {
                fieldLabel: 'Series Format',
                name: 'seriesFormat',
                emptyText: 'TV/{n}/{fn}'
            }, {
                fieldLabel: 'Anime Format',
                name: 'animeFormat',
                emptyText: 'Anime/{n}/{fn}'
            }, {
                fieldLabel: 'Music Format',
                name: 'musicFormat',
                emptyText: 'Music/{n}/{fn}'
            }, {
                fieldLabel: 'File Format',
                name: 'unsortedFormat',
                emptyText: 'Unsorted/{fn}'
            }]
        }, {
            title: 'Automated Media Center',
            defaults: {
                allowBlank: true,
                xtype: 'textfield',
                anchor: '100%'
            },
            items: [{
                name: 'exec',
                fieldLabel: 'Run Program',
                emptyText: "touch '{file}'"
            }, {
                name: 'plex',
                fieldLabel: 'Plex',
                emptyText: 'host:token'
            }, {
                name: 'xbmc',
                fieldLabel: 'Kodi',
                emptyText: 'host'
            }, {
                name: 'pushover',
                fieldLabel: 'Pushover',
                emptyText: 'userkey:apikey'
            }, {
                name: 'pushbullet',
                fieldLabel: 'PushBullet',
                emptyText: 'apikey'
            }]
        }, {
            title: 'Logging',
            defaults: {
                allowBlank: true,
                forceSelection: true,
                queryMode: 'local'
            },
            items: [{
                xtype: 'combobox',
                name: 'log',
                fieldLabel: 'Log Level',
                displayField: 'label',
                valueField: 'value',
                value: 'info',
                store: {
                    type: 'log-levels'
                },
                editable: false
            }]
        }],

        buttons: [{
            xtype: 'button',
            scale: 'small',
            iconCls: 'donate-btn',
            text: 'Donate',
            handler: 'onDonate',
            style: 'left: 0em !important' // align this button to the left
        }, {
            xtype: 'button',
            scale: 'small',
            iconCls: 'configure-btn',
            text: 'Tools',
            menu: new Ext.menu.Menu({
                items: [
                    // these will render as dropdown menu items when the arrow is clicked:
                    {text: 'Configure', handler: 'onConfigure', iconCls: 'configure-item' },
                    {text: 'System Info', handler: 'onInfo', iconCls: 'sysinfo-item' },
                    {text: 'Help', handler: 'onHelp', iconCls: 'help-item' }
                ]
            }),
            style: 'left: 6em !important' // align this button to the left
        }, {
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
                    {text: 'Dry Run', handler: 'onTest', iconCls: 'dryrun-item'},
                    {text: 'Schedule', handler: 'onSchedule', iconCls: 'schedule-item'}
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