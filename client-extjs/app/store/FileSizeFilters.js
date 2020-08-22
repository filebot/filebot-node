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
        [3, ''+100*1000*1000, '100 MB'],
        [4, ''+500*1000*1000, '500 MB'],
        [5, ''+2*1000*1000*1000, '2 GB'],
        [6, ''+5*1000*1000*1000, '5 GB']
    ]
});
