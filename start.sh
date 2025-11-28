#!/bin/bash
# VoyagerLuxury - Linux/Mac Startup Script

echo ""
echo "============================================================"
echo "  VoyagerLuxury - Automated Startup Script (Linux/Mac)"
echo "============================================================"
echo ""

node start.js

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "Script failed with error code $EXIT_CODE"
    exit $EXIT_CODE
fi

