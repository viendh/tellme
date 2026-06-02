@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0") ELSE (SET "BASE_DIR=%__MVNW_ARG0_NAME__%")
@SET "MAVEN_PROJECTBASEDIR=%BASE_DIR%"

@IF NOT "%MAVEN_BASEDIR%"=="" @SET "MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%"

@SET "EXEC_DIR=%CD%"
@SET "WDIR=%EXEC_DIR%"
@IF NOT "%MAVEN_PROJECTBASEDIR%"=="%EXEC_DIR%" @SET "WDIR=%MAVEN_PROJECTBASEDIR%"

@REM Find java.exe
@IF NOT "%JAVA_HOME%"=="" GOTO OkJHome
@FOR %%i IN (java.exe) DO @SET "JAVA_EXE=%%~$PATH:i"
@IF NOT "%JAVA_EXE%"=="" @GOTO OkJHome
@ECHO.
@ECHO Error: JAVA_HOME not found in your environment. >&2
@ECHO Please set the JAVA_HOME variable in your environment to match the >&2
@ECHO location of your Java installation. >&2
@ECHO.
@GOTO error

:OkJHome
@IF NOT "%JAVA_HOME%"=="" @SET "JAVA_EXE=%JAVA_HOME%/bin/java.exe"
@IF EXIST "%JAVA_EXE%" GOTO init

@ECHO.
@ECHO Error: JAVA_HOME is set to an invalid directory. >&2
@ECHO JAVA_HOME = "%JAVA_HOME%" >&2
@ECHO Please set the JAVA_HOME variable in your environment to match the >&2
@ECHO location of your Java installation. >&2
@ECHO.
@GOTO error

:init
@SET "MAVEN_OPTS=%MAVEN_OPTS% -Xmx512m"

@SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"
@SET "WRAPPER_URL=https://repo1.maven.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

@IF EXIST "%WRAPPER_JAR%" GOTO execute

@ECHO Downloading Maven Wrapper from: %WRAPPER_URL%
@PowerShell -Command "&{"^
    "$webclient = new-object System.Net.WebClient;"^
    "if (-not ([string]::IsNullOrEmpty('%MVNW_USERNAME%') -and [string]::IsNullOrEmpty('%MVNW_PASSWORD%'))) {"^
    "$webclient.Credentials = new-object System.Net.NetworkCredential('%MVNW_USERNAME%', '%MVNW_PASSWORD%');"^
    "}"^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;"^
    "$webclient.DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%')"^
    "}"
@IF "%ERRORLEVEL%"=="0" GOTO execute
@ECHO.
@ECHO Error: Failed to download Maven Wrapper >&2
@GOTO error

:execute
@SET "MAVEN_CMD_LINE_ARGS=%*"
@"%JAVA_EXE%" ^
    %JVM_CONFIG_MAVEN_PROPS% ^
    %MAVEN_OPTS% ^
    %MAVEN_DEBUG_OPTS% ^
    -classpath "%WRAPPER_JAR%" ^
    "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
    "%WRAPPER_LAUNCHER%" ^
    %MAVEN_CMD_LINE_ARGS%

@IF NOT "%ERRORLEVEL%"=="0" @GOTO error
@GOTO end

:error
@SET ERROR_CODE=1

:end
@IF "%EXEC_DIR%"=="%CD%" GOTO :skipRestoreDir
@CD "%EXEC_DIR%"

:skipRestoreDir
@EXIT /B %ERROR_CODE%
