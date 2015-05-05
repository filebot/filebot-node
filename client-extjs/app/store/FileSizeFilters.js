Ext.define('FileBot.store.FileSizeFilters', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.filesize-filters',
    storeId: 'filesize-filters',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [1, '', 'default'],
        [2, ''+0, '0 bytes'],
        [3, ''+100*1024*1024, '100 MB'],
        [4, ''+500*1024*1024, '500 MB'],
        [5, ''+2*1024*1024*1024, '2 GB']
    ]
});