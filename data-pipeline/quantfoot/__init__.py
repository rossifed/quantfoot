"""
Main Dagster definitions module.
"""
import os
from pathlib import Path
from dagster import Definitions, load_assets_from_modules
from dagster_embedded_elt.dlt import DagsterDltResource
from dagster_dbt import DbtCliResource

from . import assets

# Load all assets
all_assets = load_assets_from_modules([assets])

# dbt project path
DBT_PROJECT_DIR = Path(__file__).parent.parent / "dbt_project"

# Define Dagster definitions
defs = Definitions(
    assets=all_assets,
    resources={
        "dlt_pipeline_resource": DagsterDltResource(),
        "dbt": DbtCliResource(project_dir=os.fspath(DBT_PROJECT_DIR)),
    }
)
