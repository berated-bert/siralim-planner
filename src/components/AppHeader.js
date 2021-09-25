import React, {PureComponent} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

class AppHeader extends PureComponent {
  render() {
    return (
      <header className="app-header">
        <div className="container">
        <div className="app-header-left">
          <h3>Siralim Planner</h3>
        </div>
        <div className="app-header-right">
          <p><a href="https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0" target="_blank">Compendium</a> {this.props.compendiumVersion}</p>
          <button id="upload-build" role="button" className="lighter" onClick={this.props.openUploadBuildModal}><FontAwesomeIcon icon={faUpload}/><span>Upload party</span></button>
          <button id="close-info-modal" role="button" className="lighter" onClick={this.props.openInfoModal}><FontAwesomeIcon icon={faInfoCircle}/><span>Info</span></button>
        </div>
        </div>
      </header>
    )
  }
}

export default AppHeader;