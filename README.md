## Block.ino lab server

This is a very simple Makefile which knows how to build Arduino sketches. It defines entire workflows for compiling code, flashing it to Arduino and even communicating through Serial monitor. You don't need to change anything in the Arduino sketches.

## Features

The application is based on AVR GNU toolchain for Linux (such as avr-gcc, avr-dude and avr-objcopy) and libraries provided by Arduino Software. There is more than one way to install this lab server since you have nodejs installed.


## Requirements
- NodeJS v.0.12.x or greater
- Arduino IDE 1.6.3 or greater (see Arduino IDE section)

#### Installing 

Clone this repository: 
```sh
git clone git@gitlab.com:joaopaulocl/blockino-backend.git
cd blockino-backend
```
And then, install all dependencies:
```sh
npm install 
node apps.js
```

### Arduino IDE

You need to have the Arduino IDE. You can either install it through the
installer or download the distribution zip file and extract it. If you are using a Linux distribution that supports debian package, a good option is:

```sh
sudo apt-get install arduino arduino-core
```

## Configuring Makefile 

The block.ino lab server uses a generic Makefile which must to be configured according to the Arduino model (Uno, Nano, Mega). You can also checkout the sample makefiles inside the `examples/`  [Makefile-example](https://github.com/sudar/Arduino-Makefile/examples/).
Download a copy of this repo some where in your system or install it through a package.

On the Mac you might want to set:

```make
    ARDUINO_DIR   = /Applications/Arduino.app/Contents/Resources/Java
    ARDMK_DIR     = /usr/local
    AVR_TOOLS_DIR = /usr
    MONITOR_PORT  = /dev/ttyACM0
    BOARD_TAG     = mega2560
```

On Linux (if you have installed through package), you shouldn't need to set anything other than your board type and port:

```make
    BOARD_TAG     = mega2560
    MONITOR_PORT  = /dev/ttyACM0
```

On Windows (using cygwin), you might want to set:

```make
    ARDUINO_DIR   = ../../arduino
    ARDMK_DIR     = path/to/mkfile
    MONITOR_PORT  = com3
    BOARD_TAG     = mega2560
```

On Windows (using MSYS and PuTTY), you might want to set the following extra parameters:

```make
    MONITOR_CMD   = putty
    MONITOR_PARMS = 8,1,n,N
```

On Arduino 1.5+ installs, you should set the architecture to either `avr` or `sam` and if using a submenu CPU type, then also set that:

```make
	ARCHITECTURE  = avr
    BOARD_TAG     = atmegang
    BOARD_SUB     = atmega168
```

It is recommended in Windows that you create a symbolic link to avoid problems with file naming conventions on Windows. For example, if your your Arduino directory is in:

    c:\Program Files (x86)\Arduino

You will get problems with the special characters on the directory name. More details about this can be found in [issue #94](https://github.com/sudar/Arduino-Makefile/issues/94)

To create a symbolic link, you can use the command “mklink” on Windows, e.g.

```sh
    mklink /d c:\Arduino c:\Program Files (x86)\Arduino
```

After which, the variables should be:

```make
    ARDUINO_DIR=../../../../../Arduino
```

Instead of:

```make
    ARDUINO_DIR=../../../../../Program\ Files\ \(x86\)/Arduino
```

- `BOARD_TAG` - Type of board, for a list see boards.txt or `make show_boards`
- `MONITOR_PORT` - The port where your Arduino is plugged in, usually `/dev/ttyACM0` or `/dev/ttyUSB0` in Linux or Mac OS X and `com3`, `com4`, etc. in Windows.
- `ARDUINO_DIR` - Path to Arduino installation. In Cygwin in Windows this path must be
  relative, not absolute (e.g. "../../arduino" and not "/c/cygwin/Arduino").
- `ARDMK_DIR`   - Path where the `*.mk` are present. If you installed the package, then it is usually `/usr/share/arduino`
- `AVR_TOOLS_DIR` - Path where the avr tools chain binaries are present. If you are going to use the binaries that came with Arduino installation, then you don't have to set it. Otherwise set it realtive and not absolute.

The list of all variables that can be overridden is available at [arduino-mk-vars.md](arduino-mk-vars.md) file.

## Including Libraries
The first way to include an Arduino library is moving its source code (inside of a folder with the same name) to arduino's library folder (/usr/share/arduino/libraries if linux). However,
Arduino mk provides another way to include libraries: you can specify space separated list of libraries that are needed for your sketch to the variable `ARDUINO_LIBS`.

```make
	ARDUINO_LIBS = Wire SoftwareSerial
```

The libraries will be searched in the following places in the following order.

- `/libraries` directory inside your sketchbook directory. Sketchbook directory will be auto detected from your Arduino preference file. You can also manually set it through `ARDUINO_SKETCHBOOK`.
- `/libraries` directory inside your Arduino directory, which is read from `ARDUINO_DIR`.

The libraries inside user directories will take precedence over libraries present in Arduino core directory.

The makefile can autodetect the libraries that are included from your sketch and can include them automatically. But it can't detect libraries that are included from other libraries. (see [issue #93](https://github.com/sudar/Arduino-Makefile/issues/93))

## avrdude

To upload compiled files, `avrdude` is used. This Makefile tries to find `avrdude` and it's config (`avrdude.conf`) below `ARDUINO_DIR`. If you like to use the one installed on your system instead of the one which came with Arduino, you can try to set the variables `AVRDUDE` and `AVRDUDE_CONF`. On a typical Linux system these could be set to

```make
      AVRDUDE      = /usr/bin/avrdude
      AVRDUDE_CONF = /etc/avrdude.conf
```


## Credits
This project use a generic Makefile provided by [sudar/Arduino-Makefile](https://github.com/sudar/Arduino-Makefile)

