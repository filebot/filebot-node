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
        var store = this.getViewModel().getStore('tasks')

        // refresh task state every few seconds
        Ext.util.TaskManager.start({
            run: this.refresh,
            interval: Ext.manifest.server.refresh,
            scope: this
        })

        // immediately refresh data when new tasks are executed
        FileBot.getApplication().on('execute', function() {
            this.refresh()

            // auto-select first row after new rows have been loaded and rendered
            this.selectFirstRowOnUpdate = true
        }, this)

        // same for filebot --license calls
        FileBot.getApplication().on('license', function() {
            this.refresh()

            // auto-select first row after new rows have been loaded and rendered
            this.selectFirstRowOnUpdate = true
        }, this)

        // auto-select newly added tasks (on 'add' event doesn't work for grid)
        store.on('datachanged', this.updateFirstRowSelection, this)
    },

    refresh: function() {
        var store = this.getViewModel().getStore('tasks')
        store.reload()
    },

    selectFirstRowOnUpdate: false,
    updateFirstRowSelection: function() {
        if (this.selectFirstRowOnUpdate) {
            this.selectFirstRowOnUpdate = false
            this.getView().getSelectionModel().select(0)
        }
    }

});
