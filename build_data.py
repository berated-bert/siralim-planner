import csv, json
import hashlib

HASH_LENGTH = 6

def generate_unique_name(row):
	return "%s_%s_%s" % (row["family"].lower(), row["creature"].lower(), row["trait_name"].lower())

def generate_uid(row):
	return hashlib.md5(generate_unique_name(row).encode('utf-8')).hexdigest()[:HASH_LENGTH]

def generate_search_text(row):
	ri = dict(row)
	return " ".join([ri['Class'], ri['Creature'], ri['Family'], ri['Trait Name'], ri['Trait Description'], ri['Material Name']])



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

def main():
	json_data, version = load_csv_file('data/Siralim Ultimate Compendium - Traits.csv')
	save_json_data(json_data, 'src/data/data.json')
	with open('src/data/compendium_version.json', 'w') as f:
		f.write('"%s"' % version)

if __name__=="__main__":
	main()

