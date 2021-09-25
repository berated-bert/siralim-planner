import React, {PureComponent} from 'react';

class InfoSection extends PureComponent {
  render() {
    return (
    <section>
        <h2>Siralim Planner by Berated Bert</h2>
        <p>This is a fan-made tool designed to simplify the process of planning builds for <a href="https://store.steampowered.com/app/1289810/Siralim_Ultimate/" target="_blank">Siralim Ultimate</a>. As a longtime fan of the series I always wished there was an easy way to theorycraft Siralim builds - so I came up with 
        this tool. The three main features of this tool are outlined below.</p>
        <h3>Party Planner</h3>
        <p>The Party Planner allows you to put together a list of 18 traits for your Siralim Ultimate party. It is comprised of 18 rows, which
        are separated into 6 groups of 3 - these correspond to your party members, and their 3 traits (2 creature traits, and 1 artifact slot).</p>
        <p>To start planning your party, click on one of the 18 rows. This brings up the Trait Selection Window, described below.</p>
        <p>You can <b>drag and drop</b> traits between rows to swap them - this enables you to easily swap traits between creatures/slots.</p>
        <p>The tool also supports some basic <b>validation</b>: if you put a trait from a monster that cannot be obtained (i.e. a Nether Boss) into
        a creature slot, the row will be highlighted with red stripes to let you know that such an assignment is not possible.</p>
        <h3>Trait Selection Window</h3>
        <p>In the trait selection window, you can <b>search</b> for a particular keyword, e.g. if you want to find all creatures 
        that interact with buffs in some way you can type "buff" and the results will be filtered accordingly.</p>
        <h3>Sharing builds</h3>
        <p>Builds can be easily shared - simply copy the URL and send it to someone and they will be able to load your build.</p>
        <h3>Acknowledgements and Source Code</h3>
        <p>The data was sourced from the <a href="https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0" target="_blank">Siralim Ultimate Compendium</a>, a fantastic
        resource by EmptyPalms. I'd like to thank EmptyPalms for putting together this resource and for their permission to use the data as part of this tool. I would also like to thank rogermicroger for their excellent <a href="https://github.com/rovermicrover/siralim-ultimate-api" target="_blank">Siralim Ultimate API</a>, from which the creature sprites are obtained.</p>
        <p>The <b>source code</b> of this tool is available on <a href="https://github.com/berated-bert/siralim-planner" target="_blank">GitHub</a>. If you would like to work on it 
        you are more than welcome to submit a pull request or fork the repository.</p>
        <p>Depending on usage I may or may not keep the tool up-to-date with the latest version of the Siralim Ultimate Compendium. If it is not up-to-date at some point feel free to 
        download the code yourself and run it locally. Better yet, feel free to update the GitHub repository with the latest spreadsheet and submit a pull request.</p>
        <p>If you encounter any problems or have any feedback please feel free to message me on Discord - <b>BeratedBert#6292</b>, or submit an issue on the GitHub repo.</p>
    </section>
    )
    }
}

export default InfoSection;