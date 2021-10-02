import React, {Component, PureComponent} from 'react';
import Modal from 'react-modal';
import _ from 'underscore';
import Select, { components } from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

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
    //console.log(this.state.currentSpecialization)
  }

  handleSpecializationChange(selectedOption) {
    let currentSpecialization = null;
    console.log(this.props.specializations);
    for(let s of this.props.specializations) {
      if(s.abbreviation === selectedOption.value) {
        currentSpecialization = s;
        break;
      }
    }
    this.setState({
      currentSpecialization: currentSpecialization,
    })
  }



  render() {

    console.log(this.state.currentSpecialization);

    return ( 
      <Modal className="modal-content modal-content-info modal-wide " overlayClassName="modal-overlay modal-overlay-info is-open" isOpen={this.props.modalIsOpen}>
      <div className="modal-header">
          <button id="close-upload-party-modal" className="modal-close" onClick={this.props.closeModal}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
        <div className="info-modal">
          <h2>Select specialization</h2>

          <section className="specialization-selection">

          <SpecializationSelectionField 
            options={this.props.specOptions}
            value={this.state.currentSpecialization}
            onChange={this.handleSpecializationChange.bind(this)}
          />
          <button aria-label="Select specialization" onClick={() => this.props.setSpecialization(this.state.currentSpecialization)}>
              <FontAwesomeIcon icon={faCheck}/>&nbsp;&nbsp;Select specialization
            </button>
          </section>



          <table id="perks-table">
            <thead>
                <th>Name</th>
                <th>Anointment</th>
                <th>Description</th>
            </thead>
            <tbody>
              {
                this.state.currentSpecialization && this.state.currentSpecialization.perks.map ((perk, i) =>
                  <tr>
                    <td>{perk.name}</td>
                    <td>
                      <FontAwesomeIcon className={perk.anointment === "Yes" ? "green-tick" : "red-tick"} icon={perk.anointment === "Yes" ? faCheck : faTimes}/>
                    </td>
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
      </Modal>

    )



  }
}


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
    return (<div className="empty-row">Click to add an anointment</div>)
  }

  render() {
    const rowErrors = null;
    const emptyRow = this.props.perk ? false : true;

    return (
    <div className="trait-slot">
      <div
        className={"trait-slot-clickable anointment-slot-clickable" + 
          (rowErrors ? " invalid-row" : "") + 
          (this.state.justUpdated ? " just-updated": "")
        }
        onMouseUp={ this.props.onMouseUp}
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
      <div className="trait-slot-controls">
        { !emptyRow && <button id={"remove-anointment-" + (this.props.anointmentSlotIndex + 1)}
          className="delete-button" aria-label="Delete anointment" onClick={this.props.clearAnointment}>
          <FontAwesomeIcon icon={faTimes} />
        </button>}
      </div>
    </div>
    )

  }
}

class SpecializationPlanner extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      specializations: [],
      currentSpecialization: null,

      specializationsModalIsOpen: false,
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
      currentSpecialization: specializationsList[0],
    }, () => {
      let anointments = [...this.props.anointments];
      anointments[0] = specializations[0].perks[0];
      anointments[1] = specializations[1].perks[0];
      this.props.updateAnointments(anointments);

    })
  }

  setSpecialization(s) {
    this.setState({
      currentSpecialization: s,
      specializationsModalIsOpen: false,
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
    this.setState({
      currentSpecialization: currentSpecialization,
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
    console.log('hi')
    this.setState({
      specializationsModalIsOpen: true,
    }, () => {

      document.body.style['overflow-y'] = "hidden";
    })
  }

  render() {

    const specName = this.state.currentSpecialization ? this.state.currentSpecialization.name : "(No specialization)";

    let specOptions = [];
    for(let s of this.state.specializations) {
      specOptions.push({ value: s.abbreviation, label: s.name });
    }

    return (
      <div id="specialization-planner" className={(!this.state.isOpen ? "hide " : "") +
        "spe-" + (this.state.currentSpecialization && this.state.currentSpecialization.abbreviation)}>

        <div className="toggle-bar" onClick={this.toggleOpen.bind(this)}>
          <FontAwesomeIcon icon={(this.state.isOpen ? faChevronLeft : faChevronRight)}/>
        </div>

        <SpecializationsModal 
          modalIsOpen={this.state.specializationsModalIsOpen}
          closeModal={this.closeSpecializationsModal.bind(this)}

          specializations={this.state.specializations}
          specOptions={specOptions}
          currentSpecialization={this.state.currentSpecialization}
          onSpecializationChange={this.handleSpecializationChange.bind(this)}
          setSpecialization={this.setSpecialization.bind(this)}
        />

 

        <h3 className="section-title">Specialization</h3>

        <section className="specialization-selection">
          <SpecializationSelectionField options={specOptions} value={this.state.currentSpecialization} onChange={this.handleSpecializationChange.bind(this)}/>
          <button aria-label="View specializations" className="grey-button" onClick={() => this.openSpecializationsModal()}><FontAwesomeIcon icon={faInfoCircle}/></button>
        </section>


        <h3 className="section-title">Anointments</h3>

        <div className="anointments-list">
        { this.props.anointments.map((anointment, i) =>
          <Anointment perk={anointment}/>
        )}
        </div>
        





        <div style={{'height': '100px'}}></div>


        <div className="flavour-text">
          <h4>About the {specName}</h4>
          {this.state.currentSpecialization && this.state.currentSpecialization.description.split('\\n').map((par, i) => 
            (<p>{par}</p>)
          )}
        </div>

      </div>
    )
  }
}

export default SpecializationPlanner;