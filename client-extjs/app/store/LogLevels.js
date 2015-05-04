Ext.define('FileBot.store.LogLevels', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.log-levels',
    storeId: 'log-levels',

    fields: [
        'id', 'value', 'label'
    ],
    
    data: [
        [0, 'info', 'only results and errors'],
        [1, 'fine', 'all important messages'],
        [2, 'all', 'everything']
    ]
});