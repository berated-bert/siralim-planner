import React, {PureComponent} from 'react';
import Modal from 'react-modal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faUpload } from '@fortawesome/free-solid-svg-icons'

import parseBuildString from '../functions/parseBuildString';

class UploadBuildModal extends PureComponent {
  render() {
    return (

      <Modal className="modal-content modal-content-info modal-sm" overlayClassName="modal-overlay modal-overlay-info is-open" isOpen={this.props.modalIsOpen}>
        <div className="modal-header">
          <button id="close-upload-build-modal" role="button" className="modal-close" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
        <div className="info-modal">
          <h2>Upload build</h2>
          <p>Paste your build string into the box below and click "upload" to upload your party. You can get your build string in-game by going to Options and then Export Data to Clipboard.</p>
          <textarea autoFocus id="upload-build-textarea" placeholder="Paste build string here"></textarea>
          <button id="upload-build-button" className="button-lg" ><FontAwesomeIcon icon={faUpload}/>&nbsp;Upload</button>
        </div>
      </Modal>
    )
  }
}

export default UploadBuildModal;