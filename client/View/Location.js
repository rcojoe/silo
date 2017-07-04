;
const React = require('react');
const BatchEditor = require('../Editor/BatchEditor');
const OperationEditor = require('../Editor/OperationEditor');
const DataStore = require('../Editor/DataStore');
const withLocationModifier = require('../Editor/withLocationModifier');
const ModifierEditor = withLocationModifier(require('../Editor/ModifierEditor'));
const Link = require('../Factory').Link;
const Api = require('../Api');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            data: {},
            batches: new DataStore([]),
            operations: new DataStore([]),
        };
    },

    getDefaultProps: function() {
        return {
            siloBasePath: null,
            code: 'root',
            writable: false,
            endpoint: '%siloBasePath%/inventory/location/%code%',
            batchEndpoint: '%siloBasePath%/inventory/location/%code%/batches',
            batchEditorAdditionalMenu: ()=>null
        };
    },

    propTypes: {
        cache: React.PropTypes.object.isRequired,
        /**
         * URL where to send the file
         */
        url: React.PropTypes.string,
        /**
         * Callback used when download has been succesfull
         */
        onSuccess: React.PropTypes.func,
        /**
         * @todo this is very bad ACL design, change that
         */
        writable: React.PropTypes.bool,

        batchEndpoint: React.PropTypes.string,

        batchEditorAdditionalMenu: React.PropTypes.any,

        modifierFactory: React.PropTypes.any.isRequired
    },

    componentDidMount: function () {
        function replace(str) {
            return str.replace('%siloBasePath%', this.props.siloBasePath).replace('%code%', this.props.code);
        };
        this.locationCache = this.props.cache
            .getFrom(replace.apply(this, [this.props.endpoint]))
            .onUpdate(value => {
                this.setState({
                    data: value,
                    operations: new DataStore(value.operations.sort((a,b)=>(b.id-a.id)))
                });
            })
            .refresh();

        this.batchCache = this.props.cache
            .getFrom(replace.apply(this, [this.props.batchEndpoint]))
            .onUpdate(value => {
                this.setState({batches: new DataStore(value)});
            })
            .refresh();
    },

    refresh: function(){
        this.batchCache.refresh();
    },

    handleDelete: function(){
        Api.fetch(this.props.siloBasePath+"/inventory/location/"+this.props.code, {method: "DELETE"});
    },

    componentWillUnmount : function () {
        this.locationCache.cleanup();
        this.batchCache.cleanup();
    },

    render: function(){
        let data = this.state.data;
        let uploadUrl = this.props.siloBasePath+"/inventory/location/"+this.props.code+'/batches';
        return (
            <div>
                <h3><span className="glyphicon glyphicon-map-marker" />Location {this.props.code}</h3>
                <button className="btn btn-danger" onClick={this.handleDelete}>Delete</button>
                {data ? (<div>
                    <b>Parent:</b>&nbsp;{data.parent ? <Link route="location" code={data.parent} /> : "No parent"}<br />
                    <b>Childs:</b>&nbsp;
                    {data.childs ? <ul>{data.childs.sort().map(function(child, key){return <li key={key}>
                            <Link route="location" code={child} />
                        </li>;})}</ul> : "No child"
                    }<br />
                    {this.props.children}
                    <ModifierEditor cache={this.props.cache}
                                    siloBasePath={this.props.siloBasePath}
                                    location={this.props.code}
                                    modifierFactory={this.props.modifierFactory}
                                    writable={this.props.writable}
                    />
                    <BatchEditor
                        exportFilename={'location-'+this.props.code+'-batches.csv'}
                        batches={this.state.batches} uploadUrl={uploadUrl} onNeedRefresh={this.refresh} writable={this.props.writable}
                        batchColumns={this.props.batchColumns}
                        additionalMenu={this.props.batchEditorAdditionalMenu} />

                    <OperationEditor operations={this.state.operations} />
                </div>) : "Loading data"}
            </div>
        );
    }
});
