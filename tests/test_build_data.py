import sys
import os
import pytest

import build_data as bd


@pytest.fixture
def example_rows():
    return [
        {
            "family": "faMily_1",
            "creature": "CreaturE_1",
            "trait_name": "traiT_1",
            "unique_name": "family_1_creature_1_trait_1",
            "uid": "1a097f",
        },
        {
            "family": "Family_2",
            "creature": "creaTurE_2",
            "trait_name": "traiT_2",
            "unique_name": "family_2_creature_2_trait_2",
            "uid": "4f0316",
        },
    ]


def test_generate_unique_name(example_rows):
    """Ensure unique name is generated correctly.

    Args:
        example_rows (list): List of example rows.
    """

    for row in example_rows:
        assert bd.generate_unique_name(row) == row["unique_name"]


def test_generate_uid(example_rows):
    """Ensure UID is generated correctly.

    Args:
        example_rows (list): List of example rows.
    """
    for row in example_rows:
        assert bd.generate_uid(row) == row["uid"]


def test_compendium_ok():
    """Sanity check for the compendium. The idea is to ensure that the data
    being fed into the app will be valid without needing to check it manually
    before deployment. This should catch any syntax errors with the csv file
    etc.
    """
    json_data, version = bd.load_csv_file(bd.SUC_DATA_FILENAME)

    # Ensure there are at least 1000 traits and less than 5000
    # (there's no way to know exactly how many there should be)
    assert len(json_data) > 1000 and len(json_data) < 5000

    # Ensure all uids are unique
    assert len(set([obj["uid"] for obj in json_data])) == len(json_data)


def test_build_data_ok():
    """Ensure the build_compendium function works as expected.
    Save the output data to tests/output_data.
    """
    json_data, specializations_data = bd.build_data(
        os.path.join("tests", "output_data")
    )

    # Ensure there are at least 30 specializations
    assert len(specializations_data) >= 30

    # Ensure the specializations are unique
    assert len(set([s["name"] for s in specializations_data])) == len(
        specializations_data
    )
