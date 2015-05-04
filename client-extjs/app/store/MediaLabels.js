Ext.define('FileBot.store.MediaLabels', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.media-labels',
    storeId: 'media-labels',

    fields: [
        'id', 'value', 'label'
    ],
    
    data: [
        [0, '', 'autodetect'],
        [1, 'movie', 'Movies'],
        [2, 'tv', 'TV Series'],
        [3, 'anime', 'Anime'],
        [4, 'music', 'Music'],
        [5, 'other', 'Files']
    ]
});