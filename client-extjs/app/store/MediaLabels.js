Ext.define('FileBot.store.MediaLabels', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.media-labels',

    storeId: 'media-labels',

    fields: [
        'label'
    ],

    data: [
        ['Automatic'],
        ['Movie'],
        ['TV'],
        ['Anime'],
        ['Music'],
        ['Other']
    ]
});
