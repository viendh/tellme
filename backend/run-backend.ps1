Set-Location "d:\Dev\Tellme\backend"
& "C:\Program Files\Java\jdk1.8.0_211/bin/java.exe" -classpath "d:\Dev\Tellme\backend\.mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=d:\Dev\Tellme\backend" "org.apache.maven.wrapper.MavenWrapperMain" "spring-boot:run" 2>&1 | Tee-Object -FilePath "d:\Dev\Tellme\backend\run.log"
