import csv, json
import hashlib

HASH_LENGTH = 6
SUAPI_DATA_FILENAME = 'data/siralim-ultimate-api/creatures.csv'
SUC_DATA_FILENAME = 'data/siralim-ultimate-compendium/Siralim Ultimate Compendium - Traits.csv'
SPECIALIZATIONS_FILENAME = 'data/steam-guide/specializations.csv'
PERKS_FILENAME = 'data/steam-guide/perks.csv'


# Generate the unique name of a monster/trait.
# At the moment it is a combination of the family, creature and trait_name,
# but realistically the trait_name alone should suffice. But changing it would mean breaking
# all existing build strings, so I'll leave it as it is for now.
def generate_unique_name(row):
	return "%s_%s_%s" % (row["family"].lower(), row["creature"].lower(), row["trait_name"].lower())

# Generate the unique id (uid) of a monster/trait by performing the hash of the result of
# the function above.
def generate_uid(row):
	return hashlib.md5(generate_unique_name(row).encode('utf-8')).hexdigest()[:HASH_LENGTH]

# Generate the "search text", i.e. a dump of all of the fields joined together so that it can
# be easily searched in the front-end without having to iterate over multiple fields (which
# is slow).
def generate_search_text(row):
	ri = dict(row)
	return " ".join([ri['Class'], ri['Creature'], ri['Family'], ri['Trait Name'], ri['Trait Description'], ri['Material Name']])


# Load the Siralim Ultimate Compendium dataset and extract a JSON object for each row.
# We use the Siralim Ultimate Compendium (rather than the Siralim Ultimate API dataset)
# because it has not only creatures, but also Backer Traits, Nether Boss Traits, etc.
#
# For each monster/trait we generate a 'uid', a <HASH_LENGTH>-character representation
# of that monster/trait, so that it can be uniquely identified even when the order
# of the data changes. 
def load_csv_file(filename):	
	json_data = []
	hash_set = set()
	with open(filename, 'r') as f:
		line = f.readline()
		version = line.split("Version ")[1].split(",")[0]
		print("Using compendium version %s." % version)
		f.readline()
		csv_reader = csv.DictReader(f)
		for row in csv_reader:
			json_obj = { k.lower().replace(" ", "_"): v.strip() for k, v in row.items() }
			json_obj['search_text'] = generate_search_text(row)
			uid =  generate_uid(json_obj)			
			json_obj['uid'] = uid
			json_data.append(json_obj)			
			assert uid not in hash_set
			hash_set.add(uid)
	return json_data, version

def save_json_data(json_data, filename):
	with open(filename, 'w') as f:
		json.dump(json_data, f, indent=1)

# Open the Siralim Ultimate API dataset and extract a map of 
# { trait_name : { sprite_filename: <filename>, stats: { health: <value> ... } }}
# 
# TODO: Could also get creature stats from this dataset, though
# long term it would be better to use the API directly 
# (but this would require a back-end server and we could no
# longer use GitHub pages)
def load_suapi_data(filename):
	suapi_data = {}
	with open(filename, 'r') as f:
		csv_reader = csv.DictReader(f)
		for row in csv_reader:
			t = row['trait'].lower()
			suapi_data[t] = {}
			suapi_data[t]['stats'] = {
				x : int(row[x]) for x in ['health', 'attack', 'intelligence', 'defense', 'speed', 'total']
			}
			suapi_data[t]['sprite_filename'] = row['battle_sprite']
	return suapi_data


# Add the sprite_filenames and stats to each object in the JSON data.
# The sprite filenames and stats are sourced from the Siralim Ultimate API:
# https://github.com/rovermicrover/siralim-ultimate-api
def add_sprites(json_data):
	suapi_data = load_suapi_data(SUAPI_DATA_FILENAME)
	for obj in json_data:
		t = obj['trait_name'].lower()
		if t in suapi_data:			
			for (k, v) in suapi_data[t].items():
				obj[k] = v
	return json_data

def load_specializations_data(specs_filename, perks_filename):
	specializations = []
	specialization_ids = {}
	specialization_abbrevs = {}
	with open(specs_filename, 'r') as f:
		csv_reader = csv.DictReader(f)
		for row in csv_reader:
			json_obj = { k: v.strip() for k, v in row.items() }
			json_obj['perks'] = []
			specializations.append(json_obj)
			specialization_ids[json_obj['name']] = len(specializations) - 1
			specialization_abbrevs[json_obj['name']] = json_obj['abbreviation']


	with open(perks_filename, 'r') as f:
		csv_reader = csv.DictReader(f)
		for row in csv_reader:
			json_obj = { k: v.strip() for k, v in row.items() }
			spec = json_obj['specialization']
			json_obj['spec'] = spec
			abbrev = specialization_abbrevs[spec]
			json_obj['spec_abbrev'] = abbrev
			json_obj['uid'] = abbrev + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[len(specializations[specialization_ids[spec]]['perks'])]
			del json_obj['specialization']

			specializations[specialization_ids[spec]]['perks'].append(json_obj)


	return specializations


# Simple function to generate some 'metadata' (compendium version, highest/lowest
# stats etc) and save it as a dictionary.
def generate_metadata(compendium_version, json_data):
	metadata = { 'compendium_version': compendium_version, 'min_stats': {}, 'max_stats': {} }

	total_stats = {}
	n_monsters_with_stats = 0

	for obj in json_data:
		if 'stats' in obj:
			n_monsters_with_stats += 1
			stats = obj['stats']
			for (k, v) in stats.items():
				if k not in metadata['min_stats']:
					metadata['min_stats'][k] = v 
				if k not in metadata['max_stats']:
					metadata['max_stats'][k] = v 	
				if v < metadata['min_stats'][k]:
					metadata['min_stats'][k] = v
				if v > metadata['max_stats'][k]:
					metadata['max_stats'][k] = v

				if k not in total_stats:
					total_stats[k] = 0
				total_stats[k] += v
				
									
	metadata['average_stats'] = {
		k: round(v/n_monsters_with_stats) for k, v in total_stats.items()
	}
	

	return metadata




def main():

	json_data, version = load_csv_file(SUC_DATA_FILENAME)

	json_data = add_sprites(json_data)

	save_json_data(json_data, 'src/data/data.json')
	with open('src/data/metadata.json', 'w') as f:
		json.dump(generate_metadata(version, json_data), f)

	specializations_data = load_specializations_data(SPECIALIZATIONS_FILENAME, PERKS_FILENAME)

	with open('src/data/specializations.json', 'w') as f:
		json.dump(specializations_data, f)

	# Print a pretty version of it for manual inspection etc
	with open('src/data/specializations_pretty.json', 'w') as f:
		json.dump(specializations_data, f, indent = 1)

	print("Data building complete.")

if __name__=="__main__":
	main()

