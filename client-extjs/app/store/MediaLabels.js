Ext.define('FileBot.store.MediaLabels', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.media-labels',
    storeId: 'media-labels',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, '', 'Automatic'],
        [1, 'Movie', 'Movies'],
        [2, 'TV', 'TV Series'],
        [3, 'Anime', 'Anime'],
        [4, 'Music', 'Music'],
        [5, 'other', 'Files']
    ]
});
