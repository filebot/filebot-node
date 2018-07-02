Ext.define('FileBot.store.EpisodeOrders', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.episode-orders',
    storeId: 'episode-orders',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, 'Airdate', 'Airdate Order'],
        [1, 'DVD', 'DVD Order'],
        [2, 'Absolute', 'Absolute Order'],
        [3, 'AbsoluteAirdate', 'Absolute Airdate Order'],
    ]
});
