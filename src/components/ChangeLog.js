import React, {PureComponent} from 'react';

import ReactMarkdown from 'react-markdown';

import md from '../markdown/ChangeLog.md';

class ChangeLog extends PureComponent {

  constructor() {
    super();
    this.state = { markdown: '' };
  }

  componentWillMount() {
    fetch(md).then(res => res.text()).then(text => this.setState({ markdown: text }));
  }

  render() {
    return (
      <section>
        <ReactMarkdown>{this.state.markdown}</ReactMarkdown>
      </section>
    )
  }
}

export default ChangeLog;