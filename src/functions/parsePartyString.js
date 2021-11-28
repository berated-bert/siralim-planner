/**
 * A function to parse the character section of a build string from Siralim Ultimate.
 * @param  {String} text The character section of the build string.
 * @return {{String, Array}}      The specialization and list of the names of the anointments
 *                                from the build string.
 */
function parseCharacterSection(text) {

  let spec = '';
  let anointment_names = [];

  for(const line of text.split('\n')) {
    if(line.indexOf("the ") !== -1 && !spec) {
      spec = line.split("the ")[1];
      if(spec.indexOf(" (") !== -1) {
        spec = spec.split(' (')[0]; // Remove (Ascended)
      }
    } else if (line.indexOf('Anointments: ') !== -1) {
      anointment_names = line.split('Anointments: ')[1].split(', ');
    }
  }
  let an_set = new Set(anointment_names);
  if(an_set.size !== anointment_names.length) throw new Error("Duplicate anointment.")

  if(anointment_names.length > 15) throw new Error("Too many anointments.");
  if(spec !== "Royal" && anointment_names.length > 5) throw new Error("Too many anointments.");


  return { spec: spec, anointment_names: anointment_names};

}


/**
 * A function to parse the creature section of a build string from Siralim Ultimate.
 * Function written by bluequakeralex and adapted by beratedbert.
 * @param  {String} text The creature section of the build string.
 * @return {Object}      An object containing {traits, relics}, which are an array
 *                       of 18 (or fewer) trait names and 6 (or fewer) relic names respectively.
 */
function parseCreatureSection(text) {  

  const innateDetectionText = "Innate Trait: ";
  const fusedDetectionText = "Fused Trait: ";
  const traitSlotDetectionText = "Trait Slot: ";
  const relicSlotDetectionText = "Relic: ";

  // Split into creatures using the ---- lines.
  // Hopefully this does not change between patches.
  let creatures = text.split('------------------------------');
  if(creatures.length > 7) throw new Error("Party appears to have more than 6 creatures.");

  creatures = creatures.slice(0, 6); // Remove the last element, which is empty space after the last
                                     // dashed line.

  let innates = new Array(6).fill(null);
  let secondaries = new Array(6).fill(null);
  let artifacts = new Array(6).fill(null);
  let relics = new Array(6).fill(null);

  // For each creature, get the innate, secondary and artifact trait.
  // Throw an error if a creature has more than one of each trait type.
  // If the creature does not have a trait in that slot, it will be null.
  for(let i = 0; i < 6; i++) {

    if(!creatures[i]) continue;

    let innateTrait = null;
    let secondaryTrait = null;
    let artifactTrait = null;
    let relic = null;

    let lines = creatures[i].split('\n');

    for (const line of lines) {
      if (line.startsWith(innateDetectionText)) {
        if(innateTrait) throw new Error("Creature #" + (i + 1) + " has more than one primary trait.")
        innateTrait = line.slice(innateDetectionText.length);
      }
      else if (line.startsWith(fusedDetectionText)) {
        if(secondaryTrait) throw new Error("Creature #" + (i + 1) + " has more than one secondary trait.")
        secondaryTrait = line.slice(fusedDetectionText.length);
      }
      else if (line.startsWith(traitSlotDetectionText)) {
        if(artifactTrait) throw new Error("Creature #" + (i + 1) + " has more than one artifact trait.")
        artifactTrait = line.slice(traitSlotDetectionText.length).split(":")[0];
      }
      else if (line.startsWith(relicSlotDetectionText)) {
        if(relic) throw new Error("Creature #" + (i + 1) + " has more than one relic.")
        relic = line.slice(relicSlotDetectionText.length).split(' (Rank')[0];
      }
    }
    innates[i] = innateTrait;
    secondaries[i] = secondaryTrait;
    artifacts[i] = artifactTrait;
    relics[i] = relic;
  }

  let traitsArray = [];
  let relicsArray = [];

  for (let i = 0; i < 6; i++) {
    const innate = innates[i];
    const fusion = secondaries[i];
    const artifact = artifacts[i];
    const relic = relics[i];

    traitsArray.push(innate);
    traitsArray.push(fusion);
    traitsArray.push(artifact);
    relicsArray.push(relic);
  }

  let atLeastOne;
  for(let i = 0; i < traitsArray.length; i++) {
    if(traitsArray[i]) atLeastOne = true;
  }
  if(!atLeastOne) throw new Error("The party string does not appear to contain any traits.")

  return {traits: traitsArray, relics: relicsArray};

}

/**
 * A function to parse the build string from the export feature in Siralim Ultimate.
 * @param  {String} text The build string.
 * @return {{Array, String, Array}}      The list of trait names, specialization name, and anointment names.
 */
function parsePartyString(text) {

  if(text.indexOf('========== CREATURES ==========') === -1) {
    throw new Error("The string does not appear to be a valid Siralim Ultimate build string.")
  }

  const sections = text.split('========== CREATURES ==========')
  
  const {spec, anointment_names} = parseCharacterSection(sections[0]);
  const {traits, relics} = parseCreatureSection(sections[1]);

  return {traits, relics, spec, anointment_names};
}

export default parsePartyString;