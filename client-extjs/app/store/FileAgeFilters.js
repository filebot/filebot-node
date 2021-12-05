Ext.define('FileBot.store.FileAgeFilters', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.fileage-filters',
    storeId: 'fileage-filters',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [1, '', 'default'],
        [2, '0.125', '3 hours'],
        [3, '0.5', '12 hours'],
        [4, '1', '24 hours'],
        [5, '3', '3 days'],
        [6, '7', '7 days']
    ]
});
