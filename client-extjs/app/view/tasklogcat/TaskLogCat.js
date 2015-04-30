/**
 * Created by reinhard on 4/29/15.
 */
Ext.define('FileBot.view.tasklogcat.TaskLogCat', {
    extend: 'Ext.panel.Panel',
    requires: [
        /* include classes required by this component here */
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
        fieldCls: 'logcatviewer',
        emptyText: '$ logcat',
        scrollable: true,
        focusable: false,
        editable: false
    }]

});
