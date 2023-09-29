// Namespace definition
Ext.ns("FileBot.NodeClient");

// Application definition
Ext.define("FileBot.NodeClient.AppInstance", {
	extend: "SYNO.SDS.AppInstance",
	appWindowName: "FileBot.NodeClient.AppWindow"
});

// Window definition
Ext.define("FileBot.NodeClient.AppWindow", {
	extend: "SYNO.SDS.AppWindow",

	constructor: function(config) {
		this.appInstance = config.appInstance;

		config = Ext.apply({
			resizable: true,
			maximizable: true,
			minimizable: true,
			width: 980,
			height: 580,
			minWidth: 830,
			minHeight: 510,
			items: [{
				xtype: 'box',
				autoEl: {
					tag: 'iframe',
					src: '/webman/3rdparty/filebot-node/index.html',
					width: '100%',
					height: '100%',
					frameborder: '0'
				}
			}],
			tools: [{
				id: 'fullscreen',
				qtip: 'Open in New Tab',
				handler: function(event, element, panel) {
					window.open('/webman/3rdparty/filebot-node/index.html', '_blank')
				}
			}, {
				id: 'help',
				qtip: 'Open Help',
				handler: function(event, element, panel) {
					window.open('https://www.filebot.net/node.html', '_blank')
				}
			}]
		}, config);

		this.callParent([config]);
	}
});
