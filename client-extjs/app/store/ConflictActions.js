Ext.define('FileBot.store.ConflictActions', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.conflict-actions',
    storeId: 'conflict-actions',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, 'skip', 'skip existing files'],
        [1, 'override', 'overwrite existing files'],
        [2, 'auto', 'overwrite if new file is better'],
        [3, 'index', 'keep both and index new file'],
        [4, 'fail', 'fail if files already exist']
    ]
});
