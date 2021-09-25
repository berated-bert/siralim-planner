import React, {Component} from 'react';
import Modal from 'react-modal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faUpload } from '@fortawesome/free-solid-svg-icons'



class UploadPartyModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      partyString: "",
      error: null,
    }
  }

  async handleUploadPartyString() {
    this.props.uploadPartyFromString(this.state.partyString, function(err) {

      if(err) {
        this.setState({
          error: err.message,
        });
      } else {
        this.setState( {
          partyString: "",
          error: null,
        });
      }
    }.bind(this));
  }

  handleInputChange(e) {
    this.setState({
      partyString: e.target.value,
    });
  }

  render() {
    return (

      <Modal className="modal-content modal-content-info modal-sm" overlayClassName="modal-overlay modal-overlay-info is-open" isOpen={this.props.modalIsOpen}>
        <div className="modal-header">
          <button id="close-upload-party-modal" role="button" className="modal-close" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
        <div className="info-modal">
          <h2>Upload party</h2>
          <p>Paste your party string into the box below and click "upload" to upload your party. You can get your build string in-game by going to Options and then Export Data to Clipboard.</p>
          { this.state.error && <div className="notification notification-error"><b>Error: </b>{this.state.error}</div>}
          <textarea autoFocus id="upload-party-textarea" placeholder="Paste party string here" onChange={(e) => this.handleInputChange(e)} value={this.state.partyString}></textarea>
          <button id="upload-party-button" className="button-lg" onClick={this.handleUploadPartyString.bind(this)}><FontAwesomeIcon icon={faUpload}/>&nbsp;Upload</button>
        </div>
      </Modal>
    )
  }
}

export default UploadPartyModal;