// A function for parsing the output of the "Export Data to Clipboard" feature
// in Siralim Ultimate.
//
// Function written by bluequakeralex and adapted by beratedbert.

function parseBuildString(text) {
  let lines = text.split("\n");
  let innates = [];
  let secondaries = [];
  let artifacts = [];

  const innateDetectionText = "Innate Trait: ";
  const fusedDetectionText = "Fused Trait: ";
  const traitSlotDetectionText = "Trait Slot: ";
  for (const line of lines) {
    if (line.startsWith(innateDetectionText)) {
      const innateTrait = line.slice(innateDetectionText.length);
      innates.push(innateTrait);
    }
    else if (line.startsWith(fusedDetectionText)) {
      const fusedTrait = line.slice(fusedDetectionText.length);
      secondaries.push(fusedTrait);
    }
    else if (line.startsWith(traitSlotDetectionText)) {
      const [traitSlot, traitDesc] = line.slice(traitSlotDetectionText.length).split(":");
      artifacts.push(traitSlot);
    }
  }

  const num_creatures = innates.length;
  for (let i=0; i<num_creatures; i++) {
    const innate = innates[i];
    const fusion = secondaries[i];
    const traitSlot = artifacts[i];
    console.log(`Creature ${i+1}`);
    if (innate !== undefined) {
      console.log(`Innate Trait: ${innate}`);
    }
    if (fusion !== undefined) {
      console.log(`Fusion: ${fusion}`);
    }

    if (traitSlot !== undefined) {
      console.log(`Trait Slot: ${traitSlot}`);
    }
  }
  return {innates: innates, secondaries: secondaries, artifacts: artifacts};
}
