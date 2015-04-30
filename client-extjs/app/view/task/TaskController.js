/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('FileBot.view.task.TaskController', {
    extend: 'Ext.app.ViewController',
    requires: ['FileBot.Node'],

    alias: 'controller.task',

    /**
     * Called when the view is created
     */
    init: function() {

    },
    
    restoreState: function() {
        var values = Ext.state.Manager.get('formOrganizeFiles')
        if (values) {
            this.getForm().setValues(values)
        }
    },

    saveState: function() {
        var values = this.getForm().getValues()
        Ext.state.Manager.set('formOrganizeFiles', values)
    },

    onExecute: function () {
        var form = this.getForm()
        var parameters = form.getValues()

        this.saveState()

        if (form.isValid()) {
            FileBot.Node.requestExecute(parameters)
        }
    },

    onTest: function () {
        var form = this.getForm()
        var parameters = form.getValues()

        this.saveState()

        if (form.isValid()) {
            // force --action test
            parameters.action = 'TEST'
            FileBot.Node.requestExecute(parameters)
        }
    },

    getForm: function () {
        return this.getView().down('form').getForm()
    }

});
