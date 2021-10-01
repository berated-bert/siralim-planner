import React, {Component, PureComponent} from 'react';
import Modal from 'react-modal';
import { withRouter } from "react-router-dom";
import _ from 'underscore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { faSortAlphaUp } from '@fortawesome/free-solid-svg-icons'
import { faSortAlphaDown } from '@fortawesome/free-solid-svg-icons'
import { faSortAlphaUpAlt } from '@fortawesome/free-solid-svg-icons'
import { faSortAlphaDownAlt } from '@fortawesome/free-solid-svg-icons'
import { faSortNumericUp } from '@fortawesome/free-solid-svg-icons'
import { faSortNumericDown } from '@fortawesome/free-solid-svg-icons'
import { faSortNumericDownAlt } from '@fortawesome/free-solid-svg-icons'

import icon_nature  from './icons/nature.png'
import icon_chaos   from './icons/chaos.png'
import icon_sorcery from './icons/sorcery.png'
import icon_death   from './icons/death.png'
import icon_life    from './icons/life.png'

import icon_attack  from './icons/attack.png'
import icon_health  from './icons/health.png'
import icon_intelligence from './icons/intelligence.png'
import icon_defense   from './icons/defense.png'
import icon_speed    from './icons/speed.png'

import InfoModal from './components/InfoModal'
import UploadPartyModal from './components/UploadPartyModal'

import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'

import parsePartyString from './functions/parsePartyString';

import './App.scss';

Modal.setAppElement("#root");

const UID_HASH_LENGTH = 6;
const MONSTERS_PER_PAGE = 120;

const monsterData = require('./data/data');

const metadata = require('./data/metadata');

const compendium_version = metadata.compendium_version;


// Construct a map (i.e. a JSON dictionary) that maps UIDs to the index
// of that UID in monsterSelectionRows.
function buildUIDMap() {
  let monsterMap = {}
  for(let i in monsterData) {
    monsterMap[monsterData[i].uid] = parseInt(i);
  }
  return monsterMap;
}

// Construct a map (i.e. a JSON dictionary) that maps lowercased trait_names to
// the UIDs in the database. This is necessary to import party strings.
function buildTraitMap() {
  let traitMap = {}
  for(let i in monsterData) {
    traitMap[monsterData[i].trait_name.toLowerCase()] = monsterData[i].uid;
  }
  return traitMap;
}

const monsterUIDMap = buildUIDMap();
const monsterTraitMap = buildTraitMap();











// A single field in the header of the Monster Selection table.
class HeaderField extends PureComponent {

  // For stats, render a stat icon according to their value.
  renderStatIcon(stat) {
    let icon = "";

    if(stat === "stats.health") icon = icon_health;
    if(stat === "stats.attack")  icon = icon_attack;
    if(stat === "stats.intelligence") icon = icon_intelligence;
    if(stat === "stats.defense") icon = icon_defense;
    if(stat === "stats.speed") icon = icon_speed;
    
    return (<img src={icon} className="class-icon" alt={"stat-" + stat}/>);
  }

  // Render a sort button when sortOrder is not null.
  renderSortButton() {
    let icon = faCaretUp;
    switch(this.props.sortOrder) {
      case 'asc':
        icon = this.props.type === "numeric" ? faSortNumericDownAlt : faSortAlphaDownAlt;
        break;        
      case 'desc':
        icon = this.props.type === "numeric" ? faSortNumericDown : faSortAlphaDown;
        break;
      default:
        return "";
    }
    return <FontAwesomeIcon icon={icon}/>;
  }

  render() {
    return (
      <div className={("monster-row-" + this.props.class_name) + (this.props.sortable ? " sortable" : "")}
       onClick={() => { if(this.props.sortable) this.props.updateSortField(this.props.sort_name)} }
      >
        {this.props.sort_name.startsWith('stats') ? this.renderStatIcon(this.props.sort_name) : this.props.field_name}
        {
          this.props.sortable &&
          <span className="sort-button">
            { this.renderSortButton() }
          </span>
        }
      </div>
    )
  }
}

// The header of the monster table (on the monster selection window).
class MonsterSelectionRowHeader extends PureComponent {

  render() {

    const fields = [
      {sort_name: "", class_name: "in-party", field_name: "", not_sortable: true},
      {sort_name: "class", type: "alpha", class_name: "class", field_name: "Class"},
      {sort_name: "family", type: "alpha",class_name: "family", field_name: "Family"},
      {sort_name: "creature", type: "alpha", class_name: "creature", field_name: "Creature"},
      {sort_name: "trait_name", type: "alpha", class_name: "trait_name", field_name: "Trait"},
      {sort_name: "trait_description", type: "alpha", class_name: "trait_description", field_name: "Trait Description"},
      {sort_name: "stats.health", type: "numeric", class_name: "stat", field_name: "H"},
      {sort_name: "stats.attack", type: "numeric", class_name: "stat", field_name: "A"},
      {sort_name: "stats.intelligence", type: "numeric", class_name: "stat", field_name: "I"},
      {sort_name: "stats.defense", type: "numeric", class_name: "stat", field_name: "D"},
      {sort_name: "stats.speed", type: "numeric", class_name: "stat", field_name: "S"},
      {sort_name: "material_name", type: "alpha", class_name: "material_name", field_name: "Material Name"}
    ]

    return (
      <div className={"monster-row monster-row-header detailed" + (this.props.sortField ? " sorted" : "")}>
        { fields.map((field, i) => 
          <HeaderField sort_name={field.sort_name}
                       class_name={field.class_name}
                       field_name={field.field_name}
                       sortable={!field.not_sortable}
                       type={field.type}
                       sortOrder={field.sort_name === this.props.sortField ? this.props.sortOrder : null}
                       updateSortField={this.props.updateSortField}
                       />
        )}      
            
      </div>
    )
  }
}


// A simple function to render a monster class icon.
// It knows which icon to render via props.icon.
function MonsterClassIcon(props) {
  let pi = props.icon.toLowerCase();
  let icon;
  if(pi === "nature") icon = icon_nature;
  if(pi === "chaos")  icon = icon_chaos;
  if(pi === "sorcery") icon = icon_sorcery;
  if(pi === "death") icon = icon_death;
  if(pi === "life") icon = icon_life;

  return (
    <span className="cls-icon">{icon && <img src={icon} className="class-icon" alt={"class-" + pi}/>}</span>
  )
}

// A class that corresponds to a single MonsterRow from within the Monster Planning window
// (i.e. the list of 18 traits) or the Monster Selection page (i.e. the big table of all monsters).
//
// If props.renderFullRow is true, it will render a full row (as per the Monster Selection page),
// otherwise it renders a short row (as per the Monster Planner window).
class MonsterPlannerRow extends Component {

  // A function for rendering a particular class (cls). 
  // It will render an icon if the class is one of the 5 classes in the game,
  // otherwise it will render the full name of the class (e.g. "Rodian Master").
  renderClass(cls, fullName) {
    let c = this.props.class.toLowerCase();
    let iconedClass = c === "nature" || c === "chaos" || c === "death" || c === "sorcery" || c === "life";

    return (
      <div className={"cls-container" + (!fullName ? " center" : "")}>
        { iconedClass && <MonsterClassIcon icon={this.props.class} /> }
      </div>
    )
  }

  render() {
    return (
      <div className={"monster-row" + (this.props.inTraitSlot ? " is-trait" : "")}>
        <div className="monster-row-class">
          <span className="mobile-only ib"><b>Class:&nbsp;&nbsp;</b></span>{this.renderClass(this.props.class, this.props.renderFullRow)}
        </div>
        <div className="monster-row-family">
          <span className="mobile-only ib"><b>Family:&nbsp;</b></span>{this.props.family}
        </div>
        <div className="monster-row-creature">
          <span className="mobile-only ib"><b>Creature:&nbsp;</b></span>{this.props.creature}
        </div>
        <div className="monster-row-trait_name">
          <span className="mobile-only ib"><b>Trait name:&nbsp;</b></span>{this.props.trait_name}
        </div>
        <div className={"monster-row-trait_description"}>
          <span className="mobile-only ib"><b>Trait description:&nbsp;</b></span>{this.props.trait_description}
        </div>
      </div>
    );
  }
}


// A single stat in the MonsterSelection table, colourised based on how high it is with
// respect to the stats of other monsters.
class MonsterStat extends PureComponent {




  // Colour the background according to the stat's value with respect to the stats of
  // the other monsters.
  // This is determined via the metadata.
  getStatBackground() {
    const stat = this.props.stat;
    const value = this.props.value;

    const avgStat = metadata.average_stats[stat.toLowerCase()];
    const minStat = metadata.min_stats[stat.toLowerCase()];
    const maxStat = metadata.max_stats[stat.toLowerCase()];

    let colour = 'rgba(0, 0, 0, ';
    let positive = 0;
    if(value > avgStat) positive = 1;
    else if (value < avgStat) positive = -1;

    let opacity = 0;
    if(positive > 0) opacity = (value - avgStat) / (maxStat - avgStat);
    else if(positive < 0) opacity = (avgStat - value) / (avgStat - minStat);

    if(positive > 0) colour = 'rgba(0, 235, 16, ';
    else if(positive < 0) colour = 'rgba(252, 19, 3, ';

    return {'background': colour + (opacity * 0.75) + ')'}

  }

  render() {

    return (
      <div className={"monster-row-stat "}>
        <span className="mobile-only ib"><b>{this.props.stat}:&nbsp;</b></span>
        <span className="stat-value" style={this.getStatBackground()}>{this.props.value || "-"}</span>        
      </div>
    )
  }
}


// A fragment of all stats of a particular monster in the MonsterSelection table.
class MonsterStats extends PureComponent {

  render() {
    const stats = ['Health', 'Attack', 'Intelligence', 'Defense', 'Speed'];
    return (
      <React.Fragment>
        {stats.map((stat, i) => 
          <MonsterStat stat={stat} value={this.props[stat.toLowerCase()]} />
        )}
      </React.Fragment>
    )
  }
}

class MonsterSelectionRow extends Component {

  // A function for rendering a particular class (cls). 
  // It will render an icon if the class is one of the 5 classes in the game,
  // otherwise it will render the full name of the class (e.g. "Rodian Master").
  renderClass(cls, fullName) {
    let c = this.props.class.toLowerCase();
    let iconedClass = c === "nature" || c === "chaos" || c === "death" || c === "sorcery" || c === "life";

    return (
      <div className={"cls-container" + (!fullName ? " center" : "")}>
        { iconedClass && <MonsterClassIcon icon={this.props.class} /> }
        <span className={"cls-full-name col-cls-" + cls.toLowerCase()}>{this.props.class}</span>
      </div>
    )
  }

  render() {
    return (
      <div className="monster-row detailed">

        <div className="monster-row-in-party">
          { this.props.inParty && <span className="green-tick"><FontAwesomeIcon icon={faCheck}/></span>}
        </div>

        <div className="monster-row-class">
          <span className="mobile-only ib"><b>Class:&nbsp;&nbsp;</b></span>{this.renderClass(this.props.class, this.props.renderFullRow)}
        </div>
        <div className="monster-row-family">
          <span className="mobile-only ib"><b>Family:&nbsp;</b></span>{this.props.family}
        </div>
        <div className="monster-row-creature">
          <span className="mobile-only ib"><b>Creature:&nbsp;</b></span>{this.props.creature}
        </div>
        <div className="monster-row-trait_name">
          <span className="mobile-only ib"><b>Trait name:&nbsp;</b></span>{this.props.trait_name}
        </div>
        <div className={"monster-row-trait_description"}>
          <span className="mobile-only ib"><b>Trait description:&nbsp;</b></span>{this.props.trait_description}        
        </div>

        <MonsterStats {...this.props.stats}/>

        <div className="monster-row-material_name">
          {this.props.material_name}
        </div>
      </div>
    );
  }
}






// A row from the Monster Planner interface.
// This wraps around MonsterRow, above, providing the functionality for dragging and
// dropping and row validation.
class MonsterPlannerRowContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      justUpdated: false, // set to true when the component has just been updated
                          // (so that the row flashes, providing some nice visual feedback)
    }

    this.justUpdatedTimeout = null;
  }

  // If this component updated, set 'justUpdated' to true so that the row flashes for a second.
  componentDidUpdate(prevProps, prevState) {
    if(!this.state.justUpdated && !_.isEqual(prevProps.monster, this.props.monster)) this.setJustUpdated();
  }

  // set justUpdated to true. Once done, create a timeout to set justUpdated to false again after 1s.
  setJustUpdated() {
    this.setState({
      justUpdated: true
    }, () => {
      window.clearTimeout(this.justUpdatedTimeout);
      this.justUpdatedTimeout = window.setTimeout( () => this.clearJustUpdated(), 1000);
    })
  }

  // Set justUpdated to false.
  clearJustUpdated() {
    this.setState({
      justUpdated: false,
    })
  }

  // Return true if this row is empty (i.e. it corresponds to a monster), else false.
  isEmptyRow() {
    return _.isEmpty(this.props.monster);
  }

  // Check this row for errors. Return the error in the form of a string if present, else return null.
  getRowErrors() {
    if(!this.props.needsValidation) return null;
    if(this.isEmptyRow()) return null;

    if(!this.props.inTraitSlot && (this.props.monster.class === "Rodian Master" || this.props.monster.class === "Nether Boss" || this.props.monster.class === "Backer")) return "This trait cannot be found on a playable creature and cannot be placed in a creature slot.";
    if(this.props.inTraitSlot && (this.props.monster.material_name === "N/A" || this.props.monster.material_name === "No Material Exists")) return "This trait has no material and cannot be placed in the trait slot.";
    return null;
  }

  // A special function for rendering an empty row.
  // If there was an error (such as the monster no longer existing after uploading), print that error to the row.
  // Note that this error is different from the output of getRowErrors above - it is a parsing-related error such
  // as the buildString containing a creature that no longer exists or has changed.
  renderEmptyRow() {
    return (
      <div className="monster-row empty-row">
      	{ this.props.error && <span className="monster-row-error"><FontAwesomeIcon icon={faExclamationTriangle} />Error: {this.props.error}. </span>}
      	{"Click to add a" + (this.props.inTraitSlot ? "n artifact trait" : " monster")}
      </div>
    )
  }

  render() {

    const rowErrors = this.getRowErrors();
    const emptyRow = this.isEmptyRow();

    let rowClass = "";
    // If this monster has a class, set rowClass accordingly.
    // This allows the row to be coloured according to the creature's class.
    if(this.props.monster.class) {
      rowClass = " cls-" + this.props.monster.class.toLowerCase();
      if(this.props.inTraitSlot) rowClass = " cls-trait";
    } else {
      rowClass = " cls-empty";
    }

    return (
    <div className="monster-row-wrapper">
      {this.props.inPrimarySlot && 
        <div className={"creature-sprite-container" + (this.props.monster.sprite_filename ? "" : " empty")}>
          { this.props.monster.sprite_filename &&
            <div className="creature-sprite" style={{"backgroundImage": "url(/siralim-planner/suapi-battle-sprites/" + this.props.monster.sprite_filename + ")"}}></div>
          }
        </div>
      }
      <div
        className={"monster-row-container monster-row-container-planner" + 
          (this.props.draggable ? " draggable": "") + 
          (rowErrors ? " invalid-row" : "") + 
          (this.state.justUpdated ? " just-updated": "") + 
          rowClass

        }
        draggable={this.props.draggable}
        onDragStart={this.props.onDragStart({ row_id: this.props.row_id })}
        onDragOver={this.props.onDragOver({ row_id: this.props.row_id })}
        onDrop={this.props.onDrop({ row_id: this.props.row_id })}

        onMouseUp={ () => this.props.onMouseUp({ row_id: this.props.row_id })}

        title={rowErrors }
        data-row={this.props.creatureSlot}
      >
      
      { emptyRow ?
        this.renderEmptyRow() : 
        <MonsterPlannerRow {...this.props.monster} inTraitSlot={this.props.inTraitSlot} error={this.props.error} />   
      }
      </div>
      <div className="monster-row-controls">
        { !emptyRow && <button id={"remove-trait-" + (this.props.creatureSlot + 1)} className="delete-button" aria-label="Delete trait" onClick={() => this.props.clearMonsterPlannerRow(this.props.row_id)}><FontAwesomeIcon icon={faTimes} /></button>}
      </div>
    </div>
    )
  }
}



// The MonsterPlanner interface (i.e. the main page with the 18 rows).
//
// Drag and drop Code found here: https://codepen.io/frcodecamp/pen/OEovqx
class MonsterPlanner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      dragging: false,

      row_ids: [],
      monsters: [],
    }
    this.myRef = React.createRef();
  }

  // If this component updates and the prev props are different to the current props,
  // Update the monsterRows.
  componentDidUpdate(prevProps, prevState) {
    if(!_.isEqual(prevProps, this.props)) {
      this.setState({
        items: this.props.monsterRows
      });
    }
  }

  // A function to handle the drag start (i.e. when a row is dragged).
  handleDragStart = data => event => {
    let fromItem = JSON.stringify({ row_id: data.row_id });
    event.dataTransfer.setData("dragContent", fromItem);
    this.setState({
      dragging: true,
    })
  };

  // A function to handle the drag over event.
  handleDragOver = data => event => {
    event.preventDefault(); // Necessary. Allows us to drop.
    this.setState({
      dragging: false,
    })
    return false;
  };

  // A function to handle the event when dragging something and the mouse button is released.
  // When this happens, the rows are swapped.
  handleDrop = data => event => {
    event.preventDefault();

    let fromItem = JSON.parse(event.dataTransfer.getData("dragContent"));
    let toItem = { row_id: data.row_id };

    this.swapItems(fromItem, toItem);
    return false;
  };

  // A function to swap two items.
  // Once this swap is complete, pass this update to the parent component
  // so that the monsterPlannerRows are updated.
  // These changes will get propagated back to this component.
  swapItems = (fromItem, toItem) => {
    let items = this.state.items.slice();
    let fromIndex = -1;
    let toIndex = -1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].row_id === fromItem.row_id) {
        fromIndex = i;
      }
      if (items[i].row_id === toItem.row_id) {
        toIndex = i;
      }
    }

    if (fromIndex !== -1 && toIndex !== -1) {
      let { fromId, ...fromRest } = items[fromIndex];
      let { toId, ...toRest } = items[toIndex];
      items[fromIndex] = { id: fromItem.id, ...toRest };
      items[toIndex] = { id: toItem.id, ...fromRest };

      this.setState({ items: items, dragging: false }, () => this.props.updateMonsterPlannerRows(this.state.items));
    }    
  };

  // When the mouse button is released while hovering over a row,
  // call the openModal function on the parent of this component.
  // i.e. Open the MonsterSelection modal when a row is clicked.
  handleMouseUp(row_id, slot_id, monster) {
    this.props.openModal(row_id, slot_id, monster);
  }

  render() {
    return (
      <div id="monster-planner" className="monster-planner monster-list" ref={this.myRef}>
        {this.state.items.map((monsterRow, i) => 
          <MonsterPlannerRowContainer monster={monsterRow.monster}
          error={monsterRow.error}
          key={i}
          row_id={ monsterRow.row_id }
          draggable="true"
          onDragStart={this.handleDragStart}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
          onMouseUp={() => this.handleMouseUp(monsterRow.row_id, i, monsterRow.monster ? monsterRow.monster : null)}
          inPrimarySlot={(i + 1) % 3 === 1 && i <= 18}
          inTraitSlot={(i + 1) % 3 === 0 && i <= 18}
          needsValidation={i <= 18}
          creatureSlot={i <= 18 ? Math.floor((i + 1) / 3) : null}
          clearMonsterPlannerRow={this.props.clearMonsterPlannerRow}
          { ...this.props.openModal }
          />             
        )}
      </div>
    )
  }
}



// A simple function that returns the family of a creature, or the class + ' traits' in the case that
// the family is not present (as is the case for backer traits).
// This is used for the page names on the Monster Selection window.
function getPageFamily(m) {
  return m.family ? m.family : m.class + " traits"; // Exception for Backer traits
}

// Get the 'semantic name' of a monster, for the top of the Monster Selection window.
// i.e. "Abomination / Brute".
function getMonsterSemanticName(m) {
  return m.family ? (m.family + " / " + m.creature) : (m.class + " (" + m.trait_name + ")");
}

// The Monster Selection modal, i.e. the window that contains a list of all monsters/traits in
// Siralim Ultimate.
class MonsterSelectionModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      items: [],  // A list of all rows from the dataset.
      filteredItems: [], // A list of filtered rows from the dataset, i.e. after the search term has been applied.

      filteredItemGroups: [{"start": 0, "end": 0}], // A list of the item groups (or pages). Looks as follows:
      // [{ "start": 0, "end": 93, "familyStart": "Abomination", "familyEnd": "Aspect"}]
      currentPage: 0, // The index of the current page that the user is on.

      currentSearchTerm: "", // The current search term, i.e. what is in the search box.
      appliedSearchTerm: "", // The *applied* search term, which is applied 0.5s after the user finishes
                             // typing something into the search box.

      sortField: null, // The current field to sort by, e.g. "Class".
      sortOrder: null, // The current sort order, i.e. null, 'asc', 'desc'.
    }
    this.searchTimeout = null; // A timeout that takes place after the user stops typing in the search box.
    this.tableRef = React.createRef(); // A reference of the monster table, so that it can be used to scroll back
                                       // to the top when switching between pages.
  }

  // When this component updates, and the monsterRows have changed
  // (which should only happen on first load), set state.items accordingly
  // and set filteredItems to be the same list of rows.
  componentDidUpdate(prevProps, prevState) {
    if(!_.isEqual(prevProps.monsterRows, this.props.monsterRows)) {

      let filteredItemGroups = this.getItemGroups(this.props.monsterRows);

      this.setState({
        items: this.props.monsterRows,
        filteredItems: [...this.props.monsterRows],
        filteredItemGroups: filteredItemGroups,
      });
    }
  }


  // A terribly written function that basically puts all of the monsters into particular groups.
  // This is for pagination.
  // The result is a list of monster groups, for example:
  //
  // {start: 0, end: 120, familyStart: "Abomination", familyEnd: "Basilisk"} means that
  // monster #0 to monster #120 belong on the first page. The first family is Abomination,
  // and the last family is Basilisk.
  //
  // Rather than using fixed page size (i.e. 100), this function ensures that the families
  // are not split onto separate pages, i.e. there might be 102 on a page so that
  // one of the families is not split onto two separate pages.
  //
  // This function is super awkward and needs rewriting, but it works for now.
  getItemGroups(items) {  
    let itemGroups = [];
    let currentGroup = {"start": 0, "end": null, "familyStart": null, "familyEnd": null}
    let monstersInCurrentGroup = [];
    for(let i = 0; i < items.length; i++) {
      let item = items[i];
      let m = item.monster;
      let f = getPageFamily(m)

      if(!currentGroup.familyStart) currentGroup.familyStart = f;
      monstersInCurrentGroup.push(m);
      if((monstersInCurrentGroup.length > MONSTERS_PER_PAGE) && 
          (f !== getPageFamily(monstersInCurrentGroup[Math.max(0, monstersInCurrentGroup.length - 2)]))) {
        currentGroup.end = i;
        currentGroup.familyEnd = getPageFamily(monstersInCurrentGroup[Math.max(0, monstersInCurrentGroup.length - 2)]);
        itemGroups.push(currentGroup);
        currentGroup = {"start": i, "end": null, "familyStart": f, "familyEnd": null}
        monstersInCurrentGroup = [];
      }
    }

    // Catch the last group as well.
    if(monstersInCurrentGroup.length > 0) {
      let i = items.length - 1;

      currentGroup.end = i + 1;
      currentGroup.familyEnd = getPageFamily(monstersInCurrentGroup[Math.max(0, monstersInCurrentGroup.length - 1)]);

      itemGroups.push(currentGroup);
    }

    return itemGroups;
  }

  // A function that sets the currentSearchTerm to the value the user has typed in the search box.
  // 0.5s after the user has stopped typing, apply the search term.
  handleSearchChange(e) {
    window.clearTimeout(this.searchTimeout);
    this.setState({
      currentSearchTerm: e.target.value,
    }, () => {
      this.searchTimeout = window.setTimeout( () => this.applySearchTerm(), 500);
    });
  }


  sortResults(filteredItems) {
    const field = this.state.sortField;
    const order = this.state.sortOrder;

    function compare(a, b) {
      const sf = field.split('.')
      let af = _.get(a.monster, sf, -1);
      let bf = _.get(b.monster, sf, -1);
      if(af === '') af = "zzzzzzz"; // For empty strings (backer traits etc), treat them as if they were zzzz, e.g. last
      if(bf === '') bf = "zzzzzzz";

      if( af < bf ) return order === "asc" ? 1 : -1;
      if( af > bf ) return order === "asc" ? -1 : 1;
      return 0;
    }


    // Sort the filteredItems if sortField is not null
    if(this.state.sortField) return filteredItems.sort((a, b) => compare(a, b));
    return filteredItems;
  }

  // A function to filter the results (this.state.items) to only results that include
  // the applied search term.
  filterResults() {
    let searchTerm = this.state.currentSearchTerm.toLowerCase();
    let filteredItems = [];
    const items = this.state.items;
    for(let item of items) {
      let searchText = item.monster.search_text;
      if(searchText.toLowerCase().indexOf(searchTerm) !== -1) {
        filteredItems.push({monster: item.monster});
      }      
    }
    const sortedFilteredItems = this.sortResults(filteredItems);
    const filteredItemGroups = this.getItemGroups(sortedFilteredItems);

    this.setState({
      currentPage: 0,
      filteredItems: sortedFilteredItems,
      filteredItemGroups: filteredItemGroups
    }, () => { this.tableRef.current.scrollTo(0, 0) }) // Scroll to top of table once complete.
  }



  // Apply the search term and filter the results accordingly.
  applySearchTerm() {
    this.setState({
      appliedSearchTerm: this.state.currentSearchTerm
    }, () => this.filterResults())
  }

  // Clear the search term. Currently unused.
  resetSearchTerm() {
    if(this.state.currentSearchTerm === "") return;
    this.setState({
      currentSearchTerm: "",
    })
  }

  // A function to render the results count.
  // The output depends on whether *all* results are being shown,
  // or a filtered list.
  renderResultsCount() {   

    let r =  <span><b>{this.state.filteredItems.length}</b> of <b>{this.state.items.length}</b> results</span>;
    if(this.state.filteredItems.length === this.state.items.length) {
      r = <span>all <b>{this.state.items.length}</b> results</span>
    }
    let f = "";
    if(this.state.appliedSearchTerm) {
      f = " matching the current search term";
    }
                
    return (
      <span>Displaying {r}{f}.</span>
    )
  }

  // Go to a particular page, i.e. set currentPage = pageNum.
  // Scroll to top of table once complete.
  goToPage(pageNum) {
    this.setState({
      currentPage: pageNum,
    }, () => { this.tableRef.current.scrollTo(0, 0) })
  }


  updateSortField(sortField) {
    this.setState({
      sortField: (sortField === this.state.sortField && this.state.sortOrder === "asc") ? null : sortField,
      sortOrder: 
        this.state.sortField === sortField ? (
          this.state.sortOrder === "desc" ? "asc" :
          (
            this.state.sortOrder === "asc" ? null : "desc"
          )
        ) : "desc"      
    }, () => this.filterResults())
  }



  renderPageName(i, itemGroup) {

    let pageStart = "";
    let pageEnd = "";

    // if(!this.state.sortField) {
    //   pageStart = itemGroup.familyStart;
    //   pageEnd = itemGroup.familyEnd;
    //   return  pageStart + " - " + pageEnd;
    // }

    var sf = this.state.sortField ? this.state.sortField.split('.') : "family";
    if(!this.state.filteredItems[this.state.filteredItemGroups[i].start]) pageStart = "(unknown)";
    else {
      pageStart = String(_.get(this.state.filteredItems[this.state.filteredItemGroups[i].start].monster, sf, "(empty)"));
      if(pageStart.length > 8) pageStart = pageStart.slice(0, 7) + "..."

    }


    if(!this.state.filteredItems[this.state.filteredItemGroups[i].end - 1]) pageEnd = "(unknown)";
    else {
      pageEnd = String(_.get(this.state.filteredItems[this.state.filteredItemGroups[i].end - 1].monster, sf, "(empty)"));
      if(pageEnd.length > 8) pageEnd = pageEnd.slice(0, 7) + "..."
    }

    return pageStart + " - " + pageEnd;
                        
  }

  // This render function needs tidying up, it's a bit long.
  render() {

    // Get the start and end index via this.state.filteredItemGroups.
    let startIndex = this.state.filteredItemGroups[this.state.currentPage] ? this.state.filteredItemGroups[this.state.currentPage].start : 0;
    let endIndex = this.state.filteredItemGroups[this.state.currentPage] ? this.state.filteredItemGroups[this.state.currentPage].end : 0;

    let creature_number = Math.floor(this.props.currentSelectedIndex / 3) + 1;
    let slot = (this.props.currentSelectedIndex + 1) % 3 === 1 ? "primary" : ((this.props.currentSelectedIndex + 1)  % 3 === 2) ? "secondary" : "artifact";
    let slot_n = slot === "artifact" ? "n" : "";
    let currentMonster = !_.isEmpty(this.props.currentSelectedMonster) ? getMonsterSemanticName(this.props.currentSelectedMonster) : null;

    return (
        <div className="modal-content">
          <div className="modal-header">
            <h3>Select a{slot_n} <b>{slot}</b> trait for party member <b>{creature_number}</b>. <span style={{'marginLeft': '20px'}}>{currentMonster && ("Current: " + currentMonster)}</span></h3>
            <button id="close-modal" className="modal-close" aria-label="Close trait selection" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
          
          </div>
          <div className="monster-selection-modal">
              <div className="monster-selection-controls">
                <div className="monster-selection-search-tools">
                  <input id="monster-search" className="monster-search" autoFocus type="text" placeholder="Search monsters/traits..." onChange={(e) => this.handleSearchChange(e)} value={this.state.currentSearchTerm} />
                </div>                
               <div className="monster-selection-pagination">
                  {this.state.filteredItemGroups.map((itemGroup, i) =>
                      <div role="button" key={i} onClick={() => this.goToPage(i)} className={"tab" + (this.state.currentPage === i ? " active" : "")}>
                        {this.renderPageName(i, itemGroup)}

                      </div>
                  )}
                </div>
                <div className="mobile-hidden monster-row-container monster-row-container-selection monster-row-container-header">
                  <MonsterSelectionRowHeader sortField={this.state.sortField} sortOrder={this.state.sortOrder} updateSortField={this.updateSortField.bind(this)} /> 
                </div> 
              </div>

              <div className="monster-selection-list monster-list" ref={this.tableRef}>
                  {this.state.filteredItems.slice(startIndex, endIndex).map((monsterRow, i) =>                 
                    <div className={"monster-row-container monster-row-container-selection selectable" + 
                      ((monsterRow.monster && this.props.currentSelectedMonster && (monsterRow.monster.uid === this.props.currentSelectedMonster.uid)) ? " currently-selected-monster" : "")}
                      key={i}
                      onMouseUp={() => this.props.updateMonsterPlannerRow(monsterRow.monster)}>
                      <MonsterSelectionRow {...monsterRow.monster} 
                      renderFullRow={true}
                      searchTerm={this.state.currentSearchTerm}
                      inParty={this.props.monstersInParty.has(monsterRow.monster.uid)}
                      {...this.props.updateMonsterPlannerRow} /> 
                    </div>
                  )}              
              </div>
              <div className="monster-selection-results-count">
                 { this.renderResultsCount() }
              </div>
          </div>
        </div>
    )
  }
}

// A notification banner that displays information at the top.
class NotificationBanner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hidden: true,
    };
    this.fadeOutTimeout = null;
  }

  // When this component updates such that the prevProps are different
  // and this notification banner was not already showing, set hidden=false
  // (so the banner appears) and set a timeout for 6s for it to hide again.
  componentDidUpdate(prevProps, prevState) {
    if(_.isEqual(prevProps, this.props) && prevState.hidden === false) return;
    if(this.props.status === null) return; // Ignore first successful load, which is null.
    if(prevProps.notificationIndex === this.props.notificationIndex) return;

    this.setState({
      hidden: false,
    }, () => {
      window.clearTimeout(this.fadeOutTimeout);
      this.fadeOutTimeout = window.setTimeout( () => this.setHidden(), 6000);
    });    
  }

  // Hide the notification banner (this sets the opacity to 0 via CSS so 
  // that way nothing gets moved around awkwardly)
  setHidden() {
    this.setState({
      hidden: true,
    })
  }

  render() {
    let icon = faExclamationTriangle;
    if(this.props.status === "success") icon = faCheck;

    return (
    <div className={"notification-banner notification-" + this.props.status + (this.state.hidden ? " hidden" : "")}>
        <FontAwesomeIcon icon={icon}/>&nbsp;&nbsp;{this.props.text}
    </div>
    )

  }
}

// The main class.
class SiralimPlanner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      monsterPlannerRows: [],        // A list of the 18 monsters in the party planner interface.
      monsterSelectionRows: [],      // A list of 'monster selection rows', i.e. the dataset of all
                                     // monsters from data.json.
      currentRowId: null,            // The current row id, i.e. the row_id of the slot the user
                                     // user most recently clicked on in the party planning interface.
                                     // row_ids are unique (so if you move row_id=0 to slot 3, it will)
                                     // still be row_id=0 even though it is in slot 3 - this is necessary
                                     // to get the drag and drop functionality to work.
      currentSlotId: null,           // The current slot id, i.e. the slot the user most recently
                                     // clicked on in the party planning interface.
                                     // slot id = 0 means the first row in the table.
      currentSelectedMonster: null,  // A JSON obj corresponding to the monster that is currently
                                     // selected, i.e. the one the user most recently clicked in
                                     // the party planning interface.
      monstersInParty: new Set(), // An set of uids of the monsters/trait in the user's party
      modalIsOpen: false,             // Whether the monster selection modal is open.
      infoModalIsOpen: false,         // Whether the information modal is open.
      uploadBuildModalIsOpen: false,  // Whether the upload build modal is open.

      notificationText: null, // Text to display in the notification banner at the top.
      notificationStatus: null,       // The status of the notification, e.g. 'success', 'warning', 'error'.
      notificationIndex: 0, // Keep track of the index of each notification, to avoid weird bugs with the
                            // banner refreshing for no reason when this component updates.
    }    
  }


  // Generate a 'save string', which is a unique identifier of the entire party.
  // This is done by taking the uid of each monster (underscore if no monster)
  // across each of the 18 slots.
  // Note that the string is quite long, and will be even longer if we later add
  // in other things like traits, perks etc... so we might need to develop a 
  // back-end application like Flask to be able to generate a short URL.
  generateSaveString() {
    let monsterPlannerRows = this.state.monsterPlannerRows;
    let saveString = "";
    for(let i = 0; i < 18; i++) {
      let m = monsterPlannerRows[i];
      if(!_.isEmpty(m.monster)) saveString += m.monster.uid;
      else saveString += "_";
    }
    this.props.history.push('?b=' + saveString);
  }

  // Retrieve a set of the uids of every monster in the current party.
  getMonstersInParty(monsterPlannerRows) {
    let monstersInParty = new Set();
    // Update monsters in party
    for(let m of monsterPlannerRows) {
      if(m.monster.uid) monstersInParty.add(m.monster.uid);
    }
    return monstersInParty;
  }

  // Given a particular monster, update the monster at the currentRowId
  // to be set to that monster.
  updateMonsterPlannerRow(monster) {
    let monsterPlannerRows = [...this.state.monsterPlannerRows];
    let monstersInParty = this.state.monstersInParty;
    for(let i in monsterPlannerRows) {
      let m = monsterPlannerRows[i];
      if(m.row_id === this.state.currentRowId) {
        monsterPlannerRows[i].monster = monster;        
        break;
      } 
    }
    monstersInParty = this.getMonstersInParty(monsterPlannerRows);
    this.setState({
      monsterPlannerRows: [...monsterPlannerRows],
      monstersInParty: monstersInParty
    }, () => { 
    	this.closeModal(); 
  		this.generateSaveString();
	})
  }

  // Given a particular row_id (a unique identifier for each row on the Planner table),
  // remove the monster/trait corresponding to that row_id from the party.
  clearMonsterPlannerRow(row_id) {
    let monsterPlannerRows = [...this.state.monsterPlannerRows];
    for(let i in monsterPlannerRows) {
      let m = monsterPlannerRows[i];
      if(m.row_id === row_id) {
        monsterPlannerRows[i].monster = {};
        break;
      } 
    }
    let monstersInParty = this.getMonstersInParty(monsterPlannerRows);
    this.setState({
      monsterPlannerRows: monsterPlannerRows,
      monstersInParty: monstersInParty,
    }, this.generateSaveString)
  }

  // Update the 18 monster planner rows to newRows and generate an updated
  // saveString.
  updateMonsterPlannerRows(newRows) {
    this.setState({
      monsterPlannerRows: newRows,
    }, this.generateSaveString);
  }


  // Parse the loadString into a list of UIDs (or null for underscores).
  parseLoadString(str) {
  	let uids = [];
  	let currentUid = '';
  	for(let i = 0; i < str.length; i++) {
  		let c = str[i];
  		if(c === "_") {
  			if(currentUid.length > 0 && currentUid.length < UID_HASH_LENGTH) throw new Error("Malformed uid");
  			uids.push(null);
  		} else {
  			currentUid += c;
  			if(currentUid.length === UID_HASH_LENGTH) {
  				uids.push(currentUid);
  				currentUid = '';
  			}
  		}
  	}
    // Throw errors if the string is not valid (i.e. too short or too long).
  	if(uids.length > 18) throw new Error("Too many uids");
  	if(uids.length < 18) throw new Error("Not enough uids");

  	return uids;
  }

  // Given a list of uids, construct a new array of monsterPlannerRows
  // where each item is the monster that corresponds to that particular
  // uid. This is used to read in the buildString (from the URL) and
  // from the in-game export of data to the clipboard.
  //
  // Returns a json object with the 18 rows, any notification message that pops up
  // (right now just that the build could not be parsed or that it was parsed
  // successfully), and a status code
  // (warning, success, error, null).
  populateFromUids(uids) {

    let noti, status;
    let monsterPlannerRows = [];
    // Start by generating an empty list of 18 rows, corresponding to each
    // trait slot.
    for(let i = 0; i < 18; i++) {
      monsterPlannerRows.push({row_id: parseInt(i), monster: {}})
    }

    for(let i = 0; i < Math.min(18, uids.length); i++) {
      let uid = uids[i];
      if(uid !== null) {
        if(monsterUIDMap.hasOwnProperty(uid)) {
          monsterPlannerRows[i].monster = monsterData[monsterUIDMap[uid]];
        } else {
          monsterPlannerRows[i].error = "Monster/trait does not exist or has changed";
          noti = "Your build could not be fully parsed as at least one monster trait was not found in the database.";
          status = "warning";
        }
      }
    }
    if(!noti) {
      noti = "Your build was parsed successfully.";
      status = "success";
    }
    return {rows: monsterPlannerRows, noti: noti, status: status};
  }

  // On component mount, transform monsterData into a new array, i.e.
  // { row_id: <the index of the monster>, monster: <the JSON object of the monster> }
  // This is necessary to get the drag and drop functionality to work.
  // Every row needs a fixed id to function properly.
  componentDidMount() {

    let notificationText = null;
    let notificationStatus = null;

    let monsterPlannerRows = [];

    for(let i = 0; i < 18; i++) {
      monsterPlannerRows.push({row_id: parseInt(i), monster: {}})
    }

    let monsterSelectionRows = [];
    for(let i in monsterData.slice(0, 10000)) { // Set to 10,000 (I like to change to 100 for debug) but this slice can be removed.
      monsterSelectionRows.push({monster: monsterData[i]});
    }

    // Get string from param if there is any
    const windowUrl = window.location.search;
    const params = new URLSearchParams(windowUrl);

    let loadString = params.get('b');

    // If a load string was provided (i.e. the ?b=<etc>), then attempt to create a party from that
    // build string.
    if(loadString) {
      try {
     		const uids = this.parseLoadString(loadString);
        let mpr = this.populateFromUids(uids);
        if(mpr.status !== 'success') {
          notificationText = mpr.noti;
          notificationStatus = mpr.status;
        }
        monsterPlannerRows = mpr.rows;

     	} catch(err) {
        // TODO: Do something else with this, maybe.
     		console.log("Error:", err);
     	}
    }

    this.setState({
      monsterPlannerRows: monsterPlannerRows,
      monsterSelectionRows: monsterSelectionRows,
      notificationText: notificationText,
      notificationStatus: notificationStatus,
      notificationIndex: this.state.notificationIndex + 1,
    });
  }

  // Open the build modal by setting the state accordingly.
  openUploadBuildModal() {
    this.setState({
      uploadBuildModalIsOpen: true,
    })
  }

  // Close the build modal by setting the state accordingly.
  closeUploadBuildModal() {
    this.setState({
      uploadBuildModalIsOpen: false,
    })
  }

  // Open the info modal by setting the state accordingly.
  openInfoModal() {
  	this.setState({
  		infoModalIsOpen: true,
  	})
  }

  // Close the info modal by setting the state accordingly.
  closeInfoModal() {
  	this.setState({
  		infoModalIsOpen: false,
  	})
  }

  // Open the monster selection modal.
  // Set row_id and slot_id to the row_id and slot_id of the trait slot
  // that the user clicked on, respectively.
  // Set monster to equal the monster the user just clicked on
  // (this is necessary to highlight the currently selected monster
  // in the monster selection screen).
  openModal(row_id, slot_id, monster) {
    this.setState({
      modalIsOpen: true,
      currentRowId: row_id,
      currentSlotId: slot_id,
      currentSelectedMonster: monster || null,
    }, () => {
      // Once open, prevent scrolling of the main page while the modal is open.
      document.body.style['overflow-y'] = "hidden";
      document.getElementById('monster-search').focus();
    })
  }

  // Close the monster selection modal.
  // Enable scrolling of the main page again after it closes.
  closeModal() {
    this.setState({
      modalIsOpen: false,
      currentRowId: null,
      currentSlotId: null,
      currentSelectedMonster: null,
    }, () => {
      document.body.style['overflow-y'] = "scroll";
    })
  }


  // Given an array of trait names, return an array
  // consisting of the uids of those particular trait names,
  // null if there was no trait in that slot, 
  // or <not found> if that trait name is not present in the 
  // trait map.
  traitsToUids(traitsArray) {
    let uids = [];
    for(let t of traitsArray) {
      if(t === null) {
        uids.push(null);
        continue;
      }
      let t_ = t.toLowerCase();
      if(monsterTraitMap.hasOwnProperty(t_)) {
        uids.push(monsterTraitMap[t_]);
      } else {
        uids.push("<not found>");
      }
    }
    return uids;
  }

  // Given a party string (from SU), build a party from that string.
  // Call the callback function when finished - this will present an error
  // in the upload party window if necessary.
  uploadPartyFromString(str, callback) {
    let notificationText = null;
    let notificationStatus = null;

    try {
      let traits = parsePartyString(str);
      let uids = this.traitsToUids(traits);
      let mpr = this.populateFromUids(uids);
      if(mpr.noti) notificationText = mpr.noti;
      if(mpr.status) notificationStatus = mpr.status;
      let monsterPlannerRows = mpr.rows;
      this.setState({
        monsterPlannerRows: monsterPlannerRows,
        uploadBuildModalIsOpen: false,
        notificationText: notificationText,
        notificationStatus: notificationStatus,
        notificationIndex: this.state.notificationIndex + 1,
      }, () => { this.generateSaveString(); callback() });
    } catch(err) {
      return callback(err);
    }

    // TODO: Take the traits and put them into the table etc.
  }

  render() {
    return (
      <div className="App" id="app">
        <AppHeader openUploadBuildModal={this.openUploadBuildModal.bind(this)} openInfoModal={this.openInfoModal.bind(this)} compendiumVersion={compendium_version}/>
        <NotificationBanner text={this.state.notificationText} status={this.state.notificationStatus} notificationIndex={this.state.notificationIndex} />

        <UploadPartyModal modalIsOpen={this.state.uploadBuildModalIsOpen} closeModal={this.closeUploadBuildModal.bind(this)} uploadPartyFromString={this.uploadPartyFromString.bind(this)}/>
        <InfoModal modalIsOpen={this.state.infoModalIsOpen} closeModal={this.closeInfoModal.bind(this)}/>

        <div className={"modal-overlay" + (this.state.modalIsOpen ? " is-open" : "")}>
          <MonsterSelectionModal 
            monsterRows={this.state.monsterSelectionRows}
            monstersInParty={this.state.monstersInParty}
            closeModal={this.closeModal.bind(this)}
            updateMonsterPlannerRow={this.updateMonsterPlannerRow.bind(this)} 
            currentSelectedMonster={this.state.currentSelectedMonster} 
            currentSelectedIndex = {this.state.currentSlotId} />
        </div>

        <main>
          <div className="container">
            <MonsterPlanner 
              monsterRows={this.state.monsterPlannerRows}
              updateMonsterPlannerRows={this.updateMonsterPlannerRows.bind(this)}
              openModal={this.openModal.bind(this)}
              clearMonsterPlannerRow={this.clearMonsterPlannerRow.bind(this)} />
          </div>
        </main>
        <AppFooter/>
      </div>
    );
  }
}



export default withRouter(SiralimPlanner);