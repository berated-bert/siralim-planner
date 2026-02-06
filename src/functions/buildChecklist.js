import _ from "underscore";

const CREATURE_CLASSES = new Set([
  "Nature",
  "Chaos",
  "Death",
  "Sorcery",
  "Life",
]);

function isCreatureMonster(monster) {
  return monster && CREATURE_CLASSES.has(monster.class);
}

function getSlotLabel(slotId) {
  if (slotId === 0) return "Primary Trait";
  if (slotId === 1) return "Fused Trait";
  return "Artifact Trait";
}

function buildChecklist(partyMembers, relics, anointments, specialization) {
  const items = [];

  if (partyMembers && partyMembers.length) {
    partyMembers.forEach((partyMember, partyMemberId) => {
      partyMember.forEach((traitSlot, slotId) => {
        const monster = traitSlot && traitSlot.monster ? traitSlot.monster : null;
        if (!monster || _.isEmpty(monster)) return;

        const slotLabel = getSlotLabel(slotId);
        if (slotId === 2) {
          const materialName = monster.material_name || "Unknown material";
          items.push({
            id: `pm${partyMemberId}-slot${slotId}-material-${
              monster.uid || materialName
            }`,
            type: "material",
            label: `Material: ${materialName} (Artifact Trait: ${monster.trait_name})`,
            partyMemberId,
            slotId,
            slotLabel,
            sources: monster.sources || [],
          });
        } else {
          const creatureName = isCreatureMonster(monster)
            ? monster.creature
            : monster.trait_name;
          items.push({
            id: `pm${partyMemberId}-slot${slotId}-creature-${
              monster.uid || creatureName
            }`,
            type: "creature",
            label: `Creature: ${creatureName} (Trait: ${monster.trait_name})`,
            partyMemberId,
            slotId,
            slotLabel,
            sources: monster.sources || [],
          });
        }
      });
    });
  }

  if (relics && relics.length) {
    relics.forEach((relic, relicIndex) => {
      if (!relic) return;
      items.push({
        id: `relic-${relicIndex}-${relic.uid}`,
        type: "relic",
        label: `Relic: ${relic.name}`,
        relicIndex,
      });
    });
  }

  if (anointments && anointments.length) {
    anointments.forEach((anointment, i) => {
      if (!anointment) return;
      items.push({
        id: `anointment-${i}-${anointment.uid}`,
        type: "anointment",
        label: `Anointment: ${anointment.name}`,
      });
    });
  }

  if (specialization) {
    items.push({
      id: `specialization-${specialization.abbreviation}`,
      type: "specialization",
      label: `Specialization: ${specialization.name}`,
    });
  }

  return items;
}

export default buildChecklist;
