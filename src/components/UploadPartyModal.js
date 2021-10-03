import React, {Component} from 'react';
import Modal from 'react-modal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faUpload } from '@fortawesome/free-solid-svg-icons'


/**
 * The upload party model, which pops up when clicking the Upload Party
 * button at the top.
 * @property {String} partyString The string that the user has entered into the box.
 * @property {String} error The current error message, if any.
 */
class UploadPartyModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      partyString: "",
      error: null,
    }
  }

  /**
   * Handle the "upload" of a party string.
   * Do this by calling the function from props and checking for errors.
   */
  handleUploadPartyString() {
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

  /**
   * Handle the input change for the textarea.
   * @param  {Event} e The event that sparked this function.
   */
  handleInputChange(e) {
    this.setState({
      error: null,
      partyString: e.target.value,
    });
  }

  /**
   * The render function.
   * @return {ReactComponent} The modal.
   */
  render() {
    return (

      <Modal className="modal-content modal-content-info modal-sm" overlayClassName="modal-overlay modal-overlay-info is-open" isOpen={this.props.modalIsOpen}>
        <div className="modal-header">
          <button id="close-upload-party-modal" className="modal-close" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
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