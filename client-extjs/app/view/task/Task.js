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
        'FileBot.Node',
        'FileBot.view.task.TaskController',
        'FileBot.view.task.TaskModel',
        'FileBot.view.taskmanager.TaskManager',
        'FileBot.view.tasklogcat.TaskLogCat',
        'FileBot.store.RenameActions',
        'FileBot.store.MediaLabels',
        'FileBot.store.EpisodeOrders',
        'FileBot.store.LogLevels',
        'FileBot.store.ArchiveOptions',
        'FileBot.store.VideoLengthFilters',
        'FileBot.store.FileSizeFilters',
        'FileBot.store.FileAgeFilters',
        'FileBot.store.Languages',
        'FileBot.store.ConflictActions',
        'FileBot.store.ScriptSources',
        'FileBot.store.MovieDatabases',
        'FileBot.store.SeriesDatabases'
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
                xtype: 'combobox',
                name: 'input',
                fieldLabel: 'Input Folder',
                emptyText: '/path/to/input',
                value: Ext.manifest.server.form.input,
                bind: {
                    store: '{folders}'
                },
                displayField: 'path',
                valueField: 'path',
                minChars: 0, // forcing the query to run every time by setting minChars to 0
                queryCaching: true,
                queryParam: 'q',
                queryMode: 'remote',
                forceSelection: false,
                editable: true,
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
                editable: false,
                minWidth: 280
            }, {
                xtype: 'checkboxfield',
                name: 'strict',
                fieldLabel: 'Strict Mode',
                boxLabel: 'use strict mode',
                inputValue: 'no',
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
                editable: false,
                minWidth: 280
            }, {
                xtype: 'combobox',
                name: 'output',
                fieldLabel: 'Output Folder',
                emptyText: '/path/to/output',
                value: Ext.manifest.server.form.output,
                bind: {
                    store: '{folders}'
                },
                displayField: 'path',
                valueField: 'path',
                minChars: 0, // forcing the query to run every time by setting minChars to 0
                queryCaching: true,
                queryParam: 'q',
                queryMode: 'remote',
                forceSelection: false,
                editable: true,
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
                xtype: 'combobox',
                name: 'order',
                fieldLabel: 'Episode Order',
                displayField: 'label',
                valueField: 'value',
                value: 'Airdate',
                store: {
                    type: 'episode-orders'
                },
                editable: false,
                minWidth: 280
            }, {
                xtype: 'combobox',
                name: 'subtitles',
                fieldLabel: 'Subtitles',
                displayField: 'label',
                valueField: 'iso_639_3',
                store: {
                    type: 'languages'
                },
                emptyText: 'subtitle language',
                forceSelection: false,
                editable: true,
                allowBlank: true,
                minWidth: 320
            }, {
                xtype: 'combobox',
                name: 'lang',
                fieldLabel: 'Language',
                displayField: 'label',
                valueField: 'iso_639_1',
                value: 'en',
                store: {
                    type: 'languages'
                },
                emptyText: 'language',
                editable: false,
                minWidth: 320
            }]
        }, {
            title: 'File Options',
            defaults: {
                allowBlank: true,
                forceSelection: true,
                queryMode: 'local'
            },
            items: [{
                xtype: 'combobox',
                name: 'conflict',
                fieldLabel: 'Conflict',
                labelStyle: 'white-space: nowrap; width: 120px;',
                displayField: 'label',
                valueField: 'value',
                value: 'auto',
                store: {
                    type: 'conflict-actions'
                },
                editable: false,
                minWidth: 320
            }, {
                xtype: 'combobox',
                name: 'archives',
                fieldLabel: 'Archives',
                labelStyle: 'white-space: nowrap; width: 120px;',
                displayField: 'label',
                valueField: 'value',
                value: 'skip',
                store: {
                    type: 'archive-options'
                },
                editable: false,
                minWidth: 320
            }, {
                xtype: 'checkboxfield',
                name: 'music',
                fieldLabel: 'Music',
                labelStyle: 'white-space: nowrap; width: 120px;',
                boxLabel: 'skip music files',
                inputValue: 'no',
                checked: false
            }, {
                xtype: 'checkboxfield',
                name: 'unsorted',
                fieldLabel: 'Unsorted Files',
                labelStyle: 'white-space: nowrap; width: 120px;',
                boxLabel: 'skip unsorted files',
                inputValue: 'no',
                checked: false
            }, {
                xtype: 'textfield',
                name: 'ignore',
                fieldLabel: 'Ignore Rules',
                labelStyle: 'white-space: nowrap; width: 120px;',
                emptyText: 'games|books',
                anchor: '100%'
            }, {
                xtype: 'combobox',
                name: 'minLengthMS',
                fieldLabel: 'Video Duration',
                labelStyle: 'white-space: nowrap; width: 120px;',
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
                fieldLabel: 'File Size',
                labelStyle: 'white-space: nowrap; width: 120px;',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'filesize-filters'
                },
                editable: false
            }, {
                xtype: 'combobox',
                name: 'minFileAge',
                fieldLabel: 'File Age',
                labelStyle: 'white-space: nowrap; width: 120px;',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'fileage-filters'
                },
                editable: false
            }, {
                xtype: 'checkboxfield',
                name: 'excludeLink',
                fieldLabel: 'Exclude Link',
                labelStyle: 'white-space: nowrap; width: 120px;',
                boxLabel: 'skip superfluous links',
                checked: false
            }, {
                xtype: 'textfield',
                name: 'excludeList',
                fieldLabel: 'Exclude List',
                labelStyle: 'white-space: nowrap; width: 120px;',
                emptyText: 'exclude file that keeps track of processed files',
                value: '.excludes',
                anchor: '100%'
            }]
        }, {
            title: 'Match Options',
            defaults: {
                allowBlank: true,
                xtype: 'textfield',
                anchor: '100%'
            },
            items: [{
                xtype: 'textfield',
                name: 'query',
                fieldLabel: 'Query Expression',
                labelStyle: 'white-space: nowrap; width: 120px;',
                emptyText: '70327',
                allowBlank: true,
                anchor: '100%'
            }, {
                xtype: 'textfield',
                name: 'filter',
                fieldLabel: 'Match Filter',
                labelStyle: 'white-space: nowrap; width: 120px;',
                emptyText: 'age < 7',
                allowBlank: true,
                anchor: '100%'
            }, {
                xtype: 'textfield',
                name: 'mapper',
                fieldLabel: 'Match Mapper',
                labelStyle: 'white-space: nowrap; width: 120px;',
                emptyText: 'order.absolute.episode',
                allowBlank: true,
                anchor: '100%'
            }]
        }, {
            title: 'Format Options',
            defaults: {
                allowBlank: true,
                xtype: 'textfield',
                anchor: '100%'
            },
            items: [{
                fieldLabel: 'Movie Format',
                labelStyle: 'white-space: nowrap; width: 120px;',
                name: 'movieFormat',
                emptyText: '{plex}'
            }, {
                fieldLabel: 'Series Format',
                labelStyle: 'white-space: nowrap; width: 120px;',
                name: 'seriesFormat',
                emptyText: '{plex}'
            }, {
                fieldLabel: 'Anime Format',
                labelStyle: 'white-space: nowrap; width: 120px;',
                name: 'animeFormat',
                emptyText: '{plex}'
            }, {
                fieldLabel: 'Music Format',
                labelStyle: 'white-space: nowrap; width: 120px;',
                name: 'musicFormat',
                emptyText: '{plex}'
            }, {
                fieldLabel: 'Unsorted Format',
                labelStyle: 'white-space: nowrap; width: 120px;',
                name: 'unsortedFormat',
                emptyText: 'Unsorted/{relativeFile}'
            }]
        }, {
            title: 'Post Processing Options',
            defaults: {
                allowBlank: true,
                xtype: 'textfield',
                anchor: '100%'
            },
            items: [{
                xtype: 'checkboxfield',
                name: 'import',
                fieldLabel: 'Import Extras',
                boxLabel: 'copy companion files along from the original folder to the destination folder',
                checked: false
            }, {
                xtype: 'checkboxfield',
                name: 'metadata',
                fieldLabel: 'Export Xattr',
                boxLabel: 'copy xattr metadata into hidden .xattr folders',
                checked: false
            }, {
                xtype: 'checkboxfield',
                name: 'chmod',
                fieldLabel: 'Set Permissions',
                boxLabel: 'set permissions to all-readable / user-writable (rw-r--r--)',
                checked: false
            }, {
                name: 'exec',
                fieldLabel: 'Run Program',
                emptyText: 'stat {quote f}'
            }, {
                name: 'plex',
                fieldLabel: 'Plex',
                emptyText: 'host:token'
            }, {
                name: 'kodi',
                fieldLabel: 'Kodi',
                emptyText: 'host'
            }, {
                name: 'emby',
                fieldLabel: 'Emby',
                emptyText: 'host:apikey'
            }, {
                name: 'pushover',
                fieldLabel: 'Pushover',
                emptyText: 'userkey:apikey'
            }, {
                name: 'pushbullet',
                fieldLabel: 'PushBullet',
                emptyText: 'apikey'
            }, {
                name: 'discord',
                fieldLabel: 'Discord',
                emptyText: 'webhook'
            }, {
                xtype: 'combobox',
                name: 'report',
                fieldLabel: 'Report Folder',
                emptyText: '.reports',
                value: Ext.manifest.server.form.output,
                bind: {
                    store: '{folders}'
                },
                displayField: 'path',
                valueField: 'path',
                minChars: 0, // forcing the query to run every time by setting minChars to 0
                queryCaching: true,
                queryParam: 'q',
                queryMode: 'remote',
                forceSelection: false,
                editable: true,
                anchor: '100%'
            }]
        }, {
            title: 'Database Options',
            defaults: {
                allowBlank: true,
                forceSelection: true,
                queryMode: 'local'
            },
            items: [{
                xtype: 'combobox',
                name: 'movieDB',
                fieldLabel: 'Movie Database',
                labelStyle: 'white-space: nowrap; width: 120px;',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'movie-databases'
                },
                editable: false,
                minWidth: 320
            }, {
                xtype: 'combobox',
                name: 'seriesDB',
                fieldLabel: 'Series Database',
                labelStyle: 'white-space: nowrap; width: 120px;',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'series-databases'
                },
                editable: false,
                minWidth: 320
            }, {
                xtype: 'combobox',
                name: 'animeDB',
                fieldLabel: 'Anime Database',
                labelStyle: 'white-space: nowrap; width: 120px;',
                displayField: 'label',
                valueField: 'value',
                value: '',
                store: {
                    type: 'series-databases'
                },
                editable: false,
                minWidth: 320
            }]
        }, {
            title: 'Developer Options',
            defaults: {
                allowBlank: true,
                forceSelection: true,
                queryMode: 'local'
            },
            items: [{
                xtype: 'combobox',
                name: 'channel',
                fieldLabel: 'Script Channel',
                displayField: 'label',
                valueField: 'value',
                value: 'fn',
                store: {
                    type: 'script-sources'
                },
                editable: false
            }, {
                xtype: 'combobox',
                name: 'log',
                fieldLabel: 'Log Level',
                displayField: 'label',
                valueField: 'value',
                value: 'all',
                store: {
                    type: 'log-levels'
                },
                editable: false
            }, {
                xtype: 'checkboxfield',
                name: 'probe',
                fieldLabel: 'Media Parser',
                boxLabel: 'disable media parser',
                inputValue: 'no',
                checked: false
            }, {
                xtype: 'checkboxfield',
                name: 'index',
                fieldLabel: 'Media Index',
                boxLabel: 'disable media index',
                inputValue: 'no',
                checked: false
            }]
        }],

        buttons: [{
            xtype: 'button',
            scale: 'small',
            iconCls: 'configure-btn',
            text: 'Tools',
            menu: new Ext.menu.Menu({
                items: [
                    // these will render as dropdown menu items when the arrow is clicked:
                    {text: 'License', handler: 'onLicense', iconCls: 'license-item' },
                    {text: 'Configure', handler: 'onConfigure', iconCls: 'configure-item' },
                    {text: 'Clear Cache', handler: 'onClear', iconCls: 'clear-item' },
                    {text: 'System Info', handler: 'onInfo', iconCls: 'sysinfo-item' },
                    {text: 'Environment', handler: 'onEnvironment', iconCls: 'environment-item' },
                    {text: 'Help', handler: 'onHelp', iconCls: 'help-item' }
                ]
            }),
            width: 80,
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
                    {text: 'Schedule', handler: 'onSchedule', iconCls: 'schedule-item'},
                    {text: 'Revert', handler: 'onRevert', iconCls: 'revert-item' },
                ]
            }),
            width: 110,
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
            scrollable: 'vertical',
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
