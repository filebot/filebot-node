Ext.define('FileBot.store.RenameActions', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.rename-actions',

    storeId: 'rename-actions',

    fields: [
        'action'
    ],

    data: [
        ['Move'],
        ['Copy'],
        ['Hardlink'],
        ['Symlink'],
        ['Keeplink'],
        ['Duplicate'],
        ['Test']
    ]
});
