/**
 * Created by reinhard on 4/29/15.
 */
Ext.define('FileBot.view.tasklogcat.TaskLogCat', {
    extend: 'Ext.container.Container',
    requires: [
        'FileBot.view.tasklogcat.TaskLogCatController'
    ],
    xtype: 'tasklogcat',

    viewModel: {
        type: 'tasklogcat'
    },
    controller: 'tasklogcat',

    layout: 'fit',
    frame: false,

    items: [{
        xtype: 'textarea',
        id: 'logcatviewer',
        fieldCls: 'logcatviewer',
        emptyText: '$ logcat',
        scrollable: true,
        focusable: false,
        editable: false,
        cols: '80',
        rows: '25'
    }]

});
