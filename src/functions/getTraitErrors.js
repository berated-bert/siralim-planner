import _ from 'underscore';
/**
 * 
 * Check this row for errors. Return the error in the form of a string if present, else return null.
 * @param {Object} monster The monster to check.
 * @param {Integer} traitSlotIndex The trait slot index to check (0, 1, or 2).
 * @return {String} The error message, if any.
 */
function getTraitErrors(monster, traitSlotIndex) {
  if(_.isEmpty(monster)) return null;
  if(!(traitSlotIndex === 2) && 
    (monster.class === "Rodian Master" || monster.class === "Nether Boss" || monster.class === "Backer" || monster.class === "Pandemonium"))
      return "This trait cannot be found on a playable creature and cannot be placed in a creature slot.";
  if(traitSlotIndex === 2 && 
    (monster.material_name === "N/A" || monster.material_name === "No Material Exists")) 
      return "This trait has no material and cannot be placed in the trait slot.";
  return null;
}

export default getTraitErrors;