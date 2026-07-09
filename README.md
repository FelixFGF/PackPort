# PackPort

PackPort is a web-based Minecraft modpack conversion platform that allows users to convert CurseForge modpacks into Modrinth-compatible `.mrpack` files.

The goal of PackPort is to simplify modpack migration between platforms by preserving important modpack information such as:

- Modpack name and metadata
- Minecraft version
- Mod loader information
- Required mods and dependencies
- Configuration files
- Overrides and custom files

## Features

- Upload CurseForge `.zip` modpacks
- Detect modpack type automatically
- Parse CurseForge manifests
- Convert modpacks to Modrinth format
- Generate valid `modrinth.index.json`
- Download converted `.mrpack` files
- Modern web interface

## Tech Stack

### Backend
- Java 17
- Spring Boot
- Gradle

### Frontend
- React
- TypeScript
- Vite

## Project Status

PackPort is currently in Beta development.

The main goal is to provide a simple and reliable way to migrate Minecraft modpacks between different modpack platforms.
