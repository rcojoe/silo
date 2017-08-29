const React = require('react');
const {Column} = require('fixed-data-table');

const {Editor, PanelTable} = require('./Editor');

const DataStore = require('./DataStore');

const DownloadDataLink = require('../Common/DownloadDataLink');

const TextCell = require('./Cell/TextCell');
const ProductCell = require('./Cell/ProductCell');

/**
 * @todo additionalColumns !
 * @todo filter by SKU
 */
module.exports = React.createClass({

    displayName: "BatchEditor",

    getDefaultProps: () => ({
        menu: [],
        exportFilename: "batches.csv"
    }),

    render: function(){
        let {data, menu} = this.props;
        if (data) {
            menu = menu.slice();
            menu.push(<li key="save_as_csv"><DownloadDataLink
                filename={this.props.exportFilename}
                exportFile={()=>("product,sku,quantity\n" +
                    data.map(function(d){
                        return d.product+','+d.name+','+d.quantity+"\n"
                    }).join()
                )}>
                Save as CSV
            </DownloadDataLink></li>);
        }

        let store = new DataStore(data ? data : []);
        return (
            <Editor title="BatchEditor" menu={menu}>
                <PanelTable data={data}>
                    <Column
                        width={200}
                        header="Product"
                        cell={<ProductCell data={store} />}
                    />
                    <Column
                        width={200}
                        header="Quantity"
                        cell={<TextCell data={store} col="quantity" />}
                    />
                </PanelTable>
            </Editor>
        );
    }
});
