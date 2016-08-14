Ext.define('FileBot.store.ScriptSources', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.script-sources',
    storeId: 'script-sources',

    fields: [
        'id', 'value', 'label'
    ],

    data: [
        [0, 'fn', 'stable'],
        [1, 'dev', 'latest']
    ]
});