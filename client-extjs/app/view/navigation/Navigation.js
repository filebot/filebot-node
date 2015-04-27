/**
 * Created by reinhard on 4/25/15.
 */
Ext.define('FileBot.view.navigation.Navigation', {
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
