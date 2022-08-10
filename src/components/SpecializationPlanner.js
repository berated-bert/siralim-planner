import React, { PureComponent } from "react";
import Modal from "react-modal";
import _ from "underscore";
import Select, { components } from "react-select";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const specializationsList = require("../data/specializations");

const { Option, ValueContainer } = components;
/**
 * Override for the Option item in react-select to display icons in the options.
 * @param  {Object} props The props.
 * @return {ReactComponent}       The option.
 */
const IconOption = (props) => (
  <Option {...props}>
    <span
      className="option-icon"
      style={{
        backgroundImage:
          "url(/siralim-planner/specialization_icons/" +
          props.value +
          ".png), " +
          "url(/siralim-planner/specialization_icons/UNKNOWN.png)",
      }}
    ></span>
    {props.data.label}
  </Option>
);

/**
 * Override for the ValueContainer for react-select to display icons in the select element.
 * @param  {children}    options.children The children from react-select
 * @param  {props} options.props    The props
 * @return {ReactElement}                     The ValueContainer
 */
const MyValueContainer = ({ children, ...props }) => {
  const { hasValue } = props;
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
      <span
        className="option-icon"
        style={{
          backgroundImage:
            "url(/siralim-planner/specialization_icons/" +
            value.value +
            ".png), " +
            "url(/siralim-planner/specialization_icons/UNKNOWN.png)",
        }}
      ></span>
      {children}
    </ValueContainer>
  );
};

/**
 * A perk icon. Renders a perk from a big image of all the icons combined
 * (to avoid 500 requests)
 */
class PerkIcon extends PureComponent {
  render() {
    const coords = this.props.perk.icon_coords;
    return (
      <span
        className="perk-icon"
        style={{
          backgroundImage: "url(/siralim-planner/perk_icons/perk_icons.png)",
          backgroundPosition: `-${coords[0]}px -${coords[1]}px`,
        }}
      ></span>
    );
  }
}

/**
 * Override for customStyles for react-select.
 * @type {Object}
 */
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isSelected
      ? "2px solid rgba(0, 0, 0, 0.4) !important"
      : state.isFocused
      ? "2px solid rgba(0, 0, 0, 0.3) !important"
      : "2px solid rgba(0, 0, 0, 0.4) !important",
    color: "red",
    boxShadow: "none",
  }),
};

/**
 * The modal that pops up when the user clicks on the Anointments
 * button on the specializations box on the left side.
 * @property {Object} state.currentSpecialization The current specialization object.
 */
class SpecializationPlannerAnointmentsModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentSpecialization: null,
    };
  }

  /**
   * When component updates, and the specialisation has changed in the parent
   * and this component does not yet have a specialization, set the specialization
   * to the first one in the parent component (i.e. Hell Knight).
   * @param  {Object} prevProps The previous props.
   * @param  {Object} prevState The previous state.
   */
  componentDidUpdate(prevProps, prevState) {
    if (
      !_.isEqual(
        prevProps.currentSpecialization,
        this.props.currentSpecialization
      ) &&
      !this.state.currentSpecialization
    ) {
      this.setState({
        currentSpecialization: this.props.specializations[0],
      });
    }
  }

  /**
   * Handle the specialization change, i.e. change this.state.currentSpecialization
   * to the provided specialization.
   * @param  {obj} specialization The specialization to update to.
   */
  handleSpecializationChange(specialization) {
    let currentSpecialization = null;
    for (let s of this.props.specializations) {
      if (s.abbreviation === specialization.abbreviation) {
        currentSpecialization = s;
        break;
      }
    }
    this.setState({
      currentSpecialization: currentSpecialization,
    });
  }

  /**
   * The render function. Is super long and needs breaking down into smaller components.
   * @return {ReactComponent} The anointments modal.
   */
  render() {
    let anointmentNames = new Set();
    let anointmentsInSpecialization = {};
    for (let a of this.props.anointments) {
      if (!a) continue;
      if (!anointmentsInSpecialization.hasOwnProperty(a.spec_abbrev)) {
        anointmentsInSpecialization[a.spec_abbrev] = 0;
      }
      anointmentsInSpecialization[a.spec_abbrev]++;
      anointmentNames.add(a.name);
    }

    return (
      <Modal
        className="modal-content modal-content-info  specialization-selection-modal modal-wide "
        overlayClassName="modal-overlay modal-overlay-info is-open"
        isOpen={this.props.modalIsOpen}
      >
        <div className="modal-header">
          <h3>
            Anointments{" "}
            <span style={{ marginLeft: "20px" }}>
              {this.props.anointments.length} of {this.props.maxAnointments}{" "}
              anointments selected
            </span>
          </h3>
          <button
            id="close-upload-party-modal"
            className="modal-close"
            onClick={this.props.closeModal}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="info-modal specialization-selection">
          <nav className="specialization-selection-nav">
            {this.props.specializations.map((s, i) => (
              <div
                key={i}
                className={
                  "specialization-option " +
                  (_.isEqual(this.state.currentSpecialization, s)
                    ? "current"
                    : "") +
                  (anointmentsInSpecialization[s.abbreviation] > 0
                    ? " has-anointment"
                    : "")
                }
                onClick={() => this.handleSpecializationChange(s)}
              >
                <span
                  className="option-icon"
                  style={{
                    backgroundImage:
                      "url(/siralim-planner/specialization_icons/" +
                      s.abbreviation +
                      ".png), " +
                      "url(/siralim-planner/specialization_icons/UNKNOWN.png)",
                  }}
                ></span>
                {s.name}
                {anointmentsInSpecialization[s.abbreviation] > 0 &&
                  " (" + anointmentsInSpecialization[s.abbreviation] + ")"}
              </div>
            ))}
          </nav>
          <div className="specialization-selection-list">
            <h2>
              {this.state.currentSpecialization &&
                this.state.currentSpecialization.name}{" "}
              Perks
            </h2>
            <table
              id="perks-table"
              className={this.props.atMaxAnointments ? "max-anoints" : ""}
            >
              <thead>
                <tr>
                  <th></th>
                  <th>Perk Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {this.state.currentSpecialization &&
                  this.state.currentSpecialization.perks.map((perk, i) => (
                    <tr
                      key={i}
                      onClick={() => this.props.toggleAnointment(perk)}
                      className={
                        (anointmentNames.has(perk.name) ? "active" : "") +
                        (perk.anointment === "Yes" ? "" : "no-anoint")
                      }
                      title={
                        perk.anointment === "No"
                          ? "This perk cannot be selected as an anointment."
                          : undefined
                      }
                    >
                      <td>
                        {anointmentNames.has(perk.name) && (
                          <span className="green-tick">
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="perk-flex">
                          <PerkIcon perk={perk} />
                          {perk.name}
                        </span>
                      </td>
                      <td>{perk.description}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <section className="flavour-text">
              <h4>
                About the{" "}
                {this.state.currentSpecialization &&
                  this.state.currentSpecialization.name}
              </h4>
              {this.state.currentSpecialization &&
                this.state.currentSpecialization.description
                  .split("\\n")
                  .map((par, i) => <p key={i}>{par}</p>)}
            </section>
          </div>
        </div>
      </Modal>
    );
  }
}

/**
 * A single Anointment that appears in the list of anointments
 * on the Specializations tab on the left side.
 * Note that this has nothing to do with the Anointments modal.
 * @
 */
class SpecializationPlannerAnointment extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      justUpdated: false,
    };
  }

  /**
   * Render an empty row that says "No anointment selected".
   * @return {ReactElement} An empty row.
   */
  renderEmptyRow() {
    return <div className="empty-row">No anointment selected</div>;
  }

  /**
   * The render function.
   * @return {ReactComponent} A div representing an anointment.
   */
  render() {
    const rowErrors = null;

    return (
      <div className="trait-slot anointment-slot">
        <div
          className={
            "anointment-slot-non-clickable" +
            (rowErrors ? " invalid-row" : "") +
            (this.state.justUpdated ? " just-updated" : "")
          }
          title={rowErrors}
        >
          {!this.props.perk ? (
            this.renderEmptyRow()
          ) : (
            <div className="anointment">
              <div className="anointment-name-and-source">
                <div className="anointment-name">
                  <span className="perk-flex">
                    <PerkIcon perk={this.props.perk} />
                    {this.props.perk.name}
                  </span>
                </div>
                <div className="anointment-source">
                  (
                  <span
                    className="option-icon"
                    style={{
                      backgroundImage:
                        "url(/siralim-planner/specialization_icons/" +
                        this.props.perk.spec_abbrev +
                        ".png), " +
                        "url(/siralim-planner/specialization_icons/UNKNOWN.png)",
                    }}
                  ></span>{" "}
                  {this.props.perk.spec})
                </div>
              </div>
              <div className="anointment-desc">
                {this.props.perk.description}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

/**
 * The specialization planner, which appears as a box on the left hand side of the page.
 * Allows the user to select their specialization and anointments.
 * @property {Boolean} state.isOpen Whether the planner is open (true), or pushed to the side (false).
 * @property {Array} state.specializations A list of all specializations, which are copied over from
 *                                         specializationsList and updated with values and labels for react-select.
 * @property {Boolean} state.anointmentsModalIsOpen Whether or not the anointments modal is open.
 */
class SpecializationPlanner extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      specializations: [],

      anointmentsModalIsOpen: false,
    };
  }

  /**
   * Toggle whether this is open (or pushed to the side).
   */
  toggleOpen() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  /**
   * When this component mounts, copy over the specializations from the global specializationsList
   * and append value and labels, which are required for react-select.
   */
  componentDidMount() {
    let specializations = [...specializationsList];
    for (let s of specializations) {
      s["value"] = s.abbreviation;
      s["label"] = s.name;
    }

    this.setState({
      specializations: specializations,
    });
  }

  /**
   * Close the anointments modal and allow scrolling in the document body.
   */
  closeAnointmentsModal() {
    this.setState(
      {
        anointmentsModalIsOpen: false,
      },
      () => {
        document.body.style["overflow-y"] = "scroll";
      }
    );
  }

  /**
   * Open the anointments modal and prevent scrolling in the document body.
   */
  openAnointmentsModal() {
    this.setState(
      {
        anointmentsModalIsOpen: true,
      },
      () => {
        document.body.style["overflow-y"] = "hidden";
      }
    );
  }

  /**
   * Handle a specialization change, i.e. the user has selected a different
   * specialization in the drop down list.
   * @param  {Object} selectedOption The selected option from react-select.
   */
  handleSpecializationChange(selectedOption) {
    let currentSpecialization = null;
    for (let s of this.state.specializations) {
      if (s.abbreviation === selectedOption.value) {
        currentSpecialization = s;
        break;
      }
    }
    this.props.updateSpecialization(currentSpecialization);
  }

  /**
   * The render function.
   * @return {ReactComponent} The specialization planner div.
   */
  render() {
    const freeAnointmentSlots = new Array(
      Math.max(0, this.props.maxAnointments - this.props.anointments.length)
    ).fill(null); // TODO: Get this to work for Royal

    let specOptions = [];
    for (let s of this.state.specializations) {
      specOptions.push({ value: s.abbreviation, label: s.name });
    }

    return (
      <div
        id="specialization-planner"
        className={
          (!this.state.isOpen ? "hide " : "") +
          "spe-" +
          (this.props.currentSpecialization &&
            this.props.currentSpecialization.abbreviation)
        }
      >
        <div className="toggle-bar" onClick={this.toggleOpen.bind(this)}>
          <FontAwesomeIcon
            icon={this.state.isOpen ? faChevronLeft : faChevronRight}
          />
        </div>

        <SpecializationPlannerAnointmentsModal
          modalIsOpen={this.state.anointmentsModalIsOpen}
          closeModal={this.closeAnointmentsModal.bind(this)}
          anointments={this.props.anointments}
          specializations={this.state.specializations}
          specOptions={specOptions}
          currentSpecialization={this.props.currentSpecialization}
          maxAnointments={this.props.maxAnointments}
          atMaxAnointments={
            this.props.maxAnointments === this.props.anointments.length
          }
          toggleAnointment={this.props.toggleAnointment}
        />

        <h3 className="section-title">Specialization</h3>

        <Select
          styles={customStyles}
          value={this.props.currentSpecialization}
          onChange={this.handleSpecializationChange.bind(this)}
          options={specOptions}
          menuPosition="fixed"
          components={{ Option: IconOption, ValueContainer: MyValueContainer }}
        />

        <button
          aria-label="View specializations"
          className="perks-and-anointments-button"
          onClick={() => this.openAnointmentsModal()}
        >
          <FontAwesomeIcon icon={faBolt} />
          Anointments
        </button>

        <div className="anointments-list">
          {this.props.anointments.map((anointment, i) => (
            <SpecializationPlannerAnointment key={i} perk={anointment} />
          ))}
          {freeAnointmentSlots.map((anointment, i) => (
            <SpecializationPlannerAnointment key={i} perk={anointment} />
          ))}
        </div>
      </div>
    );
  }
}

export default SpecializationPlanner;
