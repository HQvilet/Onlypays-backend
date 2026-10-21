#!/bin/bash
set -e

echo "=========================================================="
echo " Starting InAppPurchase Service in Development Mode       "
echo " Live Hot Reloading enabled via Spring Boot DevTools     "
echo " HTTP Port: 8081 | Debug Port: 5005 | LiveReload: 35729   "
echo "=========================================================="

# Background watcher for source code changes in src/main/java
# When any Java file changes, automatically compile it so DevTools can reload
if command -v inotifywait >/dev/null 2>&1; then
  (
    while true; do
      inotifywait -r -e modify,create,delete,move /workspace/src/main/java 2>/dev/null || true
      echo ">> [Hot Reload] Detected code changes in src/main/java. Recompiling..."
      mvn compile -DskipTests -q || true
      echo ">> [Hot Reload] Recompilation finished. Spring Boot DevTools will reload."
    done
  ) &
fi

# Start Spring Boot application via Maven plugin with hot reload and remote debug
exec mvn spring-boot:run \
  -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
