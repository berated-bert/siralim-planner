""" Script to build the data for the web application.
Loads data from the Siralim Ultimate Compendium and Siralim Ultimate API.
"""

import csv
import os
import json
import hashlib
import logging as logger

logger.basicConfig(format="%(levelname)s: %(message)s", level=logger.INFO)

HASH_LENGTH = 6
SUAPI_DATA_FILENAME = "data/siralim-ultimate-api/creatures.csv"
SUC_DATA_FILENAME = (
    "data/siralim-ultimate-compendium/Siralim Ultimate Compendium - Traits.csv"
)
SPECIALIZATIONS_FILENAME = "data/steam-guide/specializations.csv"
PERKS_FILENAME = "data/steam-guide/perks.csv"
RELICS_FILENAME = (
    "data/siralim-ultimate-compendium/Siralim Ultimate Compendium - Relics.csv"
)


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
        for row in csv_reader:
            json_obj = {
                k.lower().replace(" ", "_"): v.strip() for k, v in row.items()
            }
            json_obj["search_text"] = generate_search_text(row)
            uid = generate_uid(json_obj)
            json_obj["uid"] = uid
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
    return suapi_data


def add_sprites_and_stats(json_data: list):
    """Add the sprite_filenames and stats to each object in the JSON data.
    The sprite filenames and stats are sourced from the Siralim Ultimate API:
    https://github.com/rovermicrover/siralim-ultimate-api

    Args:
        json_data (list): A list of JSON rows, where each row corresponds to a
          monster/trait.

    Returns:
        list: The updated JSON data now with sprites and stats.
    """
    suapi_data = load_suapi_data(SUAPI_DATA_FILENAME)
    traits_not_in_suapi = []
    for obj in json_data:
        t = obj["trait_name"].lower()
        if t in suapi_data:
            for (k, v) in suapi_data[t].items():
                obj[k] = v

    validate_traits(json_data, suapi_data)

    return json_data


def validate_traits(json_data: list, suapi_data: dict):
    """For each trait in the json_data, check whether it exists in the SUAPI
    data, and if so, check whether the sprite actually exists.

    Args:
        json_data (list): A list of JSON rows, where each row corresponds to a
          monster/trait.
        suapi_data (dict): A dict mapping each trait to a list of stats for
          that creature, as well as the sprite filename of that creature.
    """
    n_missing = 0
    n_missing_sprites = 0
    for obj in json_data:
        t = obj["trait_name"].lower()
        if t not in suapi_data:
            logger.warning(f"[{t}] does not appear in SUAPI data.")
            n_missing += 1
            continue
        sf = suapi_data[t]["sprite_filename"]
        if not sprite_exists(sf):
            logger.warning(f"[{t}] sprite ({sf}) is not present.")
            n_missing_sprites += 1
    print()
    if n_missing > 0:
        logger.warning(f"{n_missing} traits are missing from the SUAPI data.")
    if n_missing_sprites > 0:
        logger.warning(
            f"{n_missing_sprites} traits have sprite_filenames "
            "that do not exist."
        )
    print()


def sprite_exists(sprite_filename: str):
    """Return True if the given sprite_filename exists under
    /public/suapi_battle_sprites, False if not.

    Args:
        sprite_filename (str): The filename of the sprite.
    """
    return os.path.isfile(
        os.path.join("public", "suapi_battle_sprites", sprite_filename)
    )


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

            specializations[specialization_ids[spec]]["perks"].append(json_obj)

    return specializations


def load_relics_data(relics_filename):
    """Load the list of relics from the compendium.

    Args:
        relics_filename (str): The filename of the .csv file from
          the compendium.
    """
    relics = {}
    with open(relics_filename, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            relic = {}
            relic["stat_bonus"] = row["Stat Bonus"]
            relic["name"] = row["Relic"]
            relic["abbreviation"] = row["Relic"].split(",")[0]

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
            for (k, v) in stats.items():
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


def build_data(output_folder: str):
    """Build the data to the specified output folder.

    Args:
        output_folder (str): The output folder.
    """
    json_data, version = load_csv_file(SUC_DATA_FILENAME)

    json_data = add_sprites_and_stats(json_data)

    save_json_data(json_data, os.path.join(output_folder, "data.json"))
    with open(os.path.join(output_folder, "metadata.json"), "w") as f:
        json.dump(generate_metadata(version, json_data), f)

    specializations_data = load_specializations_data(
        SPECIALIZATIONS_FILENAME, PERKS_FILENAME
    )

    with open(os.path.join(output_folder, "specializations.json"), "w") as f:
        json.dump(specializations_data, f)

    relics_data = load_relics_data(RELICS_FILENAME)

    with open(os.path.join(output_folder, "relics.json"), "w") as f:
        json.dump(relics_data, f)

    # Print a pretty version of it for manual inspection etc
    # with open("src/data/specializations_pretty.json", "w") as f:
    #    json.dump(specializations_data, f, indent=1)

    logger.info("Data building complete.")

    return json_data, specializations_data, relics_data


if __name__ == "__main__":  # pragma: no cover
    build_data(os.path.join("src", "data"))
