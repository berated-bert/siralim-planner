## Changelog

### v1.3.3 (5 September 2025)

-   Added search page for perks (thanks to F Wang for this idea). You can access this via the "Anointments" button.

### v1.3.2 (5 September 2025)

-   Added perk icons from the new specialisations (thank you to Adex and Leqesai on Discord for providing screenshots which helped me track the icons down).
-   Fixed bug with not being able to select 20 anointments as a Royal.

### v1.3.1 (5 September 2025)

-   Sorted specializations alphabetically (both in the dropdown list and in the Anointments selector). Thanks to Axar on the Discord channel for this suggestion.
-   Added icons for the three new specialisations. I'll add perk icons once I can find a mapping between the perk names and the sprites.

### v1.3.0 (2 September 2025)

-   Added the option to include Nether Stone Traits in your build. You can now click the "Show Nether Stone Traits" button at the top to bring up an extra trait slot on each creature in your party, allowing you to add trait(s) that your creatures are receiving from Nether Stones. You can add up to 3 traits per creature (new slots appear as you add traits), which helps support the planning of endgame builds.
-   Note: the Upload Party button _should_ correctly import traits on Nether Stones, but if you come across any issues importing builds please let me know.
-   Note also that turning "Show Nether Stone Traits" off does not actually remove them from your build, it just toggles their visibility. This means that if you share your build without deleting any Nether Stone Traits then those traits will be seen by whomever loads your build into the planner via the URL (regardless of whether "Show Nether Stone Traits" is toggled on or off).
-   Added all creature sprites to the planner. Big thanks to F Wang on Discord for providing a mapping between the creature names and their sprites, which made this possible.
-   Fixed small bug where the planner deemed it legal to have a Zantai Material as a primary/fused trait.

### v1.2.6 (1 September 2025)

-   Updated the Siralim Ultimate Compendium ([link](https://docs.google.com/spreadsheets/d/1qvWwf1fNB5jN8bJ8dFGAVzC7scgDCoBO-hglwjTT4iY/edit?gid=0#gid=0)) with help from data from KageNoOni's spreadsheet. There are now 1,816 traits in the Compendium which I believe is the correct number.
-   Updated the planner with this new data source, which should hopefully now be free of errors and should not be missing any traits. If you spot anything that is not consistent with the game please let me know.
-   Please note that some trait names may have changed slightly, so builds shared prior to this update may have missing traits when importing (you'll just need to search them up again to re-add them).

### v1.2.5 (31 August 2025)

-   Fixed bug when importing builds.

### v1.2.4 (31 August 2025)

-   Added 27 missing traits (thanks again KageNoOni for the data).
-   Fixed Ascension status for the last perks of each of the 3 new specialisations.

### v1.2.3 (31 August 2025)

-   Fixed banner message in the changelog which still said specialisations and perks hadn't been added.

### v1.2.2 (31 August 2025)

-   Added the three new specialisations, and updated the anointable status of certain perks. Big thanks to KageNoOni on Discord for getting these into a spreadsheet. Note the descriptions and icons for the new specialisations and perks are still a work in progress.

### v1.2.1 (28 August 2025)

-   Fixed bug on mobile where the realm depth selector was making the search bar impossible to use.
-   Fixed bug where Royal did not have 20 max anointments.
-   Added Compendium link back in the header (not sure why I removed it - oops).

### v1.2.0 (27 August 2025)

-   Updated for v2.0. Please note that the sprites of the new creatures are missing - they will be added once the Siralim Ultimate API is updated (as this is my source for creature sprite filenames). Specializations/anointments will also be added when the Steam Guide is updated.
-   Added the ability to filter creatures/traits by maximum realm depth (credit to Lumireaver for this idea).
-   Now using Gay Moth Aunt's Siralim Ultimate Creature and Trait Sheet ([link](https://docs.google.com/spreadsheets/d/1RYRvKTCLLJxXrZ_7OOjG8j98L_fjE5KNHtLG4wHn9Xw/edit?gid=0#gid=0)) as a data source.

### v1.1.8 (13 March 2023)

-   Added missing "Excruciating Venom" trait.
-   Corrected "The Lost" to Chaos class.

### v1.1.7 (31 December 2022)

-   Fixed "Arrogance Is Confidence" not working when pasting in a build from the game.
-   Updated Friden's trait (no longer bypasses blight immunity) and added missing trait (Harbinger's Sign).

### v1.1.6 (10 August 2022)

-   Added perk icons from the Siralim Ultimate API.
-   Made the mobile experience a bit better (in the anointments screen).
-   Added the locations of the God Shops when hovering over creatures bought there.

### v1.1.5 (9 August 2022)

-   Added tooltips for monsters. Hover over a monster's name in the planner to see their sprite, stats, and source(s).
-   The sources were taken from the Siralim Ultimate API. If you notice anything incorrect, please feel free to tag me on Discord. Even better, submit a pull request to the [Siralim Ultimate API GitHub](https://github.com/rovermicrover/siralim-ultimate-api).
-   Updated a couple more monster names/trait descriptions.

### v1.1.4 (6 August 2022)

-   Fixed up some outdated trait descriptions, mostly for Exotic Creatures. Thank you to KageNoOni on Discord for providing a list of trait descriptions to update.
-   Fixed the Shadowbringer ascended perk description.
-   Made the experience a little better on mobile devices.

### v1.1.3 (23 July 2022)

-   Added all the missing creature sprites. Big thanks to Orbit49 on Discord who alerted me to the fact that most of the creature sprites were released as part of an avatars pack on the Siralim Ultimate forums ([link](https://forums.thylacinestudios.com/t/siralim-ultimate-forum-avatars-profile-pictures/8271)).
-   Added new specialization icons.

### v1.1.2 (19 July 2022)

-   Fixed small bug with the "MISSING SPRITE" text appearing underneath every creature portrait.

### v1.1.1 (18 July 2022)

-   Made the changelog appear when the version number is clicked, and removed the changelog from the info button.
-   You can now type "AND" in the monster search bar to further refine the results. For example, "defend AND nature" returns all nature creatures who have "defend" in the trait.

### v1.1.0 (18 July 2022)

-   Updated for game version 1.1.0. Note that at the time of writing this, it is still in the test branch so you'll need to opt in to the test beta to play on this version of the game if you haven't already.
-   Please note many of the newer creature sprites are still unavailable, and will be added once they are made available by modders. Same goes for the new specialization sprites.
-   Added "MISSING SPRITE" for creatures currently missing sprites.

### v1.0.4 (28 November 2021)

-   Added Relics into the tool, based on data sourced from the Siralim Ultimate Compendium.
-   Added a reset button.
-   Added a randomise button.

Thank you to EmptyPalms for the suggestions!

### v1.0.3 (22 November 2021)

-   Added data from Siralim Ultimate Compendium v0.12.12.
-   Note that monster sprites and stats for the new creatures are not currently present, and will be added once Siralim Ultimate API is updated.
-   Unfortunately builds from the previous patch are broken - sorry about that. It shouldn't happen in future though unless the trait names, creature names, or family names change again.

### v1.0.2 (1 October 2021)

-   Major design overhaul.
-   Added the ability to select a specialization and anointments.
-   Added monster stats to the monster selection table.
-   The monster selection table can now be sorted by clicking on the headings.

### v1.0.1 (25 September 2021)

-   Added creature sprites, sourced from the Siralim Ultimate API.
-   Tool now allows you to upload your build directly from the export from the game.

### v1.0.0 (24 September 2021)

-   Released.
