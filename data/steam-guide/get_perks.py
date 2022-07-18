import csv


# Grab a list of the specialization names from the text file.
def get_specs(fn):
    s = []
    with open(fn, "r") as f:
        specs = [line.strip().split(",") for line in f]

    abbrevs = set()
    for s in specs:
        if s[1] in abbrevs:
            raise ValueError(f'Abbreviation "{s[1]}" already in use.')
        abbrevs.add(s[1])

    return specs


# Get a list of all perks from the text dump of the Steam guide.
def get_perks(fn, specs):
    perks = []
    specializations = {}
    for s in specs:
        specializations[s[0]] = [s[1], []]
    current_spec = None

    in_perks = False
    in_spec = False
    current_perk = {}
    with open(fn, "r") as f:
        for line in f:
            line = line.strip()
            if line in specializations:
                current_spec = line

            if line in specializations:
                in_spec = line
                continue

            if line == "Starter Creature" or line == "Perks":
                in_spec = False

            if in_spec:
                if line == "":
                    continue
                specializations[current_spec][1].append(line)

            if line == "Perks":
                in_perks = True
                in_spec = False
                continue
            elif line in [
                "Supplemental Info",
                "Notes",
                "Spells",
                "Status Effects",
                "Notes",
            ]:
                in_perks = False
                continue
            elif line == "":
                if current_perk != {}:
                    perks.append(current_perk)
                    current_perk = {}
                    continue

            if in_perks:
                if current_perk == {}:
                    current_perk["specialization"] = current_spec
                    current_perk["name"] = line
                    continue
                if "Ranks: " in line:
                    current_perk["ranks"] = line.split("Ranks: ")[1]
                    continue
                if "Cost Per Rank: " in line:
                    current_perk["cost_per_rank"] = line.split(
                        "Cost Per Rank: "
                    )[1]
                    continue
                if "Anointment: " in line:
                    current_perk["anointment"] = line.split("Anointment: ")[1]
                    continue
                else:
                    if "description" in current_perk:
                        current_perk["description"] += " " + line
                    else:
                        current_perk["description"] = line
                    continue

    return perks, specializations


def snakify(s):
    return s.lower().replace(" ", "_")


def main():
    specs = get_specs("specializations.txt")
    perks, specializations = get_perks("steam_guide.txt", specs)

    with open("perks.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=perks[0].keys())
        writer.writeheader()
        for perk in perks:
            writer.writerow(perk)

    with open("specializations.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["name", "abbreviation", "description"])
        for spec in specializations:
            writer.writerow(
                [
                    spec,
                    specializations[spec][0],
                    "\n".join(specializations[spec][1]),
                ]
            )


if __name__ == "__main__":
    main()
