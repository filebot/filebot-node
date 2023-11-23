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
        [4, ''+15*60*1000, '15 minutes'],
        [5, ''+30*60*1000, '30 minutes'],
        [6, ''+60*60*1000, '60 minutes'],
        [7, ''+90*60*1000, '90 minutes']
    ]
});
