# ActionDev Master Learning Guide

This is a build-along plan, not a reading list. Chapters 0-16 are one dependency chain ending in a Steam-ready Early Access candidate. Every chapter begins with a **Project connection** that states what changes in the game repository and ends with evidence you must produce. Commit that evidence before continuing; later chapters assume it exists.

## 0. Install the complete development environment

Complete this chapter before starting Modern C++. Use **Windows** if you have no platform preference; it is the most direct environment for the PC/Steam client. macOS is valid for most engine work but cannot replace final Windows and Linux packaging tests. Ubuntu is suitable for the headless server and Linux client work.

Do not manually download every middleware library. Install the compiler, Git, CMake, Ninja, and vcpkg first. The project's `vcpkg.json` manifest will acquire most C/C++ dependencies reproducibly.

> **Project connection — create the repository that every later chapter modifies.** The shipped game ultimately needs reproducible Windows client and Linux dedicated-server builds. This chapter creates that foundation now, before gameplay code can hide setup mistakes. By the end, the game repository must contain `CMakeLists.txt`, `CMakePresets.json`, `vcpkg.json`, `.gitignore`, `.gitattributes`, `client/`, `server/`, `shared/`, `tests/`, `tools/`, `assets/`, and `docs/`. The empty client, server, shared library, and test targets must configure, compile, run, and test from a clean terminal. Save the exact commands in `README.md` and commit the result as `checkpoint/00-toolchain`. Do not continue if the build relies on an IDE-only setting or a dependency installed outside the manifest.
>
> **If you are stuck:** first run one command at a time—configure, build, then test—and fix the first failure rather than changing several tools. Start with the [CMake tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/), [CMake presets manual](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html), [vcpkg CMake integration](https://learn.microsoft.com/en-us/vcpkg/users/buildsystems/cmake-integration), and [Git book](https://git-scm.com/book/en/v2). The minimum proof is a fresh clone that succeeds with the documented preset.

### 0.1 Hardware and disk preparation

Recommended working minimum:

- 64-bit Windows 11, current macOS, or current Ubuntu LTS;
- 16 GB RAM; 32 GB is preferable once the editor, compiler, game, debugger, and asset tools run together;
- a GPU supporting a current Direct3D, Vulkan, or Metal backend;
- at least 40 GB free for source, build trees, vcpkg packages, symbols, captures, and tools;
- administrator access for the initial compiler and system-package installation.

Create one development root that does not contain spaces or cloud-synchronized folders.

| Platform | Suggested root |
|---|---|
| Windows | `C:\dev` |
| macOS | `~/dev` |
| Linux | `~/dev` |

Build tools create many files and perform better outside OneDrive, iCloud Drive, Dropbox, network shares, and removable drives.

### 0.2 Windows setup - recommended

#### Install Visual Studio with C++

1. Download the latest **Visual Studio Community** installer from the [official Visual Studio installation page](https://learn.microsoft.com/en-us/visualstudio/install/install-visual-studio).
2. In Visual Studio Installer, select **Desktop development with C++**.
3. Confirm these components are included:
   - current MSVC x64/x86 build tools;
   - current Windows SDK;
   - C++ CMake tools for Windows;
   - C++ AddressSanitizer;
   - Google Test adapter;
   - Windows debugger and profiling tools.
4. Install, reboot if requested, then open **Developer PowerShell for Visual Studio** from the Start menu.

Do not use an ordinary PowerShell window for the first verification. Developer PowerShell initializes the MSVC compiler environment.

#### Install Git

In PowerShell:

~~~powershell
winget install --id Git.Git --exact
~~~

Close and reopen Developer PowerShell after installation.

#### Install standalone CMake and Ninja if the verification below cannot find them

Visual Studio normally includes usable CMake and Ninja tooling. If either command is unavailable outside Visual Studio, install the standalone versions:

~~~powershell
winget install --id Kitware.CMake --exact
winget install --id Ninja-build.Ninja --exact
~~~

Close and reopen the terminal after modifying `PATH`.

#### Verify Windows tools

~~~powershell
cl
cmake --version
ninja --version
git --version
where.exe cl
where.exe cmake
where.exe ninja
where.exe git
~~~

Expected result:

- `cl` prints an MSVC compiler version and usage message;
- CMake, Ninja, and Git print versions;
- each `where.exe` command prints an actual path.

If `cl` is missing, modify Visual Studio and install **Desktop development with C++**, then use Developer PowerShell. Do not attempt to fix this by copying compiler executables into `PATH` manually.

### 0.3 macOS setup

#### Install Apple's compiler and SDK

Open Terminal and run:

~~~bash
xcode-select --install
~~~

Accept the system dialog and license. Apple documents this process in [Installing the command-line tools](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools/).

Verify:

~~~bash
xcode-select -p
clang++ --version
git --version
~~~

The selected path should normally be `/Library/Developer/CommandLineTools` when only the command-line tools are installed. If you install full Xcode later, select it with:

~~~bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
~~~

#### Install Homebrew

Use the installer from [brew.sh](https://brew.sh/) or the official [Homebrew installation documentation](https://docs.brew.sh/Installation). The current shell installer is:

~~~bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
~~~

Read the installer output. On Apple Silicon, it normally asks you to add `/opt/homebrew/bin` to the shell environment. Run the exact command it prints, then open a new Terminal.

Install the remaining tools:

~~~bash
brew update
brew install cmake ninja git pkg-config
~~~

Verify:

~~~bash
clang++ --version
cmake --version
ninja --version
git --version
pkg-config --version
~~~

macOS uses Metal through bgfx for normal development. RenderDoc is not the default macOS GPU debugger; use Xcode GPU capture on macOS and perform required RenderDoc validation on Windows or Linux.

### 0.4 Ubuntu setup

Update the package index and install the compiler, debugger, build tools, and common native dependencies:

~~~bash
sudo apt update
sudo apt install -y \
  build-essential clang lldb cmake ninja-build git curl zip unzip tar pkg-config \
  autoconf automake libtool \
  libx11-dev libxrandr-dev libxinerama-dev libxcursor-dev libxi-dev \
  libwayland-dev libxkbcommon-dev libgl1-mesa-dev \
  libasound2-dev libpulse-dev
~~~

Ubuntu maintains current setup guidance for both [GCC](https://documentation.ubuntu.com/ubuntu-for-developers/howto/gcc-setup/) and [Clang](https://documentation.ubuntu.com/ubuntu-for-developers/howto/clang-setup/).

Verify:

~~~bash
g++ --version
clang++ --version
cmake --version
ninja --version
git --version
lldb --version
~~~

Use Clang for the primary Linux development preset and keep GCC as a second CI/compiler check. If a package has a different name on your Ubuntu release, use `apt search <name>` rather than downloading random `.deb` files.

### 0.5 Do not use WSL for the primary game client

WSL is useful for headless server builds and Linux command-line tests. It adds unnecessary complexity for the main client because windowing, GPU presentation, gamepads, audio devices, debuggers, file performance, and Steam integration cross the Windows/Linux boundary.

Use native Windows for client development. Add WSL or a Linux machine later for the dedicated-server and Linux CI targets.

### 0.6 Configure Git identity and line endings

Set the name and email that should appear on commits:

~~~bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
~~~

Windows:

~~~powershell
git config --global core.autocrlf true
~~~

macOS/Linux:

~~~bash
git config --global core.autocrlf input
~~~

Verify:

~~~bash
git config --global --list
~~~

The repository should later contain a `.gitattributes` file that owns text and binary rules. Global configuration is only a safe initial default.

### 0.7 Install vcpkg

Microsoft's current [vcpkg CMake tutorial](https://learn.microsoft.com/en-us/vcpkg/get_started/get-started) requires a terminal, compiler, CMake, and Git - the tools installed above.

#### Windows

~~~powershell
New-Item -ItemType Directory -Force C:\dev | Out-Null
Set-Location C:\dev
git clone https://github.com/microsoft/vcpkg.git
Set-Location vcpkg
.\bootstrap-vcpkg.bat
$env:VCPKG_ROOT = "C:\dev\vcpkg"
$env:PATH = "$env:VCPKG_ROOT;$env:PATH"
vcpkg version
~~~

To persist `VCPKG_ROOT` for future terminals:

~~~powershell
[Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\dev\vcpkg", "User")
~~~

Add `C:\dev\vcpkg` to the user `Path` through **System Properties -> Environment Variables**, then open a new Developer PowerShell.

#### macOS/Linux

~~~bash
mkdir -p "$HOME/dev"
cd "$HOME/dev"
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh
export VCPKG_ROOT="$HOME/dev/vcpkg"
export PATH="$VCPKG_ROOT:$PATH"
vcpkg version
~~~

Persist the variables in your shell profile:

~~~bash
printf '\nexport VCPKG_ROOT="$HOME/dev/vcpkg"\nexport PATH="$VCPKG_ROOT:$PATH"\n' >> "$HOME/.zshrc"
~~~

Use `~/.bashrc` instead of `~/.zshrc` when Bash is your interactive shell. Open a new terminal and run:

~~~bash
echo "$VCPKG_ROOT"
vcpkg version
~~~

Do not run `vcpkg integrate install` for this project. CMake will use vcpkg explicitly through a preset, which keeps configuration visible and reproducible.

### 0.8 Install the editor and asset tools

Choose one code editor/IDE:

- **Windows:** Visual Studio is already installed and is the simplest starting choice.
- **Any platform:** Visual Studio Code with Microsoft's C/C++ and CMake Tools extensions.
- **Any platform:** CLion is suitable if you already have a license.

Install Blender from [blender.org](https://www.blender.org/download/) when Stage 1 reaches the glTF asset pipeline. Do not block the first C++ build on Blender.

Install these later, when their chapters require them:

- RenderDoc on Windows/Linux for GPU frame capture;
- Tracy profiler UI for CPU/memory/network profiling;
- Steam client and Steamworks SDK during the Steam integration stage;
- optional crash-reporting and deployment tools during release hardening.

The [Steamworks SDK](https://partner.steamgames.com/documentation/api) is not required for the early runtime and is downloaded through Steamworks partner access. Do not search for unofficial SDK mirrors or commit licensed SDK contents to a public repository.

### 0.9 Create the game repository

Use a separate repository for the C++ game. The ActionDev learning application is not the game repository.

Windows:

~~~powershell
Set-Location C:\dev
New-Item -ItemType Directory actiondev-game
Set-Location actiondev-game
git init
New-Item -ItemType Directory -Path client,server,shared,tools,tests,assets,docs
~~~

macOS/Linux:

~~~bash
cd "$HOME/dev"
mkdir -p actiondev-game/{client,server,shared,tools,tests,assets,docs}
cd actiondev-game
git init
~~~

The initial layout is:

~~~text
actiondev-game/
  CMakeLists.txt
  CMakePresets.json
  CMakeUserPresets.json       # local only; do not commit
  vcpkg.json
  vcpkg-configuration.json
  client/
  server/
  shared/
  tools/
  tests/
  assets/
  docs/
~~~

### 0.10 Create the dependency manifest

From the game repository root:

~~~bash
vcpkg new --application
vcpkg add port sdl3
vcpkg add port entt
vcpkg add port nlohmann-json
vcpkg add port gtest
~~~

The initial `vcpkg.json` should contain the four foundation dependencies. Commit both `vcpkg.json` and `vcpkg-configuration.json`; the latter pins the registry baseline used to resolve package versions.

Do **not** install the entire final stack on day one. Add middleware when its stage begins:

| Stage | Add through vcpkg |
|---|---|
| Rendering/content | `bgfx[tools]`, `imgui`, `miniaudio` |
| Physics/animation | `joltphysics[debugrenderer]`; add ozz-animation through a pinned maintained port/overlay or pinned upstream CMake integration selected by the project |
| Navigation/AI | `recastnavigation` |
| Networking | `gamenetworkingsockets` |
| Production UI | `rmlui[freetype]` |
| Profiling/release | `tracy`; Steamworks is installed manually from the partner SDK |

The current vcpkg catalog provides ports for [SDL3](https://vcpkg.io/en/package/sdl3.html), [bgfx](https://vcpkg.io/en/package/bgfx.html), [EnTT](https://vcpkg.io/en/package/entt.html), [Jolt Physics](https://vcpkg.io/en/package/joltphysics.html), [Recast Navigation](https://vcpkg.io/en/package/recastnavigation.html), [RmlUi](https://vcpkg.io/en/package/rmlui.html), [Dear ImGui](https://vcpkg.io/en/package/imgui), [GameNetworkingSockets](https://vcpkg.io/en/package/gamenetworkingsockets.html), [miniaudio](https://vcpkg.io/en/package/miniaudio.html), [GoogleTest](https://vcpkg.io/en/package/gtest.html), and [Tracy](https://vcpkg.io/en/package/tracy). The manifest baseline, not this prose, determines the exact versions used by the project.

If `vcpkg add port <name>` reports that a port does not exist, first update the vcpkg Git checkout and rerun bootstrap. If the project intentionally uses an older pinned baseline, do not silently update it; add a reviewed overlay port or change the baseline in a dedicated dependency-update commit.

### 0.11 Create CMake presets

Create `CMakePresets.json` in the game repository:

~~~json
{
  "version": 6,
  "configurePresets": [
    {
      "name": "dev",
      "displayName": "Developer build",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/dev",
      "cacheVariables": {
        "CMAKE_TOOLCHAIN_FILE": "$env{VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake",
        "CMAKE_BUILD_TYPE": "Debug",
        "CMAKE_EXPORT_COMPILE_COMMANDS": "ON"
      }
    },
    {
      "name": "release-with-symbols",
      "inherits": "dev",
      "binaryDir": "${sourceDir}/build/release-with-symbols",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "RelWithDebInfo"
      }
    }
  ],
  "buildPresets": [
    { "name": "dev", "configurePreset": "dev" },
    { "name": "release-with-symbols", "configurePreset": "release-with-symbols" }
  ],
  "testPresets": [
    {
      "name": "dev",
      "configurePreset": "dev",
      "output": { "outputOnFailure": true }
    }
  ]
}
~~~

If the shared preset cannot see `VCPKG_ROOT`, create an untracked `CMakeUserPresets.json`:

~~~json
{
  "version": 6,
  "configurePresets": [
    {
      "name": "local",
      "inherits": "dev",
      "environment": {
        "VCPKG_ROOT": "/absolute/path/to/vcpkg"
      }
    }
  ]
}
~~~

On Windows, use `C:/dev/vcpkg` in JSON rather than unescaped backslashes.

Add these entries to `.gitignore`:

~~~gitignore
/build/
/CMakeUserPresets.json
/.vs/
/.vscode/settings.json
~~~

### 0.12 Create the first buildable targets

Create the nested source/include directories if they do not already exist.

Windows:

~~~powershell
New-Item -ItemType Directory -Force -Path shared\include\actiondev,shared\src | Out-Null
~~~

macOS/Linux:

~~~bash
mkdir -p shared/include/actiondev shared/src
~~~

Create the root `CMakeLists.txt`:

~~~cmake
cmake_minimum_required(VERSION 3.25)
project(ActionDevGame VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(CTest)

find_package(SDL3 CONFIG REQUIRED)
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(GTest CONFIG REQUIRED)

add_library(actiondev_shared STATIC
  shared/src/version.cpp
)
target_include_directories(actiondev_shared PUBLIC shared/include)
target_link_libraries(actiondev_shared
  PUBLIC
    EnTT::EnTT
    nlohmann_json::nlohmann_json
)

add_executable(actiondev_client client/main.cpp)
target_link_libraries(actiondev_client PRIVATE actiondev_shared SDL3::SDL3)

add_executable(actiondev_server server/main.cpp)
target_link_libraries(actiondev_server PRIVATE actiondev_shared)

add_executable(actiondev_tests tests/version_tests.cpp)
target_link_libraries(actiondev_tests PRIVATE actiondev_shared GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(actiondev_tests)
~~~

Create `shared/include/actiondev/version.hpp`:

~~~cpp
#pragma once

#include <string_view>

namespace actiondev {
std::string_view version();
}
~~~

Create `shared/src/version.cpp`:

~~~cpp
#include <actiondev/version.hpp>

namespace actiondev {
std::string_view version() { return "0.1.0"; }
}
~~~

Create `client/main.cpp`:

~~~cpp
#include <SDL3/SDL.h>
#include <actiondev/version.hpp>

#include <iostream>

int main() {
    std::cout << "ActionDev client " << actiondev::version() << '\n';

    if (!SDL_Init(SDL_INIT_VIDEO | SDL_INIT_GAMEPAD)) {
        std::cerr << "SDL_Init failed: " << SDL_GetError() << '\n';
        return 1;
    }

    SDL_Quit();
    return 0;
}
~~~

Create `server/main.cpp`:

~~~cpp
#include <actiondev/version.hpp>

#include <iostream>

int main() {
    std::cout << "ActionDev dedicated server " << actiondev::version() << '\n';
    return 0;
}
~~~

Create `tests/version_tests.cpp`:

~~~cpp
#include <actiondev/version.hpp>
#include <gtest/gtest.h>

TEST(Version, IsNotEmpty) {
    EXPECT_FALSE(actiondev::version().empty());
}
~~~

### 0.13 Configure, build, test, and run

From the game repository root:

~~~bash
cmake --preset dev
cmake --build --preset dev
ctest --preset dev
~~~

Run on Windows:

~~~powershell
.\build\dev\actiondev_client.exe
.\build\dev\actiondev_server.exe
~~~

Run on macOS/Linux:

~~~bash
./build/dev/actiondev_client
./build/dev/actiondev_server
~~~

Required output:

~~~text
ActionDev client 0.1.0
ActionDev dedicated server 0.1.0
100% tests passed
~~~

The first vcpkg configure may take a long time because dependencies are compiled. Later clean builds should reuse the vcpkg binary cache.

### 0.14 Debug one executable

Before continuing, prove the debugger works.

1. Place a breakpoint on the first output statement in `server/main.cpp`.
2. Launch `actiondev_server` through Visual Studio, VS Code, CLion, or LLDB.
3. Stop at the breakpoint.
4. Inspect `actiondev::version()`.
5. Step over the output and let the process exit normally.

Command-line LLDB on macOS/Linux:

~~~bash
lldb ./build/dev/actiondev_server
(lldb) breakpoint set --name main
(lldb) run
(lldb) next
(lldb) continue
~~~

Do not begin the curriculum with an unverified debugger.

### 0.15 Required installation checklist

Do not continue to Chapter 1 until every item is true:

- [ ] A C++ compiler runs from the intended development terminal.
- [ ] CMake, Ninja, Git, and a debugger print valid versions.
- [ ] `VCPKG_ROOT` points to the vcpkg checkout.
- [ ] `vcpkg version` succeeds in a new terminal.
- [ ] The project configures with `cmake --preset dev`.
- [ ] vcpkg restores/builds the manifest dependencies without manual library copying.
- [ ] Client, server, shared library, and test targets compile.
- [ ] CTest reports all tests passed.
- [ ] Client and server executables launch from the command line.
- [ ] The debugger stops at a breakpoint and inspects a value.
- [ ] The initial repository commit contains source, manifests, presets, and documentation - not `build/` or locally installed SDKs.

### 0.16 Common installation failures

#### CMake cannot find the compiler

- Windows: open Developer PowerShell and verify `cl` before running CMake.
- macOS: run `xcode-select -p`; install or reselect the command-line tools.
- Linux: verify `clang++` or `g++`; remove the failed build directory before changing compilers.

#### CMake cannot find the vcpkg toolchain

~~~bash
echo "$VCPKG_ROOT"
ls "$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake"
~~~

PowerShell:

~~~powershell
$env:VCPKG_ROOT
Test-Path "$env:VCPKG_ROOT\scripts\buildsystems\vcpkg.cmake"
~~~

If the path is wrong, fix the environment variable and reconfigure from a clean build directory.

#### CMake cannot find SDL3, EnTT, JSON, or GoogleTest

Confirm the dependency exists in `vcpkg.json`, the vcpkg toolchain is active, and configuration output says it is installing/restoring manifest packages. Do not set random `<Library>_DIR` paths or copy headers into the repository.

#### A compiler change causes unexplained link errors

Delete only the generated build tree for that preset and configure again. vcpkg triplets include compiler/runtime assumptions; never mix objects or libraries built by incompatible toolchains.

~~~bash
cmake --build --preset dev --target clean
~~~

If that is insufficient, remove `build/dev` and reconfigure. Do not delete source, manifests, or the vcpkg checkout.

#### vcpkg compilation runs out of memory

Reduce parallelism for that terminal:

Windows PowerShell:

~~~powershell
$env:CMAKE_BUILD_PARALLEL_LEVEL = "2"
~~~

macOS/Linux:

~~~bash
export CMAKE_BUILD_PARALLEL_LEVEL=2
~~~

Then rerun CMake configuration/build.

#### Linux links but the client cannot open a window or audio device

Confirm you are running inside a graphical desktop session, not a headless SSH shell. Verify `DISPLAY` or `WAYLAND_DISPLAY`, audio service access, and required X11/Wayland/audio development packages. The dedicated server should remain capable of running headlessly.

#### macOS reports an invalid or missing SDK after an OS update

Update or reinstall the Command Line Tools and verify the active path with `xcode-select -p`. Remove the generated build preset directory and configure again.

## 1. Modern C++ and repository foundations

> **Project connection — replace throwaway setup code with the reusable core every game system depends on.** Chapters 2-15 will create windows, GPU resources, physics bodies, sockets, entities, items, and saves; all of them require explicit lifetime, stable identity, typed failure, and isolated build targets. Build these foundations in the real repository now: `shared/include/actiondev/core/` for strong IDs, handles, results, and clocks; `shared/src/core/` for implementations; `tests/core/` for lifetime and invalid-handle tests; and target-local CMake files for `actiondev_shared`, `actiondev_client`, `actiondev_server`, `actiondev_tools`, and `actiondev_tests`. Add an ASan preset and make CTest run it.
>
> **What this unlocks:** Chapter 2 can own SDL resources without leaks; Chapter 3 can refer to assets/entities without raw pointers; Chapters 7, 13, and 15 can serialize persistent and network identities without confusing them with runtime handles. Before moving on, intentionally trigger and explain one compiler, linker, runtime-sanitizer, and stale-handle failure; prove move-only resources destroy exactly once; and commit as `checkpoint/01-core`.
>
> **Starter hint:** implement one `Handle<Domain>` containing an index plus generation, then write destroy/reuse tests before generalizing it. Prefer values and `std::unique_ptr`; introduce shared ownership only with a written owner graph. If lost, use [cppreference](https://en.cppreference.com/), the [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines), the [CMake tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/), [GoogleTest](https://google.github.io/googletest/), and [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html) while doing this checkpoint—not later.

### The build pipeline you need to understand

A C++ program is not compiled as one giant file. Each source file is preprocessed and compiled into an object file. The linker then combines object files and libraries into an executable. That distinction explains three common classes of failure:

- A **compiler error** means one translation unit could not be parsed or type-checked. Missing declarations, invalid conversions, and syntax errors live here.
- A **linker error** means compilation succeeded but the final program cannot find or uniquely choose a definition. Undefined symbols, duplicate definitions, missing libraries, and ABI mismatches live here.
- A **runtime error** happens after a valid executable launches. Invalid lifetime, out-of-bounds access, failed resource initialization, data corruption, and logic bugs live here.

Headers describe interfaces seen by multiple translation units. Source files normally contain definitions. Keep headers small and stable because changing a widely included header causes broad recompilation and exposes implementation detail. Use forward declarations where they genuinely reduce coupling, but do not sacrifice clarity to avoid every include.

Your first diagnostic habit should be to find the **first meaningful error**, identify which build phase produced it, and reduce it to the smallest failing target. Do not randomly change CMake, headers, and source code at the same time.

### Ownership and RAII

RAII means a resource is acquired by an object's construction and released by its destruction. The destructor runs when the owning object leaves scope, including early returns and exceptions. This is the foundation for safe native code.

Use these defaults:

- store ordinary values directly;
- use references or non-owning pointers for temporary access whose lifetime is guaranteed elsewhere;
- use `std::unique_ptr` for unique heap ownership;
- use `std::shared_ptr` only when shared lifetime is a real domain requirement, not as a way to avoid deciding who owns something;
- use stable handles or IDs when systems must refer to objects that may move or disappear;
- wrap every SDL, bgfx, file, socket, and middleware handle in an owner that makes invalid states and destruction order explicit.

~~~cpp
class File final {
public:
    explicit File(const std::filesystem::path& path)
        : handle_(std::fopen(path.string().c_str(), "rb")) {
        if (!handle_) throw std::runtime_error("open failed");
    }

    ~File() { std::fclose(handle_); }

    File(const File&) = delete;
    File& operator=(const File&) = delete;

    File(File&& other) noexcept
        : handle_(std::exchange(other.handle_, nullptr)) {}

private:
    std::FILE* handle_ = nullptr;
};
~~~

The same pattern applies to a bgfx buffer, an SDL window, a mapped file, or a network connection. A moved-from object must remain destructible. Copying an exclusive resource should be impossible unless the resource has a documented clone operation.

### Stable identity instead of pointer identity

Pointers are poor durable identities. Containers reallocate, entities are destroyed, network state arrives later, and saves outlive the process. Use different strong types for different identity domains:

~~~cpp
struct EntityId { std::uint32_t value; };
struct ContentId { std::uint64_t value; };
struct NetworkId { std::uint32_t value; };
struct PersistentId { std::array<std::byte, 16> value; };
~~~

Do not make these implicit aliases of the same integer. A compile-time error is better than accidentally using a runtime entity number as a persistent item ID. A handle registry should include a generation counter so that a stale handle cannot access a new object that reused the same slot.

### Data boundaries and error handling

Throwing an exception may be reasonable for unrecoverable startup failure, but ordinary game operations need explicit results. Parsing content, loading optional assets, validating commands, joining sessions, and migrating saves all have expected failure modes.

~~~cpp
enum class EquipError {
    UnknownItem,
    WrongOwner,
    InvalidSlot,
    RequirementsNotMet
};

std::expected<EquipResult, EquipError>
try_equip(PlayerId player, ItemId item, LoadoutSlot slot);
~~~

The caller can now handle each failure deliberately. Avoid boolean results that discard the reason. Avoid functions that both partially mutate state and then return an error. Prefer validate-then-commit or transactional state changes.

For content and wire data, separate four phases:

1. **Parse:** turn bytes/text into a typed intermediate representation.
2. **Validate:** enforce ranges, required fields, uniqueness, versions, and local invariants.
3. **Link:** resolve referenced IDs and detect missing or cyclic relationships.
4. **Activate:** publish an immutable runtime view only after all prior phases succeed.

### Target-based CMake

Treat every executable and library as a target with declared dependencies and usage requirements. Do not build the project through global include paths and compiler flags.

~~~cmake
add_library(actiondev_shared STATIC)
target_sources(actiondev_shared PRIVATE src/combat/damage.cpp)
target_include_directories(actiondev_shared PUBLIC include)
target_compile_features(actiondev_shared PUBLIC cxx_std_20)

add_executable(actiondev_server src/server/main.cpp)
target_link_libraries(actiondev_server PRIVATE actiondev_shared)
~~~

`PUBLIC` means both the target and its consumers need the usage requirement. `PRIVATE` means only the target needs it. `INTERFACE` means only consumers need it. Incorrect visibility creates hidden transitive dependencies that break when the project grows.

Provide presets for Debug, RelWithDebInfo, sanitizer, and CI builds. A clean checkout should configure, build, and test without undocumented IDE state.

### Foundation exercises

1. Build a two-file program manually and intentionally produce one compiler error, one linker error, and one runtime sanitizer error. Explain why each belongs to that phase.
2. Write a move-only RAII wrapper around a mock handle and verify destruction exactly once.
3. Build a generation-based handle registry and prove that a destroyed handle cannot access a reused slot.
4. Create strong ID types for entity, ability, item, and connection identity. Verify that accidental cross-use fails to compile.
5. Create client, server, shared, tools, and tests targets. Build them from documented presets in a clean directory.

Do not leave this chapter until ASan catches an intentional lifetime bug, CTest runs from the command line, and a fresh clone produces the same result.

## 2. Platform shell, input, clocks, and the main loop

> **Project connection — turn the empty executable into the first real client while preserving a headless server.** Add `client/platform/` for SDL initialization, window/events, device input, and client clocks; add `shared/input/` for device-independent `PlayerActions` and action bindings; add `shared/sim/FixedStep.hpp`; and keep `server/main.cpp` free of SDL, audio, and renderer dependencies. The client loop must pump events, sample actions, run zero or more fixed simulation ticks, and render an interpolated presentation. The server must run the same fixed tick headlessly.
>
> **What this unlocks:** every later player action becomes an input command rather than an SDL key; deterministic physics/combat in Chapters 4-7 receives a fixed tick; networking in Chapter 15 can sequence those commands; controller/UI work in Chapter 8 reuses the action map. Before continuing, prove focus loss clears holds, keyboard and gamepad produce the same action struct, an invalid config cannot replace the active config, the server runs 10,000 ticks, and scripted input ends in the same simulation state at 30/60/144 FPS. Commit as `checkpoint/02-platform-loop`.
>
> **Starter hint:** make the initial simulation only a position updated by `PlayerActions.move`; do not wait for physics or rendering. Log tick number, input sequence, and position. Use the [SDL3 examples](https://examples.libsdl.org/SDL3/), [SDL3 API reference](https://wiki.libsdl.org/SDL3/), and [Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/) beside the code. If a hold sticks, log raw transition, mapped action state, focus state, and sampled command separately.

### Lifecycle before features

The platform shell owns initialization order, the event pump, top-level failure handling, and reverse-order shutdown. Put this behind a small boundary so the dedicated server never depends on a window.

~~~cpp
int main() {
    Platform platform;
    Renderer renderer{platform.window()};
    GameClient client{platform, renderer};

    while (!platform.quit_requested()) {
        platform.pump_events();
        client.frame(platform.clock());
    }
}
~~~

Real code should return typed initialization errors rather than constructing half-valid services. Test failed initialization and repeated startup/shutdown. A clean happy path does not prove resource ownership is correct.

### Events versus sampled state

Input has two useful forms:

- **Events** describe transitions: key pressed, device connected, window focus lost, mouse wheel moved.
- **Sampled state** describes what is currently true: key held, stick position, trigger value.

Use events to update device and action state. Sample the resulting actions when producing simulation commands. Do not let gameplay read raw SDL scancodes throughout the codebase.

~~~cpp
struct PlayerActions {
    Vec2 move;
    Vec2 look;
    bool attack_pressed;
    bool attack_held;
    bool block_held;
    bool dodge_pressed;
};
~~~

The action map translates keyboard, mouse, and gamepad inputs into this device-independent representation. It also owns deadzones, sensitivity, chords, remapping, conflict detection, and glyph selection. The game consumes actions, not devices.

On focus loss, clear held state and stop producing commands until input is reacquired. Otherwise a released key that occurred while unfocused can leave movement or block permanently held. On controller disconnect, preserve the binding but remove the live device. Support keyboard/mouse and controller activity in the same frame without making prompts flicker continuously.

### Three clocks, not one delta time

An action game needs at least three concepts of time:

- **wall time** for timestamps, diagnostics, and real-world intervals;
- **simulation time** advanced in fixed steps;
- **render time** used to present an interpolated view between simulation states.

Do not pass a variable frame delta through authoritative gameplay. A fixed accumulator is the standard starting point:

~~~cpp
constexpr double tick = 1.0 / 30.0;
double accumulator = 0.0;

while (running) {
    const double frame = clamp(clock.elapsed_seconds(), 0.0, 0.25);
    accumulator += frame;

    while (accumulator >= tick) {
        simulation.step(tick, command_queue.take_for_tick());
        accumulator -= tick;
    }

    const double alpha = accumulator / tick;
    renderer.draw(interpolate(previous, current, alpha));
}
~~~

Clamping the incoming frame prevents a debugger pause or window drag from demanding seconds of catch-up. The simulation still needs headroom: if one 33.3 ms tick routinely takes 33.3 ms, any spike creates a spiral of death. Set a much smaller normal budget and measure worst cases.

Interpolation affects presentation only. Never feed an interpolated transform back into collision or combat. Keep previous and current authoritative/simulated states separate from the rendered pose.

### Configuration, logging, and hot reload

Validate configuration before use. Include units in names (`snapshot_rate_hz`, `dodge_duration_ms`) and reject nonsensical ranges. For hot reload, build a candidate configuration, validate it, and swap it atomically. If validation fails, retain the old configuration and report the exact field.

Only reload presentation or explicitly safe data during a live session. Changing an authoritative ability definition on one process while another uses the old version is a protocol/content mismatch, not a convenient edit.

Logs should be structured enough to correlate a failure:

~~~text
level=warn category=input frame=1842 device=gamepad-2 event=disconnect
level=info category=combat tick=9912 actor=42 action=heavy_03 state=startup
level=warn category=net conn=7 seq=312 reason=late_command server_tick=9914
~~~

Avoid per-frame log spam. Use counters, sampled traces, and on-demand overlays for high-frequency state.

### Platform exercises

1. Start and stop the windowed client 100 times under a leak checker.
2. Unplug and reconnect a controller during movement, then switch to keyboard/mouse in the same frame.
3. Alt-tab while every holdable action is active and verify no action remains stuck.
4. Render at 30, 60, 144, and uncapped FPS while replaying the same scripted input; compare final simulation state.
5. Reload one valid and one invalid presentation configuration; verify invalid data never replaces the active version.

## 3. Rendering, assets, ECS, and data-driven content

> **Project connection — give the simulation a visible, data-driven presentation without making the renderer authoritative.** Add `client/render/` for bgfx initialization, RAII resource owners, render passes, and extraction of a read-only `RenderScene`; add `shared/world/` for EnTT components/systems and deferred entity destruction; add `tools/asset_pipeline/` for GLB validation/conversion and a manifest; add `shared/content/` for parse/validate/link/freeze registries. Import one graybox player, enemy, arena, and missing-asset fallback through the pipeline. The server may depend on content definitions and ECS state but must not link bgfx or presentation assets.
>
> **What this unlocks:** Chapter 4 gets transforms and collision metadata, Chapter 5 gets skeleton/animation references, Chapters 6 and 14 author abilities/enemies as validated content, and Chapter 15 can replicate stable content IDs instead of implementation memory. Before continuing, prove invalid content cannot activate, a failed hot reload retains the prior registry, destroying entities in adversarial order leaves no stale relationships, RenderDoc can identify the graybox draw, and the headless server builds with no renderer dependency. Commit as `checkpoint/03-world-content-render`.
>
> **Starter hint:** render one hard-coded triangle, then one manifest-loaded GLB, then extract it from one ECS entity; do not build a material editor first. Start with the [bgfx examples](https://bkaradzic.github.io/bgfx/examples.html), [RenderDoc getting started](https://renderdoc.org/docs/getting_started/quick_start.html), [Blender glTF exporter guide](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html), [EnTT documentation](https://skypjack.github.io/entt/), and [JSON for Modern C++](https://json.nlohmann.me/). When a model looks wrong, inspect transform spaces and the captured draw before changing importer scale constants.

### Rendering is a consumer of game state

The renderer should not own gameplay. Build a presentation extraction step that turns the current client-visible state into a render queue. This keeps the dedicated server free of renderer dependencies and prevents draw code from mutating combat state.

With bgfx, think in explicit resources and passes:

- initialize the selected backend and device state;
- create buffers, textures, shaders, and programs with RAII owners;
- assign stable view IDs and pass order;
- submit draw state and transforms;
- call the frame boundary;
- handle resize/reset and resource destruction deliberately.

The most common early rendering failures are coordinate-space mistakes and resource-lifetime mistakes. Always name the space of a vector or matrix: model, world, view, clip, tangent, or screen. A normal transformed as a position or a world-space light compared with a view-space position can produce plausible but wrong output.

Build diagnostic modes before visual polish: wireframe, normals, collision, bounds, depth, light volumes, overdraw approximation, and missing-asset markers. Capture a frame in RenderDoc and learn to inspect the draw call, bound buffers, textures, shaders, and transforms.

### Asset pipeline as a build pipeline

Source assets are not runtime assets. Establish one repeatable path:

~~~text
Blender source -> export GLB -> validate -> convert/optimize -> build manifest -> runtime package
~~~

Define units, up axis, forward axis, origin/pivot, naming, material limits, skeleton conventions, animation naming, and texture color-space rules. Apply or deliberately preserve transforms; do not fix every scale problem by multiplying a mystery constant in the importer.

The content build should produce a manifest containing stable IDs, dependencies, hashes, versions, and output paths. Generated assets stay separate from authoring files. CI should validate a representative export and fail with a human-readable path and reason.

Use fallback assets intentionally. A missing noncritical texture can show a diagnostic material; a missing authoritative ability definition should stop content activation.

### ECS without turning everything into ECS

An ECS is useful when many entities share data-oriented component combinations and systems query them in bulk. It is not a requirement that every service, configuration object, asset, connection, or singleton become an entity.

Good components are small facts:

~~~cpp
struct Transform { Vec3 position; Quat rotation; };
struct Health { float current; float maximum; };
struct Team { TeamId id; };
struct PendingDestroy {};
~~~

Systems operate over required facts. Services such as the renderer, network transport, asset registry, and save repository remain explicit services. Commands describe requested changes; events describe changes that happened. Do not use a global event bus to hide all control flow.

Entity IDs are runtime-local and disposable. Persist or replicate explicit stable identifiers instead. When an entity is destroyed, invalidate relationships and queued commands predictably. Avoid storing raw references into component arrays across operations that can reallocate or destroy entities.

### Content schemas and registries

Gameplay definitions should be data, but "data-driven" does not mean "accept arbitrary JSON." Define a schema and enforce invariants.

~~~json
{
  "id": "ability.guard_breaker",
  "version": 1,
  "tags": ["ability.melee", "damage.physical"],
  "cost": { "resource": "stamina", "amount": 18 },
  "timing": { "startup_ms": 280, "active_ms": 120, "recovery_ms": 520 },
  "targeting": { "mode": "soft_or_locked", "range_m": 3.2 },
  "effects": [{ "type": "damage", "coefficient": 1.45 }]
}
~~~

Validation should reject duplicate IDs, negative timings, missing references, illegal tag combinations, impossible slot categories, cyclic dependencies, unknown versions, and nondeterministic ordering. Error messages must include the file, field, rejected value, and rule.

After linking, publish immutable definitions. Runtime instances reference stable content IDs and cache only safe derived data. This makes save migration, networking, hot reload, and debugging possible.

### Transactional hot reload

Never mutate the live registry one file at a time. Build a complete candidate registry, validate and link it, then swap generations. Existing runtime handles either continue pointing at the old generation until a safe boundary or resolve through a versioned handle. A failed reload leaves the previous generation untouched.

Authoritative content changes require version agreement across server and clients. Presentation-only changes can be more permissive.

### Rendering/data exercises

1. Render a lit graybox mesh and diagnose one deliberately wrong model/view/projection transform in RenderDoc.
2. Round-trip one Blender asset through GLB with documented units, axes, materials, and validation.
3. Build an EnTT playground containing player, enemy, projectile, pickup, and trigger entities. Destroy them in adversarial orders and verify stale relationships are rejected.
4. Implement parse/validate/link/freeze for abilities and items. Add fixtures for missing IDs, cycles, range errors, duplicate definitions, and deterministic output.
5. Attempt an invalid hot reload and prove that the live registry and active session remain unchanged.

## 4. Physics, locomotion, and gameplay queries

> **Project connection — make authoritative movement and combat geometry real.** Add `shared/physics/` with a project-owned Jolt world and query facade; `shared/movement/CharacterMotor.*` with intent, fixed-tick resolution, grounded/slope/stair/ledge rules, and forced-motion composition; `shared/combat/SpatialQueries.*` for ray, sweep, and overlap contracts; plus `tests/movement/` and a `tools/traversal_map` or test-scene definition. The fixed tick created in Chapter 2 owns physics stepping. ECS transforms from Chapter 3 receive only the collision-resolved result; the renderer reads them afterward.
>
> **What this unlocks:** Chapter 5 can build dodge, block facing, melee traces, knockback, and target validity on one geometry contract; Chapter 14 can make nav steering request movement without teleporting; Chapter 15 can predict/reconcile the same motor. Before continuing, the character must traverse flat ground, ramps, stairs, ledges, corners, and narrow gaps at multiple render rates; query filters must exclude self/allies correctly; repeated attack IDs must not hit twice; and forced motion must stop or slide according to an explicit rule. Commit as `checkpoint/04-authoritative-movement`.
>
> **Starter hint:** begin with a capsule on a five-piece graybox traversal map and expose debug draw for contact normal, ground state, desired velocity, resolved displacement, and query shapes. Keep `IPhysicsQueries` small enough to fake in tests. Use the [Jolt samples/documentation](https://jrouwe.github.io/JoltPhysics/), [Jolt CharacterVirtual sample](https://github.com/jrouwe/JoltPhysics/tree/master/Samples/Tests/General), and [Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/). If movement differs by frame rate, find the variable delta that entered authoritative state.

### Physics is a service to gameplay rules

Jolt supplies collision shapes, broadphase/narrowphase detection, rigid bodies, character support, and scene queries. It does not decide what a dodge, melee attack, line of sight, walkable slope, or knockback means. Put a project-owned query facade between gameplay and middleware so tests can express intent and so physics implementation details do not leak through every system.

~~~cpp
struct QueryFilter {
    CollisionLayerMask layers;
    EntityId ignore;
    TeamId hostile_to;
};

std::optional<RayHit> raycast(Ray ray, QueryFilter filter);
std::optional<SweepHit> sweep(Shape shape, Transform from, Vec3 delta, QueryFilter filter);
std::vector<OverlapHit> overlap(Shape shape, Transform at, QueryFilter filter);
~~~

Use a raycast for an infinitesimal line, a sweep for a moving volume, and an overlap for everything already inside a volume. A melee weapon often needs a sequence of swept shapes between sampled attachment transforms, not one ray from the character origin.

Define collision layers early: static world, dynamic world, player body, enemy body, projectile, gameplay query, trigger, and presentation-only debris are typical starting categories. Write the permitted interaction matrix as data/tests rather than scattering filter conditionals.

### Character movement is intent plus resolution

Separate desired movement from collision-resolved movement:

1. Convert the sampled move action from camera space to a world-space planar direction.
2. Compute desired horizontal velocity using acceleration, maximum speed, and braking.
3. Apply vertical velocity, gravity, and authored forced motion.
4. Ask the character controller/physics world to resolve the displacement.
5. Derive grounded state, actual velocity, blocking contacts, and movement-facing rotation from the result.
6. Publish a movement result that combat, animation, networking, and presentation can inspect.

Do not set the final transform before collision resolution and then ask physics to catch up. Do not derive authoritative velocity from the rendered interpolated transform.

### Grounding, slopes, steps, and edges

Grounding is more than "a ray below the feet hit something." Define:

- maximum walkable slope from the contact normal;
- maximum step height and forward clearance;
- ground snap distance and when snapping is disabled;
- behavior at ledges, acute corners, and small gaps;
- moving-platform inheritance if platforms are supported;
- depenetration limits and recovery from invalid spawn positions.

Build a permanent traversal test map with flat ground, multiple slope angles, ascending/descending stairs, narrow ledges, corners, low ceilings, moving surfaces if supported, and intentionally bad spawn points. Run the same scripted path at several render rates.

### Forced movement and combat displacement

Knockback, lunges, root motion, dodge movement, pulls, and boss pushes must use the same collision-aware displacement contract as locomotion. Each source contributes an intent with priority, duration, and cancellation rules. The server resolves the final movement.

For a lunge, distinguish:

- authored displacement curve;
- facing direction selected at startup;
- maximum assist turn;
- collision-truncated distance;
- interrupt/cancel behavior;
- what the owning client predicts;
- how reconciliation corrects a blocked prediction.

If animation contains root motion, extract the authored delta, transform it to the chosen action direction, cap it, and pass it through the movement resolver. Animation cannot tunnel through a wall because the clip says the character moved three meters.

### Combat queries

Hit detection needs stable rules:

- create a unique attack instance ID;
- sample one or more trace shapes during active windows;
- remember which targets that attack instance already hit;
- filter owner, team, dead/invalid, invulnerable, and noncombat entities;
- resolve the hit on the authoritative server;
- attach contact point, normal, hit zone, attack tag, and tick to the event;
- make duplicate/replayed hit messages harmless.

Target selection and hit validation are separate. A soft target may help choose facing, but the attack still needs range, shape, timing, line-of-sight, and state validation.

### Physics exercises

1. Create a layer/filter matrix and write tests proving every allowed and forbidden pair.
2. Compare ray, overlap, and sweep results in the same scene. Explain why each is or is not suitable for a sword arc.
3. Traverse the permanent movement test map at 30, 60, and 144 render FPS using the same command script.
4. Drive a root-motion lunge into a wall and verify collision truncation on client prediction and server authority.
5. Trace the same enemy several times during one active window and prove damage is applied once unless the move explicitly supports multi-hit intervals.

## 5. Animation, targeting, combat state, and damage

> **Project connection — turn the moving graybox into the first complete, testable action-combat loop.** Add `shared/combat/` for target selection, action timelines, attack IDs, block/dodge state, hit ledger, damage pipeline, tags, statuses, and typed results; add `client/animation/` for ozz sampling/graphs and presentation events; add combat definitions under `assets/gameplay/`. Implement exactly one player kit first: camera-relative movement, soft target plus tab lock, a three-hit holdable basic chain, held block, perfect-block window, guard break, and two independently recharging dodge charges. Animation presents authoritative phases; it does not decide whether damage happened.
>
> **What this unlocks:** Chapter 6 can express abilities/equipment as data over a proven action/effect contract; Chapter 14 lets enemies issue the same action commands; Chapter 15 replicates attack IDs and confirmed results. Before continuing, a headless test and slow-motion rendered trace must agree on startup/active/recovery ticks; each attack-target pair hits at most once; dodge/block boundary ticks are tested; target loss and interruption have explicit outcomes; and the damage breakdown explains every modifier. Commit as `checkpoint/05-combat-vertical`.
>
> **Starter hint:** use cubes/capsules and one animation clip if necessary. First make `RequestAction -> ActionStarted -> ActiveWindow -> HitQuery -> DamageApplied -> ActionEnded` visible in a timeline inspector, then add presentation polish. Use [ozz-animation documentation](https://guillaumeblanc.github.io/ozz-animation/documentation/), [Jolt queries](https://jrouwe.github.io/JoltPhysics/), [Game Programming Patterns: State](https://gameprogrammingpatterns.com/state.html), and [Dear ImGui getting started](https://github.com/ocornut/imgui/wiki/Getting-Started). When a hit feels wrong, inspect action tick, query shape, facing decision, defense state, and damage stages in that order.

### Animation presents state; gameplay authorizes state

Ozz samples skeletons, blends poses, and supports runtime animation processing. Your project still owns the animation graph, action state, timing events, root-motion policy, and network representation.

The safe flow is:

~~~text
input command
  -> gameplay action request
  -> state/requirements validation
  -> authoritative action start at tick T
  -> animation state selected from action tag
  -> authored timing events open/close gameplay windows
  -> server performs traces and resolves effects
  -> client presents confirmation/correction
~~~

An animation event may say "the active window begins now," but it does not bypass the state machine. Events need stable IDs, normalized or tick-based timing, repeat/loop semantics, and deterministic handling when the render frame crosses several events at once.

Keep separate concepts for locomotion state, combat action state, upper/lower-body layers, additive reactions, and presentation transitions. A single enum containing every possible combination becomes unmaintainable.

### Target acquisition

Soft targeting chooses the nearest living hostile within the main weapon's selection range regardless of character facing. A robust candidate pipeline is:

1. Gather possible hostile candidates from a spatial query.
2. Reject dead, untargetable, out-of-range, hidden by required occlusion rules, or encounter-invalid candidates.
3. Score primarily by distance.
4. Use stable tie-breakers and a small hysteresis benefit for the current soft target to prevent flicker.
5. Return a target ID, not a direct pointer.

Tab lock copies the current valid target into explicit lock state. Camera control and locomotion remain independent. Release happens only under documented conditions: manual release, death/invalidation, or exceeding the chosen lock grace/range rule. If a target becomes invalid during an action, the action follows its authored fallback: continue directionally, cancel, retarget only if explicitly permitted, or resolve at the last valid position.

Target selection does not mean the attack hits. Hit validation remains a server-side collision/timing decision.

### Facing assistance

Facing assistance exists to make execution readable, not to surrender control. At action startup:

1. Choose the aim source: movement direction, current facing, reticle ray, soft target, or locked target according to the ability.
2. Compute desired yaw.
3. Clamp by maximum assist angle and maximum turn speed.
4. Apply assistance only during the authored startup interval.
5. Freeze or continue action-facing according to the move.

Log the chosen target, initial angle, applied angle, cap, and expiration tick. Without this instrumentation, "combat feels wrong" becomes difficult to diagnose.

### Combat state machine

Model action phases explicitly. A useful starting state set is:

~~~text
Locomotion
AttackStartup -> AttackActive -> AttackRecovery
BlockRaise -> Blocking -> GuardBreak
DodgeStartup -> Dodging -> DodgeRecovery
Stunned / KnockedDown / Dead
~~~

Transitions are authorized by conditions, not by UI buttons. For example, an attack request may require a valid current state, sufficient resource, available weapon action, no blocking status tag, and a legal sequence number. Spending the resource and entering startup should happen atomically.

Maintain a transition table containing:

- source states;
- request/event;
- guard conditions;
- resource transaction;
- destination state;
- emitted tags/events;
- cancellation and interruption rules;
- replicated compact action tag.

Write tests from this table. If a transition is not in the table, it is rejected.

### Three-hit basic chain

Each weapon family authors three steps with startup, active, recovery, buffer-open, continuation, movement commitment, facing assist, trace set, damage coefficient, and timeout.

For hold continuation:

- while the button is held, queue the next legal step only during the continuation window;
- for press buffering, store one bounded intent and consume it when the next step becomes legal;
- clear buffered intent on interruption, timeout, incompatible state, weapon change, or action completion;
- never allow a request to jump directly to step three;
- make the finisher stronger through authored data, not a special hard-coded branch.

Test early presses, late presses, continuous hold, release between steps, interruption in every phase, timeout, weapon swap, insufficient resource, and repeated network commands.

### Block and perfect block

Treat block raise, active block, and guard break as different states.

On raise:

- validate the action and facing requirements;
- spend the raise cost once;
- record the perfect-block interval;
- enter BlockRaise, then Blocking.

While blocking:

- drain stamina according to the authored rule;
- reject or reduce hits based on angle/type;
- if a hit lands inside the perfect interval, refund only the raise cost and trigger the punish opportunity;
- if stamina reaches zero, enter GuardBreak and prevent block until full recovery.

Do not refund the entire accumulated drain on perfect block. Do not let a client declare that a block was perfect. The server evaluates hit tick, facing, active interval, and resources.

### Dodge charges and invulnerability

Represent two independent charges with their own recharge completion ticks. Spending one charge starts its recharge immediately or at the authored boundary. A dodge has:

- direction source (the canonical baseline is current character facing);
- displacement curve and collision resolution;
- startup, invulnerability, and recovery intervals;
- cancellation/interruption rules;
- server-owned charge spend and invulnerability;
- predicted client presentation with correction.

Test spending both charges quickly, recharge ordering, a hit on each side of the invulnerability boundary, a wall-truncated dodge, duplicate requests, and reconciliation after the client predicted a dodge the server rejected.

### Damage pipeline

All attacks use one pipeline:

1. **Dodge:** reject the hit if authoritative invulnerability applies.
2. **Block:** determine block validity, perfect block, stamina cost, guard break, and remaining damage.
3. **Modifiers:** apply declared attacker/defender/global modifiers in a stable order with clamping and rounding rules.
4. **Shields:** consume matching shield layers according to priority and overflow policy.
5. **Health:** reduce health and determine death/downed transition.
6. **Post-hit effects:** lifesteal, on-hit, retaliation, status application, threat, combat log, and rewards, only if their trigger conditions were met.

~~~cpp
DamageResult resolve_damage(const DamageEvent& event, CombatState& target) {
    if (target.invulnerable_at(event.tick)) return DamageResult::dodged();

    auto block = resolve_block(event, target);
    if (block.perfect) emit(PerfectBlock{event.attack_id, target.id});

    auto value = apply_modifiers(block.remaining_damage, event, target);
    value = target.shields.absorb(value);
    const auto health_result = target.health.apply(value);
    apply_post_hit_effects(event, health_result, target);
    return make_result(block, health_result);
}
~~~

Specify numeric types, rounding stage, caps, zero/negative behavior, overflow protection, and deterministic modifier ordering. Golden tests should cover the same event across multiple attacker archetypes and prove identical ordering.

### Tags and statuses

Use a constrained hierarchical vocabulary such as:

~~~text
state.blocking
state.invulnerable
status.poison
status.crowd_control.stun
damage.physical
damage.fire
ability.melee
immunity.crowd_control
~~~

For every status define source, duration, tick policy, stacking/refresh rule, maximum stacks, exclusivity group, immunity interaction, cleanse category, dispel order, persistence behavior, and replication representation. Avoid one boolean component per status; that becomes unreviewable and makes interactions implicit.

### Combat exercises

1. Draw the complete transition table for locomotion, attack, block, dodge, stun, and death. Write a rejection test for every illegal transition.
2. Implement the three-hit chain from data and run a frame-by-frame overlay showing phase, buffer window, selected target, facing assistance, and traces.
3. Test perfect block on the tick before, at the start, at the end, and after the perfect interval. Verify the refund is the raise cost only.
4. Spend both dodge charges, resolve a hit at invulnerability boundaries, and verify independent recharge.
5. Build a golden damage fixture covering dodge, block, modifier order, multiple shield layers, health, death, lifesteal, and status application.
6. Simulate target death, despawn, range loss, and occlusion during startup/active/recovery and verify the authored invalidation policy.

## 6. Abilities, progression, loot, navigation, and encounters

> **Project connection — turn the hard-coded combat probe into a small replayable ARPG.** Extend `shared/abilities/` with immutable definitions, runtime instances, grants/loadouts, targeting policies, costs, cooldowns, and typed effects; add `shared/stats/`, `shared/items/`, `shared/progression/`, `shared/ai/`, and `shared/encounters/`; place validated definitions in `assets/gameplay/{abilities,items,enemies,encounters}/`. Build one complete class with a main weapon, borrowed sub-weapon skills, basic tree choices, item bases/affixes, three enemy roles, and one boss encounter. All of them must reuse Chapter 5's action, damage, tag, and status contracts.
>
> **What this unlocks:** Chapter 7 can assign authority and durable ownership to real gameplay transactions; Chapter 8 can display real party/combat/inventory state; Chapters 12-14 later harden the exact cross-system contracts. Before continuing, data validation must reject broken references and tag rules; loadout/equipment changes must rebuild derived stats deterministically; loot generated with a captured seed must reproduce; AI must request ordinary abilities rather than applying damage directly; and encounter reset/completion must be idempotent. Commit as `checkpoint/06-arpg-systems`.
>
> **Starter hint:** build one thin end-to-end path before breadth: one ability definition creates one effect, one enemy uses it, one boss grants one item, and equipping that item changes one stat. Only then add categories. Use [JSON for Modern C++](https://json.nlohmann.me/), [Game Programming Patterns](https://gameprogrammingpatterns.com/), [Recast Navigation](https://recastnav.com/), the free [Game AI Pro books](https://www.gameaipro.com/), and the [behavior-tree survey](https://arxiv.org/abs/2005.05842). If systems disagree, print stable definition ID, runtime instance ID, owner, source, target, operation ID, and tick at each boundary.

### Ability architecture

An ability definition describes requirements and effects; the authoritative executor owns state changes. Keep these concerns separate:

- **definition:** stable ID, tags, slot category, targeting policy, costs, cooldown, timing, animation/action tag, effect list;
- **loadout binding:** which learned/granted ability occupies a legal slot;
- **runtime instance/state:** current cooldown, charges, rank, modifiers, and owner;
- **execution:** validate request, reserve/spend resources, start action, resolve effects, commit cooldown, emit events.

The 2 main / 2 sub / 4 class / 1 ultimate layout is a presentation of loadout categories. Validation belongs in the loadout/ability domain, not in button widgets.

Treat every request as untrusted:

~~~text
request ability X
 -> known and granted?
 -> legal slot/loadout?
 -> current state permits it?
 -> target/direction valid?
 -> resource and charge available?
 -> cooldown complete on server clock?
 -> sequence/replay valid?
 -> atomically start action and commit required costs
~~~

### Hybrid class progression

The progression goal is strong class identity plus meaningful specialization. Use a modest initial tree whose nodes grant one of:

- an active ability;
- a passive stat rule;
- a modifier to a named ability/tag;
- a conditional interaction;
- a build-defining conversion with an explicit downside.

Avoid hundreds of tiny percentage nodes before the underlying combat has enough variety to support them. Every node needs prerequisites, rank limits, respec behavior, save representation, validation, and UI explanation. A build validator must reject cycles, impossible point totals, unknown nodes, and mutually exclusive selections.

Keep base class rules, learned abilities, equipment grants, and temporary status grants separate. This prevents an item removal from accidentally deleting a permanently learned skill.

### Items, affixes, and personal loot

Separate the content layers:

- **item base:** type, slot, required level, base stats, tags, visual/audio references;
- **rarity rule:** number/quality budget for affixes;
- **affix definition:** eligible item tags, tier ranges, weights, stat/effect modifier;
- **rolled item instance:** persistent ID, base ID, rolled affix IDs/values, owner, creation version;
- **loot table:** candidates, weights, conditions, quantities, pity/guarantee rules if any.

The server creates the item instance. The client may display an anticipated pickup, but it does not choose the roll or owner.

Use deterministic seeds in tests and unpredictable server-controlled entropy in production. A deterministic test should be able to reproduce a failed distribution or duplicate request. The production seed must not be chosen by the looting client.

Personal loot flow:

1. Enemy death is finalized once.
2. Server evaluates each eligible player's reward context.
3. Server rolls separate owned drops or a documented shared rule.
4. Spawned pickup includes an authoritative item instance ID and visibility/ownership policy.
5. Pickup request validates owner, distance, state, inventory capacity, and transaction ID.
6. Inventory write and world removal commit atomically.
7. Duplicate or replayed pickup returns the prior result or a harmless rejection.
8. Durable progression/save is checkpointed according to policy.

Test disconnect before pickup, reconnect, full inventory, simultaneous pickup, duplicate request, server retry, item save, old content version, and two players receiving different drops from the same boss.

### Navigation is not intelligence

Recast builds a navigation mesh from geometry. Detour performs path queries and related runtime navigation. Neither library decides whom an enemy should attack or when a boss changes phase.

Use navigation in layers:

- navmesh generation and validation;
- nearest-poly projection and path queries;
- corridor following and local steering;
- crowd/avoidance only where its behavior fits;
- gameplay constraints such as leash, forbidden areas, jump links, doors, and encounter bounds.

Build visual diagnostics for mesh tiles, polygons, path corridor, steering target, failed query reason, and off-mesh links. Test start/end points outside the mesh, dynamic obstacles, invalidated tiles, narrow passages, large-agent radius, and unreachable targets.

### Perception, threat, and behavior

Perception should produce explicit observations from server state: visible hostile, heard event, recent damage source, ally needing support, objective state. Threat then ranks eligible targets using declared contributions such as damage, healing, protection, taunt, proximity, and scripted encounter modifiers.

Tanks need control tools, not only high health. A taunt may set or raise threat for a duration, but scripted boss mechanics may temporarily override normal threat. Write this as a policy and show it in a debug table.

Separate **decision** from **action execution**. A behavior tree, hierarchical state machine, or utility scorer can request "use ability X on target Y," but the same ability executor used by players validates and runs it. AI must not bypass resource, cooldown, range, state, or damage rules.

Every behavior action returns a meaningful result: running, succeeded, failed because target invalid, failed because path unavailable, failed because ability rejected, or interrupted. Recovery behavior needs to handle each result.

### Encounter and boss orchestration

An encounter owns bounds, participants, spawn groups, objectives, reset/leash policy, phase state, reward eligibility, and cleanup. Enemy entities own their ordinary combat state; the encounter coordinates rules that span several entities.

Boss phases should be data/state transitions driven by explicit conditions. Telegraphs need lead time, geometry, priority, color-independent cues, cancellation policy, and server timing. A phase transition must clean up old hazards and prevent duplicate rewards.

Scale from one to eight players using authored policies, not only multiplied health. Consider:

- health/damage curves with caps;
- additional target selection and mechanic coverage;
- spawn counts bounded by server and readability budgets;
- threat and support behavior;
- personal loot and reward eligibility;
- revive/downed pressure;
- anti-kiting/leash rules;
- critical telegraph visibility under maximum effect density.

### Progression/AI exercises

1. Implement an ability request validator and test every rejection reason, including replayed sequence numbers.
2. Build a small progression tree with active, passive, conditional, and mutually exclusive nodes. Round-trip, respec, and migrate it.
3. Roll 100,000 deterministic loot trials and verify weights/tier bounds, then test transactional personal pickup with two players.
4. Generate and inspect a navmesh test level with unreachable islands, narrow doors, dynamic obstacles, and off-mesh links.
5. Display a live threat table and exercise damage, healing, taunt, scripted override, target death, and leash reset.
6. Build three enemies and one boss using the same ability/combat contracts as the player. Verify no AI action bypasses validation.

## 7. Dedicated networking, authority, and persistence

> **Project connection — move the Chapter 6 ARPG behind a real dedicated-server authority boundary.** Create `server/session/`, `server/simulation/`, and `server/persistence/`; create `shared/net/protocol/` with explicit versioned messages and limits; create `client/net/` with command history, prediction, reconciliation, interpolation, and reconnect state. The server loads character state, owns the ECS/physics/combat/AI/loot truth, validates commands, commits durable changes, and emits replication views. The client sends intent and presents predicted/confirmed results; it never authors health, item, XP, cooldown, or encounter truth.
>
> **What this unlocks:** Chapter 8 can build party UX and accessibility against honest distributed state; Chapter 9 can test, package, observe, and release the actual topology; Chapter 15 later completes per-system replication. Before continuing, two separate clients must finish the graybox slice through a localhost dedicated server under simulated latency/jitter/loss; reconnect must restore a coherent baseline; duplicate pickup/save requests must be harmless; malformed/oversized messages must be rejected; and an old/corrupt save fixture must fail or migrate without partial mutation. Commit as `checkpoint/07-two-player-authority`.
>
> **Starter hint:** network only movement first, then action start/result, then owner-only inventory. Put a sequence, server tick, protocol version, and bounded length on messages before adding payload breadth. Use [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets), [Gaffer on Games: Networked Physics](https://gafferongames.com/categories/networked-physics/), [Snapshot Interpolation](https://gafferongames.com/post/snapshot_interpolation/), and [libFuzzer](https://llvm.org/docs/LibFuzzer.html). When desync appears, compare command sequence, simulated tick, state checksum, acknowledgment, and correction—not rendered position.

### Start with one truth

The dedicated server is the authority for gameplay. Solo mode launches or connects to a localhost server; it does not use a separate single-player rules path. This avoids the most expensive architectural mistake in the original roadmap: building a client-owned game and attempting to convert it later.

Keep transport, protocol, simulation, and persistence separate:

- **transport** sends reliable/unreliable messages and reports connection/network statistics;
- **protocol** defines versioned message types, serialization, size limits, sequences, and compatibility;
- **simulation** validates commands and advances authoritative state at fixed ticks;
- **persistence** commits durable player-owned results and migrations.

GameNetworkingSockets solves transport concerns. It does not decide your command schema, combat validation, snapshot layout, reconnection policy, item transaction, or save format.

### Connection and session flow

A platform-neutral flow should exist before Steam integration:

1. Discover or create a session.
2. Join the party roster and negotiate protocol/content/build compatibility.
3. Receive server assignment and connection parameters.
4. Establish the transport connection.
5. Authenticate the player/session identity when platform support is active.
6. Complete a handshake containing protocol version, content manifest hash, requested character, and capabilities.
7. Receive an initial authoritative checkpoint.
8. Begin tick-numbered command and snapshot exchange.
9. On disconnect, preserve a bounded reconnect slot and resume from a new checkpoint plus subsequent state.

Lobby metadata is discovery/assembly data, not trusted gameplay state. Never accept a lobby field as proof of inventory, progression, character stats, or server authority.

### Input-command protocol

Clients send compact intent:

~~~cpp
struct InputCommand {
    std::uint32_t sequence;
    Tick client_tick;
    Vec2 move;
    Angle aim;
    ActionBits pressed;
    ActionBits held;
};
~~~

The server maps commands to its tick timeline, rejects duplicates/old/future-out-of-window data, rate-limits abuse, and validates every requested action against authoritative state. Include enough history for loss recovery without letting a client rewrite old outcomes.

The owning client stores predicted states keyed by command sequence. When snapshot acknowledgment arrives:

1. Find the predicted state corresponding to the acknowledged command.
2. Compare authoritative and predicted position/velocity/action state.
3. If within tolerance, discard acknowledged history.
4. If outside tolerance, restore the authoritative state and replay unacknowledged commands.
5. Present small corrections smoothly; snap or use a clear recovery policy for large/invalid states.

Prediction does not grant authority. It makes local presentation responsive while the server remains final.

### Snapshot interpolation

Remote entities are rendered from a time-delayed buffer of authoritative snapshots. If snapshots arrive at 20 Hz, their nominal spacing is 50 ms, but jitter means a practical buffer needs more than one interval. Choose buffer depth from measured arrival variance.

For each entity, store time/tick, position, rotation, velocity if used, compact action tag, and relevant presentation state. Render between the two snapshots surrounding the interpolation time. Extrapolate only for a short bounded window; then hold or degrade visibly rather than inventing long authoritative motion.

Handle spawn/despawn and teleports explicitly. Interpolating from an old life to a newly reused entity ID or across a portal produces severe artifacts; generation/version identity prevents this.

### Replication tiers and interest management

Eight-player combat cannot broadcast every field of every entity at the same rate. Build a per-client relevance and priority system.

Possible tiers:

- owning player and immediately engaged actors: high-frequency state;
- nearby party, enemies, projectiles, hazards, and critical boss mechanics: medium/high frequency based on importance;
- distant but relevant party/objective state: lower frequency;
- static/rare durable changes: reliable event or baseline state;
- irrelevant entities: no state until they enter interest.

Priority inputs include distance, visibility, engagement, threat, damage relevance, ownership, boss/telegraph criticality, age since last update, and estimated encoding cost. Apply starvation protection so a low-priority entity eventually updates.

Measure bits/bytes per message type, updates per second, entities per tier, dropped/deferred updates, packet loss, resend, and snapshot age. "It seems fine on localhost" is not a bandwidth test.

### Reliable versus unreliable data

Use reliable ordered delivery for state that must arrive exactly and in order, such as handshake, inventory transaction result, party membership, durable reward confirmation, and checkpoint metadata. Use unreliable/sequenced delivery for frequent state where a newer update supersedes an older one, such as snapshots and aim state.

Do not make every message reliable. A lost old snapshot should not block newer snapshots behind retransmission. Do not make durable inventory changes unreliable. Classify each message by consequence of loss, duplication, reordering, and lateness.

Every durable request needs an idempotency/operation ID. The server records or derives the result so retrying after a timeout does not grant an item twice or spend a resource twice.

### Security boundary

Treat all client input as hostile or faulty. Validate:

- message type, length, version, and decode result before allocation/use;
- sequence, tick window, rate, and connection/session ownership;
- entity and item ownership;
- action state, cooldown, resource, target, distance, collision, and line-of-sight;
- inventory capacity and transaction uniqueness;
- string/path lengths and enum ranges;
- decompression and collection limits;
- reconnect/session ticket validity.

The client can lie about input but cannot choose the result. Never expose server secrets in a client package. Avoid logging credentials or unnecessary personal data. Use Steam authentication/session tickets and SDR where appropriate, but keep the game-level validator independent of Steam.

### Save and persistence architecture

Separate these domains:

- **account/platform identity**;
- **character progression**: level, learned nodes, stats, quests/unlocks as scoped;
- **owned item instances** and inventories/stash;
- **session checkpoint** used for reconnect or run recovery;
- **device preferences** that should not become server authority.

Every save has a format version and content/build context. Use write-to-temp, flush, checksum/validation, and atomic replacement for local files. A persistence service/database should use transactions for related inventory/progression changes.

Migrations are explicit functions from one version to the next:

~~~cpp
SaveV4 migrate_v3_to_v4(const SaveV3& old) {
    SaveV4 next;
    next.character = migrate_character(old.character);
    next.inventory = migrate_inventory(old.items);
    next.schema_version = 4;
    return next;
}
~~~

Never edit old migration behavior after release unless you also change how already migrated data is recognized. Keep golden old-save fixtures. If content IDs disappear, map, refund, quarantine, or reject them through a documented policy.

Cloud synchronization needs conflict handling. Do not sync machine-specific graphics settings as character progression. Do not assume latest timestamp is always correct when clocks or offline play can diverge. Prefer server-owned progression for online-earned durable state and a clear conflict UI/policy for local files.

### Reconnect and version compatibility

On disconnect, retain authoritative player/session state for a bounded grace period. A reconnect handshake should prove identity, negotiate compatible versions, invalidate the old connection, and send a fresh baseline. Do not rely on replaying an unbounded event history.

Define a compatibility matrix:

- same protocol/content version: normal join;
- compatible minor protocol: join through explicit optional fields/features;
- incompatible protocol or authoritative content: reject with a useful update message;
- newer save format on older build: reject safely, never destructively downgrade;
- older save on newer build: migrate through tested steps.

During patch rollout, server/client version skew must be deliberate. Steam branch and depot promotion should preserve the known compatible client/server pair.

### Networking exercises

1. Run a headless server and two clients using a platform-neutral local session browser.
2. Add latency, jitter, 5% loss, duplication, and reordering. Record movement reconciliation and remote interpolation behavior.
3. Send duplicate and out-of-order input commands; verify state changes once and sequences advance correctly.
4. Budget a worst-case boss fight with eight players, enemies, projectiles, hazards, party state, and loot. Show updates deferred by priority without losing critical telegraphs.
5. Disconnect during combat, during loot creation, and during pickup; reconnect and verify no duplicate reward or lost durable result.
6. Fuzz message decoders and save loaders with size limits under ASan/UBSan.
7. Migrate several historical save fixtures and prove a failed/interrupted migration preserves the old file.

## 8. Party UX, readability, accessibility, and performance

> **Project connection — make the authoritative multiplayer slice understandable and usable by one to eight real players.** Add `client/ui/` with an RmlUi data facade for party roster, player status, target, abilities, resources, combat results, inventory, settings, reconnect, and errors; keep `client/debug/` in Dear ImGui. Add scalable UI, complete controller navigation/remapping/glyphs, reduced-effects and readability settings, non-color cues, party pings, ally frames, downed/revive flow, and effect/telegraph priority. UI reads replicated/presentation models and sends commands; it never mutates authoritative gameplay directly.
>
> **What this unlocks:** Chapter 9 can run accessibility, soak, performance, and release acceptance on a user-facing build rather than a debug prototype; the final Steam build has controller-complete menus and truthful failure states. Before continuing, 1/2/4/6/8-player scenarios must keep lethal telegraphs, local feedback, target state, and party emergencies legible; every required flow must work without a mouse; text/UI scale must not clip; network rejection/reconnect errors must be actionable; and measured client frame, server tick, nav/AI, memory, and bandwidth budgets must be recorded. Commit as `checkpoint/08-player-experience`.
>
> **Starter hint:** implement a read-only `UiModel` snapshot and explicit `UiCommand` queue before styling screens. Test at 1280x720 and high scale early. Use the [RmlUi C++ manual](https://mikke89.github.io/RmlUiDoc/pages/cpp_manual.html), [Steam Input documentation](https://partner.steamgames.com/doc/features/steam_controller), [Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/gaming/accessibility/guidelines), and [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/). When eight-player combat becomes unreadable, rank effects by gameplay consequence and ownership before reducing everything equally.

### Production UI versus developer UI

Use RmlUi for player-facing menus and HUD and Dear ImGui for internal inspection. They solve different problems.

Production UI consumes a presentation model. It should not query arbitrary ECS components or mutate server state directly. A view-model/facade exposes stable, localized values and emits typed requests.

~~~text
authoritative/client state
 -> presentation model
 -> RmlUi document and styles
 -> typed user action
 -> client command/request
 -> server validation
~~~

Developer UI can reveal entity IDs, tags, threat, nav paths, packets, timings, and raw values. It must be easy to disable from shipping builds or secure appropriately; it is not a substitute for player-facing explanation.

### Eight-player information hierarchy

An eight-slot roster should communicate only what the group needs immediately:

- identity and role-leaning icon;
- health/shield and downed/dead state;
- distance/off-screen direction where relevant;
- major defensive or cleanse-critical status;
- revive interaction/progress;
- leader, ready, loading, disconnected, or reconnecting state.

Avoid showing every buff, cooldown, resource, and item at all times. Provide expanded detail on demand. Role indicators describe build intent; they should not hard-lock composition unless that becomes an explicit game rule.

Pings and quick communication need cooldown/spam handling, readable world/HUD pairing, controller access, color-independent symbols, and an optional reduced-noise policy.

### Revive and support clarity

The server owns downed, revive eligibility, interaction progress, interruption, completion, and any limits. The UI predicts/progresses presentation but corrects to authority.

Support targeting needs a defined fallback. A smart heal might prefer the aimed/locked ally, then the lowest valid ally within a cone/range, but that policy must be visible and testable. Do not silently redirect a critical skill to an unexpected target.

Test eight simultaneous status combinations, multiple downed allies, off-screen direction, interrupted revive, reviver disconnect, target death, and network correction.

### Combat readability budget

Render priority should follow gameplay consequence:

1. lethal hostile telegraph and local danger;
2. boss phase/break/interrupt/taunt information;
3. local player's attacks, confirmations, and resource consequences;
4. required ally support/revive/cleanse information;
5. other allied attacks and decorative effects;
6. ambient decoration.

Classify effects as mine, party-critical, hostile-critical, ordinary ally, or ambient. Provide intensity and count budgets per class. Culling an effect must never erase the only representation of a mechanic.

Worst-case readability testing is a designed scenario, not an accidental late playtest. Spawn the maximum intended party, enemies, projectiles, ground hazards, damage numbers, shields, statuses, and boss mechanics. Capture normal and reduced-effects modes with color filters and camera shake disabled.

### Input and accessibility

Action-based input allows parity across keyboard/mouse and controller. Every screen must support focus navigation, activation, cancel/back, scrolling, tabs, sliders, remapping, and conflict resolution without a mouse.

At minimum provide:

- remapping and alternate bindings;
- deadzone and sensitivity settings;
- controller disconnect recovery and stable glyph switching;
- subtitle/caption controls where dialogue or nonvisual cues matter;
- text and UI scale;
- safe-area handling;
- reduced camera shake, motion, flashes, and effect opacity/density;
- color-safe icon/shape/text redundancy;
- long-string and pseudo-localization testing;
- no required rapid repeat, hold, or simultaneous input without a configurable alternative where feasible.

Accessibility is not a final polish pass. Each new mechanic must define how it is perceived, controlled, and configured.

### Performance budgets

Budget both client frame and server tick.

At 30 Hz, a server tick has 33.3 ms absolute duration, but target substantially less under normal load to retain spike headroom. Break down simulation, physics, AI, navigation, combat, replication, persistence queues, and logging.

On the client, measure CPU frame, render submission, GPU passes, skinning/animation, UI layout, VFX, streaming, and memory. Use percentiles and worst-case captures, not only averages.

Track:

- server tick p50/p95/p99 and worst sustained interval;
- client CPU/GPU frame p50/p95/p99;
- allocations and memory growth over long sessions;
- entity, AI, nav-query, projectile, and effect counts;
- per-client and total bandwidth by message type;
- snapshot age, loss, correction magnitude, and interpolation underruns;
- UI draw/layout counts and worst screen;
- asset load/stream stalls.

Fix measured bottlenecks. Do not pre-emptively replace clear code with complex optimization based on intuition.

### UX/performance exercises

1. Navigate every production screen using keyboard only and controller only.
2. Render one, four, and eight party frames at several resolutions and long-string locales.
3. Execute simultaneous downed/revive/support scenarios under packet loss.
4. Capture a worst-case combat frame in RenderDoc and a server/client trace in Tracy. Identify the largest real cost before changing code.
5. Repeat the stress scene using reduced effects, color filters, larger UI/text, no camera shake, and controller input. Verify critical mechanics remain understandable.

## 9. Testing, observability, Steam, and Early Access operations

> **Project connection — convert the playable build into a supportable release candidate.** Expand `tests/` into unit, deterministic simulation, protocol/parser, migration, integration, multi-client, load, soak, and packaging lanes; add `shared/telemetry/` plus client/server crash context; add `platform/steam/` behind an adapter; create client/server packaging scripts, depots/branches documentation, compatibility policy, rollback runbook, support template, privacy statement, known-issues list, and store-claim evidence under `docs/release/`. Release promotion must use the same tested artifacts, not an IDE rebuild.
>
> **What this unlocks:** Chapters 10-16 provide the final system-by-system integration audit and ordered vertical-slice gates; after those pass, this chapter's pipeline is what actually ships and patches the game. Before moving on, CI must build supported client/server targets, run sanitizer and migration fixtures, fuzz parsers, package staged installs, and retain symbols; a two-hour multi-client soak must stay within documented budgets; a crash must be diagnosable from build ID/logs/symbols; patch and rollback rehearsals must succeed; and every public Steam/Early Access claim must map to a tested current capability. Commit as `checkpoint/09-release-pipeline`.
>
> **Starter hint:** treat build ID, protocol version, content hash, and save version as one compatibility record printed at startup and included in every crash report. Start with [CTest](https://cmake.org/cmake/help/latest/manual/ctest.1.html), [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html), [ThreadSanitizer](https://clang.llvm.org/docs/ThreadSanitizer.html), [Tracy](https://github.com/wolfpld/tracy), [RenderDoc](https://renderdoc.org/), [Crashpad](https://chromium.googlesource.com/crashpad/crashpad/), [SteamPipe/uploading](https://partner.steamgames.com/doc/sdk/uploading), and [Steam Early Access rules](https://partner.steamgames.com/doc/store/earlyaccess). If a test is flaky, capture seed, tick, network-fault preset, build ID, and artifact before rerunning.

### Test in layers

Use the cheapest layer that can prove the rule:

- **unit tests:** formulas, tag/status stacking, state transitions, serialization helpers, validation;
- **headless simulation tests:** movement, combat timelines, AI decisions, loot transactions, save/checkpoint behavior;
- **integration tests:** physics queries, content registry, network protocol, persistence repository, Steam adapter boundary;
- **network scenario tests:** two/eight clients, latency/loss, reconnect, late join, duplication, compatibility;
- **render/UI smoke tests:** startup, representative frames, resolution/input/accessibility paths;
- **package/end-to-end tests:** install client/server artifacts, boot, connect, complete a run, save, restart, reconnect.

Tests should be deterministic where the rule is deterministic. Store random seeds and fixture versions. A flaky test is either fixed, quarantined with ownership/deadline, or removed if it proves nothing; it is not accepted as normal.

### Sanitizers, static analysis, and fuzzing

Run fast tests on every change. Use ASan/UBSan regularly, TSan in a targeted or scheduled lane, and static analysis with reviewed rules. Fuzz parsers and decoders that cross trust boundaries: content, saves, network messages, compressed data, and imported metadata.

A fuzz target needs input-size limits, a seed corpus, stable crash reproduction, and a process for turning each unique crash into a regression test. "The fuzzer ran" is not evidence if results are ignored.

### Logs, crashes, metrics, and traces

Design observability around questions you will need to answer:

- Which build, protocol, content, and save version failed?
- Which session, connection, player, entity, action, and tick were involved?
- What command was accepted or rejected, and why?
- Was the server late, the snapshot missing, or the client correction large?
- Did an inventory/save transaction commit once?
- What changed immediately before a crash?

Use structured logs and bounded buffers. Redact tickets, credentials, personal paths, chat, and unnecessary identifiers. Crash reports need symbols and build IDs. Metrics should be minimal, documented, consent-aware where appropriate, and useful to operations rather than collected because they are available.

Rehearse the path from a deliberate crash to a symbolized report, relevant logs/trace, local reproduction, regression test, fixed build, and promoted patch.

### Steam integration boundary

Keep Steam behind project-owned interfaces for identity, lobby/session discovery, server registration, relay/connectivity, achievements/stats, Cloud, Input, and build environment. The simulation should run in local development without Steam.

Study Spacewar and official examples, but do not copy their architecture blindly. A lobby assembles players and metadata; the dedicated server remains authoritative. Session tickets prove Steam identity/ownership within their documented scope; game rules still validate commands.

Plan separate client and dedicated-server packages/depots. Keep upload scripts, depot mapping, branch policy, version compatibility, and promotion steps in source control without credentials. Promote an immutable tested artifact instead of rebuilding differently for each branch.

### Cloud, stats, and achievements

Use Steam Cloud only for files whose ownership and conflict policy are understood. Keep machine-specific graphics settings separate. For server-owned progression, Cloud is not a substitute for authoritative persistence.

Achievements and stats observe or reflect authoritative game events. A client-side unlock presentation must not grant progression or rewards. Define IDs early enough to avoid accidental renaming after release, but keep the first set small and meaningful.

### Early Access is a release state, not a funding promise

The candidate must already be playable and worth using in its current state. Store copy, screenshots, trailers, and FAQ must distinguish:

- what is playable now;
- what is experimental now;
- known limitations and save/compatibility risks;
- what is being considered but not promised;
- how updates, feedback, support, and pricing are expected to work without guaranteeing uncertain future dates/features.

Map every store claim to a build and evidence. If the build does not support the claim, remove or qualify the claim.

Operational readiness includes:

- staged branch/depot install and boot rehearsal;
- separate dedicated-server package and deployment instructions;
- Coming Soon and review timing checked against current Steam rules;
- crash/log/support intake and severity policy;
- known-issues and patch-note templates;
- server/client protocol and save compatibility policy;
- emergency rollback and forward-fix decision process;
- moderation/community responsibility within actual team capacity;
- first-patch and data-migration rehearsal.

### Release exercises

1. Make each CI lane catch an intentional failure, then remove the fault and retain the regression test.
2. Fuzz save, content, and packet parsers under sanitizers; minimize and fix at least one seeded defect.
3. Run a two-hour stress soak and an overnight headless soak while tracking memory, tick/frame time, reconnects, rewards, and saves.
4. Package client and server from CI artifacts, install them into clean locations, and complete a smoke session.
5. Trigger a deliberate crash and execute the full symbolized triage workflow.
6. Write an Early Access store draft and delete every claim that cannot be demonstrated in the current candidate.
7. Tabletop a corrupt save, server crash during reward commit, incompatible client patch, and emergency rollback.

## 10. Assemble the runtime as one system

> **Project connection — audit the repository before adding more features.** Produce `docs/architecture/target-graph.md`, `composition-roots.md`, `server-tick.md`, `entity-lifecycle.md`, and `ownership-matrix.md` from the real code. Refactor until the CMake dependency graph, service construction/destruction, tick phases, commands/events, and entity teardown match those documents. Add a headless integration test that boots the composition root, runs a scripted player/enemy/action flow, destroys the entities, and shuts down with no leaked services or stale handles.
>
> **Required exit evidence:** the server target has no client/presentation dependency; client and server share domain rules without sharing platform ownership; every mutable system has one owner and tick phase; every cross-system request/result is traceable; and startup failure unwinds safely. Commit the diagrams plus test as `checkpoint/10-runtime-assembly`. This checkpoint prevents Chapters 11-15 from creating circular dependencies that make the game impossible to network, test, or patch.
>
> **If stuck:** begin at `main()` for client and server, draw every constructed service and arrow, then trace one tick and one entity from spawn through destruction. Delete arrows you cannot justify. Use [Game Programming Patterns](https://gameprogrammingpatterns.com/), the free [Data-Oriented Design book](https://www.dataorienteddesign.com/dodbook/), [CMake target guidance](https://cmake.org/cmake/help/latest/guide/tutorial/), and [Tracy](https://github.com/wolfpld/tracy) to confirm dependency and execution boundaries.

This chapter connects the earlier subjects into one permanent architecture. The goal is not to create every feature at once. The goal is to establish dependency direction, ownership, update order, and data flow so later systems can be added without bypassing authority or creating circular coupling.

### 10.1 Permanent target boundaries

Use at least these CMake targets:

~~~text
actiondev_protocol       IDs, message schemas, serialization, version negotiation
actiondev_simulation     fixed-step state, combat, abilities, AI-facing action API
actiondev_content        authored definitions, validation, registries, migrations
actiondev_persistence    save/checkpoint interfaces and implementations
actiondev_client         SDL, input, prediction, presentation, renderer, audio, UI
actiondev_server         connections, authoritative session, simulation, persistence
actiondev_tools          validators, asset/content build, replay/inspection utilities
actiondev_tests          unit, simulation, integration, network, migration fixtures
~~~

The important rule is dependency direction:

~~~mermaid
flowchart TD
  Protocol["protocol"] --> Client["client"]
  Protocol --> Server["server"]
  Content["content"] --> Simulation["simulation"]
  Protocol --> Simulation
  Simulation --> Client
  Simulation --> Server
  Persistence["persistence"] --> Server
  Content --> Client
  Content --> Server
  Tools["tools"] --> Content
  Simulation --> Tests["tests"]
  Content --> Tests
  Protocol --> Tests
  Persistence --> Tests
~~~

Simulation never includes SDL, bgfx, RmlUi, Steam, or client audio/VFX. Protocol never includes renderer or entity-registry types. Content definitions may describe presentation references, but resolving a texture or sound belongs to the client.

Do not create a single `GameManager` that owns everything. Compose explicit services in the client and server entry points. Each service should expose a narrow interface and have a clear shutdown order.

### 10.2 Runtime composition roots

The composition root is the only place that constructs concrete infrastructure and wires it to domain systems.

~~~cpp
int run_server(const ServerConfig& config) {
    ContentRegistry content = load_validated_content(config.content_path);
    SqliteCharacterRepository characters{config.database_path};
    GNSListener listener{config.listen_address};
    ServerClock clock;

    GameSession session{
        content,
        characters,
        listener,
        clock,
        config.simulation
    };

    return session.run();
}
~~~

`GameSession` receives interfaces or references to services it needs. A combat system does not construct a database. An inventory transaction does not look up a global network singleton. This makes the headless simulation testable with in-memory repositories and fake transports.

The client composition root builds a platform layer, content registry, connection, prediction history, presentation world, renderer, audio system, and UI facade. The client may run against localhost or a remote server without changing gameplay rules.

### 10.3 Authoritative tick phases

Choose and document one stable update order. A practical starting order is:

1. Drain decoded network messages into bounded per-connection queues.
2. Authenticate/validate command headers, sequence numbers, and tick windows.
3. Convert accepted input into domain commands for this tick.
4. Update session/party transitions that must occur before simulation.
5. Update action-state timers and accept/reject new action requests.
6. Resolve movement intent and physics movement.
7. Update animation-derived authoritative timing windows.
8. Perform combat traces, projectiles, hazards, and effect resolution.
9. Update statuses, resources, cooldowns, death/downed/revive, and threat.
10. Update perception, AI decisions, navigation requests, and encounter orchestration.
11. Finalize loot, rewards, inventory transactions, and checkpoint requests.
12. Destroy/spawn entities at controlled lifecycle barriers.
13. Build per-client replication views and outgoing events/snapshots.
14. Commit queued persistence work that must be durable at this boundary.
15. Record metrics, trace markers, hashes, and optional replay data.

This order is not arbitrary. Movement must resolve before melee traces use world positions. Damage must resolve before death rewards. Entity destruction must wait until systems finish iterating. Replication must observe the finalized tick rather than a half-mutated state.

Write this order as code, not comments spread across systems:

~~~cpp
void GameSession::tick() {
    ZoneScopedN("GameSession::tick");
    commands_.begin_tick(tick_);
    network_input_.collect(tick_, commands_);
    action_system_.update(world_, commands_, tick_);
    movement_system_.update(world_, physics_, tick_);
    combat_system_.update(world_, physics_, events_, tick_);
    status_system_.update(world_, events_, tick_);
    ai_system_.update(world_, nav_, commands_, tick_);
    encounter_system_.update(world_, events_, commands_, tick_);
    reward_system_.update(world_, events_, transactions_, tick_);
    lifecycle_.commit(world_, events_);
    replication_.publish(world_, events_, tick_);
    persistence_.commit_ready(transactions_, tick_);
    ++tick_;
}
~~~

### 10.4 Commands, events, and direct calls

Use three communication styles deliberately:

- A **direct call** is appropriate when one system synchronously asks a service for a result, such as a physics sweep or registry lookup.
- A **command** requests a future or validated state change: move, use ability, equip item, revive player, spawn encounter.
- An **event** records something that already happened: damage applied, entity died, item created, player downed, phase changed.

Do not turn all communication into events. Hidden chains of listeners make ordering and ownership impossible to reason about. Critical transactions should have an explicit orchestrator.

~~~cpp
using GameCommand = std::variant<
    MoveCommand,
    UseAbilityCommand,
    EquipItemCommand,
    ReviveCommand
>;

using GameEvent = std::variant<
    ActionStarted,
    DamageApplied,
    StatusChanged,
    EntityDied,
    LootCreated
>;
~~~

Commands include requester identity and operation/sequence context. Events include authoritative tick and stable involved IDs. Presentation consumes events, but it never changes the result represented by them.

### 10.5 Entity lifecycle

Entity creation should be centralized around validated spawn descriptions. A spawn builds required components, registers network/persistent identity where applicable, and emits one authoritative spawn event. Destruction is requested during the tick and committed at a lifecycle barrier.

~~~cpp
struct SpawnEnemy {
    ContentId archetype;
    EncounterId encounter;
    Transform transform;
    std::optional<NetworkId> network_id;
};
~~~

On destruction:

1. mark the entity pending-destroy;
2. prevent new commands from targeting it;
3. let required death/reward events finish;
4. remove spatial/nav/physics/network registrations;
5. invalidate relationships and handles;
6. destroy ECS components;
7. retain tombstone/sequence information long enough to reject late packets.

Never destroy an entity immediately from inside a system iteration unless the entire iteration model explicitly supports it.

### 10.6 Whole-system ownership matrix

| System | Owns | Reads | Emits/calls | Never owns |
|---|---|---|---|---|
| Input | device state, action mapping | SDL events | tick commands | combat results |
| Movement | intent, resolved locomotion state | actions, physics, statuses | transform/velocity events | camera or animation pose |
| Action state | legal transitions and phase timing | commands, resources, definitions | action tags/windows | hit results |
| Animation | sampled pose and presentation transitions | action tags, movement | timing markers/root delta | combat authority |
| Targeting | candidate ranking and lock state | spatial query, teams, validity | selected target | hit validation |
| Combat | traces and damage pipeline | action windows, physics, stats | damage/death/status events | loot persistence |
| Ability | grants, costs, cooldowns, effect execution | definitions, action state, targets | commands/effects | UI slots as widgets |
| AI | perception, threat, decisions | world state, nav, encounters | ordinary ability/move commands | alternate combat rules |
| Encounter | phase/objective/spawn orchestration | events, participants | spawn/phase/reward commands | player inventory writes |
| Reward/loot | loot rolls and ownership | death/eligibility/content | item transactions | visual pickup behavior |
| Inventory | item instances and slot transactions | ownership, definitions | equipment/stat changes | random loot decisions |
| Progression | XP/level/tree validation | rewards, class definitions | grants/stat rebuild | direct combat mutation |
| Persistence | durable versioned records | committed transactions | success/failure result | live ECS pointers |
| Replication | per-client relevance and encoding | finalized authoritative state | network messages | gameplay decisions |
| UI | presentation models and user requests | client-visible state | commands | authoritative mutation |

When a feature does not fit this matrix, stop and decide which system owns the invariant before implementing it.

### 10.7 What to learn and build

Learn:

- dependency inversion and composition roots;
- fixed-step phase ordering;
- ECS lifecycle barriers;
- command/event/transaction semantics;
- interface-based testing and fake infrastructure;
- stable identity across runtime, network, content, and persistence domains.

Build:

1. Empty client/server composition roots using the same content registry.
2. A headless `GameSession::tick()` with explicit phases and Tracy zones.
3. Typed command and event variants with bounded queues.
4. Spawn/despawn service with generation-safe handles.
5. A test that runs 10,000 empty ticks, spawns/destroys entities, and verifies no leak or stale access.

## 11. Integrate the playable character and combat loop

> **Project connection — prove that input, movement, animation, targeting, combat, networking, and presentation form one vertical path.** Build one `PlayerCharacter` slice across the existing targets rather than a new monolithic class: command producer in the client, validated action/movement state in shared/server code, Jolt motor, target service, action timeline, damage/defense state, replicated result, ozz presentation, and UI/debug view. Add `tests/integration/player_combat_slice.*` plus a recorded script that walks, targets, attacks three times, blocks, perfect-blocks, dodges twice, takes damage, loses a target, and recovers from interruption.
>
> **Required exit evidence:** every state change has a named owner; rendered animation cannot create a hit; physics cannot bypass action rules; the client cannot author damage; and the same command script produces the same authoritative event sequence headlessly and with rendering enabled. Prove the sequence locally and through a dedicated server, then commit as `checkpoint/11-player-combat`. Chapter 12 may only extend this path through definitions/effects—it may not create a second combat pipeline.
>
> **If stuck:** hard-code one ability ID and one target until the event chain works, then re-enable data selection and target ranking. Inspect the timeline `command -> validation -> action phase -> query -> defense -> damage -> event -> replication -> presentation`. Use [Jolt Physics](https://jrouwe.github.io/JoltPhysics/), [ozz-animation](https://guillaumeblanc.github.io/ozz-animation/documentation/), [Dear ImGui](https://github.com/ocornut/imgui/wiki/Getting-Started), and [Gaffer on fixed timesteps](https://gafferongames.com/post/fix_your_timestep/).

### 11.1 Character aggregate and ECS representation

A playable character is not one class containing every subsystem. It is a set of components plus domain services that enforce cross-component invariants.

Minimum authoritative components:

~~~cpp
struct CharacterIdentity { CharacterId persistent_id; PlayerId owner; };
struct Transform { Vec3 position; Quat rotation; };
struct Velocity { Vec3 linear; };
struct CharacterMotor { MotorState state; MovementTuningId tuning; };
struct Resources { float health, stamina, class_resource; };
struct ActionState { ActionTag action; ActionPhase phase; Tick phase_ends; };
struct TargetState { EntityHandle soft; EntityHandle locked; };
struct AbilityState { AbilityLoadout loadout; CooldownTable cooldowns; };
struct StatusSet { SmallVector<StatusInstance, 8> active; };
struct EquipmentState { ItemInstanceId main_weapon; ItemInstanceId sub_weapon; };
struct NetworkOwner { ConnectionId connection; };
~~~

Presentation components such as render mesh, animation pose, audio emitter, effect handles, and HUD references exist only in the client presentation world.

### 11.2 One input-to-hit flow

Trace a basic attack through the entire system:

1. SDL input changes the local `attack` action.
2. At the next local simulation tick, the client creates `UseAbilityCommand` for the main weapon basic action with command sequence and aim/target context.
3. Client prediction validates against its last confirmed state and starts a predicted action tag/animation if locally legal.
4. Transport sends the command to the server.
5. Server validates connection ownership, sequence/tick window, character state, weapon definition, cost, and target/facing policy.
6. Server atomically spends required resources and enters `AttackStartup` at authoritative tick T.
7. Replication sends `ActionStarted` with action ID/tag and start tick.
8. Server action timeline reaches the active window. The combat system performs the authored sweep against authoritative physics positions.
9. A valid hit enters the single damage pipeline and produces `DamageApplied` plus any status/threat/death events.
10. The client receives confirmation. It matches predicted action/hit presentation by attack ID and corrects only if necessary.
11. UI reads confirmed resource/cooldown/target health through a presentation model.

This trace should exist as a sequence diagram and an automated two-process test. If the same action uses different domain code for AI, player, client prediction, and server authority, the design is drifting.

### 11.3 Build movement first

Implement character movement in this order:

1. Local action map produces normalized movement intent.
2. Shared motor logic converts intent to desired planar velocity.
3. Jolt adapter resolves collision, grounding, stairs, slopes, and depenetration.
4. Server runs the motor authoritatively.
5. Client runs the same predictable subset for the owning player.
6. Snapshot contains position, rotation, velocity, grounded/motor state, and acknowledged command.
7. Client reconciles and replays unacknowledged inputs.
8. Remote players use snapshot interpolation.
9. Animation graph consumes resolved speed, direction, grounded state, and action tag.
10. Camera follows the presentation transform, never the authoritative server transform directly.

Do not add attacks until locomotion is stable at different render rates and under simulated network faults. Combat feel cannot be tuned on top of unpredictable movement correction.

### 11.4 Add targeting as a service

`TargetingSystem` owns candidate collection, filtering, ranking, hysteresis, lock state, and invalidation. It receives a spatial query interface and team/validity access. It does not apply rotation or damage.

~~~cpp
struct TargetQuery {
    EntityHandle requester;
    float selection_range;
    float lock_range;
    TargetMode mode;
};

TargetSelection TargetingSystem::select(const WorldView&, const TargetQuery&);
~~~

Action validation asks targeting for a target and then separately validates action-specific range/shape. Movement/action state uses the selection to compute capped startup facing. UI receives selected IDs to draw indicators. Networking replicates lock changes and authoritative action target where needed, not the entire candidate list.

### 11.5 Add action state before damage

Implement an action timeline that can run with no animation or renderer. Given a definition and start tick, it must answer:

- current phase;
- whether input buffering is open;
- whether movement/facing/root delta is allowed;
- whether hit traces are active;
- whether block/dodge invulnerability is active;
- whether cancellation/interruption is legal;
- next phase transition tick.

Test action timelines headlessly. Then connect animation clips and events as presentation/audit of the same authored timing. Do not make the only copy of combat timing live inside an animation file.

### 11.6 Integrate animation without surrendering authority

Map replicated/shared action tags to client animation graph states. The server does not sample a full render skeleton unless a measured gameplay requirement demands it; it uses authored gameplay timing and query shapes.

The client animation graph consumes:

- locomotion parameters from resolved movement;
- authoritative/predicted action tag and normalized action time;
- weapon/stance definition;
- additive hit/status reactions;
- server correction markers;
- presentation-only IK/look/foot placement.

Root-motion moves provide an authored displacement curve or extracted root delta that shared movement code resolves through physics. The server owns the result. The client may sample the same curve for prediction and pose alignment.

### 11.7 Integrate defense and damage

Block and dodge are actions using the same command/state pipeline as attacks. They are not special checks scattered through input, animation, and health code.

`CombatResolver` receives an immutable hit context and mutable target combat state. It emits a result/event record containing every stage:

~~~cpp
struct DamageResult {
    AttackId attack;
    EntityId attacker;
    EntityId target;
    bool dodged;
    BlockResult block;
    float pre_modifier;
    float post_modifier;
    float shield_absorbed;
    float health_damage;
    bool killed;
    std::vector<AppliedEffect> effects;
};
~~~

This record feeds combat logs, UI numbers, VFX/audio choices, threat, analytics/debug capture, and tests. Those consumers do not rerun the formula.

### 11.8 Learning/build sequence

Learn:

- camera-space to world-space movement math;
- character-controller collision and fixed-step motion;
- prediction/reconciliation and interpolation;
- finite state machines and tick-based timelines;
- animation graph parameters and event auditing;
- spatial queries and deterministic candidate ordering;
- formula pipelines and immutable result records.

Build in this order:

1. Headless movement motor and traversal tests.
2. Server-authoritative movement with a debug client.
3. Local prediction/reconciliation and remote interpolation.
4. Client locomotion animation and camera.
5. Soft target and Tab lock with visual diagnostics.
6. Headless three-step action timeline and buffering tests.
7. Attack-facing and collision-aware movement commitment.
8. Server melee traces and immutable hit result.
9. Damage pipeline, health/death, and combat log.
10. Block, perfect block, guard break, dodge charges, and invulnerability boundaries.
11. Presentation VFX/audio/UI driven only from confirmed/predicted event records.

Exit test: two processes exchange commands/snapshots; both see the same movement, target, action, hit, resource, and death result under latency/loss, with bounded correction and no client-authored outcome.

## 12. Build abilities, effects, stats, and equipment as connected systems

> **Project connection — make the Chapter 11 combat path extensible enough to author a real class and gear build without code forks.** Add validated definition files and runtime repositories for abilities, effects, stats, equipment, grants, loadouts, and tags. Build one class package with a basic chain, two main-weapon skills, two borrowed sub-weapon skills, four class skills, one core skill, passives, resource rules, and at least six items that change the build through the same effect/stat pipeline. Add a loadout inspector that shows the source of every grant and stat modifier.
>
> **Required exit evidence:** equipping/unequipping produces the same derived result after save/load; invalid loadouts fail before mutation; ability cost/cooldown/effects commit atomically; tags block illegal combinations; removing a source revokes only its grants; and combat still uses the single Chapter 11 action/damage flow. Commit definitions, schema validators, tests, and a playable build demonstration as `checkpoint/12-buildcraft`. This is the content architecture required to add classes and items after launch without rewriting combat.
>
> **If stuck:** implement a single `AbilityDefinition -> AbilityRuntime -> EffectSpec -> StatModifier` path with one additive stat before supporting every modifier kind. Print modifier source IDs and evaluation order. Use [JSON for Modern C++](https://json.nlohmann.me/), [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines), and [Game Programming Patterns](https://gameprogrammingpatterns.com/) while implementing the first data-driven ability.

### 12.1 Why these systems must share contracts

Abilities request actions and effects. Effects change stats, resources, statuses, movement, or spawned entities. Equipment and progression grant or modify abilities/stats. UI displays the resulting loadout and state. Networking validates requests and replicates results. Persistence stores durable grants, item instances, and build choices.

If each subsystem modifies character fields directly, the order becomes accidental and save/network validation becomes impossible. Use explicit grant, modifier, cost, cooldown, and effect contracts.

### 12.2 Separate definitions from runtime state

~~~cpp
struct AbilityDefinition {
    AbilityId id;
    AbilitySlotCategory slot;
    ActionDefinitionId action;
    TargetPolicy targeting;
    CostDefinition cost;
    CooldownDefinition cooldown;
    std::vector<EffectDefinition> effects;
    TagSet tags;
};

struct AbilityRuntimeState {
    AbilityId id;
    Tick cooldown_ends;
    std::uint8_t charges;
    std::uint8_t rank;
};
~~~

Definitions are immutable and shared by content ID/version. Runtime state belongs to a character/session/save. An equipment item grants a reference/modifier; it does not copy an entire mutable ability definition into the inventory.

### 12.3 Ability execution transaction

`AbilityExecutor` coordinates systems; it does not own all of them.

~~~text
request
 -> ownership/grant/loadout validation
 -> state/tag restriction validation
 -> target/direction validation
 -> cost/cooldown/charge validation
 -> reserve or atomically spend cost
 -> start action timeline
 -> resolve effects at authored action markers
 -> start cooldown according to policy
 -> emit result and replication event
~~~

Define when cost and cooldown commit: on accepted request, action start, first active frame, successful hit, or completion. Different abilities may use different authored policies, but the policy must be explicit and tested. A disconnect or interruption must not leave a half-spent transaction.

### 12.4 Effect system boundary

Use a constrained set of effect types rather than arbitrary scripts with unrestricted world access:

- direct damage/healing;
- apply/remove/refresh status;
- resource change;
- movement impulse/teleport with validation;
- spawn projectile/hazard/entity through spawn service;
- grant/revoke tag or timed modifier;
- shield creation;
- threat modification;
- reward/progression effect only through server reward transactions.

Each effect definition validates required parameters and target policy. Each execution produces an `EffectResult`. Complex class mechanics compose several effects and conditions rather than bypassing the combat pipeline.

### 12.5 Stat aggregation

Separate base values from modifiers and derived values:

~~~text
class/base stats
 + level/progression allocations
 + equipment/affix modifiers
 + passive ability modifiers
 + temporary status modifiers
 -> clamped derived stats
~~~

Give modifiers a declared operation and order, for example base override, additive, multiplicative, final additive, then clamp. Do not let insertion order decide the result.

~~~cpp
struct StatModifier {
    StatId stat;
    ModifierLayer layer;
    ModifierOperation operation;
    float value;
    SourceId source;
};
~~~

Rebuild derived stats when the source set changes, or use a correctly invalidated cache. Persist source choices/items, not every derived float. Recompute after loading and compare against invariants.

### 12.6 Equipment integration

Equipping an item is a server transaction:

1. Validate the item exists, is owned, is in an equip-capable container, and the slot/type/requirements are legal.
2. Determine the item currently in the destination slot.
3. Remove old item's grants/modifiers through their source ID.
4. Move inventory/equipment records atomically.
5. Apply new grants/modifiers.
6. Rebuild derived stats and validate health/resource transition policy.
7. Update available weapon actions/ability grants and loadout validity.
8. Persist the transaction.
9. Replicate inventory/equipment/stat/loadout changes.
10. Notify presentation to update mesh, animation stance, icons, and comparison UI.

The UI does not optimistically create an item or final stat total. It may show pending state until the server transaction result arrives.

### 12.7 Main/sub weapon relationship

Main weapon definition owns the basic chain, native weapon abilities, range, trace shapes, timings, stance, and animation set. Sub-weapon abilities can be granted to the two sub slots without replacing the main basic chain.

Keep separate relationships:

~~~text
item instance -> item base -> weapon definition
weapon definition -> granted ability IDs
character loadout slot -> granted ability ID
ability definition -> action/effect definitions
~~~

Validate that every bound ability is currently granted and legal for its slot. On weapon removal, unbind or mark invalid affected slots through a deterministic policy.

### 12.8 What to learn and build

Learn:

- immutable definitions versus runtime instances;
- transactional resource/cooldown commits;
- typed effect dispatch and result records;
- layered stat aggregation and cache invalidation;
- equipment/inventory ownership and UI request/result flow;
- versioned serialization for grants, loadouts, and item references.

Build:

1. Content schemas and validation for one class, main weapon, sub weapon, and five abilities.
2. Ability grant/loadout validator for 2 main, 2 sub, 4 class, and 1 ultimate slots.
3. Headless ability transaction with cost, cooldown, target, action, and effect result tests.
4. Layered stat aggregator with golden formula tests.
5. Equipment transaction that grants/removes modifiers and abilities by source.
6. Client loadout/equipment presentation model driven from server results.
7. Save/load round trip and migration fixture for all runtime state that must persist.

## 13. Connect loot, inventory, progression, and persistence

> **Project connection — make combat produce durable, player-owned progression without duplication or corruption.** Add persistent item IDs, deterministic loot generation, personal ownership, pickup operations, revisioned inventory/equipment commands, XP/level/tree transactions, a versioned save envelope, migrations, atomic write/replace/recovery, and a repository interface usable by the server. Wire the Chapter 12 equipment/stat rebuild into load and inventory commits; do not serialize derived stats as independent truth.
>
> **Required exit evidence:** boss death creates one reward operation; two players receive distinct authorized loot views; repeated/stale pickup and inventory requests are harmless; every item exists in exactly one location; crash/disconnect injection around reward and save boundaries loses or duplicates nothing; corrupt saves do not partially load; and at least two older save fixtures migrate. Complete a kill-loot-equip-level-save-restart-load loop through the dedicated server and commit as `checkpoint/13-durable-progression`.
>
> **If stuck:** start with an in-memory `PersistenceRepository` and operation IDs, then add files/database behind the same interface. Test exactly-one-location as an invariant after every command. Use [JSON for Modern C++](https://json.nlohmann.me/), [GoogleTest](https://google.github.io/googletest/), [C++ filesystem](https://en.cppreference.com/w/cpp/filesystem), and [Steam Cloud documentation](https://partner.steamgames.com/doc/features/cloud). Treat power loss between temp-file write and rename as a normal test case.

### 13.1 The durable ownership chain

Loot is not a visual pickup. It is a server-created durable transaction that crosses encounter, reward, item generation, inventory, replication, UI, and persistence systems.

~~~mermaid
flowchart LR
  Death["authoritative enemy death"] --> Eligibility["reward eligibility"]
  Eligibility --> Roll["server loot roll"]
  Roll --> Item["persistent item instance"]
  Item --> Pickup["owned pickup or direct grant"]
  Pickup --> Inventory["inventory transaction"]
  Inventory --> Save["durable commit"]
  Inventory --> Replication["owner-only replication"]
  Replication --> UI["pickup/inventory UI"]
~~~

The reward system owns eligibility and asks the loot generator to create item descriptions. The item repository assigns persistent IDs. The world spawn service creates a pickup representation. The inventory service commits pickup. Persistence records the durable result. Each step uses an operation ID so retries cannot duplicate the grant.

### 13.2 Item instance model

~~~cpp
struct ItemInstance {
    ItemInstanceId id;
    ItemBaseId base;
    PlayerId owner;
    std::vector<AffixRoll> affixes;
    ItemLocation location;
    ContentVersion created_with;
    ItemRevision revision;
};
~~~

An item instance stores rolled outcomes and stable references, not pointers to runtime definitions. `ItemLocation` is a discriminated value such as world pickup, inventory slot, equipment slot, stash slot, mail/recovery, or consumed/destroyed tombstone. A transaction moves one revision between legal locations.

Do not represent an equipped item simultaneously in inventory and equipment containers. Do not delete the source record before the destination write is durable. Use unique constraints or transaction checks to preserve exactly-one-location.

### 13.3 Death-to-reward orchestration

When health reaches the death threshold:

1. Combat produces one idempotent `EntityDied` event with killer/contributor/encounter context.
2. Encounter system confirms the death belongs to an active attempt and updates objectives/phase.
3. Reward system calculates eligible party members from server participation rules.
4. For each eligible player, loot generator evaluates the encounter's table with a server-controlled roll context.
5. Item service creates persistent item instances and ownership records.
6. World service creates owner-visible pickups or inventory direct grants according to policy.
7. Replication sends only permitted pickup information to each client.
8. Persistence checkpoint includes reward operation IDs and results.

If the server crashes after item creation but before presentation, recovery must rediscover or deliver the committed reward. If it crashes before commit, retry must not create a second item. Design the transaction boundary before adding VFX.

### 13.4 Inventory commands

Use explicit commands and results:

~~~cpp
struct MoveItemCommand {
    OperationId operation;
    PlayerId player;
    ItemInstanceId item;
    ItemLocation expected_from;
    ItemLocation requested_to;
    ItemRevision expected_revision;
};
~~~

The expected location/revision prevents a stale UI from overwriting newer state. The server returns success with new revision/location or a typed rejection such as wrong owner, stale revision, illegal slot, no capacity, requirements unmet, or item locked by another transaction.

### 13.5 Progression integration

XP and progression are rewards, not client counters. A reward transaction grants XP; progression determines new level/points/unlocks; ability/stat systems rebuild grants; persistence commits; replication sends the owner-visible result; UI animates from old confirmed state to new confirmed state.

Keep these sources separate:

- class archetype/base growth;
- allocated progression nodes;
- learned permanent abilities;
- equipment-granted abilities/modifiers;
- temporary session/status grants.

The save stores allocated nodes and durable grants. It does not store every derived stat or temporary combat status. On load, validate the build against the current content version, migrate IDs, recompute derived state, and reject/quarantine impossible combinations.

### 13.6 Persistence ports and transactions

Domain code should depend on repository interfaces:

~~~cpp
class CharacterRepository {
public:
    virtual std::expected<CharacterRecord, LoadError>
    load(PlayerId, CharacterId) = 0;

    virtual std::expected<CommitReceipt, CommitError>
    commit(const CharacterTransaction&) = 0;
};
~~~

Tests use an in-memory repository with failure injection. Local development may use versioned files or SQLite. Production can use a transactional service/database without changing combat or inventory rules.

Do not synchronously block the simulation tick on a slow remote database. Queue durable transactions with clear semantics: which state may be acknowledged to the player before commit, what happens on timeout, and how retry/idempotency works. For critical item grants, prefer not to tell the client the grant is final until a durable receipt exists.

### 13.7 Save schema and migration ownership

A save/checkpoint envelope should include:

~~~cpp
struct SaveEnvelope {
    SaveFormatVersion format;
    BuildVersion writer_build;
    ContentVersion content;
    CharacterRecord character;
    std::vector<ItemInstanceRecord> items;
    std::vector<CompletedOperation> operations;
    Checksum checksum;
};
~~~

Migration code belongs to persistence/content tooling, not UI. It converts old records to the newest validated domain representation before runtime entities are created. Keep golden fixtures for every released save version and run them in CI.

### 13.8 What to learn and build

Learn:

- database/file transactions and idempotency;
- optimistic concurrency through revisions;
- weighted loot tables and deterministic test RNG;
- persistent identity and exactly-one-location invariants;
- progression grant/rebuild flows;
- schema evolution, checksums, atomic files, and recovery.

Build:

1. Item base/affix/loot-table validators.
2. Deterministic loot generator with distribution tests.
3. Persistent item instance repository and unique ownership/location invariants.
4. Pickup and inventory move transactions with duplicate/stale request tests.
5. Equipment integration from Chapter 12.
6. XP/level/tree allocation transaction and derived-state rebuild.
7. Versioned save envelope, atomic write, corrupt input handling, and two migration fixtures.
8. Disconnect/crash injection at every reward/pickup commit boundary.

## 14. Connect navigation, AI, encounters, and player combat

> **Project connection — turn the player/buildcraft slice into a replayable encounter using the same rules.** Build a navmesh tool/runtime adapter, perception/memory, deterministic threat policy, behavior actions that emit shared commands, a melee pursuer, ranged controller, support enemy, and a multi-phase boss encounter with reset and personal reward completion. Add AI/threat/nav/encounter inspectors and a headless encounter test. Enemies may choose targets and abilities, but only the shared Chapter 11-12 executors move, spend resources, apply effects, deal damage, or die.
>
> **Required exit evidence:** all four archetypes use ordinary validated abilities; navigation never writes final transforms; threat handles death/taunt/healing/ties deterministically; encounter reset removes hazards, entities, memory, and old attempt IDs; boss completion and rewards happen once; and 1/2/4/8 participant variants remain within AI/nav budgets. Run the encounter from start through wipe/reset and successful reward, then commit as `checkpoint/14-encounter`.
>
> **If stuck:** first make one melee enemy alternate `AcquireTarget -> MoveCommand -> AbilityCommand -> WaitForResult`; add navmesh and richer behavior only after that loop is testable. Use [Recast Navigation](https://recastnav.com/), the free [Game AI Pro books](https://www.gameaipro.com/), the [behavior-tree survey](https://arxiv.org/abs/2005.05842), [Jolt Physics](https://jrouwe.github.io/JoltPhysics/), and [Tracy](https://github.com/wolfpld/tracy). Expose rejection reasons rather than silently retrying actions.

### 14.1 AI is another command producer

AI-controlled entities use the same movement, targeting, action, ability, combat, status, and death systems as players. AI decides what to request; it does not apply damage, teleport, ignore cooldowns, or directly set animation state.

~~~mermaid
flowchart LR
  Perception["perception"] --> Memory["world memory"]
  Memory --> Threat["threat/target policy"]
  Threat --> Decision["behavior decision"]
  Encounter["encounter constraints"] --> Decision
  Decision --> Command["move/use-ability command"]
  Command --> Shared["shared action/combat executor"]
  Shared --> Events["damage/status/death events"]
  Events --> Memory
  Events --> Encounter
~~~

This design means improvements and fixes to combat validation automatically apply to enemies. It also makes AI behavior headlessly testable by inspecting emitted commands and resulting shared events.

### 14.2 Perception and memory

Perception queries authoritative state at a controlled cadence. It produces observations rather than permanently storing raw pointers:

~~~cpp
struct Observation {
    EntityHandle subject;
    ObservationKind kind;
    Vec3 last_known_position;
    Tick observed_at;
    float confidence;
};
~~~

Sight uses spatial candidates plus distance, field policy, occlusion, invisibility/stealth tags, and encounter rules. Hearing or event awareness consumes authored world events. Memory expires or decays according to archetype. Debug UI should show why a target is perceived or rejected.

### 14.3 Threat and target policy

Threat is a server-owned table keyed by stable entity handles. Damage, healing, protection, taunt, scripted mechanics, distance, and time can contribute through explicit rules. The table is an input to target policy, not an absolute command; encounters may override it for a phase mechanic.

~~~cpp
struct ThreatEntry {
    EntityHandle target;
    float damage_threat;
    float support_threat;
    float taunt_floor;
    Tick last_contribution;
};
~~~

Test target death, invisibility, leaving encounter bounds, taunt expiry, healer threat, equal-score tie-breaking, and phase override. A live threat inspector is mandatory for tuning.

### 14.4 Navigation request flow

AI requests a path from its current projected nav position to a goal. Navigation returns a path/corridor or a typed failure. Movement follows a steering target but resolves final displacement through the same character motor/Jolt collision system as players.

Do not copy the navmesh position directly into `Transform`. Do not let local avoidance override a combat action's movement commitment without an explicit priority rule.

Path requests should be rate/budget controlled. Cache/reuse while valid, invalidate on target movement threshold or navmesh change, and spread expensive queries across ticks. Critical boss mechanics may receive higher budget than ambient enemies.

### 14.5 Behavior model and action contracts

Choose a hierarchical state machine, behavior tree, or utility system based on team comfort. The integration contract is more important than the choice. A behavior action should request one of a small set of domain commands and wait for a result/event.

Example melee loop:

~~~text
AcquireTarget
 -> if no target: Patrol/Return
 -> if outside ability range: RequestPath/Move
 -> if action unavailable: Reposition/Wait
 -> RequestAbility
 -> wait for ActionStarted or rejection
 -> monitor hit/action completion/interruption
 -> choose recovery or next decision
~~~

Avoid behavior tasks that say "play attack animation and subtract health." They bypass the shared game.

### 14.6 Encounter as orchestration layer

An encounter owns:

- bounds, participants, attempt ID, state, and reset rules;
- spawn groups/waves and their archetype/content IDs;
- phase conditions and objective state;
- environmental hazards and scripted ability requests;
- reward eligibility and completion operation ID;
- cleanup and failure recovery.

It does not own each enemy's ordinary movement/combat state. It observes authoritative events and issues commands at phase transitions.

~~~cpp
enum class EncounterState { Dormant, Starting, Active, Completed, Failed, Resetting };

struct EncounterRuntime {
    EncounterId id;
    AttemptId attempt;
    EncounterState state;
    std::uint32_t phase;
    Tick state_started;
    std::vector<EntityHandle> members;
};
~~~

Every transition is idempotent. A boss death packet or repeated event cannot grant completion twice. Reset cleans hazards, despawns encounter-owned actors, clears threat/memory, restores doors/objectives, and invalidates the old attempt ID.

### 14.7 Boss integration

Bosses use ordinary abilities plus encounter-driven phase selection. A mechanic definition should identify:

- target policy and participant count behavior;
- cast/start tick and interrupt/cancel rules;
- telegraph shape, lead time, priority, and accessibility representation;
- authoritative hazard/projectile/effect spawn;
- success/failure consequences;
- cleanup on phase transition, reset, death, or disconnect;
- scaling policy for 1/2/4/6/8 participants;
- replication priority and bandwidth cost.

Telegraph presentation is driven from authoritative cast/hazard state. The server does not trust that a client saw the effect, and the renderer cannot delay the authoritative activation to match a slow asset.

### 14.8 Three-enemy vertical-slice roster

Build archetypes that prove different integration paths:

1. **Melee pursuer:** perception, threat, pathing, approach spacing, basic chain, blockable attack, leash/reset.
2. **Ranged controller:** preferred range, line-of-sight, repositioning, projectile/hazard ability, interruptible cast.
3. **Support enemy:** ally selection, heal/buff/cleanse ability, threat contribution, retreat behavior.
4. **Boss:** encounter phases, target variation, lethal telegraph, add/hazard orchestration, interrupt/break interaction, reward completion.

Do not build twelve visually different melee enemies before these four integration patterns are stable.

### 14.9 What to learn and build

Learn:

- navmesh generation/query/corridor following;
- perception filters and temporal memory;
- threat mathematics and deterministic target selection;
- behavior state/action result patterns;
- command-driven AI integration;
- encounter orchestration, idempotent phases, and reset;
- AI/nav tick budgeting and debug visualization.

Build:

1. Navmesh build/validation tool and runtime query adapter.
2. Perception observations and debug inspector.
3. Threat table with damage/heal/taunt/override tests.
4. Behavior actions that emit shared move/ability commands.
5. Three enemy archetypes using shared combat.
6. Encounter state machine and complete reset test.
7. Boss phase definitions, telegraph replication, and duplicate-completion protection.
8. Headless encounter test plus rendered 1/2/4/8 participant stress variants.

## 15. Replicate each game system deliberately

> **Project connection — make the complete Chapter 14 encounter correct for remote players, late join, and reconnect.** Define explicit protocol schemas and per-client replication views for spawn/despawn, movement, action/combat, abilities/resources, enemies/encounter, party/revive, loot, inventory/equipment, progression, and baselines. Add network IDs/generations, content/build negotiation, prediction history, interpolation, interest reasons, bandwidth counters, owner-only privacy, and reconnect reconstruction. Never serialize raw ECS/component memory.
>
> **Required exit evidence:** two remote clients and a bot/load harness can complete the full encounter under latency/jitter/loss/reordering/duplication; local movement corrections stay bounded; attack IDs bind prediction to authoritative results; critical telegraphs and party state arrive with correct priority; private inventory/progression never reaches another client; late join/reconnect rebuilds coherent state during combat, downed state, boss phase, ground loot, and persistence commits. Commit packet schemas, fault presets, traces, and results as `checkpoint/15-networked-game`.
>
> **If stuck:** replicate one domain at a time in this order: handshake, spawn, movement, action start/result, party/encounter, then owner-only durable state. Log message type, byte count, sequence, tick, entity generation, relevance reason, and reliability. Use [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets), [Gaffer on Networked Physics](https://gafferongames.com/categories/networked-physics/), [Snapshot Interpolation](https://gafferongames.com/post/snapshot_interpolation/), and [libFuzzer](https://llvm.org/docs/LibFuzzer.html).

### 15.1 Replication is a view, not serialization of the ECS

Do not dump entity/component memory into packets. Build a per-client replication view from finalized authoritative state. The view decides relevance, field ownership, frequency, quantization, baseline/delta behavior, and privacy.

| Domain | Client sends | Server sends | Reliability |
|---|---|---|---|
| Movement | input command sequence, move/look/actions | owner correction/ack; remote transforms/velocity | commands and snapshots sequenced; handshake reliable |
| Action/combat | requested ability/target/direction | action start/phase tag, confirmed hit/damage/status/death | action/durable results reliable; frequent state snapshot |
| Targeting | lock/cycle request if needed | accepted lock/action target where gameplay-relevant | reliable or sequenced event |
| Ability | use request | cooldown/charge/resource/result | reliable state change plus snapshots |
| AI/encounter | none | relevant actors, casts, hazards, objectives, phase | critical events reliable; transforms snapshots |
| Loot | pickup request | owner-visible pickup, transaction result | reliable and idempotent |
| Inventory/loadout | transaction request with revision | owner-only snapshot/delta/result | reliable ordered |
| Progression | allocation/respec request | owner-only XP/level/tree result | reliable ordered |
| Party/revive | ready/ping/revive request | roster/state/progress/result | reliable; positional awareness may be snapshot |
| Save/checkpoint | no arbitrary save upload | checkpoint/commit status where exposed | reliable |

### 15.2 Stable wire identity

Map runtime entities to network IDs with generation/lifetime. A client cannot infer access to an entity merely by guessing an ID. Spawn messages establish type/content/presentation references. Despawn messages end the network lifetime. Late packets for old generations are ignored.

Protocol messages use explicit integer sizes, endianness/encoding library rules, length limits, enum validation, and version negotiation. Do not send raw `sizeof(struct)` memory.

### 15.3 Owner prediction versus remote presentation

Only the owning client's predictable local state is replayed from input history. Remote players, enemies, projectiles, and hazards normally interpolate authoritative snapshots or present replicated events.

Predicted state should be narrow:

- local motor position/velocity/facing;
- predicted start of legal local action presentation;
- anticipated resource/cooldown UI clearly correctable;
- presentation effects that can be canceled or confirmed.

Do not predict loot creation, XP, item transactions, enemy death rewards, or final hit results as durable truth.

### 15.4 Combat replication flow

Use IDs to match prediction and confirmation:

~~~text
client command sequence 200 requests ability
 -> local predicted ActionInstance temp(200)
 -> server accepts and assigns AttackId 881 at tick 9050
 -> ActionStarted acknowledges command 200 / AttackId 881
 -> client binds predicted presentation to 881
 -> server DamageApplied references 881 and target ID
 -> client confirms hit VFX/number/audio
 -> if rejected, client cancels predicted action presentation and reconciles state
~~~

The server's action start tick allows the client to place remote animation at the correct normalized time. Do not transmit "play animation now" without simulation timing context.

### 15.5 Interest and privacy by system

Relevance is not only distance:

- party roster/major status is relevant regardless of distance;
- owner inventory/progression is never sent to unrelated players;
- a boss lethal telegraph receives high priority even near an interest boundary;
- a personal loot pickup is visible only to its owner unless design says otherwise;
- distant ambient enemies can update slowly or disappear from interest;
- encounter objectives/phase remain relevant to participants;
- debug/administrative data is never present in normal client protocol.

Build a relevance reason enum and inspect it live. "Why did this entity replicate?" should have an answer.

### 15.6 Join and reconnect reconstruction

A new/returning client needs a coherent baseline:

1. protocol/content/build compatibility accepted;
2. authenticated player and character loaded;
3. session/party/encounter membership restored or created;
4. authoritative player entity assigned;
5. baseline includes relevant entity spawns/state, party, objectives, owner resources/loadout/inventory summary, current encounter phase, and server tick/time mapping;
6. subsequent deltas/events start after baseline sequence;
7. client activates gameplay only after required content/assets and baseline are ready;
8. old connection and stale commands are invalidated.

Test reconnect during attack, downed state, revive, boss phase, loot on ground, inventory transaction, and pending persistence commit.

### 15.7 What to learn and build

Learn:

- message schema/version design;
- quantization and delta/baseline state;
- reliable versus sequenced traffic;
- prediction history and reconciliation replay;
- interpolation buffers and jitter;
- relevance/priority/bandwidth budgeting;
- idempotent durable operations and reconnect baselines.

Build:

1. Handshake/version/content negotiation.
2. Input command channel and acknowledged prediction history.
3. Spawn/despawn plus remote transform snapshots.
4. Action/combat event confirmation using stable attack IDs.
5. Party/encounter/critical telegraph replication.
6. Owner-only inventory/progression transactions.
7. Interest priority and bandwidth metrics.
8. Full baseline/reconnect under packet faults.

## 16. Build the vertical slice in dependency order

This sequence turns the isolated systems into a playable game while keeping every increment testable. Do not start a later increment until the earlier one has a repeatable demonstration and automated checks.

> **Project connection — this is the release-producing schedule.** Create one issue/milestone and one evidence folder `docs/gates/increment-01` through `increment-12` for each increment below. Every folder must contain the commit SHA, exact build/test commands, automated results, playable scenario, captures/metrics, known limitations, and go/no-go decision. An increment is not complete because its code exists; it is complete only when its **Prove** line is repeatable from a clean build. The result of Increment 12 is the artifact uploaded for Early Access review, not another prototype branch.
>
> **If you are unsure what to do next:** work only on the first incomplete increment, choose its smallest failing proof, and trace backward to the chapter checkpoint that owns the missing contract. Do not start more content to avoid a broken foundation. The help links repeated under each increment are intentionally local so they are available at the moment of implementation.

### Increment 1 - Reproducible runtime shell

Build: client/server/shared/tests targets, config, logs, fixed clocks, empty server tick, SDL window/input, CI, sanitizers.

Learn: build/link pipeline, RAII, CMake targets, lifecycle, fixed timestep, test structure.

Prove: clean clone builds; server runs 10,000 ticks; client opens/closes repeatedly; debugger and sanitizer work.

Help at this step: [CMake tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/), [vcpkg integration](https://learn.microsoft.com/en-us/vcpkg/users/buildsystems/cmake-integration), [SDL3 examples](https://examples.libsdl.org/SDL3/), and [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html). First hint: reduce the shell to one client target, one server target, and one shared test if the graph will not configure.

### Increment 2 - Authoritative movement playground

Build: Jolt world, character motor, traversal map, server movement, command protocol, local prediction, reconciliation, remote interpolation, movement inspector.

Learn: vectors/transforms, collision queries, fixed-step movement, network time/sequence, prediction math.

Prove: same scripted input across render rates; two clients under latency/loss; bounded correction; no wall/stair/ledge blockers.

Help at this step: [Jolt Physics](https://jrouwe.github.io/JoltPhysics/), [Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/), and [Networked Physics](https://gafferongames.com/categories/networked-physics/). First hint: prove a headless capsule motor from recorded inputs before adding prediction or animation.

### Increment 3 - Presentation and content foundation

Build: bgfx scene extraction/render passes, camera, graybox assets, glTF pipeline, EnTT world, content parse/validate/link/freeze, ImGui inspectors.

Learn: coordinate spaces, GPU resource lifetime, asset manifests, ECS boundaries, schemas/stable IDs.

Prove: headless server has no renderer dependency; invalid content cannot activate; missing presentation asset has a visible fallback.

Help at this step: [bgfx examples](https://bkaradzic.github.io/bgfx/examples.html), [RenderDoc quick start](https://renderdoc.org/docs/getting_started/quick_start.html), [Blender glTF export](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html), and [EnTT](https://skypjack.github.io/entt/). First hint: ship a lit graybox and a failing content fixture before any art polish.

### Increment 4 - Combat feel probe

Build: soft target/lock, action timeline, animation graph, three-hit chain, collision-aware traces, damage result, block/perfect block/guard break, dodge charges.

Learn: state machines, animation/gameplay timing, targeting ranking, query shapes, formula ordering.

Prove: slow-motion timeline and headless tests agree; canonical combat rules pass at boundaries; remote process sees the same authoritative result.

Help at this step: [ozz-animation](https://guillaumeblanc.github.io/ozz-animation/documentation/), [Jolt queries](https://jrouwe.github.io/JoltPhysics/), and [Dear ImGui](https://github.com/ocornut/imgui/wiki/Getting-Started). First hint: visualize every action phase and hit shape; do not tune by animation appearance alone.

### Increment 5 - Ability and buildcraft package

Build: definitions, grants/loadout, ability transaction, typed effects, statuses/tags, stat aggregation, main/sub weapon equipment, one complete class kit.

Learn: immutable definitions/runtime instances, modifiers, transactions, effect composition, data validation.

Prove: every slot category validates; equipment changes derived state deterministically; save/load preserves sources and recomputes derived values.

Help at this step: [JSON for Modern C++](https://json.nlohmann.me/), [Game Programming Patterns](https://gameprogrammingpatterns.com/), and [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines). First hint: finish one ability/effect/stat/item chain before building a general editor or a second class.

### Increment 6 - Enemy and encounter package

Build: navmesh/path adapter, perception, threat, behavior commands, melee/ranged/support enemies, encounter state/reset, boss phases/telegraphs.

Learn: navigation, spatial reasoning, decision/action separation, orchestration, AI budgeting.

Prove: enemies use shared abilities/combat; reset leaves no stale entities/hazards; boss completion/reward occurs once.

Help at this step: [Recast Navigation](https://recastnav.com/), [Game AI Pro](https://www.gameaipro.com/), and the [behavior-tree survey](https://arxiv.org/abs/2005.05842). First hint: make an enemy emit the same move/ability commands as a player before introducing a behavior-tree framework.

### Increment 7 - Loot, inventory, progression, and save

Build: loot tables, item instances/affixes, personal pickup, inventory/equipment transactions, XP/level/tree, atomic/versioned save, migrations.

Learn: RNG testing, persistent identity, idempotency, optimistic revisions, transactional durability, schema evolution.

Prove: two-player separate loot; duplicate pickup harmless; crash/disconnect recovery; old/corrupt save fixtures handled safely.

Help at this step: [C++ filesystem](https://en.cppreference.com/w/cpp/filesystem), [GoogleTest](https://google.github.io/googletest/), and [Steam Cloud](https://partner.steamgames.com/doc/features/cloud). First hint: assign every durable operation and item a stable ID, then test retries before adding storage complexity.

### Increment 8 - Complete localhost vertical slice

Build: a 10-15 minute flow with one class, main/sub weapons, three enemies, boss, rewards, save/reload, HUD/menu, audio/VFX, debug/replay tools.

Learn: vertical integration, user flow, pacing, failure triage, evidence collection.

Prove: all gameplay runs through the localhost dedicated server; the Increment 8 evidence dossier is complete; no client-only alternate rules remain.

Help at this step: return to the Chapter 10 ownership matrix and Chapter 11 command-to-hit trace. First hint: remove every client-only gameplay shortcut, then run the complete 10-15 minute flow from a clean character and save the trace as gate evidence.

### Increment 9 - Two-player authority proof

Build: party/session flow, two remote clients, revive, reconnect, interest management, owner-only state, network simulation presets.

Learn: distributed state, eventual arrival, jitter buffers, replication priority, session lifecycle, security validation.

Prove: repeated slice under latency/jitter/loss; no item/progression corruption; traces explain every correction/rejection.

Help at this step: [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets), [Networked Physics](https://gafferongames.com/categories/networked-physics/), and [Snapshot Interpolation](https://gafferongames.com/post/snapshot_interpolation/). First hint: use one named fault preset and one deterministic scenario until every mismatch has a command/tick trace.

### Increment 10 - Eight-player readability and budgets

Build: 2/4/6/8 bot/client harness, party frames/pings, effect priority, AI/nav/network budgets, reduced-effects/accessibility settings, soak tests.

Learn: performance profiling, bandwidth accounting, information hierarchy, accessibility under load.

Prove: critical telegraphs/party state survive worst case; tick/frame/bandwidth/memory remain within documented budgets; two-hour soak.

Help at this step: [Tracy](https://github.com/wolfpld/tracy), [Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/gaming/accessibility/guidelines), and [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/). First hint: classify effects and UI by consequence before optimizing; measure worst-case server tick and packet bytes by system.

### Increment 11 - Steam packaging and operations

Build: Steam adapter, identity/lobby/server registration plan, client/server depots, private branches, Cloud/conflict policy, stats/achievements, crash/support workflow.

Learn: platform boundaries, artifact promotion, compatibility, support and release operations.

Prove: clean staged install boots client/server and joins; symbols/logs triage a crash; patch/rollback rehearsal works.

Help at this step: [Steamworks Spacewar](https://partner.steamgames.com/doc/sdk/api/example), [game servers](https://partner.steamgames.com/doc/features/multiplayer/game_servers), [SteamPipe uploading](https://partner.steamgames.com/doc/sdk/uploading), and [Crashpad](https://chromium.googlesource.com/crashpad/crashpad/). First hint: promote one immutable build artifact through a private branch instead of rebuilding for each environment.

### Increment 12 - Early Access candidate

Build: replayable current content, final migrations, compatibility matrix, store/FAQ/current-state copy, known issues, first patch plan.

Learn: release judgment, evidence-based scope, honest communication, sustainable operations.

Prove: the final release dossier passes without waiving corruption, accessibility, packaging, support, or store-truth blockers.

Help at this step: [Steam Early Access rules](https://partner.steamgames.com/doc/store/earlyaccess), [store presence documentation](https://partner.steamgames.com/doc/store), and [Steam stats/achievements](https://partner.steamgames.com/doc/features/achievements). First hint: map each store claim to a current-build test/capture and remove any claim that depends on future work.

### 16.1 Integration review checklist

For every new system or feature, answer these before implementation:

1. Which target/module owns it?
2. Is its state authoritative, predicted, presentation-only, or durable?
3. What stable IDs and versions cross its boundaries?
4. Which command requests it, and who validates that command?
5. Which event/result proves it happened?
6. Where in the server tick does it run, and why there?
7. Which existing systems does it read, and which may it mutate?
8. What must replicate, to whom, how often, and with what reliability?
9. What must persist, and what migration/idempotency rule applies?
10. Which UI/debug views consume it without owning it?
11. What happens on invalid input, target loss, disconnect, retry, or partial failure?
12. What is the smallest headless test and smallest playable demonstration?
13. Which performance/bandwidth/readability budget can it consume?
14. What evidence closes the chapter checkpoint or release increment?

If these answers are unclear, the feature is not ready to code. Return to the relevant learning chapter and create the missing contract first.


# Assessment, review, and graduation

## 17. Assessment model

Use several forms of assessment because no single quiz proves runtime engineering competence.

| Assessment | Use |
|---|---|
| Code reading and trace prediction | Check understanding of state, ownership, timing, and data flow before implementation. |
| Ordering and matching | Verify lifecycle, build, protocol, migration, and damage-resolution sequences. |
| Bug finding and patch review | Expose lifetime, authority, invalidation, concurrency, and boundary mistakes. |
| Architecture tradeoff defense | Require explicit constraints, consequences, rejected options, and revisit conditions. |
| Test design | Prove the learner can identify boundaries, invalid states, authority abuse, and observability needs. |
| Headless micro-scenario | Verify formulas and state transitions without rendering noise. |
| Playable demonstration | Verify integrated feel and user-visible behavior. |
| Profile, packet, or capture review | Verify performance and networking claims with measurement. |
| Migration/fault exercise | Verify durability under old, corrupt, interrupted, or hostile input. |
| Checkpoint dossier | Synthesize commit, tests, evidence, limitations, and go/no-go judgment. |

Every chapter checkpoint requires all critical combat-law, authority, security, economy, save-integrity, accessibility, and store-truth items to pass. A failed checkpoint produces a remediation list and another evidence run; it does not produce a calendar-based pass.

## 18. Definition of done for a chapter checkpoint

A chapter checkpoint is complete only when:

- every earlier chapter checkpoint is complete;
- the learner can explain the visual/data-flow model without copying it;
- the named project artifact exists at the architecture boundary specified by the chapter's **Project connection**;
- specified automated tests pass from the documented preset;
- relevant manual and failure scenarios have been run;
- instrumentation makes future diagnosis possible;
- the decision and known limitations are recorded;
- the checkpoint commit and evidence folder exist;
- the main branch remains buildable.

## 19. Definition of done for the learning path

The learning path is complete when Chapters 0-16, checkpoint commits `checkpoint/00-toolchain` through `checkpoint/15-networked-game`, and all 12 vertical-slice increments are complete, and the learner can independently:

1. reproduce and explain the full client/server/shared architecture;
2. extend a data-driven class, weapon, enemy, encounter, item, or ability without bypassing validation or authority;
3. diagnose movement, animation, combat, networking, save, performance, and packaging faults using the project tools;
4. run two-player and eight-player evidence scenarios under adverse conditions;
5. migrate saves and protocols deliberately;
6. build, package, deploy, observe, support, and patch the client and dedicated server;
7. evaluate an Early Access candidate honestly and call no-go when evidence is insufficient.

## 20. Final project dossier

The graduating artifact is the game repository plus a release dossier containing:

- runtime scope and owned/borrowed architecture;
- current gameplay and combat contracts;
- content, tag, save, and network schema versions;
- gate evidence and acceptance results;
- build/test/package instructions;
- performance and bandwidth budgets with worst-case captures;
- accessibility and controller test matrix;
- server deployment and compatibility policy;
- save migration and recovery policy;
- crash, privacy, support, patch, and rollback runbooks;
- current content inventory and known issues;
- Steam store and Early Access claims mapped to playable evidence;
- next-content plan separated into committed, experimental, and not-promised work.

## 21. Unresolved decisions that require a project decision record

The consolidated sources intentionally do not choose these for you:

- team size, weekly capacity, budget, outsourcing, exact art direction, and non-PC targets;
- controller-first versus keyboard-first tuning priority, while both remain supported;
- exact launch counts for classes, weapons, acts/dungeons, bosses, and item families;
- friends-only, server-browser, or automated matchmaking policy;
- hosting provider, server regions, autoscaling, operating budget, and persistence service;
- lock grace, join-in-progress/boss locks, revive limits, difficulty ownership, respec price, swap cooldown, and root-motion policy per move;
- anti-cheat aggressiveness and moderation policy;
- procedural maps, crafting breadth, seasons, monetization, mods, or an MMO-persistent world;
- final audio authoring workflow beyond the miniaudio baseline.

Record each resolved choice with context, constraints, chosen option, alternatives, consequences, review trigger, and date. None of these decisions may silently invalidate the canonical combat contract, authoritative networking model, owned/borrowed boundary, accessibility requirements, or gate evidence standard.
