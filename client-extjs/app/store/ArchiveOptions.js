Ext.define('FileBot.store.ArchiveOptions', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.archive-options',
    storeId: 'archive-options',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, 'skip', 'Ignore archives'],
        [1, 'extract-keep', 'Extract and keep archives'],
        [2, 'extract-delete', 'Extract and delete archives']
    ]
});
