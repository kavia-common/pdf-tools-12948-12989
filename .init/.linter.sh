#!/bin/bash
cd /home/kavia/workspace/code-generation/pdf-tools-12948-12989/PDFToolsMonolith
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

