Ext.define('FileBot.store.MediaLabels', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.media-labels',

    storeId: 'media-labels',

    fields: [
        'id', 'label'
    ],

    data: [
        [0, 'Automatic'],
        [1, 'Movies'],
        [2, 'TV Series'],
        [3, 'Anime'],
        [4, 'Music'],
        [5, 'Other']
    ]
});