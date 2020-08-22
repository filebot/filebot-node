Ext.define('FileBot.store.ArchiveOptions', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.archive-options',
    storeId: 'archive-options',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, 'skip', 'ignore archives'],
        [1, 'extract-keep', 'extract and keep archives'],
        [2, 'extract-delete', 'extract and delete archives']
    ]
});
