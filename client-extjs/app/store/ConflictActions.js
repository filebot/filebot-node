Ext.define('FileBot.store.ConflictActions', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.conflict-actions',
    storeId: 'conflict-actions',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, 'skip', 'Skip existing files'],
        [1, 'override', 'Override existing files'],
        [2, 'auto', 'Override if new file is better'],
        [3, 'index', 'Keep both and index new file'],
        [4, 'fail', 'Fail if files already exist']
    ]
});