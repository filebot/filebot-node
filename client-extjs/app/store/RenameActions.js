Ext.define('FileBot.store.RenameActions', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.rename-actions',

    storeId: 'rename-actions',

    fields: [
        'id', 'action'
    ],
    
    data: [
        [1, 'Move'],
        [2, 'Copy'],
        [3, 'Hardlink'],
        [4, 'Symlink'],
        [5, 'Keeplink'],
        [6, 'Duplicate']
    ]
});