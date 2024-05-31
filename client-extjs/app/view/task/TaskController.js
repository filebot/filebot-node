/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('FileBot.view.task.TaskController', {
    extend: 'Ext.app.ViewController',
    requires: [
        'FileBot.Node'
    ],

    alias: 'controller.task',

    /**
     * Called when the view is created
     */
    init: function() {
        FileBot.getApplication().on('init', function() {
            // start fetching folder data
            this.getViewModel().getStore('folders').setProxy(FileBot.Node.getDataProxy('folders'))
        }, this)

        FileBot.getApplication().on('auth', function(options) {
            var fields = this.getView().down('#media-server-options')
            if (options.auth == 'SYNO' || options.auth == 'QNAP') {
                // enable media server options by default
                fields.query('checkbox').forEach(function(checkbox) {
                    checkbox.setValue(true)
                })
                fields.show()
            } else {
                // remove media server options from the form entirely
                fields.destroy()
            }
        }, this)

        FileBot.getApplication().on('state', function(json) {
            // restore form fields
            if (json) {
                var form = this.getForm()
                form.setValues(Ext.decode(json))
                form.isValid()
            }
        }, this)

        // show current environment
        FileBot.getApplication().on('environment', this.showEnvironmentForm, this)
    },

    restoreState: function() {
        var values = Ext.state.Manager.get('formOrganizeFiles')
        var form = this.getForm()

        // restore form values
        if (values) {
            form.setValues(values)
        }

        // mark invalid fields on init
        form.isValid()
    },

    saveState: function() {
        var values = this.getForm().getValues()
        Ext.state.Manager.set('formOrganizeFiles', values)
        FileBot.Node.requestState({'store': Ext.encode(values)})
        return values
    },

    onExecute: function() {
        var parameters = this.getExecuteParameters()
        if (parameters) {
            FileBot.Node.requestExecute(parameters)
        }
    },

    onTest: function() {
        var parameters = this.getExecuteParameters()
        if (parameters) {
            // force --action test and then execute normally
            parameters.action = 'TEST'
            FileBot.Node.requestExecute(parameters)
        }
    },

    onSchedule: function() {
        var parameters = this.getExecuteParameters()
        if (parameters) {
            FileBot.Node.requestSchedule(parameters)
        }
    },

    onLicense: function() {
        Ext.create('Ext.window.Window', {
            id: 'licenseWindow',
            items: [{
                xtype: 'form',
                id: 'licenseForm',
                items: [{
                    xtype: 'hidden',
                    name: 'fn',
                    value: 'license'
                }, {
                    xtype: 'textareafield',
                    width: 540,
                    height: 360,
                    id: 'licenseTextArea',
                    name: 'license',
                    fieldCls: 'license',
                    allowBlank: false,
                    emptyText: '-----BEGIN PGP SIGNED MESSAGE-----\n\n\n\n\n\n\n\n\n-----BEGIN PGP SIGNATURE-----\n\n\n\n\n\n\n\n\n\n-----END PGP SIGNATURE-----'
                }],
                buttons: [
                    {
                        xtype: 'filefield',
                        width: 75,
                        buttonOnly: true,
                        accept: '.psm',
                        buttonConfig: {
                            text: 'Select',
                            iconCls: 'select-btn'
                        },
                        listeners: {
                            change: function(evt) {
                                var file = evt.fileInputEl.dom.files[0]
                                var reader = new FileReader()
                                reader.onload = function(evt) {
                                    Ext.getCmp('licenseTextArea').setValue(evt.target.result)
                                }
                                reader.readAsText(file)
                            }
                        }
                    },
                    { xtype: 'tbfill' },
                    { text:'Purchase', iconCls: 'purchase-btn', handler: function(btn) {
                        window.open(Ext.manifest.server.url.license_purchase, '_blank')
                    }},
                    { text:'Activate', iconCls: 'license-btn', formBind: true, handler: function(btn) {
                        var form = Ext.getCmp('licenseForm').getForm()
                        if (form.isValid()) {
                            FileBot.Node.requestExecute(form.getValues())
                            Ext.getCmp('licenseWindow').destroy()
                        }
                    }}
                ],
            }],
            title: 'Activate License',
            bodyPadding: 10,
            scrollable: false,
            resizable: false,
            closable: true
        }).show()
    },

    onConfigure: function() {
        Ext.create('Ext.window.Window', {
            id: 'osdbWindow',
            items: [{
                xtype: 'form',
                id: 'osdbForm',
                items: [{
                    xtype: 'hidden',
                    name: 'fn',
                    value: 'configure'
                }, {
                    xtype: 'textfield',
                    allowBlank: false,
                    fieldLabel: 'Username',
                    name: 'osdbUser',
                    emptyText: 'username'
                }, {
                    xtype: 'textfield',
                    allowBlank: false,
                    fieldLabel: 'Password',
                    name: 'osdbPwd',
                    emptyText: 'password',
                    inputType: 'password'
                }],
                buttons: [
                    { text:'Register', handler: function(btn) {
                        window.open(Ext.manifest.server.url.osdb_register, '_blank')
                    }},
                    { text:'Login', formBind: true, handler: function(btn) {
                        var form = Ext.getCmp('osdbForm').getForm()
                        if (form.isValid()) {
                            FileBot.Node.requestExecute(form.getValues())
                            Ext.getCmp('osdbWindow').destroy()
                        }
                    }}
                ],
            }],
            title: 'OpenSubtitles',
            bodyPadding: 10,
            scrollable: false,
            resizable: false,
            closable: true
        }).show()
    },

    onSettings: function() {
        Ext.create('Ext.window.Window', {
            id: 'settingsWindow',
            items: [{
                xtype: 'form',
                id: 'settingsForm',
                items: [{
                    xtype: 'hidden',
                    name: 'fn',
                    value: 'properties'
                }, {
                    xtype: 'textfield',
                    allowBlank: false,
                    fieldLabel: 'Name',
                    name: 'name',
                    emptyText: 'net.filebot.xattr.store'
                }, {
                    xtype: 'textfield',
                    allowBlank: true,
                    fieldLabel: 'Value',
                    name: 'value',
                    emptyText: '.xattr'
                }],
                buttons: [
                    { text:'Set', formBind: true, handler: function(btn) {
                        var form = Ext.getCmp('settingsForm').getForm()
                        if (form.isValid()) {
                            FileBot.Node.requestExecute(form.getValues())
                            Ext.getCmp('settingsWindow').destroy()
                        }
                    }}
                ],
            }],
            title: 'System Properties',
            bodyPadding: 10,
            scrollable: false,
            resizable: false,
            closable: true
        }).show()
    },

    onRevert: function() {
        var parameters = {'fn':'revert'}
        FileBot.Node.requestExecute(parameters)
    },

    onInfo: function() {
        var parameters = {'fn':'sysinfo'}
        FileBot.Node.requestExecute(parameters)
    },

    onClear: function() {
        var parameters = {'fn':'clear'}
        FileBot.Node.requestExecute(parameters)
    },

    onEnvironment: function() {
        var parameters = {}
        FileBot.Node.requestEnvironment(parameters)
    },

    onHelp: function() {
        window.open(Ext.manifest.server.url.help, '_blank')
    },

    getExecuteParameters: function() {
        var form = this.getForm()
        if (form.isValid()) {
            return this.saveState()
        }
        return null
    },

    getForm: function() {
        return this.getView().down('form').getForm()
    },

    showEnvironmentForm: function(data) {
        // show status message
        if (data.message != null) {
            Ext.create('Ext.window.MessageBox', {
                // set closeAction to 'destroy' if this instance is not
                // intended to be reused by the application
                closeAction: 'destroy'
            }).show({
                title: 'Environment',
                msg: data.message,
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            })
        }

        // show environment input form
        if (data.environment != null) {
            Ext.create('Ext.window.Window', {
                id: 'environmentWindow',
                items: [{
                    xtype: 'form',
                    id: 'environmentForm',
                    items: [{
                        xtype: 'textareafield',
                        width: 540,
                        height: 360,
                        id: 'environmentTextArea',
                        name: 'environment',
                        fieldCls: 'environment',
                        allowBlank: true,
                        value: data.environment,
                        emptyText: 'export JAVA_OPTS=-Xmx512m'
                    }],
                    buttons: [
                        { text:'Set Environment', formBind: true, handler: function(btn) {
                            var environment = Ext.getCmp('environmentForm').getForm().getValues()['environment']
                            FileBot.Node.requestEnvironment({'environment': environment})
                            Ext.getCmp('environmentWindow').destroy()
                        }}
                    ],
                }],
                title: 'Environment',
                bodyPadding: 10,
                scrollable: false,
                resizable: false,
                closable: true
            }).show()
        }
    }

});
