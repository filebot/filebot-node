Ext.define('FileBot.store.RenameActions', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.rename-actions',
    storeId: 'rename-actions',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [1, 'MOVE', 'move and rename'],
        [2, 'COPY', 'copy'],
        [3, 'HARDLINK', 'hardlink'],
        [4, 'SYMLINK', 'symlink'],
        [5, 'CLONE', 'reflink'],
        [6, 'KEEPLINK', 'move and symlink back'],
        [7, 'DUPLICATE', 'hardlink or copy']
    ]
});
