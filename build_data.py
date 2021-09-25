import csv, json
import hashlib

HASH_LENGTH = 6
SUAPI_DATA_FILENAME = 'data/siralim-ultimate-api/creatures.csv'
SUC_DATA_FILENAME = 'data/Siralim Ultimate Compendium - Traits.csv'

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
		print(version)
		f.readline()
		csv_reader = csv.DictReader(f)
		for row in csv_reader:
			json_obj = { k.lower().replace(" ", "_"): v for k, v in row.items() }
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
# { trait_name : sprite_name }
# 
# TODO: Could also get creature stats from this dataset, though
# long term it would be better to use the API directly 
# (but this would require a back-end server and we could no
# longer use GitHub pages)
def get_sprite_map(filename):
	sprite_map = {}
	with open(filename, 'r') as f:
		csv_reader = csv.DictReader(f)
		for row in csv_reader:
			sprite_map[row['trait'].lower()] = row['battle_sprite']
	return sprite_map


# Add the sprite_filenames to each object in the JSON data.
# The sprite filenames are sourced from the Siralim Ultimate API:
# https://github.com/rovermicrover/siralim-ultimate-api
def add_sprites(json_data):
	sprite_map = get_sprite_map(SUAPI_DATA_FILENAME)
	for obj in json_data:
		if obj['trait_name'].lower() in sprite_map:
			obj['sprite_filename'] = sprite_map[obj['trait_name'].lower()] 
		else:
			obj['sprite_filename'] = ''
	return json_data


def main():

	json_data, version = load_csv_file(SUC_DATA_FILENAME)

	json_data = add_sprites(json_data)

	save_json_data(json_data, 'src/data/data.json')
	with open('src/data/compendium_version.json', 'w') as f:
		f.write('"%s"' % version)

if __name__=="__main__":
	main()

