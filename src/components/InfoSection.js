import React, { PureComponent } from "react";
import ReactMarkdown from "react-markdown";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import md from "../markdown/InfoSection.md";

/**
 * The InfoSection which resides in the InfoModal.
 * Renders markdown from markdown/InfoSection.md.
 */
class InfoSection extends PureComponent {
  constructor() {
    super();
    this.state = { markdown: "" };
  }

  /**
   * When component is mounted, retrieve the markdown.
   * @return {void}
   */
  componentWillMount() {
    fetch(md)
      .then((res) => res.text())
      .then((text) => this.setState({ markdown: text }));
  }

  /**
   * Render function.
   * @return {ReactComponent} A <section> element containing the markdown.
   */
  render() {
    return (
      <section>
        <div className="note">
          <FontAwesomeIcon icon={faInfoCircle} />
          Please note that the Planner is not fully updated to V2.0 yet. New
          creatures/traits have been added, but they are missing sprites.
          Specializations and annointments have not been added yet - they will
          be added once the data becomes available.
        </div>
        <ReactMarkdown safe={true}>{this.state.markdown}</ReactMarkdown>
      </section>
    );
  }
}

export default InfoSection;
