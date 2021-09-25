import React, {PureComponent} from 'react';

class ChangeLog extends PureComponent {
  render() {
    return (
      <section>
        <h2>Changelog</h2>
        <h3>25 September 2021</h3>
        <ul>
          <li>Added creature sprites, sourced from the Siralim Ultimate API.</li>
        </ul>

        <h3>24 September 2021</h3>
        <p>Released.</p>
      </section>
    )
  }
}

export default ChangeLog;