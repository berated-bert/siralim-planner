import React, {Component, PureComponent} from 'react';
import Modal from 'react-modal';
import { withRouter, BrowserRouter } from "react-router-dom";
import _ from 'underscore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

import icon_nature  from './icons/nature.png';
import icon_chaos   from './icons/chaos.png';
import icon_sorcery from './icons/sorcery.png';
import icon_death   from './icons/death.png';
import icon_life    from './icons/life.png';

import './App.scss';

const UID_HASH_LENGTH = 6;
const MONSTERS_PER_PAGE = 120;

let monsterData = require('./data/data');
let compendium_version = require('./data/compendium_version');

class TraitsTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (<div>Traits table</div>)
  }
}


class MonsterRowHeader extends Component {
  render() {
    return (
      <div className={"monster-row monster-row-header" + (this.props.renderFullRow ? " detailed" : "")}>
        { this.props.renderFullRow && 
          <div className="monster-row-in-party">
            
          </div>
        }     
        <div className="monster-row-class">Class</div>
        <div className="monster-row-family">Family</div>
        <div className="monster-row-creature">Creature</div>
        <div className="monster-row-trait_name">Trait Name</div>
        <div className={"monster-row-trait_description"}>
          Trait Description
        </div>
        { this.props.renderFullRow && 
          <div className="monster-row-material_name">
            Material Name
          </div>
        }        
      </div>
    )
  }
}

// // https://stackoverflow.com/questions/51022834/react-jsx-make-substring-in-bold
// function BoldedText(text, shouldBeBold) {

//   var text_ = text.toLowerCase();
//   const shouldBeBold_ = shouldBeBold.toLowerCase();
  
//   var casedTextArray = [];
//   const textArray = text_.split(shouldBeBold_);


//   var a = [];
  
//   // Produces the indices in reverse order; throw on a .reverse() if you want
//   for (var a=[],i=text_.length;i--;) if (text_[i]==shouldBeBold_) a.push(i);  
//   a.reverse();
//   var mentions = [];
//   for(var i of a) {

//     mentions.push(text.slice(i, i + shouldBeBold.length));
//   }
//   console.log(shouldBeBold, a, mentions);

//   var totalChars = 0;
//   for(var i of textArray) {
//     console.log(i)
//     var substr = text.slice(totalChars, totalChars + i.length);
//     casedTextArray.push(substr);
//     totalChars += substr.length + shouldBeBold.length;
//   }



 
//   return (
//     <span>
//       {casedTextArray.map((item, index) => (
//         <>
//           {item}
//           {index !== textArray.length - 1 && (
//             <b>{mentions.pop()}</b>
//           )}
//         </>
//       ))}
//     </span>
// );
// }


function MonsterClassIcon(props) {
  var pi = props.icon.toLowerCase();
  var icon;
  if(pi === "nature") icon = icon_nature;
  if(pi === "chaos")  icon = icon_chaos;
  if(pi === "sorcery") icon = icon_sorcery;
  if(pi === "death") icon = icon_death;
  if(pi === "life") icon = icon_life;

  return (
    <span className="cls-icon">{icon && <img src={icon} className="class-icon"/>}</span>
  )
}

// <div className={"cls cls-" + cls.toLowerCase()}></div>

class MonsterRow extends Component {

  constructor(props) {
    super(props);
  }

  renderClass(cls, fullName) {
    var c = this.props.class.toLowerCase();
    var iconedClass = c === "nature" || c === "chaos" || c === "death" || c === "sorcery" || c === "life";

    return (
      <div className={"cls-container" + (!fullName ? " center" : "")}>
        { iconedClass && <MonsterClassIcon icon={this.props.class} /> }
        {fullName && <span className={"cls-full-name col-cls-" + cls.toLowerCase()}>{this.props.class}</span>}
      </div>
    )
  }

  renderText(text) {
    //if(!this.props.searchTerm) return text;
    //return BoldedText(text, this.props.searchTerm);
    return text;
  }

  render() {



    return (
      <div className={"monster-row" + (this.props.inTraitSlot ? " is-trait" : "") + (this.props.renderFullRow ? " detailed" : "")}>

      	

        { this.props.renderFullRow && 

          <div className="monster-row-in-party">
            { this.props.inParty && <span className="green-tick"><FontAwesomeIcon icon={faCheck}/></span>}
          </div>
        }

        <div className="monster-row-class">
          {this.renderClass(this.props.class, this.props.renderFullRow)}
        </div>
        <div className="monster-row-family">
          {this.props.family}
        </div>
        <div className="monster-row-creature">
          {this.props.creature}
        </div>
        <div className="monster-row-trait_name">
          {this.props.trait_name}
        </div>
        <div className={"monster-row-trait_description"}>
          {this.props.trait_description}
        </div>
        { this.props.renderFullRow && 
          <div className="monster-row-material_name">
            {this.props.material_name}
          </div>
        }
      </div>
    );
  }
}

class MonsterPlannerRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hoveredOver: false,
      justUpdated: false,
    }

    this.justUpdatedTimeout = null;
  }

  componentDidUpdate(prevProps, prevState) {
    if(!this.state.justUpdated && !_.isEqual(prevProps.monster, this.props.monster)) this.setJustUpdated();
  }

  setJustUpdated() {
    this.setState({
      justUpdated: true
    }, () => {
      window.clearTimeout(this.justUpdatedTimeout)
      this.justUpdatedTimeout = window.setTimeout( () => this.clearJustUpdated(), 1000);
    })
  }

  clearJustUpdated() {
    this.setState({
      justUpdated: false,
    })
  }

  isEmptyRow() {
    return _.isEmpty(this.props.monster);
  }

  getRowErrors() {
    if(!this.props.needsValidation) return null;
    if(this.isEmptyRow()) return null;

    if(!this.props.inTraitSlot && (this.props.monster.class === "Rodian Master" || this.props.monster.class === "Nether Boss" || this.props.monster.class === "Backer")) return "This trait cannot be found on a playable creature and cannot be placed in a creature slot.";
    if(this.props.inTraitSlot && (this.props.monster.material_name === "N/A" || this.props.monster.material_name === "No Material Exists")) return "This trait has no material and cannot be placed in the trait slot.";
    return null;
  }

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

    if(this.props.monster.class) {
      var rowClass = " cls-" + this.props.monster.class.toLowerCase();
      if(this.props.inTraitSlot) rowClass = " cls-trait";
    } else {
      rowClass = " cls-empty";
    }

    return (
    <div className="monster-row-wrapper">
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
        <MonsterRow {...this.props.monster} inTraitSlot={this.props.inTraitSlot} error={this.props.error} />   
      }
      </div>
      <div className="monster-row-controls">
        { !emptyRow && <button className="delete-button" onClick={() => this.props.clearMonsterPlannerRow(this.props.row_id)}><FontAwesomeIcon icon={faTimes} /></button>}
      </div>
    </div>
    )
  }


}



// DND Code found here: https://codepen.io/frcodecamp/pen/OEovqx
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

  componentDidUpdate(prevProps, prevState) {
    if(!_.isEqual(prevProps, this.props)) {
      this.setState({
        items: this.props.monsterRows
      });
    }
  }


  handleDragStart = data => event => {
    console.log('start')
    let fromItem = JSON.stringify({ row_id: data.row_id });
    console.log(fromItem)
    event.dataTransfer.setData("dragContent", fromItem);
    this.setState({
      dragging: true,
    })
  };

  handleDragOver = data => event => {
    event.preventDefault(); // Necessary. Allows us to drop.
    this.setState({
      dragging: false,
    })
    return false;
  };

  handleDrop = data => event => {
    event.preventDefault();

    let fromItem = JSON.parse(event.dataTransfer.getData("dragContent"));
    let toItem = { row_id: data.row_id };

    this.swapItems(fromItem, toItem);
    return false;
  };

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

    if (fromIndex != -1 && toIndex != -1) {
      let { fromId, ...fromRest } = items[fromIndex];
      let { toId, ...toRest } = items[toIndex];
      items[fromIndex] = { id: fromItem.id, ...toRest };
      items[toIndex] = { id: toItem.id, ...fromRest };

      this.setState({ items: items, dragging: false }, () => this.props.updateMonsterPlannerRows(this.state.items));
    }
    
  };

  handleMouseUp(row_id, slot_id, monster) {
    this.props.openModal(row_id, slot_id, monster);
  }

  render() {
    return (
      <div id="monster-planner" className="monster-planner monster-list" ref={this.myRef}>
        {this.state.items.map((monsterRow, i) => 
          <MonsterPlannerRow monster={monsterRow.monster}
          error={monsterRow.error}
          key={i}
          row_id={ monsterRow.row_id }
          draggable="true"
          onDragStart={this.handleDragStart}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
          onMouseUp={() => this.handleMouseUp(monsterRow.row_id, i, monsterRow.monster ? monsterRow.monster : null)}
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

// class MonsterSelectionRow extends Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {





//   }
// }

// _.isEqual() doesn't seem to work for sets
// yoinked this from here: https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}


function getPageFamily(m) {
  return m.family ? m.family : m.class + " traits"; // Exception for Backer traits
}

function getMonsterSemanticName(m) {
  console.log(m)
  return m.family ? (m.family + " / " + m.creature) : (m.class + " (" + m.trait_name + ")");
}

class MonsterSelectionModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      filteredItems: [],

      filteredItemGroups: [{"start": 0, "end": 0}], // [{ "start": 0, "end": 93, "familyStart": "Abomination", "familyEnd": "Aspect"}]
      currentPage: 0,

      currentSearchTerm: "",
      appliedSearchTerm: "",
    }
    this.searchTimeout = null;
    this.tableRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {

    //console.log(prevProps, this.props, prevState, this.state, _.isEqual(prevProps, this.props), _.isEqual(prevState, this.state))


    if(!_.isEqual(prevProps.monsterRows, this.props.monsterRows)) {

      var filteredItemGroups = this.getItemGroups(this.props.monsterRows);

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
    var itemGroups = [];
    var currentGroup = {"start": 0, "end": null, "familyStart": null, "familyEnd": null}
    var monstersInCurrentGroup = [];
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var m = item.monster;
      var f = getPageFamily(m)

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


    if(monstersInCurrentGroup.length > 0) {
      currentGroup.end = i;
      currentGroup.familyEnd = getPageFamily(monstersInCurrentGroup[Math.max(0, monstersInCurrentGroup.length - 1)]);
      itemGroups.push(currentGroup);
      currentGroup = {"start": i, "end": null, "familyStart": f, "familyEnd": null}
      monstersInCurrentGroup = [];
    }

    return itemGroups;
  }


  handleSearchChange(e) {
    window.clearTimeout(this.searchTimeout);
    this.setState({
      currentSearchTerm: e.target.value,
    }, () => {
      this.searchTimeout = window.setTimeout( () => this.applySearchTerm(), 500);
    });
  }

  filterResults() {
    var searchTerm = this.state.currentSearchTerm.toLowerCase();
    var filteredItems = [];
    for(var item of this.state.items) {
      var searchText = item.monster.search_text;
      if(searchText.toLowerCase().indexOf(searchTerm) !== -1) {
        filteredItems.push({monster: item.monster});
      }      
    }
    var filteredItemGroups = this.getItemGroups(filteredItems);
    this.setState({
      currentPage: 0,
      filteredItems: filteredItems,
      filteredItemGroups: filteredItemGroups
    }, () => { this.tableRef.current.scrollTo(0, 0) })
  }

  applySearchTerm() {
    this.setState({
      appliedSearchTerm: this.state.currentSearchTerm
    }, () => this.filterResults())
  }

  resetSearchTerm() {
    if(this.state.currentSearchTerm === "") return;
    this.setState({
      currentSearchTerm: "",
    })
  }

  renderResultsCount() {   

    var r =  <span><b>{this.state.filteredItems.length}</b> of <b>{this.state.items.length}</b> results</span>;
    if(this.state.filteredItems.length === this.state.items.length) {
      r = <span>all <b>{this.state.items.length}</b> results</span>
    }
    var f = "";
    if(this.state.appliedSearchTerm) {
      f = " matching the current search term";
    }
                
    return (
    <span>Displaying {r}{f}.</span>
    )
  }

    goToPage(pageNum) {
      this.setState({
        currentPage: pageNum,
      }, () => { this.tableRef.current.scrollTo(0, 0) })
    }
/*      <Modal
        isOpen={this.props.isOpen}
        //onAfterClose={() => this.resetSearchTerm()}
        onRequestClose={this.props.closeModal}
        contentLabel="Example Modal"
      >*/
  render() {

    var startIndex = this.state.filteredItemGroups[this.state.currentPage] ? this.state.filteredItemGroups[this.state.currentPage].start : 0;
    var endIndex = this.state.filteredItemGroups[this.state.currentPage] ? this.state.filteredItemGroups[this.state.currentPage].end : 0;

    console.log(startIndex, endIndex, "<X")


    var creature_number = Math.floor(this.props.currentSelectedIndex / 3) + 1;
    var slot = (this.props.currentSelectedIndex + 1) % 3 === 1 ? "primary" : ((this.props.currentSelectedIndex + 1)  % 3 === 2) ? "secondary" : "artifact";
    var slot_n = slot === "artifact" ? "n" : "";
    var currentMonster = !_.isEmpty(this.props.currentSelectedMonster) ? getMonsterSemanticName(this.props.currentSelectedMonster) : null;



    return (
        <div className="modal-content">
          <div className="modal-header">
            <h3>Select a{slot_n} <b>{slot}</b> trait for party member <b>{creature_number}</b>. <span style={{'margin-left': '20px'}}>{currentMonster && ("Current: " + currentMonster)}</span></h3>
            <button className="modal-close" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
          
          </div>
          <div className="monster-selection-modal">

              <div className="monster-selection-controls">


                <div className="monster-selection-search-tools">
                  <input id="monster-search" className="monster-search" autoFocus type="text" placeholder="Search monsters/traits..." onChange={(e) => this.handleSearchChange(e)} value={this.state.currentSearchTerm} />
                </div>
                
               <div className="monster-selection-pagination">

                  {this.state.filteredItemGroups.map((itemGroup, i) =>
                      <div onClick={() => this.goToPage(i)} className={"tab" + (this.state.currentPage === i ? " active" : "")}>{itemGroup.familyStart} - {itemGroup.familyEnd}</div>
                  )}
                </div>

                <div className="monster-row-container monster-row-container-selection monster-row-container-header">
                  <MonsterRowHeader renderFullRow={true} /> 
                </div> 


              </div>

              <div className="monster-selection-list monster-list" ref={this.tableRef}>
                  {this.state.filteredItems.slice(startIndex, endIndex).map((monsterRow, i) =>                 
                    <div className={"monster-row-container monster-row-container-selection selectable" + 
                      ((monsterRow.monster && this.props.currentSelectedMonster && (monsterRow.monster.uid === this.props.currentSelectedMonster.uid)) ? " currently-selected-monster" : "")}
                      onMouseUp={() => this.props.updateMonsterPlannerRow(monsterRow.monster)}>
                      <MonsterRow {...monsterRow.monster} 
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

class SiralimPlanner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      monsterPlannerRows: [],
      monsterSelectionRows: [],
      currentRowId: null,
      currentSlotId: null,
      currentSelectedMonster: null,      
      monstersInParty: new Set(), // An set of uids of the monsters/trait in the user's party
      messageText: null,
      //saveString: null,
      monsterMap: {}, // A map of uid: row_index
      modelIsOpen: false,
      infoModalIsOpen: false,
    }    
  }

  // componentDidUpdate(prevProps, prevState) {

  // 	console.log(prevState.monsterPlannerRows[0] ? prevState.monsterPlannerRows[0].monster : "undef", this.state.monsterPlannerRows[0] ? this.state.monsterPlannerRows[0].monster : "undef")

  // 	if(!_.isEqual(prevState.monsterPlannerRows, this.state.monsterPlannerRows)) {
  // 		var saveString = this.generateSaveString();
  // 		this.props.history.push(saveString)
  // 	}
  // }

  generateSaveString() {
  	console.log("Hi")
    var monsterPlannerRows = this.state.monsterPlannerRows;
    var saveString = "";
    for(var i = 0; i < 18; i++) {
      var m = monsterPlannerRows[i];
      if(!_.isEmpty(m.monster)) saveString += m.monster.uid;
      else saveString += "_";
    }
    //prompt("Link to this build: ", "siralim-planner.github.io?build=" + saveString)


    this.props.history.push('?b=' + saveString);
    

    // this.setState({
    //   saveString: saveString
    // })
  }

  getMonstersInParty(monsterPlannerRows) {
    var monstersInParty = new Set();
    // Update monsters in party
    for(var m of monsterPlannerRows) {
      if(m.monster.uid) monstersInParty.add(m.monster.uid);
    }
    return monstersInParty;
  }

  updateMonsterPlannerRow(monster) {
    var monsterPlannerRows = [...this.state.monsterPlannerRows];
    var monstersInParty = this.state.monstersInParty;
    for(var i in monsterPlannerRows) {
      var m = monsterPlannerRows[i];
      if(m.row_id === this.state.currentRowId) {
        monsterPlannerRows[i].monster = monster;        
        break;
      } 
    }
    var monstersInParty = this.getMonstersInParty(monsterPlannerRows);

     console.log([...monsterPlannerRows][0], "< 1")

    this.setState({
      monsterPlannerRows: [...monsterPlannerRows],
      monstersInParty: monstersInParty
    }, () => { 
    	console.log("done")
    	this.closeModal(); 
  		this.generateSaveString();
	})
  }

  clearMonsterPlannerRow(row_id) {

    var monsterPlannerRows = [...this.state.monsterPlannerRows];
    for(var i in monsterPlannerRows) {
      var m = monsterPlannerRows[i];
      if(m.row_id === row_id) {
        monsterPlannerRows[i].monster = {};
        break;
      } 
    }
    var monstersInParty = this.getMonstersInParty(monsterPlannerRows);

    this.setState({
      monsterPlannerRows: monsterPlannerRows,
      monstersInParty: monstersInParty,
    }, this.generateSaveString)
  }

  updateMonsterPlannerRows(newRows) {
    this.setState({
      monsterPlannerRows: newRows,
    }, this.generateSaveString);
  }


  buildMonsterMap(monsterSelectionRows) {
    var monsterMap = {}
    for(var i in monsterSelectionRows) {
      monsterMap[monsterSelectionRows[i].monster.uid] = parseInt(i);
    }
    return monsterMap;
  }

  // Parse the loadString into a list of UIDs (or null for underscores).
  parseLoadString(str) {
  	var uids = [];
  	var currentUid = '';
  	for(var i = 0; i < str.length; i++) {
  		var c = str[i];
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

  	if(uids.length > 18) throw new Error("Too many uids");
  	if(uids.length < 18) throw new Error("Not enough uids");

  	return uids;
  }

  // On component mount, transform monsterData into a new array, i.e.
  // { row_id: <the index of the monster>, monster: <the JSON object of the monster> }
  // This is necessary to get the drag and drop functionality to work.
  // Every row needs a fixed id to function properly.
  componentDidMount() {
    var monsterPlannerRows = [];
    for(var i = 0; i < 18; i++) {
      monsterPlannerRows.push({row_id: parseInt(i), monster: {}})
    }

    var monsterSelectionRows = [];
    for(var i in monsterData.slice(0, 10330)) {
      monsterSelectionRows.push({monster: monsterData[i]});
    }

    var monsterMap = this.buildMonsterMap(monsterSelectionRows);
    console.log(monsterMap, "< monster map")


    // Get string from param if there is any
    const windowUrl = window.location.search;
    const params = new URLSearchParams(windowUrl);

    var loadString = params.get('b');
    console.log(loadString)

    try {
   		var uids = this.parseLoadString(loadString);
   		console.log(uids)
   		for(var i = 0; i < uids.length; i++) {
   			var uid = uids[i];
   			if(uid !== null) {
   				if(monsterMap.hasOwnProperty(uid)) monsterPlannerRows[i].monster = monsterData[monsterMap[uid]];
   				else monsterPlannerRows[i].error = "Monster/trait does not exist or has changed"
   			}
   		}


   	} catch(err) {
   		console.log(err);
   	}


    this.setState({
      monsterPlannerRows: monsterPlannerRows,
      monsterSelectionRows: monsterSelectionRows,
      monsterMap: monsterMap,
    });
  }

  openInfoModal() {
  	this.setState({
  		infoModalIsOpen: true,
  	})
  }

  closeInfoModal() {
  	this.setState({
  		infoModalIsOpen: false,
  	})
  }

  openModal(row_id, slot_id, monster) {

    console.log(row_id)
    this.setState({
      modalIsOpen: true,
      currentRowId: row_id,
      currentSlotId: slot_id,
      currentSelectedMonster: monster || null,
    }, () => {
      document.body.style['overflow-y'] = "hidden";
      document.getElementById('monster-search').focus();
    })
  }

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

  // <button className="lighter" onClick={() => this.generateSaveString()}><FontAwesomeIcon icon={faSave}/><span>Save</span></button>

  render() {
    return (
      <div className="App" id="app">
        <header className="app-header">
          <div className="container">
          <div className="app-header-left">
            <h3>Siralim Planner</h3>
          </div>
          <div className="app-header-right">
          	<p><a href="https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0" target="_blank">Compendium</a> {compendium_version}</p>
            <button className="lighter" onClick={() => this.openInfoModal()}><FontAwesomeIcon icon={faInfoCircle}/><span>Info</span></button>
          </div>
          </div>
        </header>

        <Modal className="modal-content modal-content-info" overlayClassName="modal-overlay modal-overlay-info is-open" isOpen={this.state.infoModalIsOpen}>
        	<div className="modal-header">
          	<button className="modal-close" onClick={() => this.closeInfoModal()}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        	<div className="info-modal">
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
        		resource by EmptyPalms. I'd like to thank EmptyPalms for putting together this resource and for their permission to use the data as part of this tool.</p>
        		<p>The <b>source code</b> of this tool is available on <a href="https://github.com/siralim-planner/siralim-planner" target="_blank">GitHub</a>. If you would like to work on it 
        		you are more than welcome to submit a pull request or fork the repository.</p>
        		<p>Depending on usage I may or may not keep the tool up-to-date with the latest version of the Siralim Ultimate Compendium. If it is not up-to-date at some point feel free to 
        		download the code yourself and run it locally. Better yet, feel free to update the GitHub repository with the latest spreadsheet and submit a pull request.</p>
        		<p>If you encounter any problems or have any feedback please feel free to message me on Discord - <b>BeratedBert#6292</b>, or submit an issue on the GitHub repo.</p>

        	</div>
        </Modal>

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
        <footer>
          <div className="container">
            <p>2021 Created by BeratedBert. This site is not affiliated with Thylacine Studios.</p>
            <p>Data sourced from the <a href="https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0" target="_blank">Siralim Ultimate Compendium</a>.</p>
          </div>
        </footer>
      </div>
    );
  }
}



export default withRouter(SiralimPlanner);