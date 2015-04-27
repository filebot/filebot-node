/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('FileBot.view.main.Main', {
    extend: 'Ext.container.Container',
    requires: [
        'FileBot.view.main.MainController',
        'FileBot.view.main.MainModel',
        'FileBot.view.navigation.Navigation',
        'FileBot.view.task.Task'
    ],

    xtype: 'app-main',

    controller: 'main',
    viewModel: {
        type: 'main'
    },

    layout: {
        type: 'border'
    },

    items: [
        {
            region: 'center',
            xtype: 'navigation-tabs',
            items: [{
                title: 'Tasks',
                xtype: 'section-task'
            },
            {
                title: 'Logs',
                html: '<h2>TODO</h2>'
            },
            {
                title: 'Settings',
                html: '<h2>TODO</h2>'
            }]
        }]
});
