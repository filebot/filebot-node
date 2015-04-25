/**
 * This example shows how to give your tab bar a custom look and feel typical of
 * app navigation.
 */
Ext.define('FileBot.view.main.NavigationTabs', {
    extend: 'Ext.tab.Panel',
    xtype: 'navigation-tabs',

    // ui: 'navigation', // NOT WORKING
    
    tabBar: {
        layout: {
            pack: 'center'
        }
    },

    defaults: {
        iconAlign: 'top',
        bodyPadding: 15
    }

});
