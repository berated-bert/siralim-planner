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
          Note regarding Version 2.0: New creatures/traits have been added, and
          should now be up to date. Specializations and annointments have been
          added, but have missing icons for now.
        </div>
        <ReactMarkdown safe={true}>{this.state.markdown}</ReactMarkdown>
      </section>
    );
  }
}

export default InfoSection;
