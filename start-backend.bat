@echo off
SET "JAVA_HOME=C:\Program Files\Java\jdk1.8.0_211"
SET "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0backend"
call .\mvnw.cmd spring-boot:run
