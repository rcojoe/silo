;
import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import UploadField from './UploadField';

module.exports = React.createClass({
    getInitialState() {
        return {
            merge: false,
            showModal: false
        };
    },
    propTypes: {
        //url: React.propTypes.string.required
    },
    close() {
        this.setState({ showModal: false });
    },

    open() {
        this.setState({ showModal: true });
    },

    handleSuccess() {
        console.log("yop");
    },

    handleChange(flag) {
        this.setState({merge: flag});
    },

    render() {
        return (
            <a onClick={this.open}>
                CSV Upload

                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>CSV Upload</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Mass edit those batches by uploading a CSV. You can either:</p>
                        <div className="radio">
                            <label>
                                <input type="radio" name="optionsRadios"
                                       onChange={this.handleChange.bind(this, true)}
                                       checked={this.state.merge} />
                                <b>Merge</b> the uploaded batches with the current set
                            </label>
                        </div>
                        <div className="radio">
                            <label>
                                <input type="radio" name="optionsRadios"
                                       onChange={this.handleChange.bind(this, false)}
                                       checked={!this.state.merge} />
                                <b>Replace</b> the current set by the uploaded batches
                            </label>
                        </div>
                        <p>Please note this will create a single Operation performing the requested action.</p>
                        <p>Expected format is:</p>
                        <pre>{`sku,quantity
31-232-25,15
14-231-21,-2`}</pre>
                        <UploadField url={this.props.url+'?merge='+(this.state.merge ? 'true' : 'false')} onSuccess={this.handleSuccess} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </a>
        );
    }
});
