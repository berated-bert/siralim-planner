import React, { PureComponent } from "react";
import Modal from "react-modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";

const TYPE_ORDER = [
  "creature",
  "material",
  "relic",
  "anointment",
  "specialization",
];

const TYPE_LABELS = {
  creature: "Creatures",
  material: "Materials",
  relic: "Relics",
  anointment: "Anointments",
  specialization: "Specialization",
};

class ChecklistModal extends PureComponent {
  renderGroup(type, items) {
    if (!items.length) return null;
    return (
      <div className="checklist-group" key={type}>
        <h4>{TYPE_LABELS[type] || type}</h4>
        <div className="checklist-items">
          {items.map((item) => {
            const checked = !!this.props.checkedMap[item.id];
            return (
              <label
                key={item.id}
                className={"checklist-item" + (checked ? " checked" : "")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => this.props.toggleItem(item.id)}
                />
                <span className="checklist-item-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={checked ? faCheckSquare : faSquare} />
                </span>
                <span className="checklist-item-label">
                  {item.label}
                  {item.slotLabel && (
                    <span className="checklist-item-meta">
                      Party Member {item.partyMemberId + 1}, {item.slotLabel}
                    </span>
                  )}
                  {item.sources && item.sources.length > 0 && (
                    <span className="checklist-item-meta">
                      Sources: {item.sources.join(", ")}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const total = this.props.items.length;
    const checkedCount = this.props.items.reduce((acc, item) => {
      return acc + (this.props.checkedMap[item.id] ? 1 : 0);
    }, 0);

    const groups = TYPE_ORDER.map((type) => {
      const items = this.props.items.filter((item) => item.type === type);
      return this.renderGroup(type, items);
    });

    return (
      <Modal
        className="modal-content modal-content-info checklist-modal"
        overlayClassName="modal-overlay modal-overlay-info is-open"
        isOpen={this.props.modalIsOpen}
      >
        <div className="modal-header">
          <h3>Checklist</h3>
          <button
            id="close-checklist-modal"
            className="modal-close"
            aria-label="Close checklist"
            onClick={this.props.closeModal}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="checklist-summary">
          <span>
            {checkedCount} / {total} complete
          </span>
          <div className="checklist-actions">
            <button onClick={this.props.checkAll}>Check all</button>
            <button onClick={this.props.clearAll}>Clear all</button>
          </div>
        </div>
        <div className="checklist-body">{groups}</div>
      </Modal>
    );
  }
}

export default ChecklistModal;
