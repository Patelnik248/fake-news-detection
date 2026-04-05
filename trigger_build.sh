#!/bin/bash
# Trigger a Jenkins build via the REST API
JENKINS_URL="http://localhost:8080"
JOB="FakeNews-CI"
USER="admin"
PASS="7e09ed458ae047cd95da059d46edaa52"

# Get CSRF crumb
CRUMB=$(curl -s --user "$USER:$PASS" "$JENKINS_URL/crumbIssuer/api/json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['crumbRequestField']+':'+d['crumb'])")

# Trigger the build
curl -s -X POST "$JENKINS_URL/job/$JOB/build" --user "$USER:$PASS" -H "$CRUMB"
echo "Build triggered!"
