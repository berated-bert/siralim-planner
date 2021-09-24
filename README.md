# Siralim Planner

This is a fan-made tool designed to simplify the process of planning builds for Siralim Ultimate. Further details on the tool are available
on the Info page of the tool: [https://siralim-planner.github.io](https://berated-bert.github.io/siralim-planner/).

## About the source code

This is a front-end only React app. It uses a simple python script to read in data from the [Siralim Ultimate Compendium](https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0) such that it can be visualised via the React app.

## Running the app locally

Running the app locally requires NodeJS and npm. To run the app, first install the packages via:

    npm install

Then simply run it via

    npm start

## Updating the database

In order to update the database to the latest version of the [Siralim Ultimate Compendium](https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit#gid=0), simply
download a copy of the Traits sheet of the Compendium, save it to `data/Siralim Ultimate Compendium - Traits.csv`, and run:

    python build_data.py

This will convert the `.csv` file into a `.json` file, which is stored under `src/data/data.json` and read in by the React app.

## Other notes

### How the URL sharing works

In order to come up with a way of saving/loading builds without using a back-end server (like Grimtools.com), I needed some way
to uniquely identify monsters/traits so that they could be saved in the URL parameters. I was originally going to use the indexes
of the monsters within the Compendium, (i.e. Abomination Bile is 1, Abomination Brute is 2, etc...), so that the URL would look as follows:

    https://siralim-tools.github.io/?build=1,123,34,15,44...

but this would cause problems later down the line when new creatures are added. If a creature was added before creature 123, for example, 
then any builds loaded from previous versions of the Compendium would break.

So instead I decided to take the hash of the family + creature + trait. This should be more robust as the family, creature and traits don't
tend to change between patches. I chose a hash length of 6 (in order to minimise potential collisions). So the result is a unique 6-character
string that represents each monster, e.g. Iron Golem just happens to be `ef5667` and will always be `ef5667` unless its family, creature or
the name of its trait changes at some point. 

## TODO

- Tidy up the source code (it is a bit messy - it needs refactoring/commenting/documenting etc).
- Make the design responsive, i.e. work nicely on mobile.
- Potentially add artifact stats 
- Allow import of builds from the game (this may be tricky)
- Find a way to add the monster sprites to the planner. If anybody knows a database that maps monster names to their respective sprites, please let me know!

## License and contact

The software is licensed under the open source MIT License.

Please feel free to fork the repository and/or submit pull requests/issues etc. If you have any other comments/feedback feel free to message me on Discord - BeratedBert#6292.

This tool is not affiliated with Thylacine Studios.