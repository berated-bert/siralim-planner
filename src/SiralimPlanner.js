import React, { Component } from "react";
import Modal from "react-modal";
import { withRouter } from "react-router-dom";
import _ from "underscore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import InfoModal from "./components/InfoModal";
import UploadPartyModal from "./components/UploadPartyModal";

import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";

import MonsterSelectionModal from "./components/MonsterSelectionModal";
import MonsterPlanner from "./components/MonsterPlanner";
import SpecializationPlanner from "./components/SpecializationPlanner";

import parsePartyString from "./functions/parsePartyString";
import randomSample from "./functions/randomSample";
import getTraitErrors from "./functions/getTraitErrors";

import "./App.scss";

Modal.setAppElement("#root");

const UID_HASH_LENGTH = 6;
const monsterData = require("./data/data");
const specializationsList = require("./data/specializations");
const metadata = require("./data/metadata");
const compendium_version = metadata.compendium_version;
const relicsList = require("./data/relics");
// [
//   {name: "Wintermaul", stat_bonus: "Health",  abbreviation: "wintermaul", perks: [{'rank': 10, 'description': 'Does a cool thing'}]},
//   {name: "Temptation", abbreviation: "temptation"},
//   {name: "Salus", abbreviation: "salus"},

// ]

/**
 * Construct a map (i.e. a JSON dictionary) that maps UIDs to the index
 * of that UID in traitsList.
 * @return {Object} A map of {uid: index}
 */
function buildUIDMap() {
  let monsterMap = {};
  for (let i in monsterData) {
    monsterMap[monsterData[i].uid] = parseInt(i);
  }
  return monsterMap;
}

/**
 * Construct a map (i.e. a JSON dictionary) that maps lowercased trait_names to
 * the UIDs in the database. This is necessary to import party strings.
 * @return {Object} A map of {trait_name: uid}
 */
function buildTraitMap() {
  let traitMap = {};
  for (let i in monsterData) {
    traitMap[monsterData[i].trait_name.toLowerCase()] = monsterData[i].uid;
  }
  return traitMap;
}

/**
 * Construct two maps: one mapping anointment UIDs (BMA, BMB etc) to the corresponding
 * perk, and another mapping anointment names (Union, Whetbone etc) to the corresponding
 * perk.
 * @return {Object} An object containing the anointment UID map and anointment name map.
 */
function buildAnointmentMaps() {
  let anointmentUIDMap = {};
  let anointmentNameMap = {};
  for (let s of specializationsList) {
    for (let p of s.perks) {
      if (p.anointment === "No") continue;
      anointmentUIDMap[p.uid] = p;
      anointmentNameMap[p.name] = p;
    }
  }
  return {
    anointmentUIDMap: anointmentUIDMap,
    anointmentNameMap: anointmentNameMap,
  };
}

/**
 * Construct a map that maps each relic UID to the relic objects.
 * @return {Object} An object containing the relic UID map.
 */
function buildRelicUIDMap() {
  let relicUIDMap = {};
  for (let r of relicsList) {
    relicUIDMap[r.uid] = r;
  }
  return relicUIDMap;
}

/**
 * Construct a map that maps specialization names to the specialization objects.
 * @return {Object} A map of {specialization name: specialization object}
 */
function buildSpecializationNameMap() {
  let specializationNameMap = {};
  for (let s of specializationsList) {
    specializationNameMap[s.name] = s;
  }
  return specializationNameMap;
}

const monsterUIDMap = buildUIDMap();
const monsterTraitMap = buildTraitMap();
const { anointmentUIDMap, anointmentNameMap } = buildAnointmentMaps();
const specializationNameMap = buildSpecializationNameMap();
const relicUIDMap = buildRelicUIDMap();

/**
 * A class representing the notification banner, which appears at the top when
 * a notification is made in the SiralimPlanner app.
 * @property {Boolean} state.hidden Whether this banner is currently hidden or not.
 */
class NotificationBanner extends Component {
  /**
   * Class constructor.
   * @param  {Object} props The props.
   * @return {void}
   */
  constructor(props) {
    super(props);
    this.state = {
      hidden: true,
    };
    this.fadeOutTimeout = null;
  }

  /**
   * When this component updates such that the prevProps are different
   * and this notification banner was not already showing, set hidden=false
   * (so the banner appears) and set a timeout for 6s for it to hide again.
   * @param  {Object} prevProps The previous props.
   * @param  {Object} prevState The previous state.
   * @return {void}
   */
  componentDidUpdate(prevProps, prevState) {
    if (_.isEqual(prevProps, this.props) && prevState.hidden === false) return;
    if (this.props.status === null) return; // Ignore first successful load, which is null.
    if (prevProps.notificationIndex === this.props.notificationIndex) return;

    this.setState(
      {
        hidden: false,
      },
      () => {
        window.clearTimeout(this.fadeOutTimeout);
        this.fadeOutTimeout = window.setTimeout(() => this.setHidden(), 6000);
      }
    );
  }

  /**
   * Hide the notification banner (this sets the opacity to 0 via CSS so that
   * way nothing gets moved around awkwardly.)
   */
  setHidden() {
    this.setState({
      hidden: true,
    });
  }

  /**
   * The render function
   * @return {ReactComponent} The notification banner component.
   */
  render() {
    let icon = faExclamationTriangle;
    if (this.props.status === "success") icon = faCheck;

    return (
      <div
        className={
          "notification-banner notification-" +
          this.props.status +
          (this.state.hidden ? " hidden" : "")
        }
      >
        <FontAwesomeIcon icon={icon} />
        &nbsp;&nbsp;{this.props.text}
      </div>
    );
  }
}

/**
 * The main component which sits within App.
 * @property state.partyMembers {Array}  A list of 6 items, each of which corresponds to a party member.
 * @property state.anointments  {Array}  A list of the 5 anointments (or 15 if Royal) the user has selected.
 * @property state.relics  {Array}  A list of the 6 relics the user has selected (one per party member).
 * @property {Object} state.currentSpecialization    The currently selected specialization.
 * @property {Integer} state.maxAnointments The maximum number of anointments. Is changed to 15 when spec = Royal
 * @property {Integer} state.currentPartyMemberId The current party member id, i.e. 0, 1, 2, 3, 4 or 5.
 * @property {Integer} state.currentTraitSlotId The current party trait slot id, i.e. 0, 1 or 2.
 * @property {Integer} state.currentSlotId The current slot id, i.e. the slot the user most recently
 *                                      clicked on in the party planning interface.
 *                                      slot id = 0 means the first row in the table.
 * @property {Object} state.currentSelectedMonster A JSON obj corresponding to the monster that is currently
 *                                           selected, i.e. the one the user most recently clicked in
 *                                           the party planning interface.
 * @property {Set} state.monstersInParty An set of uids of the monsters/trait in the user's party.
 * @property {Boolean} state.modalIsOpen Whether the monster selection modal is open.
 * @property {Boolean} state.infoModalIsOpen Whether the information modal is open.
 * @property {Boolean} state.uploadBuildModalIsOpen Whether the upload build modal is open.
 * @property {String} state.notificationText Text to display in the notification banner at the top.
 * @property {String} state.notificationStatus The status of the notification, e.g. 'success', 'warning', 'error'.
 * @property {Integer} state.notificationIndex Keep track of the index of each notification, to avoid weird bugs with the
 *                                       banner refreshing for no reason when this component updates.
 *
 */
class SiralimPlanner extends Component {
  /**
   * The constructor.
   * @param  {Object} props The props.
   */
  constructor(props) {
    super(props);
    this.originalState = {
      partyMembers: [],
      anointments: [],
      relics: [],
      currentSpecialization: null,
      maxAnointments: 5,

      currentPartyMemberId: null,
      currentTraitSlotId: null,
      currentSlotId: null,
      currentSelectedMonster: null,

      monstersInParty: new Set(),
      modalIsOpen: false,
      infoModalIsOpen: false,
      uploadBuildModalIsOpen: false,

      notificationText: null,
      notificationStatus: null,
      notificationIndex: 0,
    };

    this.state = this.originalState;
  }

  /**
   * Generate a 'save string', which is a unique identifier of the entire party.
   * This is done by taking the uid of each monster (underscore if no monster)
   * across each of the 18 slots.
   * Note that the string is quite long, and will be even longer if we later add
   * in other things like traits, perks etc... so we might need to develop a
   * back-end application like Flask to be able to generate a short URL.
   */
  generateSaveString() {
    let partyMembers = this.state.partyMembers;
    let saveString = "";

    var c = 0;
    for (let pm of partyMembers) {
      for (let m of pm) {
        if (!_.isEmpty(m.monster)) saveString += m.monster.uid;
        else saveString += "_";
        c++;
        if (c > 18) break;
      }
    }

    // Generate specialization string
    if (this.state.currentSpecialization) {
      saveString += "&s=" + this.state.currentSpecialization.abbreviation;
    }

    // Generate anointments string
    if (this.state.anointments.length > 0) saveString += "&a=";
    for (let a of this.state.anointments) {
      saveString += a.uid;
    }

    // Generate relics string
    if (this.state.relics.length > 0) saveString += "&r=";
    for (let r of this.state.relics) {
      if (!r) {
        saveString += "_";
        continue;
      }
      saveString += r.uid;
    }

    this.props.history.push("?b=" + saveString);
  }

  /**
   * Retrieve a set of the uids of every monster/trait (up to 18) in the current party.
   * @param  {Array} partyMembers An array of Objects where each object is a party member.
   * @return {Array}              An array of the uid of each monster/trait in the party.
   */
  getMonstersInParty(partyMembers) {
    let monstersInParty = new Set();
    for (let p of partyMembers) {
      for (let m of p) {
        if (m.monster.uid) monstersInParty.add(m.monster.uid);
      }
    }
    return monstersInParty;
  }

  /**
   * Given a particular monster, update the monster at the party member and trait slot id
   * to be set to that monster.
   * @param  {Object} monster The monster to replace the current monster with.
   */
  updatePartyMember(monster) {
    let partyMembers = [...this.state.partyMembers];
    partyMembers[this.state.currentPartyMemberId][
      this.state.currentTraitSlotId
    ].monster = monster;

    let monstersInParty = this.getMonstersInParty(partyMembers);
    this.setState(
      {
        partyMembers: [...partyMembers],
        monstersInParty: monstersInParty,
      },
      () => {
        this.closeModal();
        this.generateSaveString();
      }
    );
  }

  /**
   * Given a particular partyMemberId and traitSlotId, e.g. 1, 4,
   * remove that monster/trait from the party.
   * @param  {Integer} partyMemberId The id of the party member, e.g. 1.
   * @param  {Integer} traitSlotId   The id of the trait slot, e.g. 4.
   */
  clearPartyMember(partyMemberId, traitSlotId) {
    let partyMembers = [...this.state.partyMembers];
    partyMembers[partyMemberId][traitSlotId].monster = {};
    let monstersInParty = this.getMonstersInParty(partyMembers);

    this.setState(
      {
        partyMembers: partyMembers,
        monstersInParty: monstersInParty,
      },
      this.generateSaveString
    );
  }

  /**
   * Update the 18 monster planner rows to newRows and generate an updated
   * saveString.
   * @param  {Array} newMembers An array of monster objects.
   */
  updatePartyMembers(newMembers) {
    this.setState(
      {
        partyMembers: newMembers,
      },
      this.generateSaveString
    );
  }

  /**
   * Update the anointments array to newAnointments and generate an updated
   * saveString.
   * @param  {Array} newAnointments An array of anointment objects.
   */
  updateAnointments(newAnointments) {
    this.setState(
      {
        anointments: newAnointments,
      },
      this.generateSaveString
    );
  }

  /**
   * Update the relics array to newRelics and generate an updated
   * saveString.
   * @param  {Array} newRelics An array of relic objects.
   */
  updateRelics(newRelics) {
    console.log(newRelics);
    this.setState(
      {
        relics: newRelics,
      },
      this.generateSaveString
    );
  }

  /**
   * Parse the loadString into a list of UIDs (or null for underscores).
   * @param  {String} str The string to parse.
   * @return {Array}     An array of strings, where each string is a uid.
   */
  parseLoadString(str) {
    let uids = [];
    let currentUid = "";
    for (let i = 0; i < str.length; i++) {
      let c = str[i];
      if (c === "_") {
        if (currentUid.length > 0 && currentUid.length < UID_HASH_LENGTH)
          throw new Error("Malformed uid");
        uids.push(null);
      } else {
        currentUid += c;
        if (currentUid.length === UID_HASH_LENGTH) {
          uids.push(currentUid);
          currentUid = "";
        }
      }
    }
    // Throw errors if the string is not valid (i.e. too short or too long).
    if (uids.length > 18) throw new Error("Too many uids");
    if (uids.length < 18) throw new Error("Not enough uids");

    return uids;
  }

  /**
   * Parse the spec string (should contain two letters corresponding to
   * a specialization) and return the specialization in the string.
   * @param  {String} str The string to parse.
   * @return {Object}     The specialization object.
   * @throws {Error} If specialization is not found.
   */
  parseSpecString(str) {
    for (let s of specializationsList) {
      if (s.abbreviation === str) {
        return s;
      }
    }
    throw new Error("Specialization not found");
  }

  /**
   * Parse the anointments string and return a list of anointments
   * whose uids are in the string.
   * @param  {String} str The string to parse.
   * @return {Array} The array of anointment objects.
   * @throws {Error} If the string is not valid.
   */
  parseAnointmentsString(str) {
    let anointments = [];
    let a_uids = str.match(/.{1,3}/g);
    let seen_uids = new Set();
    for (let a of a_uids) {
      if (a.length !== 3)
        throw new Error("Anointment string contains invalid anointment id.");
      if (!anointmentUIDMap.hasOwnProperty(a))
        throw new Error("Anointment id not found.");
      if (seen_uids.has(a)) throw new Error("Anointment appears twice.");
      seen_uids.add(a);

      anointments.push(anointmentUIDMap[a]);
    }
    return anointments;
  }

  /**
   * Parse the relics string and return a list of relics
   * whose uids are in the string.
   * TODO: Refactor this as it is using a lot of repeated code from parseLoadString.
   * @param  {String} str The string to parse.
   * @return {Array} The array of relic objects.
   * @throws {Error} If the string is not valid.
   */
  parseRelicsString(str) {
    let relics = [];

    let uids = [];
    let currentUid = "";
    for (let i = 0; i < str.length; i++) {
      let c = str[i];
      if (c === "_") {
        if (currentUid.length > 0 && currentUid.length < 2)
          throw new Error("Malformed uid");
        uids.push(null);
      } else {
        currentUid += c;
        if (currentUid.length === 2) {
          uids.push(currentUid);
          currentUid = "";
        }
      }
    }
    for (let uid of uids) {
      if (!uid) {
        relics.push(null);
        continue;
      }
      if (!relicUIDMap.hasOwnProperty(uid))
        throw new Error("Relic id not found.");
      relics.push(relicUIDMap[uid]);
    }

    return relics;
  }

  /**
   * Given a list of uids, construct a new array of monsterPlannerRows
   * where each item is the monster that corresponds to that particular
   * uid. This is used to read in the buildString (from the URL) and
   * from the in-game export of data to the clipboard.
   *
   * Returns a json object with the 18 rows, any notification message that pops up
   * (right now just that the build could not be parsed or that it was parsed
   * successfully), and a status code
   * (warning, success, error, null).
   * @param  {Array} uids An array of strings, where each string is a uid.
   * @return {{Array, String, String}}      An array of party members, the notification text,
   *                                        and notification status.
   */
  populateFromUids(uids) {
    let noti, status;
    //let monsterPlannerRows = [];
    let partyMembers = [];
    // Start by generating an empty list of 18 rows, corresponding to each
    // trait slot.

    for (let i = 0; i < 6; i++) {
      partyMembers.push([]);
      for (let j = 0; j < 3; j++) {
        partyMembers[i].push({ monster: {} });
      }
    }

    for (let i = 0; i < Math.min(18, uids.length); i++) {
      let uid = uids[i];
      if (uid !== null) {
        if (monsterUIDMap.hasOwnProperty(uid)) {
          partyMembers[Math.floor(i / 3)][i % 3].monster =
            monsterData[monsterUIDMap[uid]];
        } else {
          partyMembers[Math.floor(i / 3)][i % 3].error =
            "Monster/trait does not exist or has changed";
          noti =
            "Your build could not be fully parsed as at least one monster trait was not found in the database.";
          status = "warning";
        }
      }
    }
    if (!noti) {
      noti = "Your build was parsed successfully.";
      status = "success";
    }
    return { partyMembers: partyMembers, noti: noti, status: status };
  }

  /** On component mount and on reset, transform monsterData into a new array, i.e.
   * { row_id: <the index of the monster>, monster: <the JSON object of the monster> }
   * This is necessary to get the drag and drop functionality to work.
   * Every row needs a fixed id to function properly.
   */
  initialLoad() {
    let notificationText = null;
    let notificationStatus = null;

    let partyMembers = [];
    let relics = [];

    for (let i = 0; i < 6; i++) {
      partyMembers.push([]);
      relics.push(null);
      for (let j = 0; j < 3; j++) {
        partyMembers[i].push({ monster: {} });
      }
    }

    // Get string from param if there is any
    const windowUrl = window.location.search;
    const params = new URLSearchParams(windowUrl);

    let loadString = params.get("b");

    // If a load string was provided (i.e. the ?b=<etc>), then attempt to create a party from that
    // build string.
    if (loadString) {
      try {
        const uids = this.parseLoadString(loadString);
        let pm = this.populateFromUids(uids);
        if (pm.status !== "success") {
          notificationText = pm.noti;
          notificationStatus = pm.status;
        }
        partyMembers = pm.partyMembers;
      } catch (err) {
        // TODO: Do something else with this, maybe.
        console.log("Error:", err);
      }
    }

    // Parse specialization string (s)
    let specialization = null;
    let specString = params.get("s");
    if (specString) {
      try {
        specialization = this.parseSpecString(specString);
      } catch (err) {
        notificationText =
          "Error parsing specialization in URL: " + err.message;
        notificationStatus = "error";
      }
    }

    // Parse anointment string (a)
    let anointments = [];
    const anointmentString = params.get("a");
    if (anointmentString) {
      try {
        anointments = this.parseAnointmentsString(anointmentString);
      } catch (err) {
        notificationText = "Error parsing anointments in URL: " + err.message;
        notificationStatus = "error";
      }
    }
    if (
      specialization &&
      specialization.name !== "Royal" &&
      anointments.length > 5
    ) {
      anointments = anointments.slice(0, 5);
    }

    // TODO: Parse relic string (r)
    const relicsString = params.get("r");
    if (relicsString) {
      try {
        relics = this.parseRelicsString(relicsString);
      } catch (err) {
        notificationText = "Error parsing relics in URL: " + err.message;
        notificationStatus = "error";
      }
    }

    this.setState({
      anointments: anointments,
      relics: relics,
      currentSpecialization: specialization,
      partyMembers: partyMembers,
      notificationText: notificationText,
      notificationStatus: notificationStatus,
      notificationIndex: this.state.notificationIndex + 1,
    });
  }

  /**
   * On component mount, call the initial load function.
   **/
  componentDidMount() {
    this.initialLoad();
  }

  /**
   * Open the build modal by setting the state accordingly.
   */
  openUploadBuildModal() {
    this.setState({
      uploadBuildModalIsOpen: true,
    });
  }

  /**
   * Close the build modal by setting the state accordingly.
   */
  closeUploadBuildModal() {
    this.setState({
      uploadBuildModalIsOpen: false,
    });
  }

  /**
   * Open the info modal by setting the state accordingly.
   */
  openInfoModal() {
    this.setState({
      infoModalIsOpen: true,
    });
  }

  /**
   * Close the info modal by setting the state accordingly.
   */
  closeInfoModal() {
    this.setState({
      infoModalIsOpen: false,
    });
  }

  // Open the monster selection modal.
  // Set row_id and slot_id to the row_id and slot_id of the trait slot
  // that the user clicked on, respectively.
  // Set monster to equal the monster the user just clicked on
  // (this is necessary to highlight the currently selected monster
  // in the monster selection screen).

  /**
   * Open the monster selection modal.
   * Set row_id and slot_id to the row_id and slot_id of the trait slot
   * that the user clicked on, respectively.
   * Set monster to equal the monster the user just clicked on
   * (this is necessary to highlight the currently selected monster
   * in the monster selection screen).
   * @param  {Integer} partyMemberId The id of the party member, e.g. 1.
   * @param  {Integer} traitSlotId   The id of the trait slot, e.g. 4.
   * @param  {Object} monster       The monster object.
   */
  openModal(partyMemberId, traitSlotId, monster) {
    this.setState(
      {
        modalIsOpen: true,
        currentPartyMemberId: partyMemberId,
        currentTraitSlotId: traitSlotId,
        currentSelectedMonster: monster || null,
      },
      () => {
        // Once open, prevent scrolling of the main page while the modal is open.
        document.body.style["overflow-y"] = "hidden";
        document.getElementById("monster-search").focus();
      }
    );
  }

  /**
   * Close the monster selection modal.
   * Enable scrolling of the main page again after it closes.
   */
  closeModal() {
    this.setState(
      {
        modalIsOpen: false,
        currentPartyMemberId: null,
        currentTraitSlotId: null,
        currentSelectedMonster: null,
      },
      () => {
        document.body.style["overflow-y"] = "scroll";
      }
    );
  }

  // Given an array of trait names, return an array
  // consisting of the uids of those particular trait names,
  // null if there was no trait in that slot,
  // or <not found> if that trait name is not present in the
  // trait map.

  /**
   * Given an array of trait names, return an array
   * consisting of the uids of those particular trait names,
   * null if there was no trait in that slot,
   * or <not found> if that trait name is not present in the
   * trait map.
   * @param  {Array} traitsArray An array of trait names.
   * @return {Array}             An array of the uids of those trait names.
   */
  traitsToUids(traitsArray) {
    let uids = [];
    for (let t of traitsArray) {
      if (t === null) {
        uids.push(null);
        continue;
      }
      let t_ = t.toLowerCase();
      if (monsterTraitMap.hasOwnProperty(t_)) {
        uids.push(monsterTraitMap[t_]);
      } else {
        uids.push("<not found>");
      }
    }
    return uids;
  }

  /**
   * Given a party string (from SU), build a party from that string.
   * Call the callback function when finished - this will present an error
   * in the upload party window if necessary.
   * @param  {String}   str      The party string.
   * @param  {Function} callback The function to call when complete.
   */
  uploadPartyFromString(str, callback) {
    let notificationText = null;
    let notificationStatus = null;

    try {
      let { traits, relics, spec, anointment_names } = parsePartyString(str);
      let uids = this.traitsToUids(traits);
      let pm = this.populateFromUids(uids);
      if (pm.noti) notificationText = pm.noti;
      if (pm.status) notificationStatus = pm.status;
      let partyMembers = pm.partyMembers;

      if (!specializationNameMap.hasOwnProperty(spec)) {
        throw new Error('Specialization "' + spec + '" was not found.');
      }
      const specialization = specializationNameMap[spec];

      let anointments = [];
      for (let a of anointment_names) {
        if (anointmentNameMap.hasOwnProperty(a)) {
          anointments.push(anointmentNameMap[a]);
        } else {
          notificationText =
            'Your build was loaded, but anointment "' + a + '" was not found.';
          notificationStatus = "warning";
          //anointments.push(null) // Note: This should ideally push an error or something
          // and render it the same way it does with the party members
          // whose traits do not exist.
        }
      }
      anointments.slice(0, specialization.name === "Royal" ? 15 : 5);

      // Get relics
      let partyMemberRelics = new Array(6).fill(null);
      for (let i = 0; i < relics.length; i++) {
        for (let j = 0; j < relicsList.length; j++) {
          if (relicsList[j].name === relics[i]) {
            partyMemberRelics[i] = relicsList[j];
            break;
          }
        }
      }

      this.setState(
        {
          partyMembers: partyMembers,
          relics: partyMemberRelics,
          uploadBuildModalIsOpen: false,
          currentSpecialization: specialization,
          anointments: anointments,
          notificationText: notificationText,
          notificationStatus: notificationStatus,
          notificationIndex: this.state.notificationIndex + 1,
        },
        () => {
          this.generateSaveString();
          callback();
        }
      );
    } catch (err) {
      return callback(err);
    }
  }

  /**
   * Toggle an anointment, i.e. enable or disable it.
   * @param  {Object} anointment The anointment to toggle.
   */
  toggleAnointment(anointment) {
    if (anointment.anointment !== "Yes") return;

    let anointments = this.state.anointments;
    let deleted = false;
    for (let i = 0; i < anointments.length; i++) {
      const a = anointments[i];
      // If this anointment in list, remove it and add a null at the end.
      if (anointment.name === a.name) {
        anointments.splice(i, 1);
        deleted = true;
        break;
      }
    }
    if (!deleted) {
      let limit = 5;
      if (
        this.state.currentSpecialization &&
        this.state.currentSpecialization.name === "Royal"
      ) {
        limit = 15;
      }
      if (anointments.length < limit) {
        anointments.push(anointment);
      }
    }
    this.setState(
      {
        anointments: anointments,
      },
      this.generateSaveString
    );
  }

  /**
   * Simple function to return the max number of anointments for the given spec.
   * @param  {Object} s The specialization.
   * @return {Integer}   The max number of anointments.
   */
  getMaxAnointments(s) {
    return s.name === "Royal" ? 15 : 5;
  }

  /**
   * Update the Specialization based on the selected option from the react select component.
   * @param  {Object} s The specialization to update to.
   * @return {void}
   */
  updateSpecialization(s) {
    const maxAnointments = this.getMaxAnointments(s);
    let anointments = this.state.anointments;
    if (anointments.length > maxAnointments) {
      anointments = anointments.slice(0, maxAnointments);
    }
    this.setState(
      {
        anointments: anointments,
        currentSpecialization: s,
        maxAnointments: maxAnointments,
      },
      this.generateSaveString
    );
  }

  /**
   * Reset the entire build back (clear everything).
   */
  resetBuild() {
    if (
      !window.confirm("Are you sure you want to completely reset your build?")
    ) {
      return;
    }
    this.props.history.push("/siralim-planner/");
    this.setState({ ...this.originalState }, () => {
      this.initialLoad();
      this.setState({
        notificationText: "Your build has been reset.",
        notificationStatus: "success",
        notificationIndex: this.state.notificationIndex + 1,
      });
    });
  }

  /**
   * Randomise the build (after prompting the user that this is really what
   * they want to do).
   */
  randomiseBuild() {
    if (!window.confirm("Are you sure you want to randomise your build?")) {
      return;
    }

    // Randomise specialization
    const currentSpecialization = randomSample(specializationsList);

    // Randomise relics.
    // Ensure no relic is selected twice.
    let relics = [];
    let seenRelics = new Set();
    for (let i = 0; i < 6; i++) {
      let randomRelic = randomSample(relicsList);
      while (seenRelics.has(randomRelic)) {
        randomRelic = randomSample(relicsList);
      }
      seenRelics.add(randomRelic);
      relics.push(randomRelic);
    }

    // Randomise party members
    let partyMembers = [];
    for (let i = 0; i < 6; i++) {
      partyMembers.push([]);
      for (let j = 0; j < 3; j++) {
        let randomMonster = randomSample(monsterData);
        while (getTraitErrors(randomMonster, j)) {
          randomMonster = randomSample(monsterData);
        }
        partyMembers[i].push({ monster: randomMonster });
      }
    }

    // Randomise anointments (don't allow duplicates).
    let anointments = [];
    let anointmentUIDs = [];
    const maxAnointments = this.getMaxAnointments(currentSpecialization);
    for (let i = 0; i < maxAnointments; i++) {
      let randomAnointmentUID = randomSample(Object.keys(anointmentUIDMap));
      while (anointmentUIDs.indexOf(randomAnointmentUID) >= 0) {
        randomAnointmentUID = randomSample(Object.keys(anointmentUIDMap));
      }
      anointmentUIDs.push(randomAnointmentUID);
      anointments.push(anointmentUIDMap[randomAnointmentUID]);
    }

    // Update notification text
    const notificationText = "Your build has been randomised.";
    const notificationStatus = "success";
    const notificationIndex = this.state.notificationIndex + 1;

    this.setState(
      {
        currentSpecialization,
        relics,
        partyMembers,
        anointments,
        notificationText,
        notificationStatus,
        notificationIndex,
      },
      this.generateSaveString
    );
  }

  /**
   * The render function.
   * @return {ReactComponent} The main div containing the app.
   */
  render() {
    return (
      <div className="App" id="app">
        <AppHeader
          resetBuild={this.resetBuild.bind(this)}
          randomiseBuild={this.randomiseBuild.bind(this)}
          openUploadBuildModal={this.openUploadBuildModal.bind(this)}
          openInfoModal={this.openInfoModal.bind(this)}
          compendiumVersion={compendium_version}
        />
        <NotificationBanner
          text={this.state.notificationText}
          status={this.state.notificationStatus}
          notificationIndex={this.state.notificationIndex}
        />

        <UploadPartyModal
          modalIsOpen={this.state.uploadBuildModalIsOpen}
          closeModal={this.closeUploadBuildModal.bind(this)}
          uploadPartyFromString={this.uploadPartyFromString.bind(this)}
        />
        <InfoModal
          modalIsOpen={this.state.infoModalIsOpen}
          closeModal={this.closeInfoModal.bind(this)}
        />

        <div
          className={
            "modal-overlay" + (this.state.modalIsOpen ? " is-open" : "")
          }
        >
          <MonsterSelectionModal
            items={monsterData}
            monstersInParty={this.state.monstersInParty}
            closeModal={this.closeModal.bind(this)}
            updatePartyMember={this.updatePartyMember.bind(this)}
            currentSelectedMonster={this.state.currentSelectedMonster}
            currentPartyMemberId={this.state.currentPartyMemberId}
            currentTraitSlotId={this.state.currentTraitSlotId}
          />
        </div>

        <main>
          <SpecializationPlanner
            currentSpecialization={this.state.currentSpecialization}
            anointments={this.state.anointments}
            maxAnointments={this.state.maxAnointments}
            updateSpecialization={this.updateSpecialization.bind(this)}
            updateAnointments={this.updateAnointments.bind(this)}
            toggleAnointment={this.toggleAnointment.bind(this)}
          />
          <MonsterPlanner
            partyMembers={this.state.partyMembers}
            updatePartyMembers={this.updatePartyMembers.bind(this)}
            openModal={this.openModal.bind(this)}
            clearPartyMember={this.clearPartyMember.bind(this)}
            relics={this.state.relics}
            relicsList={relicsList}
            updateRelics={this.updateRelics.bind(this)}
          />
        </main>
        <AppFooter />
      </div>
    );
  }
}

export default withRouter(SiralimPlanner);
