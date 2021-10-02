import React, {Component, PureComponent} from 'react';
import _ from 'underscore';

class SpecializationPlanner extends PureComponent {


  render() {
    return (
      <div id="specialization-planner">
        <h3 className="section-title">Specialization</h3>
        <select>
          <option selected>Hell Knight</option>
          <option>Blood Mage</option>
        </select>



      </div>

    )
  }
}

export default SpecializationPlanner;