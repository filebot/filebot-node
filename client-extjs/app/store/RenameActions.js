Ext.define('FileBot.store.RenameActions', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.rename-actions',

    model: 'FileBot.model.RenameAction',

    storeId: 'rename-actions',

    data: [
        [0, 'MOVE'],
        [1, 'COPY'],
        [2, 'HARDLINK'],
        [3, 'SYMLINK'],
        [4, 'KEEPLINK'],
        [5, 'DUPLICATE'],
        [6, 'TEST']
    ]
});
