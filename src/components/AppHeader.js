import React, { PureComponent } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faInfoCircle,
  faTimes,
  faDice,
} from "@fortawesome/free-solid-svg-icons";

class AppHeader extends PureComponent {
  render() {
    return (
      <header className="app-header">
        <div className="container">
          <div className="app-header-left">
            <h3>
              Siralim Planner{" "}
              <span
                className="version-num"
                onClick={this.props.openChangelogModal}
              >
                v{`${process.env.REACT_APP_VERSION}`}
              </span>
            </h3>
          </div>
          <div className="app-header-right">
            <p>
              <a
                href="https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0"
                target="_blank"
                rel="noreferrer"
              >
                Compendium
              </a>{" "}
              {this.props.compendiumVersion}
            </p>
            <button
              id="upload-build"
              className="lighter"
              onClick={this.props.openUploadBuildModal}
            >
              <FontAwesomeIcon icon={faUpload} />
              <span>Upload party</span>
            </button>
            <button
              id="reset-build"
              className="lighter"
              onClick={this.props.resetBuild}
            >
              <FontAwesomeIcon icon={faTimes} />
              <span>Reset</span>
            </button>
            <button
              id="random-build"
              className="lighter"
              onClick={this.props.randomiseBuild}
            >
              <FontAwesomeIcon icon={faDice} />
              <span>Randomise</span>
            </button>
            <button
              id="open-info-modal"
              className="lighter"
              onClick={this.props.openInfoModal}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>Info</span>
            </button>
          </div>
        </div>
      </header>
    );
  }
}

export default AppHeader;
