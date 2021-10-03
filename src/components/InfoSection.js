import React, {PureComponent} from 'react';
import ReactMarkdown from 'react-markdown';

import md from '../markdown/InfoSection.md';

/**
 * The InfoSection which resides in the InfoModal.
 * Renders markdown from markdown/InfoSection.md.
 */
class InfoSection extends PureComponent {

  constructor() {
    super();
    this.state = { markdown: '' };
  }

  /**
   * When component is mounted, retrieve the markdown.
   * @return {void}
   */
  componentWillMount() {
    fetch(md).then(res => res.text()).then(text => this.setState({ markdown: text }));
  }

  /**
   * Render function.
   * @return {ReactComponent} A <section> element containing the markdown.
   */
  render() {
    return (
      <section>
        <ReactMarkdown>{this.state.markdown}</ReactMarkdown>
      </section>
      )
    }
}

export default InfoSection;