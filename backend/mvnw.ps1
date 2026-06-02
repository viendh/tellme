# PowerShell Maven Wrapper for Tellme Backend
$JAVA_EXE = if ($env:JAVA_HOME) { "$env:JAVA_HOME/bin/java.exe" } else { "java" }
$WRAPPER_JAR = "$PSScriptRoot\.mvn\wrapper\maven-wrapper.jar"
$PROJECT_DIR = $PSScriptRoot

& "$JAVA_EXE" -classpath "$WRAPPER_JAR" `
    "-Dmaven.multiModuleProjectDirectory=$PROJECT_DIR" `
    "org.apache.maven.wrapper.MavenWrapperMain" `
    @args
