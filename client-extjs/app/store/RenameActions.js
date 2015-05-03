Ext.define('FileBot.store.RenameActions', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.rename-actions',

    storeId: 'rename-actions',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [1, 'move', 'move and rename'],
        [2, 'copy', 'copy'],
        [3, 'hardlink', 'hardlink'],
        [4, 'symlink', 'symlink'],
        [5, 'keeplink', 'move and symlink back'],
        [6, 'duplicate', 'hardlink or copy']
    ]
});