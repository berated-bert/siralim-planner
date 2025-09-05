import React, { PureComponent } from "react";
import ChangeLog from "./ChangeLog";
import Modal from "react-modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

class ChangelogModal extends PureComponent {
  render() {
    return (
      <Modal
        className="modal-content modal-content-info"
        overlayClassName="modal-overlay modal-overlay-info is-open"
        isOpen={this.props.modalIsOpen}
      >
        <div className="modal-header">
          <button
            id="close-info-modal"
            className="modal-close"
            aria-label="Close info"
            onClick={this.props.closeModal}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="info-modal">
          {/*          <div className="note">
            <FontAwesomeIcon icon={faInfoCircle} />
            Note regarding Version 2.0: New creatures/traits have been added,
            and should now be up to date. Specializations and annointments have
            been added, but have missing icons for now.
          </div>*/}
          <ChangeLog />
        </div>
      </Modal>
    );
  }
}

export default ChangelogModal;
