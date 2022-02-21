Ext.define('FileBot.store.SeriesDatabases', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.series-databases',
    storeId: 'series-databases',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [1, '', 'default'],
        [2, 'TheMovieDB::TV', 'TheMovieDB'],
        [3, 'AniDB', 'AniDB'],
        [4, 'TheTVDB', 'TheTVDB'],
        [5, 'TVmaze', 'TVmaze']
    ]
});
