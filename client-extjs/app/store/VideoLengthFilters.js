Ext.define('FileBot.store.VideoLengthFilters', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.videolength-filters',
    storeId: 'videolength-filters',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [1, '', 'default'],
        [2, ''+0, '0 seconds'],
        [3, ''+5*60*1000, '5 minutes'],
        [4, ''+30*60*1000, '30 minutes'],
        [5, ''+60*60*1000, '1 hour']
    ]
});