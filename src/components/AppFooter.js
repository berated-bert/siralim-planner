import React, {PureComponent} from 'react';

class AppFooter extends PureComponent {
  render() {
    return (
      <footer>
        <div className="container">
          <p>2021 Created by BeratedBert. This site is not affiliated with Thylacine Studios.</p>
          <p>Data sourced from the <a href="https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0" target="_blank" rel="noreferrer">Siralim Ultimate Compendium</a>. Creature sprites and stats sourced from the <a href="https://github.com/rovermicrover/siralim-ultimate-api" target="_blank" rel="noreferrer">Siralim Ultimate API</a>.</p>
          <p>Source code available on <a href="https://github.com/berated-bert/siralim-planner" target="_blank" rel="noreferrer">GitHub</a>. Pull requests welcome!</p>
        </div>
      </footer>
    )
  }
}

export default AppFooter;