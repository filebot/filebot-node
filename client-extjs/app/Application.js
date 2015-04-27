/**
 * The main application class. An instance of this class is created by app.js when it calls
 * Ext.application(). This is the ideal place to handle application launch and initialization
 * details.
 */
Ext.define('FileBot.Application', {
    extend: 'Ext.app.Application',

    name: 'FileBot',

    stores: [

    ],
    views: [

    ],

    launch: function() {
        // disable X-Requested-With headers that are added by default
        Ext.Ajax.setUseDefaultXhrHeader(false);
    }

})
