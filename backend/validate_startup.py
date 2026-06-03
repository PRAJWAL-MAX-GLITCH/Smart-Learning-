import sys
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("startup_validation")

logger.info("Starting deployment import validation...")
logger.info(f"Current Working Directory: {os.getcwd()}")
logger.info(f"Python sys.path: {sys.path}")

# Add current directory and parent to sys.path to mimic different run contexts
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

modules_to_test = [
    "app",
    "app.config",
    "app.extensions",
    "app.database",
    "app.database.mongo",
    "app.models",
    "app.models.user",
    "app.controllers",
    "app.routes",
    "app.services",
    "app.utils"
]

failed = False
for module_name in modules_to_test:
    try:
        __import__(module_name)
        logger.info(f"  [OK] Successfully imported {module_name}")
    except ImportError as e:
        logger.error(f"  [FAIL] Failed to import {module_name}: {e}")
        failed = True

if failed:
    logger.error("Validation failed! Please check your package structures and PYTHONPATH.")
    sys.exit(1)
else:
    logger.info("All imports validated successfully! The application structure is healthy.")
    sys.exit(0)
