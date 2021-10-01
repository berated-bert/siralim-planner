import React, {Component, PureComponent} from 'react';
import _ from 'underscore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

import icon_attack  from '../icons/attack.png'
import icon_health  from '../icons/health.png'
import icon_intelligence from '../icons/intelligence.png'
import icon_defense   from '../icons/defense.png'
import icon_speed    from '../icons/speed.png'

import MonsterClassIcon from './MonsterClassIcon'


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
    let c = this.props.monster.class.toLowerCase();
    let iconedClass = c === "nature" || c === "chaos" || c === "death" || c === "sorcery" || c === "life";

    return (
      <React.Fragment> 
        { iconedClass && <MonsterClassIcon icon={this.props.monster.class} /> }
      </React.Fragment>
    )
  }


  render() {
    var m = this.props.monster;

    return (
      <React.Fragment>
        <div className="trait-slot-class">
          <span className="mobile-only ib"><b>Class:&nbsp;&nbsp;</b></span>{this.renderClass(m.class, this.props.renderFullRow)}
        </div>
        <div className="trait-slot-family">
          <span className="mobile-only ib"><b>Family:&nbsp;</b></span>{m.family}
        </div>
        <div className="trait-slot-creature">
          <span className="mobile-only ib"><b>Creature:&nbsp;</b></span>{m.creature}
        </div>
        <div className="trait-slot-trait_name">
          <span className="mobile-only ib"><b>Trait name:&nbsp;</b></span>{m.trait_name}
        </div>
        <div className={"trait-slot-trait_description"}>
          <span className="mobile-only ib"><b>Trait description:&nbsp;</b></span>{m.trait_description}
        </div>
      </React.Fragment>
    );
  }
}

class MonsterPlannerCreatureSprite extends PureComponent {

  render() {
    return (
      <div className={"creature-sprite-container" + (this.props.sprite_filename ? "" : " empty")}>
        { this.props.sprite_filename &&
          <div className="creature-sprite" style={{"backgroundImage": "url(/siralim-planner/suapi-battle-sprites/" + this.props.sprite_filename + ")"}}></div>
        }
      </div>
    );
  }
}

// A row from the Monster Planner interface.
// This wraps around MonsterRow, above, providing the functionality for dragging and
// dropping and row validation.
class MonsterPlannerTraitSlot extends PureComponent {

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
    if(_.isEmpty(this.props.monster)) return null;
    if(!(this.props.traitSlotIndex === 2) && (this.props.monster.class === "Rodian Master" || this.props.monster.class === "Nether Boss" || this.props.monster.class === "Backer")) return "This trait cannot be found on a playable creature and cannot be placed in a creature slot.";
    if(this.props.traitSlotIndex === 2 && (this.props.monster.material_name === "N/A" || this.props.monster.material_name === "No Material Exists")) return "This trait has no material and cannot be placed in the trait slot.";
    return null;
  }

  // A special function for rendering an empty row.
  // If there was an error (such as the monster no longer existing after uploading), print that error to the row.
  // Note that this error is different from the output of getRowErrors above - it is a parsing-related error such
  // as the buildString containing a creature that no longer exists or has changed.
  renderEmptyRow() {
    return (
      <div className="empty-row">
        { this.props.error && <span className="monster-row-error"><FontAwesomeIcon icon={faExclamationTriangle} />Error: {this.props.error}. </span>}
        {"Click to add a" + (this.props.traitSlotIndex === 0 ? " primary trait" : (this.props.traitSlotIndex === 1 ? " fused trait" : "n artifact trait"))}
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
      if(this.props.traitSlotIndex === 2) rowClass = " cls-trait";
    } else {
      rowClass = " cls-empty";
    }

    return (
    <div className="trait-slot">

      <div
        className={"trait-slot-clickable" + 
          (this.props.draggable ? " draggable": "") + 
          (rowErrors ? " invalid-row" : "") + 
          (this.state.justUpdated ? " just-updated": "") + 
          rowClass
        }
        draggable={this.props.draggable}
        onDragStart={this.props.onDragStart()}
        onDragOver={this.props.onDragOver()}
        onDrop={this.props.onDrop()}

        onMouseUp={ this.props.onMouseUp}

        title={rowErrors }
      >
      { emptyRow ? this.renderEmptyRow() :
        <MonsterPlannerRow monster={this.props.monster} error={this.props.error} />   
      }

      </div>
      <div className="trait-slot-controls">
        { !emptyRow && <button id={"remove-trait-" + (this.props.traitSlotIndex + 1)} className="delete-button" aria-label="Delete trait" onClick={this.props.clearPartyMember}><FontAwesomeIcon icon={faTimes} /></button>}
      </div>
    </div>
    )
  }
}

//         <div className="party-member-name">Creature #{this.props.partyMemberId + 1}</div>


class MonsterPlannerCreatureStats extends PureComponent {

  render() {
    let stats = {
      health: "--",
      attack: "--",
      intelligence: "--",
      defense: "--",
      speed: "--"
    }
    const m1 = this.props.monster_1.stats;
    const m2 = this.props.monster_2.stats;

    if(m1 && !m2) {
      stats.health = m1.health;
      stats.attack = m1.attack;
      stats.intelligence = m1.intelligence;
      stats.defense = m1.defense;
      stats.speed = m1.speed;
    }
    else if(m1 && m2) {
      stats.health = Math.floor((m1.health + m2.health) / 2);
      stats.attack = Math.floor((m1.attack + m2.attack) / 2);
      stats.intelligence = Math.floor((m1.intelligence + m2.intelligence) / 2);
      stats.defense = Math.floor((m1.defense + m2.defense) / 2);
      stats.speed = Math.floor((m1.speed + m2.speed) / 2);
    }

    return (
      <div className={"party-member-stats" + (stats.health === "--" ? " empty" : "")}>
        <span><img src={icon_health} className="class-icon" alt={"stat-health"}/><span>{stats.health}</span></span>
        <span><img src={icon_attack} className="class-icon" alt={"stat-attack"}/><span>{stats.attack}</span></span>
        <span><img src={icon_intelligence} className="class-icon" alt={"stat-health"}/><span>{stats.intelligence}</span></span>
        <span><img src={icon_defense} className="class-icon" alt={"stat-health"}/><span>{stats.defense}</span></span>
        <span><img src={icon_speed} className="class-icon" alt={"stat-health"}/><span>{stats.speed}</span></span>
      </div>
    )
  }
}

class MonsterPlannerPartyMember extends PureComponent {
  render() {
    return (
      <div className="monster-planner-party-member">



        <div className="party-member-profile">
          <MonsterPlannerCreatureSprite sprite_filename={this.props.partyMember[0].monster ? this.props.partyMember[0].monster.sprite_filename : null}/>
          <MonsterPlannerCreatureStats monster_1={this.props.partyMember[0].monster} monster_2={this.props.partyMember[1].monster}/>

        </div>
        <div className="party-member-traits">

          {this.props.partyMember.map((traitSlot, i) => 
            <MonsterPlannerTraitSlot
              monster={traitSlot.monster}
              error={traitSlot.error}
              key={i}
              traitSlotIndex={i}
              draggable="true"

              onDragStart={() => this.props.onDragStart({ partyMemberId: this.props.partyMemberId, traitSlotId: i })}
              onDragOver={() => this.props.onDragOver({ partyMemberId: this.props.partyMemberId, traitSlotId: i })}
              onDrop={() => this.props.onDrop({ partyMemberId: this.props.partyMemberId, traitSlotId: i })}
              onMouseUp={() => this.props.onMouseUp(this.props.partyMemberId, i, traitSlot.monster ? traitSlot.monster : null)}

              clearPartyMember={() => this.props.clearPartyMember(this.props.partyMemberId, i)}
            />             
          )}
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
      //items: [],
      dragging: false,

      //monsters: [],
    }
    this.myRef = React.createRef();
  }

  // A function to handle the drag start (i.e. when a row is dragged).
  handleDragStart = data => event => {
    let fromItem = JSON.stringify({ partyMemberId: data.partyMemberId, traitSlotId: data.traitSlotId });
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
    let toItem = { partyMemberId: data.partyMemberId, traitSlotId: data.traitSlotId };

    this.swapItems(fromItem, toItem);
    return false;
  };

  // A function to swap two items.
  // Once this swap is complete, pass this update to the parent component
  // so that the monsterPlannerRows are updated.
  // These changes will get propagated back to this component.
  swapItems = (fromItem, toItem) => {
    let items = [...this.props.partyMembers];

    let partyMembers = [...this.props.partyMembers];
    console.log(partyMembers);

    let fromPID = fromItem.partyMemberId;
    let fromTID = fromItem.traitSlotId;

    let toPID = toItem.partyMemberId;
    let toTID = toItem.traitSlotId;

    console.log('----')
    console.log(fromPID, fromTID);
    console.log(toPID, toTID);
    console.log()

    let fromObj = {... this.props.partyMembers[fromPID][fromTID]};
    let toObj   = {... this.props.partyMembers[toPID][toTID]};

    partyMembers[fromPID][fromTID] = toObj;
    partyMembers[toPID][toTID] = fromObj;

    this.setState({ dragging: false }, () => this.props.updatePartyMembers(partyMembers));


    return;


    // let fromIndex = -1;
    // let toIndex = -1;

    // for (let i = 0; i < items.length; i++) {
    //   if (items[i].row_id === fromItem.row_id) {
    //     fromIndex = i;
    //   }
    //   if (items[i].row_id === toItem.row_id) {
    //     toIndex = i;
    //   }
    // }

    // if (fromIndex !== -1 && toIndex !== -1) {
    //   let { fromId, ...fromRest } = items[fromIndex];
    //   let { toId, ...toRest } = items[toIndex];
    //   items[fromIndex] = { id: fromItem.id, ...toRest };
    //   items[toIndex] = { id: toItem.id, ...fromRest };

    //   this.setState({ dragging: false }, () => this.props.updatePartyMembers(items));
    // } 



  };

  // When the mouse button is released while hovering over a row,
  // call the openModal function on the parent of this component.
  // i.e. Open the MonsterSelection modal when a row is clicked.
  handleMouseUp(partyMemberId, traitSlotId, monster) {
    this.props.openModal(partyMemberId, traitSlotId, monster);
  }

  render() {
    return (
      <div id="monster-planner" className="container" ref={this.myRef}>
        {this.props.partyMembers.map((partyMember, i) => 
          <MonsterPlannerPartyMember
            key={i}
            partyMember={partyMember}
            clearPartyMember={this.props.clearPartyMember}
            partyMemberId={i}

            onDragStart={this.handleDragStart.bind(this)}
            onDragOver={this.handleDragOver.bind(this)}
            onDrop={this.handleDrop.bind(this)}
            onMouseUp={this.handleMouseUp.bind(this)}
          />
        )}
      </div>
    )
  }
}

export default MonsterPlanner;