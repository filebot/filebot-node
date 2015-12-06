/**
 * Created by reinhard on 4/29/15.
 */
Ext.define('FileBot.view.tasklogcat.TaskLogCat', {
    extend: 'Ext.panel.Panel',
    requires: [
        'FileBot.view.tasklogcat.TaskLogCatController'
    ],
    xtype: 'tasklogcat',

    viewModel: {
        type: 'tasklogcat'
    },
    controller: 'tasklogcat',

    layout: {
            type: 'hbox',
            align: 'stretch'
    },
    frame: false,
    autoScroll: true,
    autoWidth: true,
    scrollable: true,
    focusable: false,
    editable: false,
    flex: 1,
    border: 0,

    items: [{
        xtype: 'textarea',
        id: 'logcatviewer',
        fieldCls: 'logcatviewer',
        emptyText: '$ logcat',
        scrollable: false,
        focusable: false,
        editable: false,
        flex: 1,
        border: 0
    }]

});
