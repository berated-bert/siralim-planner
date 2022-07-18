import csv, os


def load_perks_csv(filename):
	perk_data = []
	perk_map = {}

	with open(filename, 'r') as f:
		reader = csv.DictReader(f)
		i = 0
		for row in reader:
			perk_data.append(row)
			perk_map[row['Name'].lower().replace(" ", "_").replace("'", "")] = [i, row['Specialization'].lower().replace(" ", ""), row['Specialization'].lower().replace(" ", "_")]
			perk_map[row['Name'].lower().replace(' ', "").replace("'", "")] = [i, row['Specialization'].lower().replace(" ", ""), row['Specialization'].lower().replace(" ", "_")]
			i += 1

	print(perk_map)
	return perk_data, perk_map



def get_spec_names(filename):
	specs = []
	with open(filename, 'r') as f:
		specs = [l.strip() for l in f.readlines()]
	return specs

def add_sprite_filenames(folder, specs, perk_data, perk_map):
	sprite_filenames_map = {}
	for filename in os.listdir(folder):
			#if filename.startswith(s.lower()) or '_' + s.lower() + '_' in filename and 'npc' not in filename and 'ospr' not in filename:
				#short = ''
				#print(filename, s)
				#sprite_filenames_map[short] = filename
				#
				#
		if filename.startswith("spec"): continue

		for fragment in filename.split("_"):

			if fragment in perk_map and (perk_map[fragment][1] in filename or perk_map[fragment][2] in filename):				
				print(filename, fragment, perk_map[fragment][0])
				perk_data[perk_map[fragment][0]]['Sprite filename'] = filename 
				break


	return perk_data

def save(perk_data, filename):
	fieldnames = ['Specialization','Name','Ranks','Cost per rank','Annointment','Description','Sprite filename']

	with open(filename, 'w', newline='') as f:
		writer = csv.DictWriter(f, fieldnames=fieldnames)
		for row in perk_data:
			writer.writerow(row)

def main():
	perk_filename = "perks.csv"
	spec_filename = "specializations.txt"
	sprite_folder = "C:/siralim_data/Export_Sprites"

	specs = get_spec_names(spec_filename)

	perk_data, perk_map = load_perks_csv(perk_filename)

	perk_data = add_sprite_filenames(sprite_folder, specs, perk_data, perk_map)

	save(perk_data, 'perks_with_sprites.csv')


if __name__=="__main__":
	main()

	#print(sprite_filenames)

	