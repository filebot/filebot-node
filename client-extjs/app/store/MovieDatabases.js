Ext.define('FileBot.store.MovieDatabases', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.movie-databases',
    storeId: 'movie-databases',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [1, '', 'default'],
        [2, 'TheMovieDB', 'TheMovieDB'],
        [3, 'OMDb', 'OMDb']
    ]
});
