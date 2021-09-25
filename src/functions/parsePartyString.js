// A function for parsing the output of the "Export Data to Clipboard" feature
// in Siralim Ultimate.
//
// Function written by bluequakeralex and adapted by beratedbert.

function parsePartyString(text) {
  console.log("hello")
  //let lines = text.split("\n");
  let innates = [];
  let secondaries = [];
  let artifacts = [];

  const innateDetectionText = "Innate Trait: ";
  const fusedDetectionText = "Fused Trait: ";
  const traitSlotDetectionText = "Trait Slot: ";

  // Split into creatures using the ---- lines.
  // Hopefully this does not change between patches.
  var creatures = text.split('------------------------------');
  if(creatures.length > 7) throw new Error("Party appears to have more than 6 creatures.");

  creatures = creatures.slice(0, 6); // Remove the last element, which is empty space after the last
                                     // dashed line.

  innates = new Array(6).fill(null);
  secondaries = new Array(6).fill(null);
  artifacts = new Array(6).fill(null);

  // For each creature, get the innate, secondary and artifact trait.
  // Throw an error if a creature has more than one of each trait type.
  // If the creature does not have a trait in that slot, it will be null.
  for(var i = 0; i < 6; i++) {

    if(!creatures[i]) continue;

    var innateTrait = null;
    var secondaryTrait = null;
    var artifactTrait = null;

    var lines = creatures[i].split('\n');

    for (const line of lines) {
      if (line.startsWith(innateDetectionText)) {
        if(innateTrait) throw new Error("Creature #" + (i + 1) + "has more than one primary trait.")
        innateTrait = line.slice(innateDetectionText.length);
      }
      else if (line.startsWith(fusedDetectionText)) {
        if(secondaryTrait) throw new Error("Creature #" + (i + 1) + "has more than one secondary trait.")
        secondaryTrait = line.slice(fusedDetectionText.length);
      }
      else if (line.startsWith(traitSlotDetectionText)) {
        if(artifactTrait) throw new Error("Creature #" + (i + 1) + "has more than one artifact trait.")
        artifactTrait = line.slice(traitSlotDetectionText.length).split(":")[0];
      }
    }

    innates[i] = innateTrait;
    secondaries[i] = secondaryTrait;
    artifacts[i] = artifactTrait;
  }

  let traitsArray = [];

  for (let i = 0; i < 6; i++) {
    const innate = innates[i];
    const fusion = secondaries[i];
    const artifact = artifacts[i];

    traitsArray.push(innate);
    traitsArray.push(fusion);
    traitsArray.push(artifact);
  }

  var atLeastOne;
  for(let i = 0; i < traitsArray.length; i++) {
    if(traitsArray[i]) atLeastOne = true;
  }
  if(!atLeastOne) throw new Error("The party string does not appear to contain any traits.")
  return traitsArray;
}

export default parsePartyString;