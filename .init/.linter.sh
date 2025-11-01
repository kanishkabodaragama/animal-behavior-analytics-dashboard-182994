#!/bin/bash
cd /home/kavia/workspace/code-generation/animal-behavior-analytics-dashboard-182994/dashboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

