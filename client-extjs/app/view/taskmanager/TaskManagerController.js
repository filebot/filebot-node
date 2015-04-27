/**
 * Created by reinhard on 4/25/15.
 */
Ext.define('FileBot.view.taskmanager.TaskManagerController', {
    extend: 'Ext.app.ViewController',
    requires: [
        'Ext.util.TaskManager',
        'FileBot.view.taskmanager.TaskManagerModel'
    ],
    alias: 'controller.taskmanager',

    /**
     * Called when the view is created
     */
    init: function() {
    	var store = this.getViewModel().getStore('tasks')
    	Ext.util.TaskManager.start({
    		run: this.refresh,
    		interval: 5000,
            scope: this
    	});

        FileBot.getApplication().on('executeTask', this.refresh, this)
    },

    refresh: function() {
        var store = this.getViewModel().getStore('tasks')
        console.log('Reload Task Store')
        store.reload()
    }
});
