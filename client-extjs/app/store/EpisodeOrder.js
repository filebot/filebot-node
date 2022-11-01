Ext.define('FileBot.store.EpisodeOrders', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.episode-orders',
    storeId: 'episode-orders',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, 'Airdate', 'Airdate'],
        [1, 'DVD', 'DVD'],
        [2, 'Absolute', 'Absolute'],
        [3, 'Digital', 'Digital'],
        [4, 'Production', 'Production'],
        [5, 'Date', 'Date and Title']
    ]
});
