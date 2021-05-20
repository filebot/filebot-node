/**
 * Created by reinhard on 4/25/15.
 */
Ext.define('FileBot.view.taskmanager.TaskManagerController', {
    extend: 'Ext.app.ViewController',
    requires: [
        'FileBot.view.taskmanager.TaskManagerModel',
        'Ext.util.TaskManager'
    ],
    alias: 'controller.taskmanager',

    /**
     * Called when the view is created
     */
    init: function() {
        const store = this.getViewModel().getStore('tasks')

        FileBot.getApplication().on('state', function() {
            // start fetching task data
            store.setProxy(FileBot.Node.getDataProxy('tasks'))
            // refresh task state every few seconds
            Ext.util.TaskManager.start({
                run: store.reload,
                interval: Ext.manifest.server.refresh,
                scope: store
            })
        }, this)

        // immediately refresh data when new tasks are executed
        FileBot.getApplication().on('execute', function() {
            // auto-select first row after new rows have been loaded and rendered
            this.selectFirstRowOnUpdate = true
            store.reload()
        }, this)

        // same for filebot --license calls
        FileBot.getApplication().on('license', function() {
            // auto-select first row after new rows have been loaded and rendered
            this.selectFirstRowOnUpdate = true
            store.reload()
        }, this)

        // auto-select newly added tasks (on 'add' event doesn't work for grid)
        store.on('datachanged', this.updateFirstRowSelection, this)
    },


    selectFirstRowOnUpdate: false,
    updateFirstRowSelection: function() {
        if (this.selectFirstRowOnUpdate) {
            this.selectFirstRowOnUpdate = false
            this.getView().getSelectionModel().select(0)
        }
    }

});
