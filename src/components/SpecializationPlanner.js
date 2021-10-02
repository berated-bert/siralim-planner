import React, {Component, PureComponent} from 'react';
import Modal from 'react-modal';
import _ from 'underscore';
import Select, { components } from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faBolt } from '@fortawesome/free-solid-svg-icons'

const specializationsList = require('../data/specializations');

const { Option, ValueContainer, Input } = components;
const IconOption = props => (
  <Option {...props}>
    <span className="option-icon" style={{"backgroundImage": "url(/siralim-planner/specialization_icons/" + props.value + ".png)"}}></span>
    {props.data.label}
  </Option>
);

const MyValueContainer = ({children, ...props}) => {

  const { getValue, hasValue } = props;
  const nbValues = getValue().length;

  const value = props.getValue()[0];

  if (!hasValue) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }

  return (
    <ValueContainer {...props} className="value-container">
      <span className="option-icon" style={{"backgroundImage": "url(/siralim-planner/specialization_icons/" + value.value + ".png)"}}></span>
      {children}
    </ValueContainer>
  )
};



const customStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isSelected ? '2px solid rgba(0, 0, 0, 0.4) !important' : (state.isFocused ? '2px solid rgba(0, 0, 0, 0.3) !important' : '2px solid rgba(0, 0, 0, 0.4) !important'),
    color: 'red',
    boxShadow: "none",
  })
}




class SpecializationsModal extends PureComponent {


  constructor(props) {
    super(props);
    this.state = {
      currentSpecialization: null,
    }
  }


  componentDidUpdate(prevProps, prevState) {
    if(!_.isEqual(prevProps.currentSpecialization, this.props.currentSpecialization))
    { 
      this.setState({
        currentSpecialization: this.props.currentSpecialization
      })
    }
  }

  handleSpecializationChange(specialization) {
    let currentSpecialization = null;
    for(let s of this.props.specializations) {
      if(s.abbreviation === specialization.abbreviation) {
        currentSpecialization = s;
        break;
      }
    }
    this.setState({
      currentSpecialization: currentSpecialization,
    })
  }

  render() {

    let anointmentNames = new Set();
    let anointmentsInSpecialization = {};
    for(let a of this.props.anointments) {
      if(!a) continue;
      if(!anointmentsInSpecialization.hasOwnProperty(a.spec_abbrev)) {
        anointmentsInSpecialization[a.spec_abbrev] = 0;
      }
      anointmentsInSpecialization[a.spec_abbrev]++;
      anointmentNames.add(a.name);
    }

    return ( 
      <Modal className="modal-content modal-content-info  specialization-selection-modal modal-wide " overlayClassName="modal-overlay modal-overlay-info is-open" isOpen={this.props.modalIsOpen}>
        <div className="modal-header">
          <h3>Anointments <span style={{'marginLeft': '20px'}}> {this.props.anointments.length} of {this.props.maxAnointments} anointments selected</span></h3>
          <button id="close-upload-party-modal" className="modal-close" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
        </div>

        <div className="info-modal specialization-selection">
         
          <nav className="specialization-selection-nav">

            {
              this.props.specializations.map((s, i) => 
                <div className={"specialization-option " + (_.isEqual(this.state.currentSpecialization, s) ? "current" : "") +
                  ((anointmentsInSpecialization[s.abbreviation] > 0) ? " has-anointment" : "")

                  }
                  onClick={() => this.handleSpecializationChange(s)}>
                  <span className="option-icon" style={{"backgroundImage": "url(/siralim-planner/specialization_icons/" + s.abbreviation + ".png)"}}></span>
                  { s.name }{ (anointmentsInSpecialization[s.abbreviation] > 0) && (" (" + anointmentsInSpecialization[s.abbreviation] + ")") }
                </div>

              )
            }
          </nav>

          <div className="specialization-selection-list">   

             <h2>{this.state.currentSpecialization && this.state.currentSpecialization.name} Perks</h2> 



              <table id="perks-table" className={this.props.atMaxAnointments ? "max-anoints" : ""}>
                <thead>
                    <th>Perk Name</th>
                    <th>Description</th>
                </thead>
                <tbody>
                  {
                    this.state.currentSpecialization && this.state.currentSpecialization.perks.map ((perk, i) =>
                      <tr onClick={() => this.props.toggleAnointment(perk)} className={(anointmentNames.has(perk.name) ? "active" : "") + (perk.anointment === "Yes" ? "" : "no-anoint")}>
                        <td>{perk.name}</td>
                        <td>{perk.description}</td>
                      </tr>
                  )}

                </tbody>
              </table>
              <section className="flavour-text">
                <h4>About the {this.state.currentSpecialization && this.state.currentSpecialization.name}</h4>
                {this.state.currentSpecialization && this.state.currentSpecialization.description.split('\\n').map((par, i) => 
                  (<p>{par}</p>)
                )}
              </section>
          </div>
        </div>  
      </Modal>

    )
  }
}

/*              <button aria-label="Select specialization" onClick={() => this.props.setSpecialization(this.state.currentSpecialization)}>
              <FontAwesomeIcon icon={faCheck}/>&nbsp;&nbsp;Select specialization
              </button>  


            <SpecializationSelectionField 
              options={this.props.specOptions}
              value={this.state.currentSpecialization}
              onChange={this.handleSpecializationChange.bind(this)}
            />
            */

// class AnointmentsModal extends PureComponent {
//   constructor(props) {
//     super(props);
//   }

//   render() {

//     return (
//       <Modal className="modal-content modal-content-info modal-wide " overlayClassName="modal-overlay modal-overlay-info is-open" isOpen={this.props.modalIsOpen}>
//       <div className="modal-header">
//           <button id="close-upload-party-modal" className="modal-close" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
//         </div>
//       <div className="info-modal">
//         <h2>Select anointments</h2>


//         <table id="anointments-table">
//           <thead>
//               <th>Specialization</th>
//               <th>Perk Name</th>
//               <th>Description</th>
//           </thead>
//           <tbody>
//             {
//               this.props.specializations && this.props.specializations.map ((specialization, i) =>
//               {
//                 return specialization.perks.filter(perk => perk.anointment === "Yes").map((perk, j) => 
//                   <tr>
//                     <td>{specialization.name}</td>
//                     <td>{perk.name}</td>
//                     <td>{perk.description}</td>
//                   </tr>
//                 )
//               }                
//             )}
//           </tbody>
//         </table>

//       </div>
//       </Modal>
//     )
//   }
// }


class SpecializationSelectionField extends PureComponent {

  render() {

    return (
          
          <Select 
            styles={customStyles}
            value={this.props.value}
            onChange={this.props.onChange}
            options={this.props.options}
            menuPosition="fixed"
            components={{ Option: IconOption, ValueContainer: MyValueContainer }}
          />
      )
  }
}


class Anointment extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      justUpdated: false,
    }
  }

  renderEmptyRow() {
    return (<div className="empty-row">No anointment selected</div>)
  }

  render() {
    const rowErrors = null;
    const emptyRow = this.props.perk ? false : true;

    return (
    <div className="trait-slot anointment-slot">
      <div
        className={"anointment-slot-non-clickable" + 
          (rowErrors ? " invalid-row" : "") + 
          (this.state.justUpdated ? " just-updated": "")
        }
        title={rowErrors }
      >
      { !this.props.perk ? this.renderEmptyRow() :
        <div className="anointment">
          <div className="anointment-name-and-source">
            <div className="anointment-name">            
            {this.props.perk.name}
            </div>
            <div className="anointment-source">
              (<span className="option-icon" style={{"backgroundImage": "url(/siralim-planner/specialization_icons/" + this.props.perk.spec_abbrev + ".png)"}}>
                </span> {this.props.perk.spec})
            </div>
          </div>
          <div className="anointment-desc">{this.props.perk.description}</div>
        </div>
      }

      </div>

    </div>
    )

  }
}

/*
  { this.props.perk && 
  <div className="trait-slot-controls">
    { !emptyRow && <button id={"remove-anointment-" + (this.props.anointmentSlotIndex + 1)}
      className="delete-button" aria-label="Delete anointment" onClick={this.props.clearAnointment}>
      <FontAwesomeIcon icon={faTimes} />
    </button>}
  </div>
  }
*/

class SpecializationPlanner extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      specializations: [],

      specializationsModalIsOpen: true,
    }
  }

  toggleOpen() {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  componentDidMount() {
    let specializations = [...specializationsList];
    for(let s of specializations) {
      s['value'] = s.abbreviation;
      s['label'] = s.name;
    }

    this.setState({
      specializations: specializations,
    }, () => {
      console.log(specializations[0])
      this.props.updateSpecialization(specializations[0]);

    })
  }



  closeSpecializationsModal() {
    this.setState({
      specializationsModalIsOpen: false,
    }, () => {
      document.body.style['overflow-y'] = "scroll";
    })
  }

  openSpecializationsModal() {
    this.setState({
      specializationsModalIsOpen: true,
    }, () => {
      document.body.style['overflow-y'] = "hidden";
    })
  }


  handleSpecializationChange(selectedOption) {
    let currentSpecialization = null;
    for(let s of this.state.specializations) {
      if(s.abbreviation === selectedOption.value) {
        currentSpecialization = s;
        break;
      }
    }
    this.props.updateSpecialization(currentSpecialization);
  }

  render() {

    const freeAnointmentSlots = new Array(Math.max(0, this.props.maxAnointments - this.props.anointments.length)).fill(null); // TODO: Get this to work for Royal

    let specOptions = [];
    for(let s of this.state.specializations) {
      specOptions.push({ value: s.abbreviation, label: s.name });
    }

    return (
      <div id="specialization-planner" className={(!this.state.isOpen ? "hide " : "") +
        "spe-" + (this.props.currentSpecialization && this.props.currentSpecialization.abbreviation)}>

        <div className="toggle-bar" onClick={this.toggleOpen.bind(this)}>
          <FontAwesomeIcon icon={(this.state.isOpen ? faChevronLeft : faChevronRight)}/>
        </div>

        <SpecializationsModal 
          modalIsOpen={this.state.specializationsModalIsOpen}
          closeModal={this.closeSpecializationsModal.bind(this)}

          anointments={this.props.anointments}
          specializations={this.state.specializations}
          specOptions={specOptions}
          currentSpecialization={this.props.currentSpecialization}

          maxAnointments={this.props.maxAnointments}
          atMaxAnointments={this.props.maxAnointments === this.props.anointments.length}

          toggleAnointment={this.props.toggleAnointment}
        />


 

        <h3 className="section-title">Specialization</h3>

        <SpecializationSelectionField options={specOptions} value={this.props.currentSpecialization} onChange={this.handleSpecializationChange.bind(this)}/>
        <button aria-label="View specializations" className="perks-and-anointments-button" onClick={() => this.openSpecializationsModal()}>
          <FontAwesomeIcon icon={faBolt}/>Anointments
        </button>



        <div className="anointments-list">
        { this.props.anointments.map((anointment, i) =>
          <Anointment perk={anointment}/>
        )}
        { freeAnointmentSlots.map((anointment, i) =>
          <Anointment perk={anointment}/>
        )}
        </div>
        





       

      </div>
    )
  }
}
/*
        <AnointmentsModal 
          modalIsOpen={this.state.anointmentsModalIsOpen}
          closeModal={this.closeAnointmentsModal.bind(this)}
          specializations={this.state.specializations}
          currentAnointments={this.props.anointments}
          onAnointmentsChange={this.props.updateAnointments}
        />
*/

export default SpecializationPlanner;

/*
  <div style={{'height': '100px'}}></div>
  <div className="flavour-text">
    <h4>About the {specName}</h4>
    {this.state.currentSpecialization && this.state.currentSpecialization.description.split('\\n').map((par, i) => 
      (<p>{par}</p>)
    )}
  </div>
*/