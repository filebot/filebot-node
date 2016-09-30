/**
 * Created by reinhard on 4/29/15.
 */
Ext.define('FileBot.view.tasklogcat.TaskLogCatController', {
    extend: 'Ext.app.ViewController',
    requires: [
        'FileBot.view.tasklogcat.TaskLogCatModel',
        'Ext.util.TaskManager',
        'FileBot.Node'
    ],
    alias: 'controller.tasklogcat',

    // task that is corrently locked on for log viewing
    task: null,

    // run this task repeatedly until process has finished producing output
    refreshJob: null,

    init: function() {
        this.refreshJob = Ext.util.TaskManager.newTask({
            run: this.refresh,
            interval: Ext.manifest.server.refresh,
            scope: this
        })

        // watch log of the newly selected task
        FileBot.getApplication().on('selectTask', function(record) {
            // stop existing refresh job if any
            this.refreshJob.stop()

            this.task = record
            this.refresh()

            // if task has not completed yet keep watching for new output
            if (this.task.status == '') {
                this.refreshJob.start()
            }
        }, this)

        FileBot.getApplication().on('version', function(message) {
            var val = ['$ filebot -version', message].join('\n')
            var cmp = Ext.getCmp('logcatviewer')
            cmp.setValue(val)
        }, this)
    },

    refresh: function() {
        // fetch new log and update textarea
        FileBot.Node.fetchLog(this.task, function(response) {
            console.log(response)
            var val = response.responseText
            var cmp = Ext.getCmp('logcatviewer')

            if (val != cmp.getValue()) {
                cmp.setValue(val)

                // stop checking for updates once the task is done
                if (val.match(/\[Process (?:completed|error|killed)\]/g)) {
                    this.refreshJob.stop()
                }
            }
        }.bind(this))
    }

});
