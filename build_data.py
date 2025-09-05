""" Script to build the data for the web application.
Loads data from the Siralim Ultimate Compendium and Siralim Ultimate API.
"""

import sys
import csv
import os
import json
import hashlib
import logging as logger
from PIL import Image
from typing import List, Dict

logger.basicConfig(format="%(levelname)s: %(message)s", level=logger.INFO)

HASH_LENGTH = 6
SUAPI_DATA_FILENAME = "data/siralim-ultimate-api/creatures.csv"
SUAPI_PERK_DATA_FILENAME = os.path.join(
    "data", "siralim-ultimate-api", "perks.csv"
)

F_WANG_CREATURES_FILENAME = "data/f-wang-creatures/creatures.csv"

GMA_CREATURES_FILENAME = (
    "data/gma-sheet/Siralim Ultimate Creature and Trait Sheet - Creatures.csv"
)


GODSHOP_LOCATIONS_FILENAME = os.path.join(
    "data", "misc", "godshop_locations.csv"
)

SUC_DATA_FILENAME = (
    "data/siralim-ultimate-compendium/Siralim Ultimate Compendium - Traits.csv"
)

SPECIALIZATIONS_FILENAME = "data/steam-guide/specializations.csv"
PERKS_FILENAME = "data/steam-guide/perks.csv"
RELICS_FILENAME = (
    "data/siralim-ultimate-compendium/Siralim Ultimate Compendium - Relics.csv"
)

PERK_ICONS_FOLDER = os.path.join("data", "siralim-ultimate-api", "perk_icons")

MISSING_ICON_FILENAME = "MISSING_ICON.png"
PERK_ICON_OUTPUT_FOLDER = os.path.join("public", "perk_icons")


GMA_FIXES = {
    "Turn to Grey": "Turn to Gray",
    "Year of the Trolboar": "Year of the Trollboar",
    "Shepard of Fire": "Shepherd of Fire",
    "Impedence": "Impedance",
    "Shrug Off": "Purge",
    "Transformation Apprenticeship": "Rapid Learning",
    "Tetsu-Oyakodon": "Testu-Oyakodon",
}


def generate_unique_name(row):
    """Generate the unique name of a monster/trait.
    At the moment it is a combination of the family, creature and trait_name,
    but realistically the trait_name alone should suffice. But changing it
    would mean breaking all existing build strings, so I'll leave it as it is
    for now.
    Turns out trait_names are not unique, so this seems to be the best
    way of doing it.

    Args:
        row (dict): The row to generate a unique name for.

    Returns:
        str: The unique name of the row.
    """
    return "%s_%s_%s" % (
        row["family"].lower(),
        row["creature"].lower(),
        row["trait_name"].lower(),
    )


def generate_uid(row: dict):
    """Generate the unique id (uid) of a monster/trait by performing the
    hash of the result of the function above.

    Args:
        row (dict): The row to generate the unique id for.

    Returns:
        str: The uid.
    """
    return hashlib.md5(generate_unique_name(row).encode("utf-8")).hexdigest()[
        :HASH_LENGTH
    ]


def generate_search_text(row: dict):
    """Generate the "search text", i.e. a dump of all of the fields joined
    together so that it can be easily searched in the front-end without having
    to iterate over multiple fields (which is slow).

    Args:
        row (dict): The row to generate the search text for.

    Returns:
        str: The search text.
    """
    ri = dict(row)
    return " ".join(
        [
            ri["Class"],
            ri["Creature"],
            ri["Family"],
            ri["Trait Name"],
            ri["Trait Description"],
            ri["Material Name"],
        ]
    )


def load_csv_file(filename: str):
    """Load the Siralim Ultimate Compendium dataset and extract a JSON
    object for each row. We use the Siralim Ultimate Compendium (rather than
    the Siralim Ultimate API dataset) because it has not only creatures,
    but also Backer Traits, Nether Boss Traits, etc.

    For each monster/trait we generate a 'uid', a <HASH_LENGTH>-character
    representation of that monster/trait, so that it can be uniquely
    identified even when the order of the data changes.

    Args:
        filename (str): The filename of the Siralim Ultimate Compendium -
        Traits csv to load.

    Returns:
        list, str: The JSON data from the csv and the version number.
    """
    json_data = []
    hash_set = set()
    with open(filename, "r") as f:
        line = f.readline()
        version = line.split("Version ")[1].split(",")[0]
        logger.info("Using compendium version %s." % version)
        csv_reader = csv.DictReader(f)
        f.readline()  # Remove the beta line
        for row in csv_reader:
            json_obj = {
                k.lower().replace(" ", "_"): v.strip() for k, v in row.items()
            }
            json_obj["search_text"] = generate_search_text(row)
            uid = generate_uid(json_obj)
            json_obj["uid"] = uid
            json_obj["realm_depth"] = "N/A"  # Overwritten later
            json_data.append(json_obj)

            assert uid not in hash_set
            hash_set.add(uid)
    return json_data, version


def save_json_data(json_data: list, filename: str):
    """Save the JSON data to the given filename.

    Args:
        json_data (list): The list of JSON rows.
        filename (str): The filename to save to.
    """
    with open(filename, "w") as f:
        json.dump(json_data, f, indent=1)


def load_suapi_data(filename: str):
    """Open the Siralim Ultimate API dataset and extract a map of
    { trait_name : { sprite_filename: <filename>,
                     stats: { health: <value> ...} }}

    TODO: Could also get creature stats from this dataset, though
    long term it would be better to use the API directly
    (but this would require a back-end server and we could no
    longer use GitHub pages)

    Args:
        filename (str): The filename of the Siralim Ultimate API creatures.csv

    Returns:
        dict: The dict mapping each trait to a list of stats for that creature,
          as well as the sprite filename of that creature.
    """
    suapi_data = {}
    with open(filename, "r") as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            t = row["trait"].lower()
            suapi_data[t] = {}
            suapi_data[t]["stats"] = {
                x: int(row[x])
                for x in [
                    "health",
                    "attack",
                    "intelligence",
                    "defense",
                    "speed",
                    "total",
                ]
            }
            suapi_data[t]["sprite_filename"] = row["battle_sprite"]
            suapi_data[t]["sources"] = row["sources"].split(", ")
    return suapi_data


def load_gma_creatures_data(filename: str):
    """Open GMA's Creature dataset and extract a map of
    { trait_name : { sprite_filename: <filename>,
                     stats: { health: <value> ...} }}

    Args:
        filename (str): The filename of the Siralim Ultimate API creatures.csv

    Returns:
        dict: The dict mapping each trait to a list of stats for that creature,
          as well as the sprite filename of that creature.
    """
    stat_map = {
        "Hlt": "health",
        "Atk": "attack",
        "Int": "intelligence",
        "Def": "defense",
        "Spd": "speed",
        "Total": "total",
    }

    gma_creatures_data = {}
    with open(filename, "r", encoding="utf-8") as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            if row["Name"] == "Average Stats":
                continue
            t = row["Trait Name"]

            # Fix up any minor errors with the GMA data using
            # a hardcoded dictionary...
            if t in GMA_FIXES:
                t = GMA_FIXES[t]

            t = t.lower()

            gma_creatures_data[t] = {}
            stats = {x: row[x] for x in list(stat_map.keys())}

            gma_creatures_data[t]["stats"] = {
                stat_map[k]: int(v) for k, v in stats.items()
            }
            gma_creatures_data[t]["sources"] = (
                row["Source"].replace(" + ", ", ").split(", ")
            )

            rd = row["R. Depth"].split(" (")[0]
            try:
                rd = int(rd)
            except Exception:
                if rd != "N/A":
                    rd = "?"

            gma_creatures_data[t]["realm_depth"] = rd
    return gma_creatures_data


def load_f_wang_creatures_data(filename: str):
    """Load F Wang's sheet, which maps creature to sprite_filename."""
    f_wang_data = {}
    with open(filename, "r", encoding="utf-8") as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            f_wang_data[row["name"]] = (
                "spr_crits_battle_" + row["sprite_id"] + ".png"
            )
    return f_wang_data


def add_sprites_and_stats(json_data: list):
    """Add the sprite_filenames and stats to each object in the JSON data.
    The sprite filenames and stats are sourced from F Wang's spreadsheet.

    Args:
        json_data (list): A list of JSON rows, where each row corresponds to a
          monster/trait.

    Returns:
        list: The updated JSON data now with sprites and stats.
    """
    # suapi_data = load_suapi_data(SUAPI_DATA_FILENAME)
    gma_creatures_data = load_gma_creatures_data(GMA_CREATURES_FILENAME)
    f_wang_data = load_f_wang_creatures_data(F_WANG_CREATURES_FILENAME)

    with open("test.json", "w") as f:
        json.dump(gma_creatures_data, f, indent=2)

    # Add stats, realm depths, and sources from GMA's sheet
    for obj in json_data:
        t = obj["trait_name"].lower()
        if t in gma_creatures_data:
            for k, v in gma_creatures_data[t].items():
                obj[k] = v

    # Add creature sprite filenames from F Wang's spreadsheet
    for obj in json_data:
        t = obj["creature"].lower()
        if t in f_wang_data:
            obj["sprite_filename"] = f_wang_data[t]

    validate_traits(json_data, gma_creatures_data, f_wang_data)

    return json_data


def add_godshop_locations(json_data: list):
    locations = {}
    with open(GODSHOP_LOCATIONS_FILENAME, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            locations[row["God"].lower()] = row["Location"]

    for i, obj in enumerate(json_data):
        if "sources" not in obj:
            continue
        sources = obj["sources"]
        for j, s in enumerate(sources):
            if "God Shop" in s:
                location = "nowhere"
                god = s.split(" God Shop")[0].lower()

                try:
                    location = locations[god]
                    json_data[i]["sources"][j] += f" ({location})"
                except KeyError as e:
                    logger.warning(
                        f"Missing god name: {god} in godshop_locations.csv"
                    )

    return json_data


def is_creature_class(c: str):
    """Determine whether the given class is a creature class or
    something else (backer trait etc).

    Args:
        c (str): The class name.

    Returns:
        bool: Whether it is a creature class.
    """
    return c in ["Nature", "Death", "Chaos", "Life", "Sorcery"]


def validate_traits(
    json_data: list, gma_creatures_data: dict, f_wang_data: dict
):
    """For each trait in the json_data, check whether it exists in the GMA
    and F Wang's data.
    If in F Wang's data (which is only used for sprite filenames),
    check whether the sprite actually exists.

    Args:
        json_data (list): A list of JSON rows, where each row corresponds to a
          monster/trait.
        f_wang_data (dict): A dict mapping each creature the sprite
          filename of that creature.
    """
    n_missing_stats = 0
    n_missing_sprites = 0
    for i, obj in enumerate(json_data):
        creature = obj["creature"]
        t = obj["trait_name"].lower()
        c = obj["class"]
        creature = obj["creature"]

        if not is_creature_class(c):
            continue

        if t not in gma_creatures_data:
            logger.warning(
                f"[{creature} ({obj['trait_name']})] does not "
                "appear in the GMA data."
            )
            n_missing_stats += 1
            logger.error("Cannot proceed, or the planner will crash.")
            exit(1)
            continue

        if creature not in f_wang_data:
            logger.warning(
                f"[{creature} ({obj['trait_name']})] does not "
                "appear in F Wang's data, i.e. it will have no "
                "sprite on the planner."
            )
            n_missing_sprites += 1
            json_data[i]["sprite_filename"] = "MISSING.png"
            continue

        sf = f_wang_data[creature]
        sprite_path = get_sprite_path(sf)
        if not sprite_path:
            logger.warning(f"[{creature}] sprite ({sf}) is not present.")
            json_data[i]["sprite_filename"] = "MISSING.png"
            n_missing_sprites += 1
        else:
            json_data[i]["sprite_filename"] = sprite_path
            # A bit hacky, but set the suapi filename to the actual filename
            # (which may be under forum_avatars).

    if n_missing_stats > 0:
        logger.error(
            f"{n_missing_stats} traits (attached to creatures) are missing "
            "from the GMA Creatures data."
        )
    if n_missing_sprites > 0:
        logger.warning(
            f"{n_missing_sprites} traits have sprite_filenames "
            "that do not exist."
        )
    print()


def get_sprite_path(sprite_filename: str):
    """Return the sprite_filename.
    First check whether it exists under
    /public/battle-sprites.
    If not, check under the forum_avatars.
    If not found, return False.

    Args:
        sprite_filename (str): The filename of the sprite.
    """

    def sanitise(name):
        return name.replace("'", "")

    if os.path.isfile(
        os.path.join("public", "battle-sprites", sprite_filename)
    ):
        return f"battle-sprites/{sprite_filename}"
    return False


def load_specializations_data(specs_filename, perks_filename):
    """Load the specializations data from the given filename.
    This is taken from the Steam guide for the specializations.

    Args:
        specs_filename (str): The filename of specializations.
        perks_filename (str): The filename of perks.

    Returns:
        list: A list of all specializations.
    """
    specializations = []
    specialization_ids = {}
    specialization_abbrevs = {}

    # Load perk filenames from SUAPI
    perk_icons = {}
    with open(SUAPI_PERK_DATA_FILENAME, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            spec = row["specialization"]
            perk = row["name"]
            icon = row["icon"]
            perk_icons[f"{spec}_{perk}"] = icon

    # Load specs
    with open(specs_filename, "r") as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            json_obj = {k: v.strip() for k, v in row.items()}
            json_obj["perks"] = []
            specializations.append(json_obj)
            specialization_ids[json_obj["name"]] = len(specializations) - 1
            specialization_abbrevs[json_obj["name"]] = json_obj["abbreviation"]

    # Load perks
    with open(perks_filename, "r") as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            json_obj = {k: v.strip() for k, v in row.items()}

            spec = json_obj["specialization"]
            json_obj["spec"] = spec

            abbrev = specialization_abbrevs[spec]
            json_obj["spec_abbrev"] = abbrev
            json_obj["uid"] = (
                abbrev
                + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
                    len(specializations[specialization_ids[spec]]["perks"])
                ]
            )
            del json_obj["specialization"]
            name = json_obj["name"].split(" (ASCENSION)")[0]

            # Add icons from 2.0 automatically based on their perk name
            # (as they are not in SUAPI)
            if f"{spec}_{name}" not in perk_icons:
                sp = (
                    name.lower()
                    .replace(" ", "")
                    .replace("'", "")
                    .replace("(ASCENSION)", "")
                )
                if "impenetrableshell" in sp:
                    sp = sp.replace("impenetrableshell", "impnetrableshell")
                if "killemwithkindness" in sp:
                    sp = sp.replace("killem", "killthem")
                if "confidentfacade" in sp:
                    sp = sp.replace("confident", "confidence")
                if "tastefortreasure" in sp:
                    sp = sp.replace(
                        "tastefortreasure", "timeflieswhenyourehavingfun"
                    )
                perk_icon_path = f"perk_{sp}.png"
                if os.path.exists(
                    os.path.join(PERK_ICONS_FOLDER, perk_icon_path)
                ):
                    perk_icons[f"{spec}_{name}"] = perk_icon_path

            try:
                icon = perk_icons[f"{spec}_{name}"]
            except KeyError:
                icon = MISSING_ICON_FILENAME
                logger.warning(f"Missing perk icon for perk '{name}'")

            json_obj["icon"] = icon
            specializations[specialization_ids[spec]]["perks"].append(json_obj)

    return specializations


def load_relics_data(relics_filename):
    """Load the list of relics from the compendium.

    Args:
        relics_filename (str): The filename of the .csv file from
          the compendium.
    """
    relics = {}
    uids = {}
    with open(relics_filename, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            relic = {}
            relic["stat_bonus"] = row["Stat Bonus"]
            relic["name"] = row["Relic"]
            abbrev = (
                row["Relic"].split(",")[0].replace(" & ", "").replace(" ", "")
            )
            relic["abbreviation"] = abbrev

            # Get uid and ensure it is unique.
            # A bit messy but gets the job done.
            raw_name = "".join(
                [
                    c
                    for c in relic["name"].lower()
                    if c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ".lower()
                ]
            )
            uid = raw_name[5] + raw_name[12]
            uid = uid.lower()
            if uid in uids and uids[uid] != raw_name:
                logger.error(
                    f"uid '{uid}' already exists. "
                    f"({raw_name}, {uids[uid]})"
                )
                sys.exit(0)
            uids[uid] = raw_name
            relic["uid"] = uid

            if relic["name"] not in relics:
                relics[relic["name"]] = relic
                relics[relic["name"]]["perks"] = []

            relics[relic["name"]]["perks"].append(
                {
                    "rank": row["Rank"],
                    "description": row["Relic Description"],
                }
            )
    sorted_relics = sorted(relics.values(), key=lambda x: x["name"])
    return sorted_relics


def generate_metadata(compendium_version, json_data):
    """Simple function to generate some 'metadata' (compendium version,
    highest/lowest stats etc) and save it as a dictionary.

    Args:
        compendium_version (str): The version of the SU Compendium.
        json_data (list): A list of JSON rows, each corresponding to a monster
          /trait.

    Returns:
        dict: A dict of metadata (comp version, min stats, max stats).
    """
    metadata = {
        "compendium_version": compendium_version,
        "min_stats": {},
        "max_stats": {},
    }

    total_stats = {}
    n_monsters_with_stats = 0

    for obj in json_data:
        if "stats" in obj:
            n_monsters_with_stats += 1
            stats = obj["stats"]
            for k, v in stats.items():
                if k not in metadata["min_stats"]:
                    metadata["min_stats"][k] = v
                if k not in metadata["max_stats"]:
                    metadata["max_stats"][k] = v
                if v < metadata["min_stats"][k]:
                    metadata["min_stats"][k] = v
                if v > metadata["max_stats"][k]:
                    metadata["max_stats"][k] = v

                if k not in total_stats:
                    total_stats[k] = 0
                total_stats[k] += v

    metadata["average_stats"] = {
        k: round(v / n_monsters_with_stats) for k, v in total_stats.items()
    }

    return metadata


def build_perk_icon_image(specializations_data):
    """Build a big image of all the perk icons joined together.
    This is done to avoid having 500 requests for all the perk icons.

    Args:
        specializations_data (dict): The specializations data.

    Returns:
        dict: The updated specializations data, with the coordinates of the
        perk's respective icons in the big image.
    """
    max_perks = max([len(spec["perks"]) for spec in specializations_data])

    perk_image = Image.new(
        "RGBA", (16 * max_perks, 16 * len(specializations_data))
    )

    for i, spec in enumerate(specializations_data):
        for j, perk in enumerate(spec["perks"]):
            icon = perk["icon"]
            icon_filename = os.path.join(PERK_ICONS_FOLDER, icon)
            if not os.path.isfile(icon_filename):
                # logger.warning(
                #     f"Icon filename {icon_filename} for {perk['name']} does not exist"
                # )
                icon_filename = os.path.join(
                    PERK_ICON_OUTPUT_FOLDER, MISSING_ICON_FILENAME
                )

            im = Image.open(icon_filename)
            coords = (j * 16, i * 16)
            perk_image.paste(im, coords)
            specializations_data[i]["perks"][j]["icon_coords"] = coords

    perk_image.save(os.path.join(PERK_ICON_OUTPUT_FOLDER, "perk_icons.png"))

    return specializations_data


def sort_creature_data(data: List[Dict]):
    return sorted(data, key=lambda k: (k["family"], k["creature"]))


def build_data(output_folder: str):
    """Build the data to the specified output folder.

    Args:
        output_folder (str): The output folder.
    """
    json_data, version = load_csv_file(SUC_DATA_FILENAME)

    json_data = add_sprites_and_stats(json_data)
    json_data = add_godshop_locations(json_data)

    json_data = sort_creature_data(json_data)

    save_json_data(json_data, os.path.join(output_folder, "data.json"))
    with open(os.path.join(output_folder, "metadata.json"), "w") as f:
        json.dump(generate_metadata(version, json_data), f)

    specializations_data = load_specializations_data(
        SPECIALIZATIONS_FILENAME, PERKS_FILENAME
    )

    specializations_data = build_perk_icon_image(specializations_data)

    with open(os.path.join(output_folder, "specializations.json"), "w") as f:
        json.dump(specializations_data, f)

    relics_data = load_relics_data(RELICS_FILENAME)

    with open(os.path.join(output_folder, "relics.json"), "w") as f:
        json.dump(relics_data, f)

    # Print a pretty version of it for manual inspection etc
    with open("src/data/specializations_pretty.json", "w") as f:
        json.dump(specializations_data, f, indent=1)

    logger.info("Data building complete.")

    return json_data, specializations_data, relics_data


if __name__ == "__main__":  # pragma: no cover
    build_data(os.path.join("src", "data"))
