/**
 * Created by reinhard on 4/25/15.
 */
Ext.define('FileBot.view.taskmanager.TaskManager', {
    extend: 'Ext.grid.Panel',
    requires: [
        'FileBot.view.taskmanager.TaskManagerController',
        'FileBot.view.taskmanager.TaskManagerModel'
    ],
    viewModel: {
        type: 'taskmanager'
    },
    controller: 'taskmanager',
    xtype: 'taskmanager',

    bind: '{tasks}',

    width: 400,
    height: 200,

    columns: [
    {
        text: 'Date',
        dataIndex: 'id',
        width: 140,
        renderer: function(val) {
            var t = new Date(val)
            var date = Ext.util.Format.date(t, 'd M')
            var time = Ext.util.Format.date(t, 'H:i:s')
            return '<span style="color:gray;font-size:smaller;margin-right:0.5em">'+date+'</span>'+'<span>'+time+'</span>'
        },
    }, {
        text: 'Status',
        dataIndex: 'status',
        renderer: function(val) {
            console.log(val)
            if (val == '')
                return 'Running'
            if (val == '0')
                return 'Complete'
            else
                return 'Failure (' + val + ')'
        }
    }],

    title: 'Task Manager',
    collapsible: true,
    headerPosition: 'left',
    sortableColumns: false,
    enableColumnHide: false,
    enableColumnMove: false,

    viewConfig: {
        enableTextSelection: false,
        deferEmptyText: false,
        loadMask: false
    }
});