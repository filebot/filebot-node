/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('FileBot.view.task.TaskController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.task',

    onExecute: function () {
        var form = this.getView().down('form').getForm()

        if (true || form.isValid()) {
            // submit the Ajax request and handle the response
            form.submit({
                success: function(form, action) {
                    Ext.Msg.alert('Success', action.result.message);
                },

                // If you don't pass success:true, it will always go here
                failure: function(form, action) {
                    Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
                }
            });
        }
    }

});
